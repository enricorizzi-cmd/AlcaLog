-- ============================================
-- MIGRAZIONE: Fix viste e policy utenti_profilo
-- ============================================

-- Ricrea le viste senza SECURITY DEFINER (usa security_invoker)
DROP VIEW IF EXISTS giacenze_v CASCADE;
CREATE VIEW giacenze_v WITH (security_invoker=true) AS
SELECT 
    a.codice_interno as articolo,
    m.sede,
    m.sezione,
    a.tipologia,
    a.categoria,
    a.codice_fornitore,
    f.descrizione as fornitore_predefinito,
    a.descrizione,
    a.unita_misura,
    a.peso_netto,
    COALESCE(SUM(
      CASE 
        WHEN m.tipo_movimento IN ('CARICO', 'TRASF_IN') THEN m.quantita
        WHEN m.tipo_movimento IN ('SCARICO', 'TRASF_OUT') THEN -m.quantita
        ELSE 0
      END
    ), 0) as quantita_giacente,
    (SELECT 
      CASE 
        WHEN SUM(qty_carico) > 0 THEN SUM(prezzo * qty_carico) / SUM(qty_carico)
        ELSE NULL
      END
     FROM (
       SELECT prezzo_unitario as prezzo, quantita as qty_carico
       FROM movimenti_magazzino
       WHERE tipo_movimento = 'CARICO' 
         AND articolo = a.codice_interno
       ORDER BY data_effettiva, ora_effettiva
     ) fifo_calc
    ) as prezzo_medio_FIFO,
    a.scorta_minima,
    (SELECT 
      COALESCE(AVG(consumo_mensile), 0)
     FROM (
       SELECT 
         DATE_TRUNC('month', data_effettiva)::date as mese,
         SUM(CASE WHEN tipo_movimento = 'SCARICO' THEN quantita ELSE 0 END) as consumo_mensile
       FROM movimenti_magazzino
       WHERE articolo = a.codice_interno
         AND data_effettiva >= CURRENT_DATE - INTERVAL '12 months'
       GROUP BY DATE_TRUNC('month', data_effettiva)
     ) consumi_12m
    ) as scorta_media_12m
FROM articoli a
LEFT JOIN movimenti_magazzino m ON a.codice_interno = m.articolo
LEFT JOIN fornitori f ON a.fornitore_predefinito = f.codice
WHERE a.archiviato = FALSE
GROUP BY a.codice_interno, m.sede, m.sezione, a.tipologia, a.categoria, 
         a.codice_fornitore, f.descrizione, a.descrizione, a.unita_misura, a.peso_netto, a.scorta_minima;

DROP VIEW IF EXISTS ordini_residuo_v CASCADE;
CREATE VIEW ordini_residuo_v WITH (security_invoker=true) AS
SELECT 
    ofr.id as ordine_riga_id,
    ofr.quantita_ordine,
    COALESCE(SUM(CASE WHEN m.tipo_movimento = 'CARICO' THEN m.quantita ELSE 0 END), 0) as quantita_evasa,
    ofr.quantita_ordine - COALESCE(SUM(CASE WHEN m.tipo_movimento = 'CARICO' THEN m.quantita ELSE 0 END), 0) as quantita_residua
FROM ordini_fornitori_righe ofr
LEFT JOIN movimenti_magazzino m ON m.ordine_riga_id = ofr.id 
GROUP BY ofr.id, ofr.quantita_ordine;

-- Aggiungi policy DELETE per utenti_profilo
CREATE POLICY "Utenti autenticati possono eliminare profilo" ON utenti_profilo
    FOR DELETE USING (auth.uid() = id);

