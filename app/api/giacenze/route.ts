import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calcolaPrezzoMedioFIFO } from '@/lib/utils/fifo';
import { calcolaScortaMedia12M } from '@/lib/utils/scorte';

// GET /api/giacenze - Lista giacenze con calcolo FIFO e scorte
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const sede = searchParams.get('sede');
    const sezione = searchParams.get('sezione');
    const articolo = searchParams.get('articolo');
    const categoria = searchParams.get('categoria');

    // Query base usando la vista giacenze_v
    let query = supabase
      .from('giacenze_v')
      .select('*');

    // Filtri
    if (sede) {
      query = query.eq('sede', sede);
    }
    if (sezione) {
      query = query.eq('sezione', sezione);
    }
    if (articolo) {
      query = query.eq('articolo', articolo);
    }
    if (categoria) {
      query = query.eq('categoria', categoria);
    }

    const { data: giacenze, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Calcola FIFO e scorte per ogni articolo (se non già calcolate nella vista)
    // Nota: La vista giacenze_v dovrebbe già includere questi calcoli,
    // ma possiamo ricalcolarli per sicurezza
    const giacenzeConCalcoli = await Promise.all(
      (giacenze || []).map(async (g) => {
        // Se la vista non ha già calcolato, ricalcoliamo
        const prezzoFIFO = g.prezzo_medio_FIFO || await calcolaPrezzoMedioFIFO(g.articolo);
        const scortaMedia = g.scorta_media_12m || await calcolaScortaMedia12M(g.articolo);

        return {
          ...g,
          prezzo_medio_FIFO: prezzoFIFO,
          scorta_media_12m: scortaMedia,
        };
      })
    );

    return NextResponse.json(giacenzeConCalcoli);
  } catch (error) {
    console.error('Errore recupero giacenze:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

