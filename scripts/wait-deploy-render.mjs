#!/usr/bin/env node

/**
 * Script per monitorare il deploy su Render dopo un push
 * Usa MCP RenderOSM per verificare lo stato del deploy
 * 
 * USAGE: node scripts/wait-deploy-render.mjs
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const SERVICE_ID = 'srv-d44dkcvdiees73d5b260'; // AlcaLog service ID
const MAX_WAIT_TIME = 600000; // 10 minuti massimo
const CHECK_INTERVAL = 10000; // Controlla ogni 10 secondi

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkDeployStatus() {
  try {
    // Usa curl per chiamare l'API Render (o meglio, usa MCP se disponibile)
    // Per ora, facciamo un semplice check HTTP
    const response = await fetch('https://alcalog.onrender.com/api/health', {
      method: 'GET',
      headers: {
        'User-Agent': 'DeployMonitor/1.0'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return { status: 'live', healthy: data.status === 'ok' };
    }
    return { status: 'waking', healthy: false };
  } catch (error) {
    return { status: 'waking', healthy: false, error: error.message };
  }
}

async function waitForDeploy() {
  console.log('🚀 Monitoraggio deploy Render...');
  console.log(`📦 Service ID: ${SERVICE_ID}`);
  console.log(`⏱️  Timeout massimo: ${MAX_WAIT_TIME / 1000}s`);
  console.log('');

  const startTime = Date.now();
  let lastStatus = 'unknown';

  while (Date.now() - startTime < MAX_WAIT_TIME) {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const status = await checkDeployStatus();
    
    if (status.status !== lastStatus) {
      console.log(`[${elapsed}s] Status: ${status.status}${status.healthy ? ' ✅' : ''}`);
      lastStatus = status.status;
    } else {
      process.stdout.write('.');
    }

    if (status.status === 'live' && status.healthy) {
      console.log('');
      console.log('✅ Deploy completato e servizio live!');
      console.log(`🌐 URL: https://alcalog.onrender.com`);
      return true;
    }

    await sleep(CHECK_INTERVAL);
  }

  console.log('');
  console.log('⏰ Timeout raggiunto. Il servizio potrebbe essere ancora in fase di risveglio (free tier).');
  return false;
}

// Esegui
waitForDeploy()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Errore:', error);
    process.exit(1);
  });

