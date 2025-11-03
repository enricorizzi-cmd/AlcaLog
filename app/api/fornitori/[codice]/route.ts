import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/fornitori/[codice] - Dettaglio fornitore
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ codice: string }> }
) {
  try {
    const { codice } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('fornitori')
      .select('*')
      .eq('codice', codice)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Fornitore non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Errore recupero fornitore:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// PUT /api/fornitori/[codice] - Modifica fornitore
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ codice: string }> }
) {
  try {
    const { codice } = await params;
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
    const { descrizione, referente, telefono, mail, indirizzo } = body;

    const { data, error } = await supabase
      .from('fornitori')
      .update({
        descrizione,
        referente: referente || null,
        telefono: telefono || null,
        mail: mail || null,
        indirizzo: indirizzo || null,
        updated_at: new Date().toISOString(),
      })
      .eq('codice', codice)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Errore modifica fornitore:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}


