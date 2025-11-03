/**
 * Calcolo Scorta Media 12 mesi
 * Media ponderata e indicizzata per mesi
 * Gestione mesi senza movimenti (non conteggiati nella media)
 */

import { createClient } from '@/lib/supabase/server';

/**
 * Calcola la scorta media degli ultimi 12 mesi per un articolo
 * Media ponderata e indicizzata per mesi
 */
export async function calcolaScortaMedia12M(
  articoloCodice: string
): Promise<number> {
  const supabase = await createClient();

  // Recupera consumi mensili degli ultimi 12 mesi
  const { data: movimenti, error } = await supabase
    .from('movimenti_magazzino')
    .select('tipo_movimento, quantita, data_effettiva')
    .eq('articolo', articoloCodice)
    .gte('data_effettiva', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  if (error || !movimenti || movimenti.length === 0) {
    return 0;
  }

  // Raggruppa per mese e calcola consumi (solo SCARICHI)
  const consumiPerMese = new Map<string, number>();

  for (const movimento of movimenti) {
    if (movimento.tipo_movimento === 'SCARICO') {
      const mese = movimento.data_effettiva.substring(0, 7); // YYYY-MM
      const consumo = consumiPerMese.get(mese) || 0;
      consumiPerMese.set(mese, consumo + movimento.quantita);
    }
  }

  // Calcola media solo se ci sono mesi con consumi
  if (consumiPerMese.size === 0) {
    return 0;
  }

  const totaleConsumo = Array.from(consumiPerMese.values()).reduce(
    (sum, val) => sum + val,
    0
  );
  const media = totaleConsumo / consumiPerMese.size;

  // Arrotondamento a 4 decimali
  return Math.round(media * 10000) / 10000;
}

/**
 * Calcola Target = max(scorta_minima, scorta_media_12m)
 */
export function calcolaTarget(
  scortaMinima: number | null,
  scortaMedia12m: number
): number {
  if (!scortaMinima) {
    return scortaMedia12m;
  }
  return Math.max(scortaMinima, scortaMedia12m);
}

/**
 * Identifica Deficit e Surplus
 * Deficit: giacenza < Target
 * Surplus: giacenza > Target
 */
export function calcolaBilancio(
  giacenza: number,
  target: number
): {
  deficit: number;
  surplus: number;
  bilanciato: boolean;
} {
  const differenza = giacenza - target;
  
  return {
    deficit: differenza < 0 ? Math.abs(differenza) : 0,
    surplus: differenza > 0 ? differenza : 0,
    bilanciato: differenza === 0,
  };
}

