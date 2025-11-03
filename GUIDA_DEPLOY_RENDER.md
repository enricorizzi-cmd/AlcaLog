# 🚀 GUIDA COMPLETA DEPLOYMENT SU RENDER.COM

## 📋 PREREQUISITI

- ✅ Account GitHub (gratuito)
- ✅ Account Render.com (gratuito disponibile)
- ✅ Account Supabase già configurato
- ✅ Codice progetto pronto nel repository GitHub

---

## 🗄️ STEP 1: SETUP DATABASE SUPABASE

### 1.1 Esegui Migrazione Database

1. Accedi a **Supabase Dashboard**: https://supabase.com/dashboard
2. Seleziona il tuo progetto Supabase
3. Vai a **SQL Editor** (menu laterale sinistro)
4. Clicca **New Query**
5. Apri il file `supabase/migrations/20240101000000_initial_schema.sql` dalla cartella del progetto
6. **Copia tutto il contenuto** dello script SQL
7. Incollalo nell'editor SQL di Supabase
8. Clicca **Run** (o premi F5)
9. Verifica che tutte le tabelle siano create:
   - Vai a **Table Editor**
   - Dovresti vedere 18 tabelle create

### 1.2 Verifica Credenziali

1. Vai a **Settings** → **API** nel dashboard Supabase
2. Verifica che queste informazioni siano disponibili:
   - **Project URL**: `https://TUO_PROJECT_ID.supabase.co`
   - **anon public key**: (dovrebbe essere quella già configurata)
   - **service_role key**: (per operazioni server-side)

---

## 📦 STEP 2: PREPARAZIONE REPOSITORY GITHUB

### 2.1 Crea Repository su GitHub

1. Vai su https://github.com
2. Clicca **New** (o **+** in alto a destra) → **New repository**
3. Nome repository: `alcalog-platform` (o un nome a tua scelta)
4. Descrizione: `Sistema di gestione e tracciabilità logistica ALCA FOOD`
5. Imposta come **Private** (consigliato) o **Public**
6. **NON** inizializzare con README, .gitignore o licenza (abbiamo già i file)
7. Clicca **Create repository**

### 2.2 Push Codice su GitHub

Apri PowerShell/Terminal nella cartella del progetto e esegui:

```bash
cd C:\ALCALOG\alcalog-app

# Inizializza git se non già fatto
git init

# Aggiungi tutti i file (esclusi quelli in .gitignore)
git add .

# Commit iniziale
git commit -m "Initial commit - ALCALOG Platform"

# Aggiungi remote GitHub (sostituisci TUO_USERNAME e REPO_NAME)
git remote add origin https://github.com/TUO_USERNAME/alcalog-platform.git

# Push su GitHub
git branch -M main
git push -u origin main
```

**Nota**: Se usi autenticazione GitHub, potresti dover configurare SSH o Personal Access Token.

---

## 🚀 STEP 3: CREAZIONE WEB SERVICE SU RENDER

### 3.1 Accesso Render

1. Vai su https://render.com
2. Clicca **Sign Up** (oppure **Get Started**)
3. Login con GitHub (consigliato) per collegamento automatico repository

### 3.2 Crea Nuovo Web Service

1. Nel dashboard Render, clicca **New +** (in alto a destra)
2. Seleziona **Web Service**
3. Se hai collegato GitHub, vedrai la lista dei repository
4. Seleziona `alcalog-platform` (o il nome del tuo repo)
5. Clicca **Connect**

### 3.3 Configurazione Base

Completa i seguenti campi:

#### **Name**
```
alcalog-platform
```

#### **Environment**
```
Node
```

#### **Region**
```
Frankfurt (EUR)
```
(Scegli la regione più vicina all'Italia)

#### **Branch**
```
main
```
(Il branch da deployare)

#### **Root Directory**
```
alcalog-app
```
(La sottocartella dove si trova il progetto Next.js)

#### **Build Command**
```
npm install && npm run build
```
**Nota**: Il build usa automaticamente `--webpack` per compatibilità con next-pwa

#### **Start Command**
```
npm start
```

#### **Instance Type**
- **Free**: Per testing e sviluppo (si sospende dopo 15 minuti di inattività)
- **Starter ($7/mese)**: Consigliato per produzione (no sospensioni)

Per iniziare, puoi scegliere **Free** e passare a Starter dopo.

### 3.4 Environment Variables

**IMPORTANTE**: Aggiungi queste variabili prima di fare il primo deploy.

Clicca su **Advanced** → **Environment Variables** e aggiungi:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TUO_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TUO_ANON_KEY_QUI
SUPABASE_SERVICE_ROLE_KEY=TUO_SERVICE_ROLE_KEY_QUI
RESEND_API_KEY=TUO_RESEND_API_KEY_QUI
NODE_ENV=production
```

**⚠️ IMPORTANTE**: Sostituisci i placeholder con i tuoi valori reali ottenuti dai rispettivi dashboard!

**Come aggiungere ogni variabile:**
1. Campo **Key**: Inserisci il nome (es: `NEXT_PUBLIC_SUPABASE_URL`)
2. Campo **Value**: Inserisci il valore corrispondente
3. Clicca **Add Environment Variable**
4. Ripeti per ogni variabile

### 3.5 Auto-Deploy

Assicurati che sia attivo:
- ✅ **Auto-Deploy**: Enabled (deploy automatico su ogni push a `main`)
- ✅ **Wait for CI**: Disabled (se non usi CI/CD esterno)

### 3.6 Crea Service

1. Clicca **Create Web Service**
2. Render inizierà automaticamente il primo deploy
3. Il processo può richiedere 5-10 minuti la prima volta

---

## ⏳ STEP 4: MONITORAGGIO DEPLOY

### 4.1 Log Build

Durante il deploy, vedrai:

1. **Fetching repository** - Download codice da GitHub
2. **Installing dependencies** - `npm install`
3. **Building** - `npm run build`
4. **Starting** - `npm start`

### 4.2 Verifica Errori

Se vedi errori nel log:

- **Errori build**: Controlla log per dettagli, spesso sono problemi di dipendenze o TypeScript
- **Errori runtime**: Controlla che tutte le variabili ambiente siano configurate
- **Errori Supabase**: Verifica che le chiavi API siano corrette

### 4.3 URL Applicazione

Dopo il deploy riuscito, Render ti fornirà un URL tipo:
```
https://alcalog-platform.onrender.com
```
(O un URL simile basato sul nome del servizio)

---

## ✅ STEP 5: VERIFICA FUNZIONAMENTO

### 5.1 Test Accesso

1. Vai all'URL fornito da Render
2. Dovresti vedere la pagina di login
3. Se vedi errori, controlla i log Render (sezione **Logs**)

### 5.2 Test PWA

1. Su mobile, apri l'URL in browser
2. Menu browser → "Aggiungi alla home"
3. L'app si installerà come PWA

---

## 👤 STEP 6: CREAZIONE PRIMO UTENTE ADMIN

### 6.1 Crea Utente su Supabase

1. Vai a **Supabase Dashboard** → **Authentication** → **Users**
2. Clicca **Add User** → **Create New User**
3. Inserisci:
   - **Email**: `admin@alcalog.it` (o email a tua scelta)
   - **Password**: Crea una password sicura
   - ✅ **Email Confirm**: Spunta questa casella
4. Clicca **Create User**
5. **IMPORTANTE**: Copia l'**User UID** (UUID) mostrato dopo la creazione

### 6.2 Crea Profilo Utente

1. Vai a **SQL Editor** in Supabase
2. Esegui questo script (sostituisci `USER_UUID` con l'UUID copiato):

```sql
-- Inserisci profilo utente admin
INSERT INTO utenti_profilo (id, nome, cognome, ruolo_codice, sede_predefinita, sezione_predefinita)
VALUES (
  'USER_UUID',  -- Sostituisci con l'UUID utente
  'Admin',
  'Sistema',
  'ADMIN',      -- Ruolo admin
  'SEDE1',      -- Modifica con una sede esistente
  'SEZIONE1'    -- Modifica con una sezione esistente
);
```

### 6.3 Crea Prime Ubicazioni Magazzino

Sempre nel SQL Editor, esegui:

```sql
-- Crea prime ubicazioni
INSERT INTO magazzini_ubicazioni (sede, sezione) VALUES
('SEDE1', 'SEZIONE1'),
('SEDE1', 'SEZIONE2'),
('SEDE2', 'SEZIONE1')
ON CONFLICT DO NOTHING;
```

### 6.4 Test Login

1. Vai all'URL dell'applicazione Render
2. Login con le credenziali create
3. Dovresti essere autenticato e vedere la dashboard

---

## 🔄 STEP 7: CONFIGURAZIONE AUTO-DEPLOY

Render è già configurato per auto-deploy, ma puoi verificare:

1. Vai a **Settings** del tuo Web Service su Render
2. Sezione **Auto-Deploy**:
   - ✅ **Auto-Deploy**: Enabled
   - **Branch**: `main`
3. Ogni push su `main` attiverà automaticamente un nuovo deploy

---

## 🛠️ TROUBLESHOOTING

### Problema: Build Fallisce

**Sintomi**: Log mostra errori durante `npm run build`

**Soluzioni**:
1. Verifica che `package.json` contenga tutte le dipendenze
2. Controlla errori TypeScript nel log
3. Assicurati che `NODE_ENV=production` sia impostato
4. Verifica che `next.config.ts` sia corretto

### Problema: Errore "Cannot connect to Supabase"

**Sintomi**: App si carica ma non si connette al database

**Soluzioni**:
1. Verifica che `NEXT_PUBLIC_SUPABASE_URL` sia corretto
2. Verifica che `NEXT_PUBLIC_SUPABASE_ANON_KEY` sia corretto
3. Controlla RLS policies su Supabase
4. Verifica che le tabelle siano create correttamente

### Problema: App si carica ma restituisce errori 500

**Sintomi**: Pagina carica ma le API restituiscono errori

**Soluzioni**:
1. Controlla log Render (sezione **Logs**) per errori runtime
2. Verifica che `SUPABASE_SERVICE_ROLE_KEY` sia configurata
3. Controlla errori nel browser console (F12)

### Problema: PWA Non Funziona

**Sintomi**: Non si può installare come app

**Soluzioni**:
1. Verifica che l'app sia servita via HTTPS (Render lo fa automaticamente)
2. Controlla che `manifest.json` sia in `/public`
3. Verifica che `next-pwa` sia installato e configurato

### Problema: App Si Sospende (Free Tier)

**Sintomi**: App non risponde dopo inattività

**Soluzioni**:
- È normale su Free Tier dopo 15 minuti di inattività
- La prima richiesta dopo la sospensione richiede 30-60 secondi per riattivarsi
- Considera l'upgrade a **Starter ($7/mese)** per evitare sospensioni

---

## 📝 CHECKLIST FINALE DEPLOY

Prima di considerare il deploy completo:

- [ ] Database Supabase migrato (18 tabelle create)
- [ ] Repository GitHub creato e push effettuato
- [ ] Web Service Render creato
- [ ] Tutte le environment variables configurate
- [ ] Build completata con successo
- [ ] URL applicazione funzionante
- [ ] Primo utente admin creato
- [ ] Login funzionante
- [ ] Test creazione fornitore
- [ ] Test creazione articolo
- [ ] PWA installabile su mobile

---

## 🔐 SICUREZZA

### Variabili Sensibili

- ✅ Le variabili in Render sono **criptate** e non visibili nei log pubblici
- ✅ NON committare mai file `.env.local` su GitHub (già in `.gitignore`)
- ✅ Le chiavi API sono già configurate, ma tieni sempre aggiornate le credenziali

### Best Practices

1. Usa **Private repository** su GitHub per codice proprietario
2. Rotazione periodica delle chiavi API Supabase
3. Monitora i log Render per attività sospette
4. Configura alert su Render per errori critici

---

## 💰 COSTI

### Free Tier
- ✅ Gratuito
- ⚠️ Si sospende dopo 15 min di inattività
- ✅ 750 ore/mese di runtime

### Starter ($7/mese)
- ✅ No sospensioni
- ✅ 750 ore/mese di runtime
- ✅ Consigliato per produzione

### Supabase
- ✅ Free tier generoso per start
- ✅ Upgrade quando necessario

---

## 📞 SUPPORTO

Se incontri problemi:

1. Controlla **Logs** su Render (trovano molti problemi comuni)
2. Verifica **Supabase Dashboard** → **Logs** per errori database
3. Controlla browser console (F12) per errori frontend
4. Verifica che tutte le variabili ambiente siano corrette

---

## 🎯 PROSSIMI PASSI DOPO DEPLOY

1. **Test funzionalità complete**
   - Crea fornitore
   - Crea articolo con lotto
   - Crea ordine
   - Testa ricevimento

2. **Configurazione personalizzata**
   - Crea altre ubicazioni magazzino
   - Configura ruoli e permessi
   - Personalizza notifiche

3. **Ottimizzazione**
   - Monitora performance
   - Configura CDN se necessario
   - Ottimizza query database

---

**🎉 Complimenti! Il tuo servizio ALCALOG è ora live su Render!**

URL applicazione: `https://TUO-SERVICE.onrender.com`

