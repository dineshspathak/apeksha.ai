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
    const body = await req.json();
    const { token, planId } = body;

    if (!token) {
      return NextResponse.json({ error: 'User token required' }, { status: 401 });
    }

    if (!stripe) {
      return NextResponse.json({ error: 'Billing provider not configured' }, { status: 501 });
    }

    // 1. Resolve user profile in database
    if (supabase) {
      const { data: profile, error: dbError } = await supabase
        .from('profiles')
        .select('email, id')
        .eq('license_key', token)
        .single();

      if (dbError || !profile) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // 2. Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: planId || process.env.STRIPE_PRICE_ID, // Paid tier price ID
            quantity: 1,
          },
        ],
        mode: 'subscription',
        customer_email: profile.email,
        success_url: `${req.headers.get('origin') || 'https://apeksha-ai.vercel.app'}/editor?checkout=success`,
        cancel_url: `${req.headers.get('origin') || 'https://apeksha-ai.vercel.app'}/editor?checkout=cancel`,
        metadata: {
          userId: profile.id,
          licenseKey: token,
        },
      });

      return NextResponse.json({ url: session.url });
    }

    return NextResponse.json({ error: 'Database service unavailable' }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
