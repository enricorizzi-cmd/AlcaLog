-- Script per creare utente Super Admin
-- Questo script deve essere eseguito DOPO aver creato l'utente in Supabase Auth Dashboard
-- oppure può essere eseguito tramite Supabase CLI/SQL Editor

-- IMPORTANTE: Prima crea l'utente in Supabase Auth Dashboard:
-- 1. Vai su Supabase Dashboard > Authentication > Users
-- 2. Clicca "Add user" > "Create new user"
-- 3. Email: enricorizzi1991@gmail.com
-- 4. Password: Enri124578!
-- 5. Copia l'UUID dell'utente creato e sostituiscilo nella variabile USER_UUID qui sotto

-- In alternativa, usa questo comando SQL (richiede privilegi admin):
-- SELECT auth.uid() FROM auth.users WHERE email = 'enricorizzi1991@gmail.com';

-- ============================================
-- STEP 1: Trova o inserisci l'UUID dell'utente
-- ============================================
-- Se l'utente è già stato creato via Dashboard, ottieni il suo UUID:
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

    -- ============================================
    -- STEP 2: Assicura che il ruolo ADMIN esista
    -- ============================================
    INSERT INTO ruoli (codice, descrizione)
    VALUES (admin_ruolo, 'Amministratore')
    ON CONFLICT (codice) DO NOTHING;

    -- ============================================
    -- STEP 3: Crea/aggiorna il profilo utente
    -- ============================================
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

    -- ============================================
    -- STEP 4: Assegna tutti i permessi al ruolo ADMIN
    -- ============================================
    -- Lista completa delle tab per permessi (come da documentazione)
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

    RAISE NOTICE 'Utente Super Admin creato con successo!';
    RAISE NOTICE 'UUID: %', user_uuid;
    RAISE NOTICE 'Email: enricorizzi1991@gmail.com';
    RAISE NOTICE 'Ruolo: ADMIN (tutti i permessi abilitati)';
END $$;

-- Verifica finale
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

