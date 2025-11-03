# ✅ VERIFICA COMPLETEZZA DATABASE

## 📋 Checklist Verifica Database Supabase

Dopo aver eseguito la migrazione `20240101000000_initial_schema.sql`, verifica che tutto sia stato creato correttamente.

### ✅ Tabelle Base (6 tabelle)
- [ ] `fornitori` - Anagrafica fornitori
- [ ] `articoli` - Anagrafica articoli
- [ ] `magazzini_ubicazioni` - Sedi e sezioni magazzino
- [ ] `ruoli` - Ruoli utenti (ADMIN, MAGAZZINIERE, UFFICIO)
- [ ] `utenti_profilo` - Profilo esteso utenti
- [ ] `ruoli_tab_abilitate` - Permessi per tab

### ✅ Tabelle Operative (12 tabelle)
- [ ] `articoli_lotti` - Lotti con BATCH_ID
- [ ] `ordini_fornitori` - Testata ordini
- [ ] `ordini_fornitori_righe` - Righe ordini
- [ ] `movimenti_magazzino` - Tutti i movimenti (CARICO, SCARICO, TRASF_OUT, TRASF_IN)
- [ ] `ricevimenti_note` - Note ricevimenti
- [ ] `trasferimenti` - Trasferimenti intra-azienda
- [ ] `inventari` - Testata inventari
- [ ] `inventari_righe` - Righe inventari
- [ ] `notifiche_eventi_config` - Configurazione notifiche
- [ ] `notifiche_log` - Log notifiche
- [ ] `pianificazione_proposte_trasferimenti` - Proposte trasferimenti
- [ ] `pianificazione_proposte_ordini` - Proposte ordini

### ✅ Viste (2 viste)
- [ ] `giacenze_v` - Vista calcolo giacenze real-time con FIFO e scorta media 12m
- [ ] `ordini_residuo_v` - Vista calcolo residui ordini

### ✅ Funzioni e Trigger (1 funzione + 3 trigger)
- [ ] `update_updated_at_column()` - Funzione per aggiornare updated_at
- [ ] Trigger `update_fornitori_updated_at`
- [ ] Trigger `update_articoli_updated_at`
- [ ] Trigger `update_utenti_profilo_updated_at`

### ✅ Row Level Security (RLS)
- [ ] RLS abilitato su tutte le 18 tabelle
- [ ] Policy base "Utenti autenticati possono leggere" su: fornitori, articoli, magazzini_ubicazioni, ruoli
- [ ] Policy "Utenti vedono solo il proprio profilo" su utenti_profilo
- [ ] Policy "Utenti modificano solo il proprio profilo" su utenti_profilo

### ✅ Seed Data
- [ ] Ruoli inseriti: ADMIN, MAGAZZINIERE, UFFICIO

### ⚠️ DA CONFIGURARE DOPO (non critico)
- [ ] Policy RLS specifiche per INSERT/UPDATE/DELETE (attualmente solo SELECT)
- [ ] Permessi per tab (ruoli_tab_abilitate) - da configurare tramite interfaccia admin
- [ ] Configurazione notifiche (notifiche_eventi_config) - da configurare tramite interfaccia

## 🧪 Test Rapidi

### 1. Verifica Tabella Ordini
```sql
SELECT COUNT(*) FROM ordini_fornitori;
-- Dovrebbe restituire 0 (tabella vuota ma esistente)
```

### 2. Verifica Vista Giacenze
```sql
SELECT * FROM giacenze_v LIMIT 1;
-- Dovrebbe funzionare senza errori
```

### 3. Verifica Vista Residui
```sql
SELECT * FROM ordini_residuo_v LIMIT 1;
-- Dovrebbe funzionare senza errori
```

### 4. Verifica API
- Vai su: https://alcalog.onrender.com/api/ordini
- Dovrebbe restituire `[]` (array vuoto) invece di errore 400

## 📝 Note Importanti

✅ **Il database è completo** se:
- Tutte le 18 tabelle sono presenti
- Le 2 viste funzionano
- L'API `/api/ordini` restituisce array vuoto invece di errore
- Non ci sono errori di foreign key o constraint

⚠️ **Se manca qualcosa**:
- Verifica i log in Supabase Dashboard → Database → Logs
- Controlla se ci sono errori durante l'esecuzione della migrazione
- Assicurati di aver copiato TUTTO il contenuto dello script SQL

