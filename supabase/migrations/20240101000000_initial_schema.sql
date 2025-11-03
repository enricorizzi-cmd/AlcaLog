-- ============================================
-- MIGRAZIONE INIZIALE - ALCALOG
-- Database completo per gestione magazzino
-- ============================================

-- Abilita estensioni necessarie
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELLE BASE (ANAGRAFICHE)
-- ============================================

-- 1. FORNITORI
CREATE TABLE IF NOT EXISTS fornitori (
    codice TEXT PRIMARY KEY,
    descrizione TEXT NOT NULL,
    referente TEXT,
    telefono TEXT,
    mail TEXT,
    indirizzo TEXT,
    archiviato BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fornitori_descrizione ON fornitori(descrizione);
CREATE INDEX IF NOT EXISTS idx_fornitori_archiviato ON fornitori(archiviato) WHERE archiviato = FALSE;

-- 2. ARTICOLI
CREATE TABLE IF NOT EXISTS articoli (
    codice_interno TEXT PRIMARY KEY,
    tipologia TEXT,
    categoria TEXT,
    codice_fornitore TEXT,
    fornitore_predefinito TEXT REFERENCES fornitori(codice),
    descrizione TEXT NOT NULL,
    peso_netto DECIMAL(10,4),
    unita_misura TEXT,
    ultimo_prezzo DECIMAL(10,4),
    scorta_minima DECIMAL(10,4),
    archiviato BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_articoli_fornitore ON articoli(fornitore_predefinito);
CREATE INDEX IF NOT EXISTS idx_articoli_categoria ON articoli(categoria);
CREATE INDEX IF NOT EXISTS idx_articoli_tipologia ON articoli(tipologia);
CREATE INDEX IF NOT EXISTS idx_articoli_archiviato ON articoli(archiviato) WHERE archiviato = FALSE;

-- 3. MAGAZZINI UBICAZIONI
CREATE TABLE IF NOT EXISTS magazzini_ubicazioni (
    sede TEXT NOT NULL,
    sezione TEXT NOT NULL,
    PRIMARY KEY (sede, sezione)
);

-- 4. RUOLI
CREATE TABLE IF NOT EXISTS ruoli (
    codice TEXT PRIMARY KEY,
    descrizione TEXT NOT NULL
);

-- 5. UTENTI (profilo esteso, auth.users gestito da Supabase Auth)
CREATE TABLE IF NOT EXISTS utenti_profilo (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    cognome TEXT NOT NULL,
    telefono TEXT,
    ruolo_codice TEXT REFERENCES ruoli(codice),
    sede_predefinita TEXT,
    sezione_predefinita TEXT,
    FOREIGN KEY (sede_predefinita, sezione_predefinita) 
      REFERENCES magazzini_ubicazioni(sede, sezione),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_utenti_ruolo ON utenti_profilo(ruolo_codice);
CREATE INDEX IF NOT EXISTS idx_utenti_ubicazione ON utenti_profilo(sede_predefinita, sezione_predefinita);

-- 6. RUOLI TAB ABILITATE
CREATE TABLE IF NOT EXISTS ruoli_tab_abilitate (
    ruolo_codice TEXT REFERENCES ruoli(codice) ON DELETE CASCADE,
    tab_nome TEXT NOT NULL,
    permesso_vista BOOLEAN DEFAULT FALSE,
    permesso_modifica BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (ruolo_codice, tab_nome)
);

-- ============================================
-- TABELLE OPERATIVE
-- ============================================

-- 7. ARTICOLI LOTTI
CREATE TABLE IF NOT EXISTS articoli_lotti (
    id TEXT PRIMARY KEY, -- BATCH_ID (alfanumerico sequenziale)
    lotto_interno SERIAL, -- Lotto interno sequenziale automatico
    lotto_fornitore TEXT NOT NULL, -- Lotto inserito manualmente
    articolo TEXT REFERENCES articoli(codice_interno) ON DELETE RESTRICT,
    scadenza DATE NOT NULL,
    UNIQUE(articolo, lotto_fornitore, scadenza),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lotti_articolo ON articoli_lotti(articolo);
CREATE INDEX IF NOT EXISTS idx_lotti_batch ON articoli_lotti(id);
CREATE INDEX IF NOT EXISTS idx_lotti_unique ON articoli_lotti(articolo, lotto_fornitore, scadenza);

-- 8. ORDINI FORNITORI (testata)
CREATE TABLE IF NOT EXISTS ordini_fornitori (
    id SERIAL PRIMARY KEY,
    data_ordine DATE NOT NULL,
    numero_ordine TEXT UNIQUE,
    fornitore_movimento TEXT REFERENCES fornitori(codice) ON DELETE RESTRICT,
    note_totali TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_ordini_data ON ordini_fornitori(data_ordine);
CREATE INDEX IF NOT EXISTS idx_ordini_fornitore ON ordini_fornitori(fornitore_movimento);
CREATE INDEX IF NOT EXISTS idx_ordini_created_by ON ordini_fornitori(created_by);

-- 9. ORDINI FORNITORI RIGHE
CREATE TABLE IF NOT EXISTS ordini_fornitori_righe (
    id SERIAL PRIMARY KEY,
    ordine_id INTEGER REFERENCES ordini_fornitori(id) ON DELETE CASCADE,
    tipologia TEXT,
    categoria TEXT,
    codice_fornitore TEXT,
    fornitore_predef_articolo TEXT REFERENCES fornitori(codice),
    articolo TEXT REFERENCES articoli(codice_interno) ON DELETE RESTRICT,
    descrizione TEXT,
    peso_netto DECIMAL(10,4),
    unita_misura TEXT,
    ultimo_prezzo DECIMAL(10,4),
    prezzo_medio_fifo_snapshot DECIMAL(10,4),
    quantita_ordine DECIMAL(10,4) NOT NULL,
    data_arrivo_prevista DATE
);

CREATE INDEX IF NOT EXISTS idx_ordini_righe_ordine ON ordini_fornitori_righe(ordine_id);
CREATE INDEX IF NOT EXISTS idx_ordini_righe_articolo ON ordini_fornitori_righe(articolo);

-- 10. MOVIMENTI MAGAZZINO
CREATE TABLE IF NOT EXISTS movimenti_magazzino (
    id SERIAL PRIMARY KEY,
    tipo_movimento TEXT NOT NULL CHECK (tipo_movimento IN ('CARICO', 'SCARICO', 'TRASF_OUT', 'TRASF_IN')),
    articolo TEXT REFERENCES articoli(codice_interno) ON DELETE RESTRICT,
    lotto_id TEXT REFERENCES articoli_lotti(id) ON DELETE RESTRICT,
    sede TEXT NOT NULL,
    sezione TEXT NOT NULL,
    FOREIGN KEY (sede, sezione) REFERENCES magazzini_ubicazioni(sede, sezione),
    quantita DECIMAL(10,4) NOT NULL, -- Consente negativi
    prezzo_unitario DECIMAL(10,4), -- Obbligatorio solo per CARICO
    data_effettiva DATE NOT NULL,
    ora_effettiva TIME NOT NULL,
    note_riga TEXT,
    ordine_riga_id INTEGER REFERENCES ordini_fornitori_righe(id),
    trasferimento_id INTEGER,
    utente_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_movimenti_data_ora ON movimenti_magazzino(data_effettiva, ora_effettiva);
CREATE INDEX IF NOT EXISTS idx_movimenti_articolo ON movimenti_magazzino(articolo);
CREATE INDEX IF NOT EXISTS idx_movimenti_lotto ON movimenti_magazzino(lotto_id);
CREATE INDEX IF NOT EXISTS idx_movimenti_ubicazione ON movimenti_magazzino(sede, sezione);
CREATE INDEX IF NOT EXISTS idx_movimenti_tipo ON movimenti_magazzino(tipo_movimento);
CREATE INDEX IF NOT EXISTS idx_movimenti_utente ON movimenti_magazzino(utente_id);

-- 11. RICEVIMENTI NOTE
CREATE TABLE IF NOT EXISTS ricevimenti_note (
    id SERIAL PRIMARY KEY,
    ordine_id INTEGER REFERENCES ordini_fornitori(id) ON DELETE CASCADE,
    testo TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_note_ordine ON ricevimenti_note(ordine_id);

-- 12. TRASFERIMENTI
CREATE TABLE IF NOT EXISTS trasferimenti (
    id SERIAL PRIMARY KEY,
    articolo TEXT REFERENCES articoli(codice_interno) ON DELETE RESTRICT,
    lotto_id TEXT REFERENCES articoli_lotti(id) ON DELETE RESTRICT,
    sede_origine TEXT NOT NULL,
    sezione_origine TEXT NOT NULL,
    sede_destinazione TEXT NOT NULL,
    sezione_destinazione TEXT NOT NULL,
    FOREIGN KEY (sede_origine, sezione_origine) REFERENCES magazzini_ubicazioni(sede, sezione),
    FOREIGN KEY (sede_destinazione, sezione_destinazione) REFERENCES magazzini_ubicazioni(sede, sezione),
    quantita DECIMAL(10,4) NOT NULL,
    data_effettiva DATE NOT NULL,
    ora_effettiva TIME NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trasf_data ON trasferimenti(data_effettiva, ora_effettiva);
CREATE INDEX IF NOT EXISTS idx_trasf_origine ON trasferimenti(sede_origine, sezione_origine);
CREATE INDEX IF NOT EXISTS idx_trasf_destinazione ON trasferimenti(sede_destinazione, sezione_destinazione);
CREATE INDEX IF NOT EXISTS idx_trasf_articolo ON trasferimenti(articolo, lotto_id);

-- 13. INVENTARI (testata)
CREATE TABLE IF NOT EXISTS inventari (
    id SERIAL PRIMARY KEY,
    sede TEXT NOT NULL,
    sezione TEXT NOT NULL,
    FOREIGN KEY (sede, sezione) REFERENCES magazzini_ubicazioni(sede, sezione),
    utente_id UUID REFERENCES auth.users(id),
    creato_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    inviato_at TIMESTAMP WITH TIME ZONE,
    note TEXT
);

CREATE INDEX IF NOT EXISTS idx_inventari_creato ON inventari(creato_at);
CREATE INDEX IF NOT EXISTS idx_inventari_inviato ON inventari(inviato_at);
CREATE INDEX IF NOT EXISTS idx_inventari_ubicazione ON inventari(sede, sezione);
CREATE INDEX IF NOT EXISTS idx_inventari_utente ON inventari(utente_id);

-- 14. INVENTARI RIGHE
CREATE TABLE IF NOT EXISTS inventari_righe (
    id SERIAL PRIMARY KEY,
    inventario_id INTEGER REFERENCES inventari(id) ON DELETE CASCADE,
    articolo TEXT REFERENCES articoli(codice_interno) ON DELETE RESTRICT,
    lotto_id TEXT REFERENCES articoli_lotti(id) ON DELETE RESTRICT,
    sede TEXT NOT NULL,
    sezione TEXT NOT NULL,
    FOREIGN KEY (sede, sezione) REFERENCES magazzini_ubicazioni(sede, sezione),
    unita_misura TEXT,
    giacenza_teorica DECIMAL(10,4) NOT NULL,
    conteggio_fisico DECIMAL(10,4),
    differenza DECIMAL(10,4) GENERATED ALWAYS AS (conteggio_fisico - giacenza_teorica) STORED
);

CREATE INDEX IF NOT EXISTS idx_inventari_righe_inventario ON inventari_righe(inventario_id);
CREATE INDEX IF NOT EXISTS idx_inventari_righe_articolo ON inventari_righe(articolo, lotto_id);

-- 15. NOTIFICHE EVENTI CONFIG
CREATE TABLE IF NOT EXISTS notifiche_eventi_config (
    evento TEXT NOT NULL CHECK (evento IN (
      'CREAZIONE_ORDINE', 'EVASIONE_RICEVIMENTO', 'CREAZIONE_QR', 
      'RIGA_AGGIUNTA_PREZZO_DA_DEFINIRE', 'PRELIEVO_NEGATIVO_O_LOTTO_ASSENTE', 
      'INVENTARIO_INVIATO'
    )),
    ruolo_codice TEXT REFERENCES ruoli(codice) ON DELETE CASCADE,
    PRIMARY KEY (evento, ruolo_codice)
);

CREATE INDEX IF NOT EXISTS idx_notifiche_config_evento ON notifiche_eventi_config(evento);

-- 16. NOTIFICHE LOG
CREATE TABLE IF NOT EXISTS notifiche_log (
    id SERIAL PRIMARY KEY,
    evento TEXT NOT NULL,
    destinatario_utente_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    destinatario_ruolo_codice TEXT REFERENCES ruoli(codice) ON DELETE CASCADE,
    riferimento TEXT, -- ID documento/movimento
    messaggio TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    letto BOOLEAN DEFAULT FALSE,
    letto_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_notifiche_destinatario ON notifiche_log(destinatario_utente_id);
CREATE INDEX IF NOT EXISTS idx_notifiche_ruolo ON notifiche_log(destinatario_ruolo_codice);
CREATE INDEX IF NOT EXISTS idx_notifiche_created ON notifiche_log(created_at);
CREATE INDEX IF NOT EXISTS idx_notifiche_letto ON notifiche_log(letto, created_at) WHERE letto = FALSE;

-- 17. PIANIFICAZIONE PROPOSTE TRASFERIMENTI
CREATE TABLE IF NOT EXISTS pianificazione_proposte_trasferimenti (
    id SERIAL PRIMARY KEY,
    articolo TEXT REFERENCES articoli(codice_interno) ON DELETE CASCADE,
    da_sede TEXT NOT NULL,
    da_sezione TEXT NOT NULL,
    a_sede TEXT NOT NULL,
    a_sezione TEXT NOT NULL,
    FOREIGN KEY (da_sede, da_sezione) REFERENCES magazzini_ubicazioni(sede, sezione),
    FOREIGN KEY (a_sede, a_sezione) REFERENCES magazzini_ubicazioni(sede, sezione),
    quantita_proposta DECIMAL(10,4) NOT NULL,
    target_da DECIMAL(10,4),
    giacenza_da DECIMAL(10,4),
    scorta_minima_da DECIMAL(10,4),
    scorta_media12m_da DECIMAL(10,4),
    sessione_id TEXT NOT NULL,
    stato TEXT DEFAULT 'PROPOSTO' CHECK (stato IN ('PROPOSTO', 'MODIFICATO', 'CONFERMATO', 'ANNULLATO'))
);

CREATE INDEX IF NOT EXISTS idx_pianif_trasf_sessione ON pianificazione_proposte_trasferimenti(sessione_id);
CREATE INDEX IF NOT EXISTS idx_pianif_trasf_articolo ON pianificazione_proposte_trasferimenti(articolo);
CREATE INDEX IF NOT EXISTS idx_pianif_trasf_stato ON pianificazione_proposte_trasferimenti(stato);

-- 18. PIANIFICAZIONE PROPOSTE ORDINI
CREATE TABLE IF NOT EXISTS pianificazione_proposte_ordini (
    id SERIAL PRIMARY KEY,
    fornitore TEXT REFERENCES fornitori(codice) ON DELETE CASCADE,
    articolo TEXT REFERENCES articoli(codice_interno) ON DELETE CASCADE,
    quantita_proposta DECIMAL(10,4) NOT NULL,
    motivo TEXT,
    perimetro TEXT CHECK (perimetro IN ('AGGREGATO', 'SEDE_SEZIONE')),
    sessione_id TEXT NOT NULL,
    stato TEXT DEFAULT 'PROPOSTO' CHECK (stato IN ('PROPOSTO', 'MODIFICATO', 'CONFERMATO', 'ANNULLATO'))
);

CREATE INDEX IF NOT EXISTS idx_pianif_ordini_sessione ON pianificazione_proposte_ordini(sessione_id);
CREATE INDEX IF NOT EXISTS idx_pianif_ordini_fornitore ON pianificazione_proposte_ordini(fornitore);
CREATE INDEX IF NOT EXISTS idx_pianif_ordini_articolo ON pianificazione_proposte_ordini(articolo);
CREATE INDEX IF NOT EXISTS idx_pianif_ordini_stato ON pianificazione_proposte_ordini(stato);

-- ============================================
-- VISTE DATABASE
-- ============================================

-- Vista Giacenze (calcolo real-time)
CREATE OR REPLACE VIEW giacenze_v AS
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
    -- Prezzo medio FIFO (calcolato globalmente per articolo, non per sezione)
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
    -- Scorta media 12 mesi (calcolo ponderato e indicizzato per mesi)
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

-- Vista Ordini Residui
CREATE OR REPLACE VIEW ordini_residuo_v AS
SELECT 
    ofr.id as ordine_riga_id,
    ofr.quantita_ordine,
    COALESCE(SUM(CASE WHEN m.tipo_movimento = 'CARICO' THEN m.quantita ELSE 0 END), 0) as quantita_evasa,
    ofr.quantita_ordine - COALESCE(SUM(CASE WHEN m.tipo_movimento = 'CARICO' THEN m.quantita ELSE 0 END), 0) as quantita_residua
FROM ordini_fornitori_righe ofr
LEFT JOIN movimenti_magazzino m ON m.ordine_riga_id = ofr.id 
GROUP BY ofr.id, ofr.quantita_ordine;

-- ============================================
-- FUNZIONI E TRIGGERS
-- ============================================

-- Trigger per aggiornamento updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_fornitori_updated_at
    BEFORE UPDATE ON fornitori
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articoli_updated_at
    BEFORE UPDATE ON articoli
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_utenti_profilo_updated_at
    BEFORE UPDATE ON utenti_profilo
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Abilita RLS su tutte le tabelle
ALTER TABLE fornitori ENABLE ROW LEVEL SECURITY;
ALTER TABLE articoli ENABLE ROW LEVEL SECURITY;
ALTER TABLE magazzini_ubicazioni ENABLE ROW LEVEL SECURITY;
ALTER TABLE ruoli ENABLE ROW LEVEL SECURITY;
ALTER TABLE utenti_profilo ENABLE ROW LEVEL SECURITY;
ALTER TABLE ruoli_tab_abilitate ENABLE ROW LEVEL SECURITY;
ALTER TABLE articoli_lotti ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordini_fornitori ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordini_fornitori_righe ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimenti_magazzino ENABLE ROW LEVEL SECURITY;
ALTER TABLE ricevimenti_note ENABLE ROW LEVEL SECURITY;
ALTER TABLE trasferimenti ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventari ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventari_righe ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifiche_eventi_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifiche_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE pianificazione_proposte_trasferimenti ENABLE ROW LEVEL SECURITY;
ALTER TABLE pianificazione_proposte_ordini ENABLE ROW LEVEL SECURITY;

-- Policy base: tutti gli utenti autenticati possono leggere
-- (le policy specifiche per ruoli verranno create dopo i seed)
CREATE POLICY "Utenti autenticati possono leggere" ON fornitori
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono leggere" ON articoli
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono leggere" ON magazzini_ubicazioni
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono leggere" ON ruoli
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy per utenti_profilo: ogni utente vede solo il proprio profilo
CREATE POLICY "Utenti vedono solo il proprio profilo" ON utenti_profilo
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Utenti modificano solo il proprio profilo" ON utenti_profilo
    FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- SEED DATA INIZIALE
-- ============================================

-- Ruoli base
INSERT INTO ruoli (codice, descrizione) VALUES
('ADMIN', 'Amministratore'),
('MAGAZZINIERE', 'Magazziniere'),
('UFFICIO', 'Ufficio')
ON CONFLICT (codice) DO NOTHING;

-- Tab disponibili per permessi
-- I permessi verranno configurati dall'admin tramite interfaccia

COMMENT ON TABLE fornitori IS 'Anagrafica fornitori con soft delete (archiviazione)';
COMMENT ON TABLE articoli IS 'Anagrafica articoli con gestione lotti/scadenze, soft delete';
COMMENT ON TABLE articoli_lotti IS 'Lotti articoli con BATCH_ID (alfanumerico) e lotto interno sequenziale';
COMMENT ON TABLE movimenti_magazzino IS 'Tutti i movimenti: CARICO, SCARICO, TRASF_OUT, TRASF_IN';
COMMENT ON VIEW giacenze_v IS 'Vista calcolo real-time giacenze con FIFO globale e scorta media 12m';


