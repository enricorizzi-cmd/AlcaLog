import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/articoli/[codice] - Dettaglio articolo con lotti
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ codice: string }> }
) {
  try {
    const { codice } = await params;
    const supabase = await createClient();

    // Recupera articolo
    const { data: articolo, error: articoloError } = await supabase
      .from('articoli')
      .select('*, fornitore_predefinito:fornitori(*)')
      .eq('codice_interno', codice)
      .single();

    if (articoloError || !articolo) {
      return NextResponse.json(
        { error: 'Articolo non trovato' },
        { status: 404 }
      );
    }

    // Recupera lotti
    const { data: lotti, error: lottiError } = await supabase
      .from('articoli_lotti')
      .select('*')
      .eq('articolo', codice)
      .order('scadenza', { ascending: true });

    return NextResponse.json({
      ...articolo,
      lotti: lotti || [],
    });
  } catch (error) {
    console.error('Errore recupero articolo:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// PUT /api/articoli/[codice] - Modifica articolo
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
    const {
      tipologia,
      categoria,
      codice_fornitore,
      fornitore_predefinito,
      descrizione,
      peso_netto,
      unita_misura,
      ultimo_prezzo,
      scorta_minima,
    } = body;

    const { data, error } = await supabase
      .from('articoli')
      .update({
        tipologia: tipologia || null,
        categoria: categoria || null,
        codice_fornitore: codice_fornitore || null,
        fornitore_predefinito: fornitore_predefinito || null,
        descrizione,
        peso_netto: peso_netto ? parseFloat(peso_netto) : null,
        unita_misura: unita_misura || null,
        ultimo_prezzo: ultimo_prezzo ? parseFloat(ultimo_prezzo) : null,
        scorta_minima: scorta_minima ? parseFloat(scorta_minima) : null,
        updated_at: new Date().toISOString(),
      })
      .eq('codice_interno', codice)
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
    console.error('Errore modifica articolo:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

