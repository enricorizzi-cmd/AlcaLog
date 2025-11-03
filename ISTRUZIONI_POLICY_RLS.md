# 🔐 ISTRUZIONI: Aggiungere Policy RLS per INSERT/UPDATE/DELETE

## Problema

Dopo aver eseguito la migrazione iniziale, le policy RLS permettono solo la **SELECT** (lettura), ma non INSERT, UPDATE o DELETE.

Questo causa errori come:
```
new row violates row-level security policy for table "articoli"
```

## Soluzione

### Step 1: Esegui la Nuova Migrazione

1. Vai su **Supabase Dashboard**: https://supabase.com/dashboard
2. Seleziona il tuo progetto ALCALOG
3. Vai a **SQL Editor** (menu laterale sinistro)
4. Clicca **New Query**
5. Apri il file: `alcalog-app/supabase/migrations/20240102000000_add_insert_update_policies.sql`
6. **Copia TUTTO il contenuto** dello script SQL
7. Incollalo nell'editor SQL di Supabase
8. Clicca **Run** (o premi F5)

### Step 2: Verifica

Dopo aver eseguito lo script, dovresti vedere:
- ✅ Nessun errore
- ✅ Messaggio "Success. No rows returned" o simile

### Step 3: Test

1. Vai su https://alcalog.onrender.com/dashboard/articoli/nuovo
2. Prova a creare un nuovo articolo
3. Dovrebbe funzionare senza errori RLS

## Cosa Fa Questo Script

Lo script aggiunge policy RLS per permettere agli **utenti autenticati** di:
- ✅ **INSERT** - Inserire nuovi record
- ✅ **UPDATE** - Modificare record esistenti
- ✅ **DELETE** - Eliminare record

Su tutte le tabelle del database:
- fornitori
- articoli
- magazzini_ubicazioni
- ruoli
- ruoli_tab_abilitate
- articoli_lotti
- ordini_fornitori
- ordini_fornitori_righe
- movimenti_magazzino
- ricevimenti_note
- trasferimenti
- inventari
- inventari_righe
- notifiche_eventi_config
- notifiche_log
- pianificazione_proposte_trasferimenti
- pianificazione_proposte_ordini
- utenti_profilo

## Note sulla Sicurezza

⚠️ **Attenzione**: Queste policy permettono a **qualsiasi utente autenticato** di modificare qualsiasi record.

Per una sicurezza più granulare, potresti voler:
1. Limitare le policy in base al ruolo utente
2. Limitare le policy in base al proprietario del record
3. Limitare le policy per tab specifiche

Questo può essere fatto in seguito tramite interfaccia admin o script SQL aggiuntivi.

---

**Dopo aver eseguito questo script, tutte le operazioni CRUD dovrebbero funzionare correttamente!**

