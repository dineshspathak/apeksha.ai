import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2024-04-16' as any }) : null;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

export async function POST(req: Request) {
  try {
    const payload = await req.text();
    const sig = req.headers.get('stripe-signature') || '';

    if (!stripe || !supabase) {
      return NextResponse.json({ error: 'Services not initialized' }, { status: 500 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
    } catch (err: any) {
      return NextResponse.json({ error: `Webhook Signature Error: ${err.message}` }, { status: 400 });
    }

    // Handle completed checkout session
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;

      if (userId) {
        // Update user subscription status in Supabase database
        const { error } = await supabase
          .from('profiles')
          .update({ subscription_status: 'active' })
          .eq('id', userId);

        if (error) {
          console.error(`Database update error in webhook: ${error.message}`);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
