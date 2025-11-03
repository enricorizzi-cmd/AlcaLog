import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/ordini/[id]/residui - Residui ordine
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Recupera righe ordine
    const { data: righe, error: righeError } = await supabase
      .from('ordini_fornitori_righe')
      .select('id')
      .eq('ordine_id', parseInt(id));

    if (righeError || !righe || righe.length === 0) {
      return NextResponse.json([]);
    }

    // Recupera residui per ogni riga
    const rigaIds = righe.map(r => r.id);
    
    const { data: residui, error: residuiError } = await supabase
      .from('ordini_residuo_v')
      .select('*')
      .in('ordine_riga_id', rigaIds);

    if (residuiError) {
      return NextResponse.json(
        { error: residuiError.message },
        { status: 400 }
      );
    }

    return NextResponse.json(residui || []);
  } catch (error) {
    console.error('Errore recupero residui:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}


