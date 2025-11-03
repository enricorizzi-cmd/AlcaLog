import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { decodeBatchId } from '@/lib/utils/batch-id';

// GET /api/prelievi/qr/[batch_id] - Decodifica QR (BATCH_ID)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ batch_id: string }> }
) {
  try {
    const { batch_id } = await params;
    const supabase = await createClient();

    const decoded = await decodeBatchId(batch_id);

    if (!decoded) {
      return NextResponse.json(
        { error: 'BATCH_ID non trovato' },
        { status: 404 }
      );
    }

    // Recupera giacenze per questo lotto
    const { data: giacenze } = await supabase
      .from('giacenze_v')
      .select('*')
      .eq('articolo', decoded.articolo);

    return NextResponse.json({
      batch_id,
      ...decoded,
      giacenze: giacenze || [],
    });
  } catch (error) {
    console.error('Errore decodifica QR:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

