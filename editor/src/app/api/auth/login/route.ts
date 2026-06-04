import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    if (!supabase) {
      // Offline/Dev fallback: return a mock license token
      return NextResponse.json({
        message: 'Login successful (Dev Mode)',
        token: `apeksha_free_dev_token`,
        email: email,
        name: email.split('@')[0],
      });
    }

    // Sign in user using Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message || 'Login failed' }, { status: 401 });
    }

    // Retrieve the user profile and license key
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('name, license_key, subscription_status')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Login successful',
      token: profile.license_key,
      email: email,
      name: profile.name,
      subscription_status: profile.subscription_status,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
