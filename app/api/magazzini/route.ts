import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/magazzini - Lista ubicazioni magazzino
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('magazzini_ubicazioni')
      .select('*')
      .order('sede', { ascending: true })
      .order('sezione', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Errore recupero magazzini:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// POST /api/magazzini - Crea ubicazione
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verifica autenticazione
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sede, sezione } = body;

    if (!sede || !sezione) {
      return NextResponse.json(
        { error: 'Sede e sezione sono obbligatorie' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('magazzini_ubicazioni')
      .insert({
        sede,
        sezione,
      })
      .select()
      .single();

    if (error) {
      // Errore unicità
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Ubicazione già esistente' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Errore creazione magazzino:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}


