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

export async function POST(request: NextRequest) {
  // Check for missing credentials inside the handler
  if (missingCredentials) {
    console.error('Stripe Unauth Checkout: STRIPE_SECRET_KEY not set.');
    return NextResponse.json({ error: 'Stripe API not configured' }, { status: 500 });
  }

  if (!stripe) {
    return NextResponse.json({ error: 'Stripe client not initialized' }, { status: 500 });
  }

  const proPriceId = process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!proPriceId) {
    console.error('Stripe Unauth Checkout: STRIPE_PRO_MONTHLY_PRICE_ID not set.');
    return NextResponse.json({ error: 'Pro plan Price ID not configured.' }, { status: 500 });
  }
  if (!appUrl) {
    console.error('Stripe Unauth Checkout: NEXT_PUBLIC_APP_URL not set.');
    return NextResponse.json({ error: 'Application URL not configured.' }, { status: 500 });
  }

  try {
    const successUrl = `${appUrl}/signup?stripe_session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${appUrl}/#pricing`; // Or simply `${appUrl}/`

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
      // For unauthenticated users, we don't have a customer or client_reference_id yet.
      // Stripe will create a new customer or match by email if the user later signs up with the same email.
      // The email collected by Stripe can be retrieved from the session object after completion.
    };

    const checkoutSession = await stripe.checkout.sessions.create(checkoutSessionParams);

    if (!checkoutSession.url) {
      console.error('Stripe Unauth Checkout: Failed to create checkout session - no URL returned.');
      return NextResponse.json({ error: 'Could not create Stripe checkout session.' }, { status: 500 });
    }

    return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url });

  } catch (error) {
    console.error('Stripe Unauth Checkout: Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected server error occurred.';
    return NextResponse.json({ error: 'Server error creating checkout session.', details: errorMessage }, { status: 500 });
  }
} 