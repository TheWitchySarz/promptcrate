import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServiceSupabase } from '@/lib/supabase'; // For service role access

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// Instead of throwing an error at the module level (which breaks builds),
// we'll check this in the route handler
const missingCredentials = !stripeSecretKey || !webhookSecret;

// Only initialize Stripe if credentials exist
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16', // Match the version used in checkout session creation
  typescript: true,
}) : null;

// Helper function to update user plan in Supabase
async function updateUserSubscription(userId: string, plan: string, customerId: string, subscriptionId: string, subscriptionStatus: string) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from('users')
    .update({
      plan: plan,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      subscription_status: subscriptionStatus, // e.g., 'active', 'cancelled', 'past_due'
    })
    .eq('id', userId)
    .select(); // Optionally select to confirm or log

  if (error) {
    console.error(`Webhook: Supabase error updating user ${userId} to plan ${plan}:`, error);
    throw error; // Re-throw to be caught by the main handler if needed
  }
  console.log(`Webhook: User ${userId} updated to plan ${plan}, stripe_customer_id: ${customerId}, stripe_subscription_id: ${subscriptionId}, status: ${subscriptionStatus}`);
  return data;
}

export async function POST(request: NextRequest) {
  // Check for missing credentials inside the handler instead of at module level
  if (missingCredentials) {
    console.error('Webhook Error: Stripe secret key or webhook secret is not set in environment variables.');
    return NextResponse.json({ error: 'Stripe API not configured' }, { status: 500 });
  }

  if (!stripe) {
    return NextResponse.json({ error: 'Stripe client not initialized' }, { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('Webhook Error: Missing stripe-signature header');
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret!);
  } catch (err: any) {
    console.error(`Webhook Error: Signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  console.log('Webhook: Received Stripe event:', event.type, event.id);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Webhook: Processing checkout.session.completed for session_id:', session.id);

        const userId = session.client_reference_id;
        const stripeCustomerId = session.customer as string;
        const stripeSubscriptionId = session.subscription as string;
        
        // Determine the plan based on the session. For now, assume it's 'pro'
        // In a more complex setup, you might inspect session.line_items
        const planPurchased = 'pro'; // This needs to match your plan identifier in the users table
        const newSubscriptionStatus = 'active'; // Or derive from subscription object if available

        if (userId && stripeCustomerId && stripeSubscriptionId) {
          await updateUserSubscription(userId, planPurchased, stripeCustomerId, stripeSubscriptionId, newSubscriptionStatus);
          console.log(`Webhook: Successfully processed checkout for user ${userId}, subscription ${stripeSubscriptionId}`);
        } else {
          console.error('Webhook Error: Missing userId, customerId, or subscriptionId in checkout.session.completed', {
            userId, stripeCustomerId, stripeSubscriptionId, sessionId: session.id
          });
        }
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Webhook: Processing invoice.payment_succeeded for invoice_id:', invoice.id);
        if (invoice.billing_reason === 'subscription_cycle' || invoice.billing_reason === 'subscription_create') {
          const stripeSubscriptionId = invoice.subscription as string;
          const stripeCustomerId = invoice.customer as string;
          
          // For recurring payments, you might want to find the user by stripe_customer_id or stripe_subscription_id
          // And then update their subscription status or validity period.
          // This example assumes you have a way to get the userId from stripeSubscriptionId if needed.
          // Or, more robustly, use session.client_reference_id from the initial checkout.session.completed 
          // and store stripe_subscription_id. Then, on subsequent invoices, look up user by stripe_subscription_id.
          
          // const { data: userProfile, error } = await getServiceSupabase()
          //   .from('users')
          //   .select('id, plan')
          //   .eq('stripe_subscription_id', stripeSubscriptionId)
          //   .single();

          // if (userProfile && !error) {
          //   await updateUserSubscription(userProfile.id, userProfile.plan, stripeCustomerId, stripeSubscriptionId, 'active');
          //   console.log(`Webhook: Recurring payment success for user ${userProfile.id}, subscription ${stripeSubscriptionId}`);
          // } else {
          //   console.error('Webhook Error: User not found for subscription_id:', stripeSubscriptionId, 'on invoice.payment_succeeded');
          // }
          console.log(`Webhook: Invoice payment successful for subscription ${stripeSubscriptionId}, customer ${stripeCustomerId}. Ensure user plan is active.`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn('Webhook: Invoice payment failed for invoice_id:', invoice.id, 'customer:', invoice.customer, 'subscription:', invoice.subscription);
        // Optional: Update user's subscription_status to 'past_due' or similar
        // const stripeSubscriptionId = invoice.subscription as string;
        // if (stripeSubscriptionId) {
        //   // Find user by subscriptionId and update status
        // }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Webhook: Processing customer.subscription.updated for subscription_id:', subscription.id);
        const stripeCustomerId = subscription.customer as string;
        const planId = subscription.items.data[0]?.price.id; // Example: get plan from price ID
        const newStatus = subscription.status; // e.g. 'active', 'past_due', 'canceled'
        // const cancelAtPeriodEnd = subscription.cancel_at_period_end;

        // Find user by stripe_customer_id or stripe_subscription_id
        // const { data: userToUpdate, error: findError } = await getServiceSupabase()
        //   .from('users')
        //   .select('id')
        //   .eq('stripe_subscription_id', subscription.id) // or .eq('stripe_customer_id', stripeCustomerId)
        //   .single();

        // if (userToUpdate && !findError) {
        //   // Determine new plan based on planId if necessary. For now, assume plan name is known or not changing.
        //   // This might require a mapping from Stripe Price ID to your internal plan names.
        //   // For simplicity, we'll just update the status.
        //   await getServiceSupabase().from('users').update({ subscription_status: newStatus }).eq('id', userToUpdate.id);
        //   console.log(`Webhook: Updated subscription status to ${newStatus} for user ${userToUpdate.id}`);
        // } else {
        //   console.error('Webhook Error: User not found for subscription_id:', subscription.id, 'on customer.subscription.updated');
        // }
        console.log(`Webhook: Subscription ${subscription.id} status is now ${newStatus}.`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Webhook: Processing customer.subscription.deleted for subscription_id:', subscription.id);
        // This means the subscription is definitively gone (not just cancel_at_period_end).
        // Revert user to a 'free' plan or equivalent.
        // const { data: userToDowngrade, error: findErr } = await getServiceSupabase()
        //   .from('users')
        //   .select('id')
        //   .eq('stripe_subscription_id', subscription.id)
        //   .single();

        // if (userToDowngrade && !findErr) {
        //   await updateUserSubscription(userToDowngrade.id, 'free', subscription.customer as string, subscription.id, 'cancelled');
        //   console.log(`Webhook: User ${userToDowngrade.id} downgraded to free due to subscription deletion.`);
        // } else {
        //   console.error('Webhook Error: User not found for subscription_id:', subscription.id, 'on customer.subscription.deleted');
        // }
        console.log(`Webhook: Subscription ${subscription.id} deleted. User should be moved to a free plan.`);
        break;
      }

      default:
        console.warn(`Webhook: Unhandled event type ${event.type}`);
    }
  } catch (error) {
    console.error('Webhook: Error processing event:', event.type, error);
    // Do not send 500 to Stripe if it's an internal processing error after signature verification
    // Stripe will retry if it doesn't get a 2xx. If it's our error, we don't want retries for the same bad processing.
    // However, if it was a DB error that might be transient, retries might be ok.
    // For now, return 200 but log error to avoid Stripe retries for app-level bugs.
    return NextResponse.json({ received: true, error: 'Internal server error during event processing' }, { status: 200 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
} 