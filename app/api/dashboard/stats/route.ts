import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/dashboard/stats - Statistiche aggregate per dashboard
export async function GET() {
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

    // Statistiche in parallelo
    const [
      { count: totalArticoli },
      { count: totalFornitori },
      { count: ordiniAperti },
      { count: ordiniInEvasione },
      { count: inventariAperti },
      { count: movimentiOggi },
      { data: giacenze },
      { data: ordini },
      { data: movimentiRecenti },
    ] = await Promise.all([
      supabase.from('articoli').select('*', { count: 'exact', head: true }).eq('archiviato', false),
      supabase.from('fornitori').select('*', { count: 'exact', head: true }).eq('archiviato', false),
      supabase.from('ordini_fornitori').select('*', { count: 'exact', head: true }).is('inviato_at', null),
      supabase
        .from('ordini_fornitori')
        .select('*, righe:ordini_fornitori_righe(*)', { count: 'exact', head: true })
        .is('inviato_at', null),
      supabase.from('inventari').select('*', { count: 'exact', head: true }).is('inviato_at', null),
      supabase
        .from('movimenti_magazzino')
        .select('*', { count: 'exact', head: true })
        .gte('data_effettiva', new Date().toISOString().split('T')[0]),
      supabase.from('giacenze_v').select('*').limit(100),
      supabase
        .from('ordini_fornitori')
        .select('*, fornitore:fornitori(*), righe:ordini_fornitori_righe(*)')
        .order('data_ordine', { ascending: false })
        .limit(10),
      supabase
        .from('movimenti_magazzino')
        .select('*, articolo_info:articoli(codice, descrizione)')
        .order('data_effettiva', { ascending: false })
        .order('ora_effettiva', { ascending: false })
        .limit(10),
    ]);

    // Calcola statistiche aggregate
    const totaleValoreGiacenze = (giacenze || []).reduce((acc, g) => {
      const valore = (g.quantita_giacente || 0) * (g.prezzo_medio_FIFO || 0);
      return acc + valore;
    }, 0);

    const articoliSottoScorta = (giacenze || []).filter(
      (g) => (g.quantita_giacente || 0) < (g.scorta_minima || 0)
    ).length;

    const totaleMovimentiOggi = movimentiOggi || 0;

    // Statistiche ordini
    const ordiniConResidui = (ordini || []).filter((o: any) => {
      const righeConResiduo = (o.righe || []).filter((r: any) => {
        // Qui dovremmo calcolare i residui, per ora assumiamo che ci siano righe
        return true;
      });
      return righeConResiduo.length > 0;
    }).length;

    // Movimenti per tipo oggi
    const { data: movimentiPerTipo } = await supabase
      .from('movimenti_magazzino')
      .select('tipo_movimento')
      .gte('data_effettiva', new Date().toISOString().split('T')[0]);

    const movimentiStats = (movimentiPerTipo || []).reduce((acc: any, m: any) => {
      acc[m.tipo_movimento] = (acc[m.tipo_movimento] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      kpi: {
        totalArticoli: totalArticoli || 0,
        totalFornitori: totalFornitori || 0,
        ordiniAperti: ordiniAperti || 0,
        ordiniInEvasione: ordiniConResidui,
        inventariAperti: inventariAperti || 0,
        totaleValoreGiacenze: totaleValoreGiacenze.toFixed(2),
        articoliSottoScorta,
        movimentiOggi: totaleMovimentiOggi,
      },
      movimentiStats,
      ordiniRecenti: ordini || [],
      movimentiRecenti: movimentiRecenti || [],
    });
  } catch (error) {
    console.error('Errore recupero statistiche dashboard:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

