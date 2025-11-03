import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generaTemplateZPL } from '@/lib/utils/zpl';
import QRCode from 'qrcode';

// POST /api/ricevimenti/[ordine_id]/stampa-etichette - Genera e stampa etichette ZPL
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ordine_id: string }> }
) {
  try {
    const { ordine_id } = await params;
    const supabase = await createClient();

    const body = await request.json();
    const { righe, stampante_ip } = body;

    if (!righe || !Array.isArray(righe) || righe.length === 0) {
      return NextResponse.json(
        { error: 'Almeno una riga è obbligatoria' },
        { status: 400 }
      );
    }

    const etichetteZPL = [];
    const etichettePDF = [];

    for (const riga of righe) {
      const { batch_id, articolo, descrizione, lotto_fornitore, scadenza, quantita } = riga;

      if (!batch_id || !articolo) {
        continue;
      }

      // Recupera dati articolo
      const { data: articoloData } = await supabase
        .from('articoli')
        .select('descrizione')
        .eq('codice_interno', articolo)
        .single();

      const descrizioneArticolo = articoloData?.descrizione || descrizione || articolo;

      // Genera template ZPL
      const zpl = generaTemplateZPL({
        batchId: batch_id,
        codiceArticolo: articolo,
        descrizione: descrizioneArticolo,
        lottoFornitore: lotto_fornitore,
        scadenza: scadenza,
        quantita: quantita,
      });

      etichetteZPL.push({
        batch_id,
        articolo,
        zpl,
      });

      // Genera anche QR code per visualizzazione
      const qrDataUrl = await QRCode.toDataURL(batch_id, {
        width: 200,
        margin: 2,
      });

      etichettePDF.push({
        batch_id,
        articolo,
        descrizione: descrizioneArticolo,
        lotto_fornitore,
        scadenza,
        quantita,
        qr_code: qrDataUrl,
      });
    }

    // Se IP stampante fornito, invia via TCP (da implementare)
    if (stampante_ip) {
      // TODO: Implementare invio TCP/IP a stampante Zebra
      // const { sendZPLToPrinter } = await import('@/lib/utils/zpl-printer');
      // await sendZPLToPrinter(stampante_ip, etichetteZPL.map(e => e.zpl).join('\n'));
    }

    return NextResponse.json({
      success: true,
      etichette_generate: etichetteZPL.length,
      zpl_ready: etichetteZPL,
      pdf_preview: etichettePDF,
      stampante_ip: stampante_ip || null,
    });
  } catch (error) {
    console.error('Errore generazione etichette:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

