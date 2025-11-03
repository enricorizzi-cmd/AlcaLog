# ALCALOG - Sistema di Gestione e Tracciabilità Logistica

Sistema completo per la gestione magazzino, tracciabilità lotti/scadenze e controllo giacenze valorizzate.

## 🚀 Stack Tecnologico

- **Frontend/Backend**: Next.js 14 (App Router) con TypeScript
- **Database**: Supabase (PostgreSQL)
- **UI**: Tailwind CSS + shadcn/ui
- **PWA**: next-pwa (installabile su mobile)
- **Deployment**: Render.com + Supabase Cloud

## 📋 Funzionalità Implementate

### ✅ Master Data
- Gestione Fornitori (CRUD completo)
- Gestione Articoli con Lotti/Scadenze
- Gestione Magazzini (Sede/Sezione)
- Utenti e Ruoli

### ✅ Operazioni Magazzino
- **Ordini a Fornitore**: Creazione, gestione, calcolo residui automatico
- **Ricevimento Merci**: Evasione ordini, creazione lotti, generazione QR/BATCH_ID
- **Prelievo Merci**: Scarico con ricerca manuale o QR scanner
- **Trasferimenti**: Trasferimenti intra-azienda tra ubicazioni
- **Inventario**: Conteggio fisico con rettifiche automatiche

### ✅ Giacenze e Valorizzazioni
- **Giacenze Valorizzate**: Calcolo FIFO globale (4 decimali)
- **Scorte**: Media ponderata 12 mesi indicizzata
- **Bilanciamento**: Evidenza surplus/deficit vs target
- **Export**: Excel/CSV per giacenze

### ✅ QR Code e Etichette
- Generazione BATCH_ID alfanumerico sequenziale
- QR Code per tracciabilità
- Template ZPL per stampanti Zebra
- Scanner QR integrato (PWA mobile)

### ✅ Movimenti
- Storico completo movimenti magazzino
- Filtri avanzati (data, tipo, articolo, ubicazione)
- Inserimento manuale movimenti

## 🛠️ Setup Locale

### 1. Installazione Dipendenze

```bash
cd alcalog-app
npm install
```

### 2. Configurazione Ambiente

Crea file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://sycqyblsvepbyywveokap.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5Y3F5YmxzdmVwYnl5d2Vva2FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzE5MTIsImV4cCI6MjA3Nzc0NzkxMn0.hyQczn__Cl5UvAJBSeht1QT2ShQAofqjpUEEOJFlujE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5Y3F5YmxzdmVwYnl5d2Vva2FwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE3MTkxMiwiZXhwIjoyMDc3NzQ3OTEyfQ.x_2Y0dkEQ_-BJTjFHyG1Pufoev6M4AVyu-R-GInYZOE
RESEND_API_KEY=re_FXv8pFpX_3vjQBUcBvmPnkp8Ce5tss44d
```

### 3. Esegui Migrazione Database

1. Vai su Supabase Dashboard → SQL Editor
2. Esegui il file `supabase/migrations/20240101000000_initial_schema.sql`
3. Verifica creazione tabelle

### 4. Avvia Sviluppo

```bash
npm run dev
```

Visita: http://localhost:3000

## 📱 PWA Installation

L'app è installabile come PWA:

1. **Mobile**: Apri browser → Menu → "Aggiungi alla home"
2. **Desktop**: Chrome/Edge → Icona installa nella barra URL

## 🚀 Deployment

Vedi `ISTRUZIONI_DEPLOY.md` per istruzioni complete su:
- Setup Supabase
- Deploy su Render.com
- Configurazione variabili ambiente
- Creazione primo utente

## 📚 Documentazione

- `CHECKLIST_FINALE.md`: Checklist completamento
- `STATO_COMPLETAMENTO.md`: Stato dettagliato implementazione
- `ISTRUZIONI_DEPLOY.md`: Guide deployment
- `PIANO_TODO_ALCALOG.md`: Piano sviluppo originale

## 🎯 Funzionalità Chiave

### FIFO
- Calcolo globale (non per sezioni)
- 4 cifre decimali
- Non intaccato da trasferimenti
- Snapshot al momento creazione ordine

### BATCH_ID
- Alfanumerico sequenziale (ALCA000001, ALCA000002...)
- Lotto interno automatico + lotto fornitore manuale
- QR Code opaco per tracciabilità

### Scorte
- Media ponderata 12 mesi
- Target = max(scorta_minima, scorta_media_12m)
- Bilanciamento automatico surplus/deficit

### Notifiche
- Configurabili per evento e ruolo
- Push + In-app
- Log letture

## 📝 Note Tecniche

- **PWA**: Disabilitato in sviluppo (più veloce), abilitato in produzione
- **Database**: Row Level Security (RLS) attivo
- **Autenticazione**: Supabase Auth + Resend per recovery
- **QR Scanner**: html5-qrcode (PWA mobile-ready)
- **Export**: ExcelJS per .xlsx, CSV nativo

## 🔒 Sicurezza

- Credenziali in `.env.local` (non committate)
- RLS policies Supabase
- Autenticazione JWT
- Middleware protezione route

---

**Versione**: 1.0.0  
**Ultimo Aggiornamento**: 15 Gennaio 2025  
**Stato**: ✅ Operativo e pronto per deploy
