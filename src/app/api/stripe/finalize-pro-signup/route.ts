import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServiceSupabase } from '@/lib/supabase'; // For service role access

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('Stripe secret key is not set in environment variables for finalize-pro-signup.');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
  typescript: true,
});

interface FinalizeProSignupBody {
  userId: string;
  stripeSessionId: string;
}

export async function POST(request: NextRequest) {
  let body: FinalizeProSignupBody;
  try {
    body = await request.json();
  } catch (e) {
    console.error('Finalize Pro Signup: Invalid JSON body', e);
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { userId, stripeSessionId } = body;

  if (!userId || !stripeSessionId) {
    return NextResponse.json({ error: 'Missing userId or stripeSessionId.' }, { status: 400 });
  }

  try {
    console.log(`Finalize Pro Signup: Processing for userId: ${userId}, stripeSessionId: ${stripeSessionId}`);

    // Retrieve the Stripe Checkout Session
    const session = await stripe.checkout.sessions.retrieve(stripeSessionId, {
      expand: ['customer', 'subscription', 'line_items.data.price.product'],
    });

    if (!session) {
      console.error(`Finalize Pro Signup: Stripe session not found for ID: ${stripeSessionId}`);
      return NextResponse.json({ error: 'Stripe session not found.' }, { status: 404 });
    }

    // Verify payment status
    if (session.payment_status !== 'paid') {
      console.warn(`Finalize Pro Signup: Stripe session ${stripeSessionId} not paid. Status: ${session.payment_status}`);
      return NextResponse.json({ error: 'Payment not completed for this session.' }, { status: 402 }); // Payment Required or Bad Request
    }

    const stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
    const stripeSubscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
    const stripeSubscriptionStatus = typeof session.subscription === 'string' ? null : session.subscription?.status; // e.g., 'active'
    
    // Fix TypeScript error by ensuring we only access email if session.customer is a Customer object (with email) not a DeletedCustomer
    let customerEmailFromStripe: string | null = null;
    if (typeof session.customer !== 'string' && session.customer && 'email' in session.customer) {
      customerEmailFromStripe = session.customer.email;
    }

    if (!stripeCustomerId || !stripeSubscriptionId) {
      console.error(`Finalize Pro Signup: Missing customer or subscription ID from Stripe session ${stripeSessionId}`);
      return NextResponse.json({ error: 'Could not retrieve customer or subscription details from Stripe.' }, { status: 500 });
    }
    
    // For simplicity, we assume the first line item is the pro plan.
    // You might want more robust logic if you have multiple items in checkout.
    // const planName = 'pro'; // Or derive from session.line_items[0].price.product etc.

    const supabase = getServiceSupabase();

    // Check if a user profile in 'users' table already exists. 
    // It should, if AuthContext creates it after Supabase auth.signUp.
    // Or, this might be the first time we are creating/updating it with plan details.
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, plan')
      .eq('id', userId)
      .maybeSingle(); // Use maybeSingle to not error if no profile yet

    if (fetchError) {
      console.error(`Finalize Pro Signup: Supabase error fetching user ${userId}:`, fetchError.message);
      return NextResponse.json({ error: 'Database error fetching user profile.', details: fetchError.message }, { status: 500 });
    }

    const updateData = {
      plan: 'pro',
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      subscription_status: stripeSubscriptionStatus || 'active', // Fallback to active
      // email: customerEmailFromStripe, // Potentially update/set email if needed, though Supabase auth usually handles this.
    };

    if (existingUser) {
      const { error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId);
      if (updateError) {
        console.error(`Finalize Pro Signup: Supabase error updating user ${userId}:`, updateError.message);
        return NextResponse.json({ error: 'Database error updating user plan.', details: updateError.message }, { status: 500 });
      }
      console.log(`Finalize Pro Signup: User ${userId} successfully updated to Pro plan.`);
    } else {
      // If user profile doesn't exist in 'users' table yet, create it.
      // This assumes your 'users' table has an 'id' that is a FK to 'auth.users.id'.
      const { error: insertError } = await supabase
        .from('users')
        .insert([{ id: userId, ...updateData }]);
      if (insertError) {
        console.error(`Finalize Pro Signup: Supabase error inserting user ${userId} with Pro plan:`, insertError.message);
        return NextResponse.json({ error: 'Database error creating user with Pro plan.', details: insertError.message }, { status: 500 });
      }
      console.log(`Finalize Pro Signup: User ${userId} successfully created with Pro plan.`);
    }

    return NextResponse.json({ message: 'User Pro plan finalized successfully.', plan: 'pro' }, { status: 200 });

  } catch (error: any) {
    console.error('Finalize Pro Signup: Unexpected error:', error.message || error);
    return NextResponse.json({ error: 'Server error finalizing Pro signup.', details: error.message }, { status: 500 });
  }
} 