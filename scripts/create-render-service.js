/**
 * Script per creare automaticamente il servizio su Render.com
 * Usa l'API di Render per creare un Web Service
 */

const https = require('https');

// ⚠️ IMPORTANTE: Usa variabili d'ambiente per le credenziali
// export RENDER_API_KEY="tuo_api_key" prima di eseguire lo script
const RENDER_API_KEY = process.env.RENDER_API_KEY || process.env.RND_API_KEY;
const GITHUB_REPO = process.env.GITHUB_REPO || 'TUO_USERNAME/alcalog-platform';
const SERVICE_NAME = 'alcalog-platform';

if (!RENDER_API_KEY) {
  console.error('❌ Errore: RENDER_API_KEY non trovata nelle variabili d\'ambiente');
  console.error('   Configura: export RENDER_API_KEY="tuo_api_key"');
  process.exit(1);
}

// ⚠️ IMPORTANTE: Usa variabili d'ambiente o sostituisci con i tuoi valori reali
const config = {
  name: SERVICE_NAME,
  type: 'web_service',
  plan: 'free', // 'free' o 'starter'
  region: 'frankfurt',
  branch: 'main',
  rootDir: 'alcalog-app',
  buildCommand: 'npm install && npm run build',
  startCommand: 'npm start',
  envVars: [
    {
      key: 'NEXT_PUBLIC_SUPABASE_URL',
      value: process.env.NEXT_PUBLIC_SUPABASE_URL || 'TUO_SUPABASE_URL_QUI'
    },
    {
      key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'TUO_ANON_KEY_QUI'
    },
    {
      key: 'SUPABASE_SERVICE_ROLE_KEY',
      value: process.env.SUPABASE_SERVICE_ROLE_KEY || 'TUO_SERVICE_ROLE_KEY_QUI'
    },
    {
      key: 'RESEND_API_KEY',
      value: process.env.RESEND_API_KEY || 'TUO_RESEND_KEY_QUI'
    },
    {
      key: 'NODE_ENV',
      value: 'production'
    }
  ]
};

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
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
    
    req.on('error', (e) => {
      reject(e);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function createService() {
  console.log('🚀 Creazione servizio Render...\n');
  
  // Prima, dobbiamo ottenere il serviceId del repository GitHub
  // Questo richiede che il repository sia già collegato su Render
  // Per ora, creiamo lo script che mostra come farlo manualmente
  
  console.log('⚠️  NOTA: L\'API di Render richiede che il repository GitHub sia già collegato.');
  console.log('📋 ISTRUZIONI:');
  console.log('1. Vai su https://dashboard.render.com');
  console.log('2. Vai in Account Settings → Connected Accounts');
  console.log('3. Connetti il tuo account GitHub');
  console.log('4. Poi esegui questo script con il serviceId corretto\n');
  
  console.log('📝 Configurazione servizio:');
  console.log(JSON.stringify(config, null, 2));
  
  // Esempio di chiamata API (richiede serviceId)
  const examplePayload = {
    name: config.name,
    plan: config.plan,
    region: config.region,
    branch: config.branch,
    rootDir: config.rootDir,
    buildCommand: config.buildCommand,
    startCommand: config.startCommand,
    envVars: config.envVars,
    autoDeploy: true
  };
  
  console.log('\n📤 Payload API (esempio):');
  console.log(JSON.stringify(examplePayload, null, 2));
  
  console.log('\n✅ Script pronto!');
  console.log('📖 Vedi GUIDA_DEPLOY_RENDER.md per istruzioni complete');
}

createService().catch(console.error);

