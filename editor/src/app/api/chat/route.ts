import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client if keys are present
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, model, token } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages array' }, { status: 400 });
    }

    // 1. Verify User Subscription status in SaaS database
    if (supabase && token !== 'local-mode') {
      if (!token) {
        return NextResponse.json({ error: 'Authentication token required for cloud mode' }, { status: 401 });
      }

      // Query Supabase user profile by session token/license key
      const { data: userProfile, error: dbError } = await supabase
        .from('profiles')
        .select('subscription_status, token_usage')
        .eq('license_key', token)
        .single();

      // Check if user exists in the database
      if (dbError || !userProfile) {
        return NextResponse.json({ error: 'Invalid license key or token' }, { status: 401 });
      }
    }

    // 2. Fetch Master Groq Key from server environment
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return NextResponse.json({ error: 'Server configuration error: Groq API key is missing' }, { status: 500 });
    }

    // 3. Forward request to Groq Cloud API — with automatic model fallback chain on 429
    const FALLBACK_MODELS = [
      model || 'llama-3.3-70b-versatile',
      'meta-llama/llama-4-scout-17b-16e-instruct',
      'llama-3.1-8b-instant',
      'gemma2-9b-it',
    ];

    let response: Response | null = null;
    let lastError = '';

    for (const tryModel of FALLBACK_MODELS) {
      const payload = {
        model: tryModel,
        messages: messages,
        temperature: 0.7,
        max_tokens: 4096,
      };

      response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 200) break; // success, stop trying
      if (response.status === 429) {
        lastError = `Rate limited on ${tryModel}`;
        continue; // try next model
      }
      // Other error — stop
      const errorText = await response.text();
      return NextResponse.json({ error: `Groq API Error: ${errorText}` }, { status: response.status });
    }

    if (!response || !response.ok) {
      return NextResponse.json({ error: `All models rate limited. Try again in a moment.` }, { status: 429 });
    }

    const data = await response.json();
    return NextResponse.json({ content: data.choices[0].message.content });
  } catch (error: any) {
    return NextResponse.json({ error: `SaaS serverless error: ${error.message}` }, { status: 500 });
  }
}
