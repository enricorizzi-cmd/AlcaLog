/**
 * Calcolo Prezzo Medio FIFO
 * Precisione: 4 decimali
 * Calcolo globale per articolo (non per sezione)
 * Non viene intaccato dai trasferimenti
 */

import { createClient } from '@/lib/supabase/server';
import type { MovimentoMagazzino } from '@/types/database';

/**
 * Calcola il prezzo medio FIFO per un articolo
 * Media ponderata dei CARICHI dal primo movimento ad oggi
 */
export async function calcolaPrezzoMedioFIFO(
  articoloCodice: string
): Promise<number | null> {
  const supabase = await createClient();

  // Recupera tutti i CARICHI per l'articolo, ordinati per data/ora
  const { data: movimenti, error } = await supabase
    .from('movimenti_magazzino')
    .select('prezzo_unitario, quantita, data_effettiva, ora_effettiva')
    .eq('articolo', articoloCodice)
    .eq('tipo_movimento', 'CARICO')
    .not('prezzo_unitario', 'is', null)
    .order('data_effettiva', { ascending: true })
    .order('ora_effettiva', { ascending: true });

  if (error || !movimenti || movimenti.length === 0) {
    return null;
  }

  // Calcola media ponderata
  let totaleQuantita = 0;
  let totaleValore = 0;

  for (const movimento of movimenti) {
    if (movimento.prezzo_unitario && movimento.quantita > 0) {
      totaleQuantita += movimento.quantita;
      totaleValore += movimento.prezzo_unitario * movimento.quantita;
    }
  }

  if (totaleQuantita === 0) {
    return null;
  }

  // Precisione 4 decimali
  const prezzoMedio = totaleValore / totaleQuantita;
  return Math.round(prezzoMedio * 10000) / 10000;
}

/**
 * Calcola prezzo medio FIFO per più articoli (batch)
 */
export async function calcolaPrezzoMedioFIFOBatch(
  articoliCodici: string[]
): Promise<Record<string, number | null>> {
  const results: Record<string, number | null> = {};

  for (const codice of articoliCodici) {
    results[codice] = await calcolaPrezzoMedioFIFO(codice);
  }

  return results;
}

