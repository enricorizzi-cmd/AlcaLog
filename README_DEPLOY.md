# 🚀 GUIDA DEPLOY E PUSH

## ⚠️ IMPORTANTE: Limitazioni Deploy Render

**Render free tier ha limiti sui deploy!** Ogni push triggera un nuovo deploy.

### ✅ Workflow Corretto

1. **Fai più commit locali** durante lo sviluppo:
   ```bash
   git add file1.ts
   git commit -m "Fix: Descrizione fix 1"
   
   git add file2.ts
   git commit -m "Feat: Descrizione feature 2"
   ```

2. **Fai UN SOLO push** quando tutto è pronto:
   ```bash
   git push
   ```

3. **Monitora il deploy** (opzionale, ma consigliato):
   ```bash
   node scripts/push-and-monitor-deploy.mjs
   ```

## 📋 Script Disponibili

### `scripts/push-and-monitor-deploy.mjs`
Esegue push e monitora il deploy automaticamente:
```bash
node scripts/push-and-monitor-deploy.mjs
```

### `scripts/wait-deploy-render.mjs`
Monitora solo il deploy (dopo push manuale):
```bash
node scripts/wait-deploy-render.mjs
```

## 🔄 Workflow Completo

```bash
# 1. Sviluppo locale con commit multipli
git add app/api/nuovo-endpoint.ts
git commit -m "Feat: Nuovo endpoint API"

git add app/components/nuovo-componente.tsx
git commit -m "Feat: Nuovo componente"

# 2. Quando tutto è pronto: UN SOLO PUSH
git push

# 3. (Opzionale) Monitora deploy
node scripts/push-and-monitor-deploy.mjs
```

## 📊 Monitoraggio Deploy

Il monitoraggio verifica:
- ✅ Push completato
- ✅ Deploy avviato su Render
- ✅ Servizio live e healthy
- ✅ Health check endpoint risponde

**Nota**: Su free tier, il servizio può richiedere 30-60 secondi per risvegliarsi.

## ⚠️ Da Evitare

❌ **NON fare**:
```bash
git add file1 && git commit -m "Fix 1" && git push
git add file2 && git commit -m "Fix 2" && git push  # ❌ Deploy multiplo!
```

✅ **Fare invece**:
```bash
git add file1 && git commit -m "Fix 1"
git add file2 && git commit -m "Fix 2"
git push  # ✅ Un solo deploy!
```

---

**Ultimo aggiornamento**: 2025-11-03

