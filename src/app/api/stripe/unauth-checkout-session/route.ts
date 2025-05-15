import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Ensure Stripe secret key is available
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const missingCredentials = !stripeSecretKey;

// Only initialize Stripe if credentials exist
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16', // Match other Stripe API versions used
  typescript: true,
}) : null;

// Get the request host for fallback URL
const getUrlFromRequest = (request: NextRequest): string => {
  const host = request.headers.get('host') || 'promptcrate.ai';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
};

export async function POST(request: NextRequest) {
  console.log('Unauth checkout process started');
  
  // Check for missing credentials inside the handler
  if (missingCredentials) {
    console.error('Stripe Unauth Checkout: STRIPE_SECRET_KEY not set.');
    return NextResponse.json({ error: 'Stripe API not configured' }, { status: 500 });
  }

  if (!stripe) {
    console.error('Stripe client not initialized, but stripeSecretKey exists:', !!stripeSecretKey);
    return NextResponse.json({ error: 'Stripe client not initialized' }, { status: 500 });
  }

  // Log stripe key length for debugging (don't log the actual key)
  console.log(`Stripe key status: Secret key length: ${stripeSecretKey.length}, Initialized: ${!!stripe}`);

  const proPriceId = process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
  // Use environment variable or fallback to request host
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || getUrlFromRequest(request);

  if (!proPriceId) {
    console.error('Stripe Unauth Checkout: STRIPE_PRO_MONTHLY_PRICE_ID not set.');
    return NextResponse.json({ error: 'Pro plan Price ID not configured.' }, { status: 500 });
  }

  // Debug info
  console.log(`Price ID: ${proPriceId ? 'valid' : 'missing'}, length: ${proPriceId?.length || 0}`);
  console.log(`Using app URL: ${appUrl}`);

  try {
    const successUrl = `${appUrl}/signup?stripe_session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${appUrl}/#pricing`;

    console.log('Creating checkout session with parameters:', {
      mode: 'subscription',
      payment_method_types: ['card'],
      success_url: successUrl, 
      cancel_url: cancelUrl,
      price_id: proPriceId
    });

    // Create a checkout session with simple parameters first
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
    };

    // Try/catch specifically around the Stripe API call
    try {
      console.log('Calling Stripe API to create checkout session...');
      const checkoutSession = await stripe.checkout.sessions.create(checkoutSessionParams);
      console.log('Checkout session created successfully:', checkoutSession.id);

      if (!checkoutSession.url) {
        console.error('Stripe Unauth Checkout: Checkout session created but no URL returned.');
        return NextResponse.json({ error: 'Could not create Stripe checkout session.' }, { status: 500 });
      }

      console.log(`Redirecting to Stripe checkout URL: ${checkoutSession.url.substring(0, 60)}...`);
      return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url });
    } catch (stripeError: any) {
      console.error('Stripe API Error:', stripeError.type || 'unknown_type');
      console.error('Stripe Error Message:', stripeError.message || 'No message');
      console.error('Stripe Error Code:', stripeError.code || 'No code');
      console.error('Stripe Error Stack:', stripeError.stack);
      return NextResponse.json({ 
        error: 'Stripe API Error', 
        details: stripeError.message || 'Unknown Stripe error',
        code: stripeError.code
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Stripe Unauth Checkout: Unexpected error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected server error occurred.';
    return NextResponse.json({ error: 'Server error creating checkout session.', details: errorMessage }, { status: 500 });
  }
} 