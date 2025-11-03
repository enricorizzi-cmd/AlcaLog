import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/ricevimenti - Lista ordini da ricevere (con residui > 0)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Recupera ordini con residui > 0
    const { data: ordini, error } = await supabase
      .from('ordini_fornitori')
      .select(`
        *,
        fornitore_movimento:fornitori(*),
        righe:ordini_fornitori_righe(*)
      `)
      .order('data_ordine', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Filtra solo ordini con residui > 0
    const ordiniDaRicevere = await Promise.all(
      (ordini || []).map(async (ordine) => {
        const righeConResidui = await Promise.all(
          (ordine.righe || []).map(async (riga: any) => {
            const { data: residuo } = await supabase
              .from('ordini_residuo_v')
              .select('quantita_residua')
              .eq('ordine_riga_id', riga.id)
              .single();

            return {
              ...riga,
              quantita_residua: residuo?.quantita_residua || 0,
            };
          })
        );

        const haResidui = righeConResidui.some((r: any) => r.quantita_residua > 0);

        if (haResidui) {
          return {
            ...ordine,
            righe: righeConResidui,
          };
        }
        return null;
      })
    );

    const filtrati = ordiniDaRicevere.filter(o => o !== null);

    return NextResponse.json(filtrati);
  } catch (error) {
    console.error('Errore recupero ricevimenti:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}


