-- ============================================
-- MIGRAZIONE: Policy RLS per INSERT/UPDATE/DELETE
-- Aggiunge policy per permettere operazioni CRUD agli utenti autenticati
-- ============================================

-- Policy per FORNITORI
CREATE POLICY "Utenti autenticati possono inserire fornitori" ON fornitori
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono modificare fornitori" ON fornitori
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono eliminare fornitori" ON fornitori
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policy per ARTICOLI
CREATE POLICY "Utenti autenticati possono inserire articoli" ON articoli
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono modificare articoli" ON articoli
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono eliminare articoli" ON articoli
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policy per MAGAZZINI UBICAZIONI
CREATE POLICY "Utenti autenticati possono inserire magazzini" ON magazzini_ubicazioni
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono modificare magazzini" ON magazzini_ubicazioni
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono eliminare magazzini" ON magazzini_ubicazioni
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policy per RUOLI (solo admin può modificare, ma permettiamo INSERT/UPDATE agli autenticati)
CREATE POLICY "Utenti autenticati possono inserire ruoli" ON ruoli
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono modificare ruoli" ON ruoli
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono eliminare ruoli" ON ruoli
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policy per RUOLI TAB ABILITATE
CREATE POLICY "Utenti autenticati possono inserire permessi" ON ruoli_tab_abilitate
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono modificare permessi" ON ruoli_tab_abilitate
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono eliminare permessi" ON ruoli_tab_abilitate
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policy per ARTICOLI LOTTI
CREATE POLICY "Utenti autenticati possono inserire lotti" ON articoli_lotti
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono modificare lotti" ON articoli_lotti
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono eliminare lotti" ON articoli_lotti
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policy per ORDINI FORNITORI
CREATE POLICY "Utenti autenticati possono inserire ordini" ON ordini_fornitori
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono modificare ordini" ON ordini_fornitori
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono eliminare ordini" ON ordini_fornitori
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policy per ORDINI FORNITORI RIGHE
CREATE POLICY "Utenti autenticati possono inserire righe ordini" ON ordini_fornitori_righe
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono modificare righe ordini" ON ordini_fornitori_righe
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono eliminare righe ordini" ON ordini_fornitori_righe
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policy per MOVIMENTI MAGAZZINO
CREATE POLICY "Utenti autenticati possono inserire movimenti" ON movimenti_magazzino
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono modificare movimenti" ON movimenti_magazzino
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono eliminare movimenti" ON movimenti_magazzino
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policy per RICEVIMENTI NOTE
CREATE POLICY "Utenti autenticati possono inserire note" ON ricevimenti_note
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono modificare note" ON ricevimenti_note
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono eliminare note" ON ricevimenti_note
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policy per TRASFERIMENTI
CREATE POLICY "Utenti autenticati possono inserire trasferimenti" ON trasferimenti
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono modificare trasferimenti" ON trasferimenti
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono eliminare trasferimenti" ON trasferimenti
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policy per INVENTARI
CREATE POLICY "Utenti autenticati possono inserire inventari" ON inventari
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono modificare inventari" ON inventari
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono eliminare inventari" ON inventari
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policy per INVENTARI RIGHE
CREATE POLICY "Utenti autenticati possono inserire righe inventari" ON inventari_righe
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono modificare righe inventari" ON inventari_righe
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono eliminare righe inventari" ON inventari_righe
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policy per NOTIFICHE EVENTI CONFIG
CREATE POLICY "Utenti autenticati possono inserire config notifiche" ON notifiche_eventi_config
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono modificare config notifiche" ON notifiche_eventi_config
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono eliminare config notifiche" ON notifiche_eventi_config
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policy per NOTIFICHE LOG
CREATE POLICY "Utenti autenticati possono inserire notifiche" ON notifiche_log
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono modificare notifiche" ON notifiche_log
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono eliminare notifiche" ON notifiche_log
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policy per PIANIFICAZIONE PROPOSTE TRASFERIMENTI
CREATE POLICY "Utenti autenticati possono inserire proposte trasferimenti" ON pianificazione_proposte_trasferimenti
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono modificare proposte trasferimenti" ON pianificazione_proposte_trasferimenti
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono eliminare proposte trasferimenti" ON pianificazione_proposte_trasferimenti
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policy per PIANIFICAZIONE PROPOSTE ORDINI
CREATE POLICY "Utenti autenticati possono inserire proposte ordini" ON pianificazione_proposte_ordini
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono modificare proposte ordini" ON pianificazione_proposte_ordini
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono eliminare proposte ordini" ON pianificazione_proposte_ordini
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policy per UTENTI PROFILO (già esistente, aggiungiamo INSERT)
CREATE POLICY "Utenti autenticati possono inserire profilo" ON utenti_profilo
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Nota: UPDATE e SELECT già esistono nella migrazione precedente

