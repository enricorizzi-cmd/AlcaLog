import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * API per ottenere valori distinti di tipologia, categoria e unita_misura
 * Usata per popolare i dropdown nei form
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Recupera tutti gli articoli (non archiviati)
    const { data: articoli, error } = await supabase
      .from('articoli')
      .select('tipologia, categoria, unita_misura')
      .eq('archiviato', false);

    if (error) {
      console.error('Errore recupero valori distinti:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Estrai valori distinti, filtrando null/undefined e stringhe vuote
    const tipologie = Array.from(
      new Set(
        (articoli || [])
          .map(a => a.tipologia)
          .filter((v): v is string => !!v && v.trim() !== '')
      )
    ).sort();

    const categorie = Array.from(
      new Set(
        (articoli || [])
          .map(a => a.categoria)
          .filter((v): v is string => !!v && v.trim() !== '')
      )
    ).sort();

    const unitaMisura = Array.from(
      new Set(
        (articoli || [])
          .map(a => a.unita_misura)
          .filter((v): v is string => !!v && v.trim() !== '')
      )
    ).sort();

    return NextResponse.json({
      tipologie,
      categorie,
      unita_misura: unitaMisura,
    });
  } catch (error) {
    console.error('Errore recupero valori distinti:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

