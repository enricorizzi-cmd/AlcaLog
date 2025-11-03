import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/inventari - Lista inventari
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const sede = searchParams.get('sede');
    const sezione = searchParams.get('sezione');
    const soloAperti = searchParams.get('solo_aperti') === 'true';

    let query = supabase
      .from('inventari')
      .select('*, utente:utenti_profilo(*), righe:inventari_righe(*)')
      .order('creato_at', { ascending: false });

    // Filtri
    if (sede) {
      query = query.eq('sede', sede);
    }
    if (sezione) {
      query = query.eq('sezione', sezione);
    }
    if (soloAperti) {
      query = query.is('inviato_at', null);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Errore recupero inventari:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// POST /api/inventari - Crea inventario
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
    const { sede, sezione, note, righe } = body;

    if (!sede || !sezione || !righe || !Array.isArray(righe)) {
      return NextResponse.json(
        { error: 'Sede, sezione e righe sono obbligatorie' },
        { status: 400 }
      );
    }

    // Crea inventario
    const { data: inventario, error: inventarioError } = await supabase
      .from('inventari')
      .insert({
        sede,
        sezione,
        utente_id: user.id,
        note: note || null,
      })
      .select()
      .single();

    if (inventarioError) {
      return NextResponse.json(
        { error: inventarioError.message },
        { status: 400 }
      );
    }

    // Crea righe inventario
    const righeInsert = righe.map((riga: any) => ({
      inventario_id: inventario.id,
      articolo: riga.articolo,
      lotto_id: riga.lotto_id,
      sede,
      sezione,
      unita_misura: riga.unita_misura || null,
      giacenza_teorica: parseFloat(riga.giacenza_teorica || 0),
      conteggio_fisico: riga.conteggio_fisico ? parseFloat(riga.conteggio_fisico) : null,
    }));

    const { error: righeError } = await supabase
      .from('inventari_righe')
      .insert(righeInsert);

    if (righeError) {
      // Elimina inventario se falliscono le righe
      await supabase.from('inventari').delete().eq('id', inventario.id);
      return NextResponse.json(
        { error: righeError.message },
        { status: 400 }
      );
    }

    // Recupera inventario completo
    const { data: inventarioCompleto } = await supabase
      .from('inventari')
      .select('*, righe:inventari_righe(*)')
      .eq('id', inventario.id)
      .single();

    return NextResponse.json(inventarioCompleto, { status: 201 });
  } catch (error) {
    console.error('Errore creazione inventario:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}


