# 🚨 ISTRUZIONI MIGRAZIONE DATABASE URGENTE

## Problema Attuale

L'errore `Could not find the table 'public.ordini_fornitori' in the schema cache` indica che le tabelle del database **NON sono state create** in Supabase.

## Soluzione Immediata

### Step 1: Accedi a Supabase Dashboard

1. Vai su https://supabase.com/dashboard
2. Seleziona il tuo progetto ALCALOG
3. Vai a **SQL Editor** (menu laterale sinistro)

### Step 2: Esegui la Migrazione Completa

1. Clicca **New Query**
2. Apri il file: `alcalog-app/supabase/migrations/20240101000000_initial_schema.sql`
3. **Copia TUTTO il contenuto** dello script SQL (circa 400+ righe)
4. Incollalo nell'editor SQL di Supabase
5. Clicca **Run** (o premi F5)

### Step 3: Verifica Creazione Tabelle

1. Vai a **Table Editor** nel menu Supabase
2. Verifica che siano presenti queste tabelle:
   - ✅ `fornitori`
   - ✅ `articoli`
   - ✅ `magazzini_ubicazioni`
   - ✅ `ruoli`
   - ✅ `utenti_profilo`
   - ✅ `ruoli_tab_abilitate`
   - ✅ `articoli_lotti`
   - ✅ `ordini_fornitori` ← **IMPORTANTE!**
   - ✅ `ordini_fornitori_righe`
   - ✅ `movimenti_magazzino`
   - ✅ `trasferimenti`
   - ✅ `trasferimenti_righe`
   - ✅ `inventario`
   - ✅ `inventario_righe`
   - ✅ `notifiche`
   - ✅ `notifiche_utenti`
   - ✅ `ordini_residuo_v` (vista)

### Step 4: Verifica Funzionamento

1. Vai su https://alcalog.onrender.com/api/ordini
2. Dovrebbe restituire `[]` (array vuoto) invece di errore 400
3. Vai su https://alcalog.onrender.com/dashboard/ordini
4. La pagina dovrebbe caricare senza errori

## Se Ci Sono Errori Durante la Migrazione

Se vedi errori come "relation already exists":
- ✅ **NON è un problema** - significa che alcune tabelle esistono già
- ✅ Le altre tabelle verranno create normalmente

Se vedi errori di permessi:
- Verifica di essere loggato come owner del progetto Supabase
- Usa la **service_role key** se necessario

## Note Importanti

⚠️ **NON** eseguire la migrazione più volte - potrebbe causare conflitti
⚠️ **NON** modificare lo script SQL senza sapere cosa fai
✅ Se la migrazione fallisce, contatta il supporto o verifica i log in Supabase Dashboard → Database → Logs

---

**Dopo aver eseguito la migrazione, tutte le funzionalità dovrebbero funzionare correttamente!**


