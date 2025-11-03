import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import QRCode from 'qrcode';

// POST /api/qr/generate - Genera immagine QR code per BATCH_ID
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const body = await request.json();
    const { batch_id, size = 200 } = body;

    if (!batch_id) {
      return NextResponse.json(
        { error: 'BATCH_ID obbligatorio' },
        { status: 400 }
      );
    }

    // Genera QR code come data URL
    const qrDataUrl = await QRCode.toDataURL(batch_id, {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    // Estrai i dati base64
    const base64Data = qrDataUrl.split(',')[1];

    return NextResponse.json({
      batch_id,
      qr_data_url: qrDataUrl,
      base64: base64Data,
    });
  } catch (error) {
    console.error('Errore generazione QR:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}


