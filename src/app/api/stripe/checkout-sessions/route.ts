import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Get the request host for fallback URL
const getUrlFromRequest = (request: NextRequest): string => {
  const host = request.headers.get('host') || 'promptcrate.ai';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
};

export async function POST(request: NextRequest) {
  console.log('Authenticated checkout process started');
  
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Stripe Checkout: Supabase session error:', sessionError.message);
      return NextResponse.json({ error: 'Failed to get user session.', details: sessionError.message }, { status: 500 });
    }

    if (!session?.user) {
      console.error('Stripe Checkout: No user session found');
      return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
    }
    
    const { user } = session;
    console.log(`User authenticated: ${user.id}, email: ${user.email}`);

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
    const proPriceId = process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '';
    // Use environment variable or fallback to request host
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || getUrlFromRequest(request);

    // Log stripe key length for debugging (don't log the actual key)
    console.log(`Stripe key status: Secret key length: ${stripeSecretKey.length}`);
    console.log(`Price ID: ${proPriceId ? 'valid' : 'missing'}, length: ${proPriceId?.length || 0}`);
    console.log(`Using app URL: ${appUrl}`);

    // Validate required environment variables
    const missingVars = [];
    if (!stripeSecretKey) missingVars.push('STRIPE_SECRET_KEY');
    if (!proPriceId) missingVars.push('STRIPE_PRO_MONTHLY_PRICE_ID');
    // Don't check appUrl anymore since we have a fallback

    if (missingVars.length > 0) {
      console.error(`Stripe Checkout: Missing required environment variables: ${missingVars.join(', ')}`);
      return NextResponse.json({ 
        error: missingVars.includes('STRIPE_PRO_MONTHLY_PRICE_ID') 
          ? 'Pro plan Price ID not configured.' 
          : 'Stripe configuration incomplete.', 
        missingVars 
      }, { status: 500 });
    }

    // Initialize Stripe with better error handling
    let stripe;
    try {
      stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2023-10-16',
        typescript: true,
      });
      console.log('Stripe initialized successfully');
    } catch (stripeInitError: any) {
      console.error('Failed to initialize Stripe:', stripeInitError.message);
      return NextResponse.json({ error: 'Failed to initialize Stripe client.', details: stripeInitError.message }, { status: 500 });
    }

    const successUrl = `${appUrl}/account/settings?stripe_checkout=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${appUrl}/account/settings`;

    // Get Stripe customer ID if it exists
    let stripeCustomerId: string | undefined;
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('stripe_customer_id')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') { 
        console.warn('Stripe Checkout: Error fetching user profile for stripe_customer_id:', profileError.message);
      }
      
      if (profileData?.stripe_customer_id) {
        stripeCustomerId = profileData.stripe_customer_id;
        console.log(`Found existing Stripe customer ID: ${stripeCustomerId.substring(0, 5)}...`);
      } else {
        console.log('No existing Stripe customer ID found, will create new customer');
      }
    } catch (profileQueryError: any) {
      console.error('Error querying profile:', profileQueryError.message);
      // Continue with checkout even if profile query fails
    }

    // Log checkout parameters
    console.log('Creating checkout session with parameters:', {
      mode: 'subscription',
      payment_method_types: ['card'],
      success_url: successUrl, 
      cancel_url: cancelUrl,
      price_id: proPriceId,
      email: user.email,
      has_customer_id: !!stripeCustomerId
    });

    const checkoutSessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        {
          price: proPriceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      ...(stripeCustomerId ? { customer: stripeCustomerId } : { customer_email: user.email }),
      client_reference_id: user.id, // Your internal user ID
    };
    
    // Try/catch specifically around the Stripe API call
    try {
      console.log('Calling Stripe API to create checkout session...');
      const checkoutSession = await stripe.checkout.sessions.create(checkoutSessionParams);
      console.log('Checkout session created successfully:', checkoutSession.id);

      if (!checkoutSession.url) {
        console.error('Stripe Checkout: Failed to create checkout session - no URL returned.');
        return NextResponse.json({ error: 'Could not create Stripe checkout session.' }, { status: 500 });
      }

      console.log(`Redirecting to Stripe checkout URL: ${checkoutSession.url.substring(0, 60)}...`);
      return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url });
    } catch (stripeError: any) {
      console.error('Stripe API Error:', stripeError.type || 'unknown_type');
      console.error('Stripe Error Message:', stripeError.message || 'No message');
      console.error('Stripe Error Code:', stripeError.code || 'No code');
      if (stripeError.stack) console.error('Stripe Error Stack:', stripeError.stack);
      
      return NextResponse.json({ 
        error: 'Stripe API Error', 
        details: stripeError.message || 'Unknown Stripe error',
        code: stripeError.code
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Stripe Checkout: Unexpected error:', error);
    console.error('Error details:', error.message);
    if (error.stack) console.error('Error stack:', error.stack);
    
    const errorMessage = error instanceof Error ? error.message : 'An unexpected server error occurred.';
    return NextResponse.json({ error: 'Server error creating checkout session.', details: errorMessage }, { status: 500 });
  }
} 