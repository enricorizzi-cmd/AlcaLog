# 🚀 CREAZIONE AUTOMATICA SERVIZIO RENDER VIA API

## 📋 PREREQUISITI

1. ✅ Account Render.com creato
2. ✅ Account GitHub collegato a Render
3. ✅ Repository GitHub già pushato
4. ✅ Repository collegato a Render (Connected Accounts)

---

## 🎯 CREA SERVIZIO AUTOMATICAMENTE

### Step 1: Prepara il Repository GitHub

Assicurati che il repository sia pushato su GitHub:

```bash
cd alcalog-app
git init
git add .
git commit -m "Initial commit - ALCALOG Platform"
git remote add origin https://github.com/TUO_USERNAME/alcalog-platform.git
git branch -M main
git push -u origin main
```

### Step 2: Collega GitHub a Render

**IMPORTANTE**: Devi collegare GitHub a Render prima di eseguire lo script.

1. Vai su https://dashboard.render.com
2. Vai in **Settings** → **Connected Accounts**
3. Clicca **Connect** su GitHub
4. Autorizza Render ad accedere ai tuoi repository
5. Seleziona i repository da collegare (o tutti)

### Step 3: Esegui lo Script

```bash
cd alcalog-app
npm run create:render OWNER/REPO_NAME
```

**Esempio:**

```bash
# Se il tuo repository è: github.com/username/alcalog-platform
npm run create:render username/alcalog-platform
```

Lo script creerà automaticamente:
- ✅ Servizio web con nome `alcalog-platform`
- ✅ Tutte le environment variables configurate
- ✅ Build command e start command
- ✅ Auto-deploy abilitato
- ✅ Region: Frankfurt (Europa)

---

## 📝 COSA FA LO SCRIPT

Lo script invia una richiesta POST all'API Render per creare il servizio con:

- **Nome**: `alcalog-platform`
- **Plan**: `starter` (free tier)
- **Region**: `frankfurt`
- **Repository**: Il repository GitHub che specifichi
- **Branch**: `main`
- **Root Directory**: `alcalog-app`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Auto-Deploy**: `true`

**Environment Variables automatiche:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `NODE_ENV=production`

---

## ✅ DOPO L'ESECUZIONE

1. ⏳ Vai su https://dashboard.render.com
2. 📊 Dovresti vedere il servizio `alcalog-platform`
3. 🔄 Il deploy inizierà automaticamente (5-10 minuti)
4. 📍 URL finale: `https://alcalog-platform.onrender.com`

---

## 🐛 TROUBLESHOOTING

### Errore HTTP 401/403

**Causa**: API Key non valida o scaduta

**Soluzione**:
- Verifica che l'API Key sia corretta nel file dello script
- Controlla i permessi dell'API Key su Render

### Errore HTTP 422

**Causa**: Configurazione non valida

**Possibili cause**:
- Repository GitHub non esiste o non è accessibile
- Repository non collegato a Render
- Branch `main` non esiste
- Cartella `alcalog-app` non esiste nella root

**Soluzione**:
1. Verifica che il repository esista: `https://github.com/OWNER/REPO`
2. Collega GitHub a Render (vedi Step 2)
3. Verifica che il branch sia `main`
4. Verifica che la cartella `alcalog-app` esista

### Errore "Repository non trovato"

**Soluzione**:
- Usa il formato esatto: `OWNER/REPO_NAME`
- Esempio: `username/alcalog-platform` (non `alcalog-platform`)

---

## 📖 ALTERNATIVA: Creazione Manuale

Se lo script non funziona, puoi creare il servizio manualmente seguendo:
- **`GUIDA_DEPLOY_RENDER.md`** - Guida completa passo-passo

---

## 🔐 SICUREZZA

⚠️ **IMPORTANTE**: L'API Key è presente nello script. 
- ✅ Lo script è solo per uso locale
- ✅ NON committare mai l'API Key in repository pubblici
- ✅ Se compromessa, rigenera una nuova API Key su Render

---

## ✅ CHECKLIST FINALE

Dopo aver creato il servizio:

- [ ] Servizio visibile su Render Dashboard
- [ ] Deploy in corso o completato
- [ ] Nessun errore nei log
- [ ] URL accessibile: `https://alcalog-platform.onrender.com`
- [ ] Pagina di login visibile
- [ ] Environment variables configurate (verifica nei Settings)

---

**🎉 Il servizio verrà creato automaticamente in pochi secondi!**
