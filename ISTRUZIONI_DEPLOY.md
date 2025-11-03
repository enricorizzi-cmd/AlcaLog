# ISTRUZIONI DEPLOYMENT ALCALOG

## 🚀 Setup Database Supabase

### 1. Esegui Migrazione Database

1. Accedi a https://supabase.com/dashboard
2. Seleziona il progetto: `sycqyblsvepbyywveokap`
3. Vai a **SQL Editor**
4. Copia il contenuto del file `supabase/migrations/20240101000000_initial_schema.sql`
5. Esegui lo script completo
6. Verifica che tutte le tabelle siano create

### 2. Configura RLS Policies

Le policies base sono già incluse nella migrazione. Per sicurezza aggiuntiva, puoi configurare policies specifiche per ruoli tramite il dashboard Supabase.

---

## 📦 Deployment Render.com

### 1. Preparazione Repository GitHub

1. Crea repository GitHub (es: `alcalog-platform`)
2. Push del codice:
   ```bash
   cd alcalog-app
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/TUO_USERNAME/alcalog-platform.git
   git push -u origin main
   ```

### 2. Creazione Web Service su Render

1. Accedi a https://render.com
2. Click **New +** → **Web Service**
3. Connetti repository GitHub
4. Configurazione:
   - **Name**: `alcalog-platform`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free o Starter (a seconda delle esigenze)

### 3. Environment Variables su Render

Aggiungi queste variabili nell'interfaccia Render:

```
NEXT_PUBLIC_SUPABASE_URL=https://sycqyblsvepbyywveokap.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5Y3F5YmxzdmVwYnl5d2Vva2FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzE5MTIsImV4cCI6MjA3Nzc0NzkxMn0.hyQczn__Cl5UvAJBSeht1QT2ShQAofqjpUEEOJFlujE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5Y3F5YmxzdmVwYnl5d2Vva2FwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE3MTkxMiwiZXhwIjoyMDc3NzQ3OTEyfQ.x_2Y0dkEQ_-BJTjFHyG1Pufoev6M4AVyu-R-GInYZOE
RESEND_API_KEY=re_FXv8pFpX_3vjQBUcBvmPnkp8Ce5tss44d
RENDER_API_KEY=rnd_lNGvDoYk5oA3RD6TijljFEo5CLPK
NODE_ENV=production
```

### 4. Build Settings

- **Auto-Deploy**: Enabled (deploy automatico su push a main)
- **Branch**: `main`

---

## 🔐 Creazione Primo Utente Admin

### 1. Via Supabase Dashboard

1. Vai a **Authentication** → **Users**
2. Click **Add User** → **Create User**
3. Inserisci:
   - Email: `admin@alcalog.it`
   - Password: (genera una password sicura)
   - Email Confirm: `true`
4. Salva l'ID utente (UUID)

### 2. Crea Profilo Utente

Esegui questo SQL nel SQL Editor:

```sql
-- Sostituisci USER_UUID con l'ID utente appena creato
INSERT INTO utenti_profilo (id, nome, cognome, ruolo_codice, sede_predefinita, sezione_predefinita)
VALUES (
  'USER_UUID',
  'Admin',
  'Sistema',
  'ADMIN',
  'SEDE1',  -- Modifica con una sede esistente
  'SEZIONE1'  -- Modifica con una sezione esistente
);
```

### 3. Crea Prime Ubicazioni

Esegui:

```sql
INSERT INTO magazzini_ubicazioni (sede, sezione) VALUES
('SEDE1', 'SEZIONE1'),
('SEDE1', 'SEZIONE2'),
('SEDE2', 'SEZIONE1')
ON CONFLICT DO NOTHING;
```

---

## ✅ Verifica Deployment

1. **URL Applicazione**: https://tuo-service.onrender.com
2. **Test Login**: Usa credenziali admin create
3. **Test PWA**: Su mobile, visita l'URL e installa come app
4. **Test Funzionalità Base**:
   - Crea fornitore
   - Crea articolo
   - Crea ordine
   - Visualizza giacenze

---

## 📱 PWA Installation

### Mobile (iOS/Android)
1. Apri browser (Safari/Chrome)
2. Visita URL applicazione
3. Menu → "Aggiungi alla home"
4. L'app sarà installata come PWA

### Desktop
1. Chrome/Edge → Icona installa nella barra URL
2. L'app si aprirà in finestra dedicata

---

## 🐛 Troubleshooting

### Build Fallisce
- Verifica che tutte le dipendenze siano in `package.json`
- Controlla log Render per errori specifici
- Verifica che `NODE_ENV=production` sia impostato

### Database Connection Errors
- Verifica che variabili Supabase siano corrette
- Controlla che RLS policies non blocchino le query
- Verifica che l'anon key abbia i permessi corretti

### PWA Non Funziona
- Verifica che `next-pwa` sia installato
- Controlla che `manifest.json` sia in `/public`
- Verifica HTTPS (richiesto per PWA)

---

## 🔄 Update Deployment

Dopo ogni push su `main`, Render eseguirà automaticamente:
1. Git pull
2. `npm install`
3. `npm run build`
4. Restart service

---

**IMPORTANTE**: Le credenziali fornite sono già configurate nel codice, ma NON vengono committate grazie a `.gitignore`. Su Render devono essere configurate come environment variables.

