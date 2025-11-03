/**
 * Script per creare automaticamente il servizio su Render.com via API
 * 
 * USAGE:
 * node scripts/create-render-service.mjs [GITHUB_REPO_OWNER/REPO_NAME]
 * 
 * Esempio:
 * node scripts/create-render-service.mjs username/alcalog-platform
 */

import https from 'https';

const RENDER_API_KEY = 'rnd_lNGvDoYk5oA3RD6TijljFEo5CLPK';
const RENDER_API_BASE = 'api.render.com';

// Configurazione servizio
const SERVICE_CONFIG = {
  name: 'alcalog-platform',
  plan: 'free', // 'free' o 'starter'
  region: 'frankfurt',
  branch: 'main',
  rootDir: 'alcalog-app',
  buildCommand: 'npm install && npm run build',
  startCommand: 'npm start',
  autoDeploy: true,
  envVars: [
    {
      key: 'NEXT_PUBLIC_SUPABASE_URL',
      value: 'https://sycqyblsvepbyywveokap.supabase.co'
    },
    {
      key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5Y3F5YmxzdmVwYnl5d2Vva2FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzE5MTIsImV4cCI6MjA3Nzc0NzkxMn0.hyQczn__Cl5UvAJBSeht1QT2ShQAofqjpUEEOJFlujE'
    },
    {
      key: 'SUPABASE_SERVICE_ROLE_KEY',
      value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5Y3F5YmxzdmVwYnl5d2Vva2FwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE3MTkxMiwiZXhwIjoyMDc3NzQ3OTEyfQ.x_2Y0dkEQ_-BJTjFHyG1Pufoev6M4AVyu-R-GInYZOE'
    },
    {
      key: 'RESEND_API_KEY',
      value: 're_FXv8pFpX_3vjQBUcBvmPnkp8Ce5tss44d'
    },
    {
      key: 'NODE_ENV',
      value: 'production'
    }
  ]
};

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: RENDER_API_BASE,
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
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(parsed)}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${e.message} - Response: ${data}`));
        }
      });
    });
    
    req.on('error', (e) => {
      reject(e);
    });
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

async function getOwner() {
  console.log('📋 Recupero informazioni account...');
  try {
    // Prova endpoint user/me
    const user = await makeRequest('/v1/me');
    if (user && user.user) {
      console.log(`✅ Account: ${user.user.name || user.user.email || 'User'}`);
      return user.user;
    }
    throw new Error('Impossibile recuperare informazioni account');
  } catch (error) {
    console.warn('⚠️  Errore recupero user info:', error.message);
    // Se fallisce, procediamo comunque - Render può richiedere ownerId direttamente nel payload
    return null;
  }
}

async function getRepositories() {
  console.log('📋 Recupero repository GitHub collegati...');
  try {
    // Endpoint alternativo per repository
    const repos = await makeRequest('/v1/repos');
    if (repos && Array.isArray(repos) && repos.length > 0) {
      console.log(`✅ Trovati ${repos.length} repository:`);
      repos.forEach((repo, idx) => {
        console.log(`   ${idx + 1}. ${repo.name || repo.repo} (${repo.provider || 'unknown'})`);
      });
      return repos;
    }
    console.warn('⚠️  Nessun repository trovato. Assicurati di aver collegato GitHub a Render.');
    return [];
  } catch (error) {
    console.warn('⚠️  Errore recupero repository:', error.message);
    console.log('💡 Proseguo comunque - dovrai specificare il repository manualmente');
    return [];
  }
}

async function findRepository(repos, repoName) {
  if (!repos || repos.length === 0) {
    // Se non abbiamo repository, creiamo il servizio direttamente con il nome fornito
    console.log(`⚠️  Repository non trovato automaticamente. Userò: ${repoName}`);
    return {
      name: repoName,
      repository: repoName.includes('/') ? repoName : `github.com/${repoName}`,
      repo: repoName.includes('/') ? repoName : repoName
    };
  }
  
  // Cerca per nome esatto o parziale
  const found = repos.find(r => {
    const repoFullName = r.name || r.repo || r.repository;
    return repoFullName === repoName || 
           repoFullName.includes(repoName) ||
           repoName.includes(repoFullName);
  });
  
  if (!found) {
    console.log('\n📋 Repository disponibili:');
    repos.forEach((r, idx) => {
      console.log(`   ${idx + 1}. ${r.name || r.repo || r.repository}`);
    });
    throw new Error(`Repository "${repoName}" non trovato. Usa uno dei repository sopra elencati.`);
  }
  
  return found;
}

async function createService(repo) {
  console.log(`\n🚀 Creazione servizio per repository: ${repo.name || repo.repo || repo.repository}...`);
  
  // Formatta il repository nel formato richiesto da Render
  let repoString = repo.repository || repo.repo || repo.name;
  if (!repoString.includes('/')) {
    // Se è solo il nome, Render richiede owner/repo
    throw new Error(`Repository deve essere nel formato "owner/repo". Fornito: ${repoString}`);
  }
  
  if (!repoString.startsWith('github.com/')) {
    repoString = `github.com/${repoString}`;
  }
  
  const payload = {
    type: 'web_service',
    name: SERVICE_CONFIG.name,
    repo: repoString,
    branch: SERVICE_CONFIG.branch,
    rootDir: SERVICE_CONFIG.rootDir,
    planId: SERVICE_CONFIG.plan === 'free' ? 'starter' : 'pro', // Render usa 'starter' per free
    region: SERVICE_CONFIG.region,
    buildCommand: SERVICE_CONFIG.buildCommand,
    startCommand: SERVICE_CONFIG.startCommand,
    autoDeploy: SERVICE_CONFIG.autoDeploy,
    envVars: SERVICE_CONFIG.envVars.map(env => ({
      key: env.key,
      value: env.value
    }))
  };
  
  console.log('\n📤 Payload configurazione:');
  console.log(JSON.stringify({
    ...payload,
    envVars: payload.envVars.map(v => ({ key: v.key, value: '***' })) // Nascondi valori
  }, null, 2));
  
  try {
    const service = await makeRequest('/v1/services', 'POST', payload);
    console.log('\n✅ Servizio creato con successo!');
    console.log(`\n📊 Dettagli servizio:`);
    console.log(`   ID: ${service.service?.id || service.id}`);
    console.log(`   Nome: ${service.service?.name || service.name}`);
    console.log(`   URL: https://${service.service?.serviceDetails?.url || SERVICE_CONFIG.name + '.onrender.com'}`);
    console.log(`   Stato: ${service.service?.serviceDetails?.deploy?.status || 'creating'}`);
    
    return service;
  } catch (error) {
    console.error('\n❌ Errore creazione servizio:', error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Script Creazione Servizio Render.com');
  console.log('==========================================\n');
  
  const repoArg = process.argv[2];
  
  if (!repoArg) {
    console.log('❌ Errore: Specifica il repository GitHub');
    console.log('\nUsage:');
    console.log('  node scripts/create-render-service.mjs [OWNER/REPO_NAME]');
    console.log('\nEsempio:');
    console.log('  node scripts/create-render-service.mjs username/alcalog-platform');
    console.log('\nOppure solo il nome se il repository è già collegato:');
    console.log('  node scripts/create-render-service.mjs alcalog-platform');
    process.exit(1);
  }
  
  try {
    // Step 1: Verifica formato repository
    if (!repoArg.includes('/')) {
      console.log('⚠️  Formato repository non valido.');
      console.log('📖 Usa il formato: OWNER/REPO_NAME');
      console.log('   Esempio: username/alcalog-platform\n');
      process.exit(1);
    }
    
    // Step 2: Prova a recuperare info account (opzionale)
    await getOwner();
    
    // Step 3: Prova a recuperare repository (opzionale)
    const repos = await getRepositories();
    
    // Step 4: Trova o prepara repository
    const repo = await findRepository(repos, repoArg);
    console.log(`✅ Repository: ${repo.name || repo.repo || repoArg}`);
    
    // Step 5: Crea servizio
    const service = await createService(repo);
    
    console.log('\n✅ COMPLETATO!');
    console.log('\n📝 Prossimi passi:');
    console.log('   1. Vai su https://dashboard.render.com');
    console.log('   2. Controlla il servizio appena creato');
    console.log('   3. Il deploy inizierà automaticamente');
    console.log('   4. Monitora i log per eventuali errori');
    console.log('\n🎉 Il servizio sarà disponibile a:');
    console.log(`   https://${SERVICE_CONFIG.name}.onrender.com`);
    
  } catch (error) {
    console.error('\n❌ Errore:', error.message);
    process.exit(1);
  }
}

main();

