-- ============================================
-- SCRIPT COMPLETO: Setup Database + Utente Super Admin
-- Questo script crea le tabelle necessarie E l'utente admin
-- ============================================

-- IMPORTANTE: Prima crea l'utente in Supabase Auth Dashboard:
-- 1. Vai su Supabase Dashboard > Authentication > Users
-- 2. Clicca "Add user" > "Create new user"
-- 3. Email: enricorizzi1991@gmail.com
-- 4. Password: Enri124578!
-- 5. Auto Confirm User: ✅

-- ============================================
-- PARTE 1: Creazione Tabelle Base (se non esistono)
-- ============================================

-- Abilita estensioni necessarie
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- 5. UTENTI PROFILO
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
-- PARTE 2: Creazione Utente Super Admin
-- ============================================

DO $$
DECLARE
    user_uuid UUID;
    admin_ruolo TEXT := 'ADMIN';
BEGIN
    -- Trova l'UUID dell'utente per email
    SELECT id INTO user_uuid
    FROM auth.users
    WHERE email = 'enricorizzi1991@gmail.com';

    -- Se l'utente non esiste, esce con errore
    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'Utente non trovato in auth.users. Crea prima l''utente in Supabase Auth Dashboard!';
    END IF;

    -- Assicura che il ruolo ADMIN esista
    INSERT INTO ruoli (codice, descrizione)
    VALUES (admin_ruolo, 'Amministratore')
    ON CONFLICT (codice) DO NOTHING;

    -- Crea/aggiorna il profilo utente
    INSERT INTO utenti_profilo (
        id,
        nome,
        cognome,
        ruolo_codice,
        created_at,
        updated_at
    )
    VALUES (
        user_uuid,
        'Enrico',
        'Rizzi',
        admin_ruolo,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) 
    DO UPDATE SET
        nome = EXCLUDED.nome,
        cognome = EXCLUDED.cognome,
        ruolo_codice = EXCLUDED.ruolo_codice,
        updated_at = NOW();

    -- Assegna tutti i permessi al ruolo ADMIN
    INSERT INTO ruoli_tab_abilitate (ruolo_codice, tab_nome, permesso_vista, permesso_modifica)
    VALUES
        (admin_ruolo, 'Fornitori', TRUE, TRUE),
        (admin_ruolo, 'Articoli', TRUE, TRUE),
        (admin_ruolo, 'Magazzini', TRUE, TRUE),
        (admin_ruolo, 'Giacenze', TRUE, TRUE),
        (admin_ruolo, 'Ordini', TRUE, TRUE),
        (admin_ruolo, 'Ricevimento', TRUE, TRUE),
        (admin_ruolo, 'Prelievo', TRUE, TRUE),
        (admin_ruolo, 'Trasferimenti', TRUE, TRUE),
        (admin_ruolo, 'Inventario', TRUE, TRUE),
        (admin_ruolo, 'Movimenti', TRUE, TRUE),
        (admin_ruolo, 'Pianificazione', TRUE, TRUE),
        (admin_ruolo, 'Utenti', TRUE, TRUE),
        (admin_ruolo, 'Ruoli', TRUE, TRUE),
        (admin_ruolo, 'Notifiche', TRUE, TRUE)
    ON CONFLICT (ruolo_codice, tab_nome)
    DO UPDATE SET
        permesso_vista = EXCLUDED.permesso_vista,
        permesso_modifica = EXCLUDED.permesso_modifica;

    RAISE NOTICE '✅ Utente Super Admin creato con successo!';
    RAISE NOTICE 'UUID: %', user_uuid;
    RAISE NOTICE 'Email: enricorizzi1991@gmail.com';
    RAISE NOTICE 'Ruolo: ADMIN (tutti i permessi abilitati)';
END $$;

-- ============================================
-- PARTE 3: Verifica Finale
-- ============================================

SELECT 
    u.id,
    u.email,
    up.nome,
    up.cognome,
    up.ruolo_codice,
    r.descrizione as ruolo_descrizione,
    COUNT(rta.tab_nome) as permessi_totali
FROM auth.users u
JOIN utenti_profilo up ON u.id = up.id
JOIN ruoli r ON up.ruolo_codice = r.codice
LEFT JOIN ruoli_tab_abilitate rta ON r.codice = rta.ruolo_codice
WHERE u.email = 'enricorizzi1991@gmail.com'
GROUP BY u.id, u.email, up.nome, up.cognome, up.ruolo_codice, r.descrizione;


