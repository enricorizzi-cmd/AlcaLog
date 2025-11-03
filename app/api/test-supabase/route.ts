import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        error: 'Variabili d\'ambiente mancanti',
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
      }, { status: 500 });
    }

    // Test connessione diretta a Supabase
    const testUrl = `${supabaseUrl}/rest/v1/`;
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      // Timeout di 10 secondi
      signal: AbortSignal.timeout(10000),
    });

    return NextResponse.json({
      success: true,
      supabaseUrl,
      statusCode: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      canConnect: response.ok,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorName = error instanceof Error ? error.name : 'Unknown';
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      errorName,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Presente' : 'Mancante',
    }, { status: 500 });
  }
}

