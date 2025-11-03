-- ============================================
-- MIGRAZIONE: Policy RLS SELECT mancanti
-- Aggiunge policy SELECT per tutte le tabelle che ne sono prive
-- ============================================

-- Policy SELECT per INVENTARI
CREATE POLICY "Utenti autenticati possono leggere inventari" ON inventari
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy SELECT per INVENTARI RIGHE
CREATE POLICY "Utenti autenticati possono leggere righe inventari" ON inventari_righe
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy SELECT per MOVIMENTI MAGAZZINO
CREATE POLICY "Utenti autenticati possono leggere movimenti" ON movimenti_magazzino
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy SELECT per NOTIFICHE EVENTI CONFIG
CREATE POLICY "Utenti autenticati possono leggere config notifiche" ON notifiche_eventi_config
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy SELECT per NOTIFICHE LOG
CREATE POLICY "Utenti autenticati possono leggere notifiche" ON notifiche_log
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy SELECT per ORDINI FORNITORI
CREATE POLICY "Utenti autenticati possono leggere ordini" ON ordini_fornitori
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy SELECT per ORDINI FORNITORI RIGHE
CREATE POLICY "Utenti autenticati possono leggere righe ordini" ON ordini_fornitori_righe
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy SELECT per PIANIFICAZIONE PROPOSTE ORDINI
CREATE POLICY "Utenti autenticati possono leggere proposte ordini" ON pianificazione_proposte_ordini
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy SELECT per PIANIFICAZIONE PROPOSTE TRASFERIMENTI
CREATE POLICY "Utenti autenticati possono leggere proposte trasferimenti" ON pianificazione_proposte_trasferimenti
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy SELECT per RICEVIMENTI NOTE
CREATE POLICY "Utenti autenticati possono leggere note" ON ricevimenti_note
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy SELECT per RUOLI TAB ABILITATE
CREATE POLICY "Utenti autenticati possono leggere permessi" ON ruoli_tab_abilitate
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy SELECT per TRASFERIMENTI
CREATE POLICY "Utenti autenticati possono leggere trasferimenti" ON trasferimenti
    FOR SELECT USING (auth.role() = 'authenticated');

