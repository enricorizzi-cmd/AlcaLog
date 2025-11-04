import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/ruoli - Lista ruoli (pubblico per registrazione)
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('ruoli')
      .select('*')
      .order('codice');

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Errore recupero ruoli:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

