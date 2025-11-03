# Creazione Utente Super Admin

## ⚠️ IMPORTANTE: Ordine di Esecuzione

**PRIMA** devi eseguire la migrazione completa del database, **POI** puoi creare l'utente.

### Opzione A: Migrazione Completa + Utente (CONSIGLIATO)

1. **Passo 1**: Esegui la migrazione completa del database
   - Vai su Supabase Dashboard > **SQL Editor**
   - Esegui il file: `supabase/migrations/20240101000000_initial_schema.sql`
   - Questo crea tutte le tabelle necessarie

2. **Passo 2**: Crea l'utente in Supabase Auth
   - Vai su **Authentication** > **Users**
   - Clicca **"Add user"** > **"Create new user"**
   - Email: `enricorizzi1991@gmail.com`
   - Password: `Enri124578!`
   - **Auto Confirm User**: ✅

3. **Passo 3**: Esegui lo script per creare il profilo admin
   - Vai su **SQL Editor**
   - Esegui il file: `supabase/scripts/create_super_admin.sql`

### Opzione B: Script Completo (Setup Rapido)

Se le tabelle non esistono ancora, usa lo script completo che crea tutto:

1. **Passo 1**: Crea l'utente in Supabase Auth
   - Vai su **Authentication** > **Users**
   - Clicca **"Add user"** > **"Create new user"**
   - Email: `enricorizzi1991@gmail.com`
   - Password: `Enri124578!`
   - **Auto Confirm User**: ✅

2. **Passo 2**: Esegui lo script completo
   - Vai su **SQL Editor**
   - Esegui il file: `supabase/scripts/setup_database_e_utente.sql`
   - Questo crea le tabelle base E l'utente admin in un solo passaggio

---

## Metodo 1: Via Supabase Dashboard (CONSIGLIATO)

### Passo 1: Crea l'utente in Supabase Auth

1. Vai su [Supabase Dashboard](https://app.supabase.com)
2. Seleziona il tuo progetto
3. Vai su **Authentication** > **Users**
4. Clicca **"Add user"** > **"Create new user"**
5. Inserisci:
   - **Email**: `enricorizzi1991@gmail.com`
   - **Password**: `Enri124578!`
   - **Auto Confirm User**: ✅ (abilita)
6. Clicca **"Create user"**

### Passo 2: Esegui lo script SQL

**Se le tabelle esistono già** (hai eseguito la migrazione completa):
1. Vai su **SQL Editor** nel Supabase Dashboard
2. Esegui il file: `create_super_admin.sql`

**Se le tabelle NON esistono** (setup rapido):
1. Vai su **SQL Editor** nel Supabase Dashboard
2. Esegui il file: `setup_database_e_utente.sql` (crea tabelle + utente)

Lo script:
- ✅ Trova automaticamente l'UUID dell'utente per email
- ✅ Crea le tabelle base se non esistono (solo con setup_database_e_utente.sql)
- ✅ Crea/verifica il ruolo ADMIN
- ✅ Crea il profilo utente
- ✅ Assegna tutti i permessi al ruolo ADMIN

---

## Metodo 2: Via Supabase CLI

### Prerequisiti
- Supabase CLI installato
- Progetto collegato

### Esegui lo script:

```bash
cd alcalog-app
supabase db execute --file supabase/scripts/create_super_admin.sql
```

**Nota**: L'utente deve essere creato prima in Auth (via Dashboard o API).

---

## Metodo 3: Via API (Programmatico)

### Creazione utente via API REST

```bash
curl -X POST 'https://[PROJECT_REF].supabase.co/auth/v1/admin/users' \
-H "apikey: [SERVICE_ROLE_KEY]" \
-H "Authorization: Bearer [SERVICE_ROLE_KEY]" \
-H "Content-Type: application/json" \
-d '{
  "email": "enricorizzi1991@gmail.com",
  "password": "Enri124578!",
  "email_confirm": true,
  "user_metadata": {
    "nome": "Enrico",
    "cognome": "Rizzi"
  }
}'
```

Poi esegui lo script SQL per creare il profilo e i permessi.

---

## Verifica Creazione

Dopo aver eseguito lo script, verifica:

```sql
SELECT 
    u.email,
    up.nome,
    up.cognome,
    up.ruolo_codice,
    COUNT(rta.tab_nome) as permessi_totali
FROM auth.users u
JOIN utenti_profilo up ON u.id = up.id
LEFT JOIN ruoli_tab_abilitate rta ON up.ruolo_codice = rta.ruolo_codice
WHERE u.email = 'enricorizzi1991@gmail.com'
GROUP BY u.email, up.nome, up.cognome, up.ruolo_codice;
```

Dovresti vedere:
- Email: `enricorizzi1991@gmail.com`
- Ruolo: `ADMIN`
- Permessi totali: `14` (tutte le tab)

---

## Credenziali Finali

- **Email**: `enricorizzi1991@gmail.com`
- **Password**: `Enri124578!`
- **Ruolo**: `ADMIN` (Super Admin con tutti i permessi)

---

## Troubleshooting

### Errore: "Utente non trovato in auth.users"
- **Soluzione**: Crea prima l'utente in Supabase Dashboard > Authentication > Users

### Errore: "Role does not exist"
- **Soluzione**: Lo script crea automaticamente il ruolo ADMIN se non esiste

### Permessi non assegnati
- **Soluzione**: Esegui nuovamente lo script, i permessi vengono sovrascritti

