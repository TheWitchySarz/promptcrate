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
      return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
    }
    const { user } = session;

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
    const proPriceId = process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '';
    // Use environment variable or fallback to request host
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || getUrlFromRequest(request);

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

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      typescript: true,
    });

    console.log(`Using app URL: ${appUrl}`);
    const successUrl = `${appUrl}/account/settings?stripe_checkout=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${appUrl}/account/settings`; // Changed to /account/settings

    let stripeCustomerId: string | undefined;
    const { data: profileData, error: profileError } = await supabase
      .from('users') // Assumes your public user profiles are in 'users' table
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { 
      console.warn('Stripe Checkout: Error fetching user profile for stripe_customer_id:', profileError.message);
      // Not necessarily fatal, Stripe can create a new customer.
    }
    
    if (profileData?.stripe_customer_id) {
      stripeCustomerId = profileData.stripe_customer_id;
    }

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
      // metadata can be used to store additional info, like supabase_user_id, if needed by webhooks
      // metadata: {
      //   supabase_user_id: user.id,
      // },
    };
    
    const checkoutSession = await stripe.checkout.sessions.create(checkoutSessionParams);

    if (!checkoutSession.url) {
      console.error('Stripe Checkout: Failed to create checkout session - no URL returned.');
      return NextResponse.json({ error: 'Could not create Stripe checkout session.' }, { status: 500 });
    }

    return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url });

  } catch (error) {
    console.error('Stripe Checkout: Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected server error occurred.';
    return NextResponse.json({ error: 'Server error creating checkout session.', details: errorMessage }, { status: 500 });
  }
} 