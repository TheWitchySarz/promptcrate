import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl

  // Define protected routes
  const protectedRoutes = ['/app', '/account', '/upload']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute && !session) {
    // User is not authenticated and trying to access a protected route
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('message', 'Please log in to access this page.')
    if (pathname !== '/' && pathname !== '/login' && pathname !== '/signup') {
      url.searchParams.set('redirect_to', pathname) // Save the intended path
    }
    return NextResponse.redirect(url)
  }

  // If user is authenticated and tries to access login or signup, redirect to editor
  if (session && (pathname === '/login' || pathname === '/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = '/app/editor'
    url.searchParams.delete('message')
    url.searchParams.delete('redirect_to')
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /api (API routes, these should have their own auth checks if needed)
     * - / (public landing page, but specific sub-routes like /login are handled above)
     * - /public (any other public assets)
     * - /pricing
     * - /features
     */
    '/((?!_next/static|_next/image|favicon.ico|api|public|pricing|features).*)(.+)',
    '/', // Also match the root for redirecting logged-in users from public pages
  ],
} 