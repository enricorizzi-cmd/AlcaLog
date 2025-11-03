/**
 * Generatore BATCH_ID per QR code
 * BATCH_ID è alfanumerico sequenziale (es: ALCA001, ALCA002...)
 * Viene generato automaticamente quando si crea un lotto
 */

import { createClient } from '@/lib/supabase/server';

const BATCH_PREFIX = 'ALCA';

/**
 * Genera un nuovo BATCH_ID sequenziale
 * Formato: ALCA + numero sequenziale (es: ALCA001, ALCA002)
 */
export async function generateBatchId(): Promise<string> {
  const supabase = await createClient();
  
  // Trova il lotto_interno più alto
  const { data, error } = await supabase
    .from('articoli_lotti')
    .select('lotto_interno')
    .order('lotto_interno', { ascending: false })
    .limit(1);

  let nextNumber = 1;
  
  // Se ci sono record, usa il più alto + 1, altrimenti inizia da 1
  if (data && data.length > 0 && !error) {
    nextNumber = (data[0].lotto_interno || 0) + 1;
  }

  // Formatta come ALCA + numero a 6 cifre (es: ALCA000001)
  const batchId = `${BATCH_PREFIX}${nextNumber.toString().padStart(6, '0')}`;
  
  return batchId;
}

/**
 * Decodifica BATCH_ID per ottenere articolo, lotto e scadenza
 */
export async function decodeBatchId(batchId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('articoli_lotti')
    .select('*, articolo_data:articoli(*)')
    .eq('id', batchId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    batchId: data.id,
    lottoId: data.id,
    articolo: typeof data.articolo === 'string' ? data.articolo : data.articolo_data?.codice_interno,
    articoloData: data.articolo_data,
    lotto_fornitore: data.lotto_fornitore,
    scadenza: data.scadenza,
  };
}

