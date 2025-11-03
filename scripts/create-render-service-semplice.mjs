/**
 * Script SEMPLIFICATO per creare servizio su Render.com
 * Versione che crea direttamente senza richiedere API complesse
 * 
 * USAGE:
 * node scripts/create-render-service-semplice.mjs [GITHUB_OWNER/REPO_NAME]
 */

import https from 'https';

// ⚠️ IMPORTANTE: Configura le tue credenziali come variabili d'ambiente
// Usa: export RENDER_API_KEY="tuo_api_key_qui" prima di eseguire lo script
const RENDER_API_KEY = process.env.RENDER_API_KEY || process.env.RND_API_KEY;

if (!RENDER_API_KEY) {
  console.error('❌ Errore: RENDER_API_KEY non trovata nelle variabili d\'ambiente');
  console.error('   Configura: export RENDER_API_KEY="tuo_api_key"');
  process.exit(1);
}

// Configurazione servizio
// ⚠️ IMPORTANTE: Sostituisci i valori con i tuoi dati reali o usa variabili d'ambiente
const CONFIG = {
  name: 'alcalog-platform',
  planId: 'starter', // 'starter' = free tier
  region: 'frankfurt',
  branch: 'main',
  rootDir: 'alcalog-app',
  buildCommand: 'npm install && npm run build',
  startCommand: 'npm start',
  autoDeploy: true,
  envVars: [
    { key: 'NEXT_PUBLIC_SUPABASE_URL', value: process.env.NEXT_PUBLIC_SUPABASE_URL || 'TUO_SUPABASE_URL_QUI' },
    { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'TUO_ANON_KEY_QUI' },
    { key: 'SUPABASE_SERVICE_ROLE_KEY', value: process.env.SUPABASE_SERVICE_ROLE_KEY || 'TUO_SERVICE_ROLE_KEY_QUI' },
    { key: 'RESEND_API_KEY', value: process.env.RESEND_API_KEY || 'TUO_RESEND_KEY_QUI' },
    { key: 'NODE_ENV', value: 'production' }
  ]
};

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.render.com',
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${RENDER_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(parsed)}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
    });
    
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  const repoArg = process.argv[2];
  
  if (!repoArg || !repoArg.includes('/')) {
    console.log('❌ Errore: Specifica il repository nel formato OWNER/REPO');
    console.log('\nUsage:');
    console.log('  node scripts/create-render-service-semplice.mjs OWNER/REPO_NAME');
    console.log('\nEsempio:');
    console.log('  node scripts/create-render-service-semplice.mjs username/alcalog-platform');
    process.exit(1);
  }
  
  // Formatta repository
  let repoString = repoArg;
  if (!repoString.startsWith('github.com/')) {
    repoString = `github.com/${repoString}`;
  }
  
  const payload = {
    type: 'web_service',
    name: CONFIG.name,
    repo: repoString,
    branch: CONFIG.branch,
    rootDir: CONFIG.rootDir,
    planId: CONFIG.planId,
    region: CONFIG.region,
    buildCommand: CONFIG.buildCommand,
    startCommand: CONFIG.startCommand,
    autoDeploy: CONFIG.autoDeploy,
    envVars: CONFIG.envVars
  };
  
  console.log('🚀 Creazione servizio Render...');
  console.log(`📦 Repository: ${repoString}`);
  console.log(`📝 Nome servizio: ${CONFIG.name}`);
  console.log('\n📤 Invio richiesta API...\n');
  
  try {
    const result = await makeRequest('/v1/services', 'POST', payload);
    
    console.log('✅ Servizio creato con successo!\n');
    console.log('📊 Dettagli:');
    console.log(`   ID: ${result.service?.id || result.id || 'N/A'}`);
    console.log(`   Nome: ${result.service?.name || CONFIG.name}`);
    console.log(`   URL: https://${CONFIG.name}.onrender.com`);
    console.log(`   Repository: ${repoString}`);
    console.log(`   Branch: ${CONFIG.branch}`);
    
    console.log('\n✅ COMPLETATO!');
    console.log('\n📝 Prossimi passi:');
    console.log('   1. Vai su https://dashboard.render.com');
    console.log('   2. Controlla il servizio appena creato');
    console.log('   3. Il deploy inizierà automaticamente');
    console.log(`   4. URL: https://${CONFIG.name}.onrender.com`);
    
  } catch (error) {
    console.error('\n❌ Errore:', error.message);
    
    if (error.message.includes('401') || error.message.includes('403')) {
      console.log('\n💡 Verifica:');
      console.log('   - API Key valida');
      console.log('   - Permessi API corretti');
    }
    
    if (error.message.includes('422')) {
      console.log('\n💡 Verifica:');
      console.log('   - Repository GitHub esiste e è accessibile');
      console.log('   - Repository collegato a Render (Connected Accounts)');
      console.log('   - Branch "main" esiste nel repository');
      console.log('   - Cartella "alcalog-app" esiste nella root');
    }
    
    console.log('\n📖 Alternativa: Crea il servizio manualmente');
    console.log('   Vedi: GUIDA_DEPLOY_RENDER.md');
    
    process.exit(1);
  }
}

main();

