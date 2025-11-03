import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envCheck = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      nodeEnv: process.env.NODE_ENV || 'not set',
    };

    const allConfigured = 
      envCheck.hasSupabaseUrl && 
      envCheck.hasSupabaseKey;

    return NextResponse.json({
      status: allConfigured ? 'ok' : 'error',
      environment: envCheck,
      message: allConfigured 
        ? 'Tutte le variabili d\'ambiente richieste sono configurate'
        : 'Alcune variabili d\'ambiente mancano',
    }, { status: allConfigured ? 200 : 500 });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}


