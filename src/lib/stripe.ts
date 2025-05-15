import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

// Only initialize Stripe if secret key exists
export const stripe = stripeSecretKey 
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      typescript: true,
    })
  : null;

export const getStripe = () => {
  if (!stripePublishableKey) {
    console.error('Missing env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
    return { publishableKey: '', error: 'Missing Stripe publishable key' };
  }
  
  return {
    publishableKey: stripePublishableKey,
  }
} 