import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    if (!supabase) {
      // Offline/Dev fallback: return a mock license token
      const mockKey = `apeksha_free_${crypto.randomBytes(8).toString('hex')}`;
      return NextResponse.json({
        message: 'Signup successful (Dev Mode)',
        token: mockKey,
        email: email,
        name: name || 'User',
      });
    }

    // Sign up user using Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message || 'Authentication failed' }, { status: 400 });
    }

    // Generate a secure license key for the user
    const licenseKey = `apks_${crypto.randomBytes(24).toString('hex')}`;

    // Create profile record in the database
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          name: name || email.split('@')[0],
          email: email,
          license_key: licenseKey,
          subscription_status: 'free', // Default tier
          created_at: new Date().toISOString(),
        },
      ]);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Signup successful',
      token: licenseKey,
      email: email,
      name: name || email.split('@')[0],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
