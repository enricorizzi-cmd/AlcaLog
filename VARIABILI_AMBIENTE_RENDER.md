# 🔐 VARIABILI AMBIENTE PER RENDER.COM

## 📋 Lista Completa Variabili da Configurare

Configura queste variabili d'ambiente nel tuo servizio Render (Settings → Environment):

---

## ✅ VARIABILI OBBLIGATORIE

### 1. Database Supabase

```env
NEXT_PUBLIC_SUPABASE_URL=https://TUO_PROJECT_ID.supabase.co
```

**Descrizione**: URL del progetto Supabase  
**Tipo**: Public (visibile al client)  
**Dove trovarla**: Supabase Dashboard → Settings → API → Project URL

---

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=TUO_ANON_KEY_QUI
```

**Descrizione**: Chiave pubblica anonima Supabase (per operazioni client-side)  
**Tipo**: Public (visibile al client)  
**Dove trovarla**: Supabase Dashboard → Settings → API → anon public key

---

```env
SUPABASE_SERVICE_ROLE_KEY=TUO_SERVICE_ROLE_KEY_QUI
```

**Descrizione**: Chiave service role Supabase (per operazioni server-side privilegiate)  
**Tipo**: Private (NON esporre al client!)  
**Dove trovarla**: Supabase Dashboard → Settings → API → service_role key  
**⚠️ IMPORTANTE**: Questa chiave bypassa RLS, usare solo server-side!

---

### 2. Email (Resend API)

```env
RESEND_API_KEY=TUO_RESEND_API_KEY_QUI
```

**Descrizione**: API Key per invio email (recupero password)  
**Tipo**: Private  
**Dove trovarla**: Resend Dashboard → API Keys

---

### 3. Ambiente

```env
NODE_ENV=production
```

**Descrizione**: Ambiente di esecuzione  
**Tipo**: Public  
**Valore**: `production` (sempre per Render)

---

## 📝 FORMATO PER INSERIMENTO SU RENDER

### Metodo 1: Interfaccia Web

1. Vai su **Render Dashboard** → Il tuo servizio → **Settings**
2. Scrolla fino a **Environment Variables**
3. Per ogni variabile:
   - **Key**: Nome della variabile (es: `NEXT_PUBLIC_SUPABASE_URL`)
   - **Value**: Valore corrispondente
   - Clicca **Add Environment Variable**
4. Ripeti per tutte le variabili

### Metodo 2: Script Automatico

Lo script `create-render-service-semplice.mjs` le configura automaticamente!

---

## 📋 TABELLA RIASSUNTIVA

| Variabile | Tipo | Obbligatoria | Descrizione |
|-----------|------|--------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | ✅ Sì | URL progetto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | ✅ Sì | Chiave anon Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Private | ✅ Sì | Chiave service role Supabase |
| `RESEND_API_KEY` | Private | ✅ Sì | API key Resend (email) |
| `NODE_ENV` | Public | ✅ Sì | Ambiente (production) |

---

## 🔍 VERIFICA VARIABILI

### Come Verificare che siano Configurate

1. Vai su Render Dashboard → Il tuo servizio → **Settings** → **Environment Variables**
2. Dovresti vedere tutte le 5 variabili elencate sopra
3. Assicurati che i valori siano corretti (copiare esattamente, senza spazi)

### Test Variabili

Dopo il deploy, puoi verificare che le variabili siano accessibili:

- **Frontend**: Le variabili `NEXT_PUBLIC_*` sono accessibili tramite `process.env.NEXT_PUBLIC_*`
- **Backend**: Tutte le variabili sono accessibili tramite `process.env.*`

---

## ⚠️ SICUREZZA

### Variabili Private (NON committare!)

- ✅ `SUPABASE_SERVICE_ROLE_KEY` - **MAI** esporre al client
- ✅ `RESEND_API_KEY` - **MAI** esporre al client
- ✅ Tutte le chiavi API sensibili

### Variabili Public (OK per client)

- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Può essere esposta
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Può essere esposta (è già pubblica)
- ✅ `NODE_ENV` - Può essere esposta

### Best Practices

1. **NON** committare mai variabili private su GitHub
2. Usa sempre `.gitignore` per file `.env*`
3. Rotazione periodica delle chiavi API
4. Monitora i log Render per eventuali leak

---

## 🔄 AGGIORNAMENTO VARIABILI

### Se Devi Cambiare una Variabile

1. Vai su Render Dashboard → Il tuo servizio → **Settings** → **Environment Variables**
2. Clicca sul pulsante **Edit** (icona matita) accanto alla variabile
3. Modifica il valore
4. Clicca **Save**
5. Render farà automaticamente un nuovo deploy con le nuove variabili

---

## ❓ TROUBLESHOOTING

### Errore: "Missing environment variable"

**Causa**: Variabile non configurata o nome errato

**Soluzione**:
1. Verifica che tutte le variabili siano presenti su Render
2. Controlla che i nomi siano esatti (case-sensitive!)
3. Verifica che non ci siano spazi extra

### Errore: "Invalid Supabase credentials"

**Causa**: Chiavi Supabase non valide o scadute

**Soluzione**:
1. Vai su Supabase Dashboard → Settings → API
2. Verifica che le chiavi corrispondano
3. Se necessario, rigenera le chiavi

### Errore: "Resend API error"

**Causa**: API Key Resend non valida

**Soluzione**:
1. Vai su Resend Dashboard → API Keys
2. Verifica che la chiave sia attiva
3. Se necessario, crea una nuova chiave

---

## ✅ CHECKLIST FINALE

Prima di considerare il servizio configurato:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurata
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurata
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurata
- [ ] `RESEND_API_KEY` configurata
- [ ] `NODE_ENV=production` configurata
- [ ] Tutti i valori copiati correttamente (senza spazi)
- [ ] Variabili verificate su Render Dashboard

---

## 📝 COPY-PASTE RAPIDO

Se preferisci copiare tutto insieme, ecco le variabili pronte:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TUO_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TUO_ANON_KEY_QUI
SUPABASE_SERVICE_ROLE_KEY=TUO_SERVICE_ROLE_KEY_QUI
RESEND_API_KEY=TUO_RESEND_API_KEY_QUI
NODE_ENV=production
```

**⚠️ IMPORTANTE**: Sostituisci i placeholder con i tuoi valori reali ottenuti dai rispettivi dashboard!

**Nota**: Su Render devi aggiungere ogni variabile separatamente nell'interfaccia web.

---

**✅ Con queste 5 variabili il servizio sarà completamente configurato!**

