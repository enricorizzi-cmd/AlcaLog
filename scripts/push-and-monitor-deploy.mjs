#!/usr/bin/env node

/**
 * Script per fare push e monitorare il deploy su Render
 * Usa MCP RenderOSM per verificare lo stato del deploy
 * 
 * USAGE: node scripts/push-and-monitor-deploy.mjs [commit_message]
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const SERVICE_ID = 'srv-d44dkcvdiees73d5b260'; // AlcaLog service ID

async function pushAndMonitor() {
  console.log('🚀 Eseguo push e monitoraggio deploy...');
  console.log('');

  try {
    // Push
    console.log('📤 Push su GitHub...');
    const { stdout: pushOutput } = await execAsync('git push', { cwd: process.cwd() });
    console.log(pushOutput);
    console.log('✅ Push completato');
    console.log('');

    // Attendi 30 secondi per permettere a Render di iniziare il deploy
    console.log('⏳ Attendo 30 secondi per l\'avvio del deploy...');
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Monitora deploy usando API Render (o meglio, verifica health check)
    console.log('📊 Monitoraggio deploy...');
    console.log('ℹ️  Nota: Su free tier, il servizio potrebbe richiedere risveglio');
    console.log('');

    let deployReady = false;
    let attempts = 0;
    const maxAttempts = 60; // 10 minuti (60 * 10 secondi)

    while (!deployReady && attempts < maxAttempts) {
      attempts++;
      try {
        const response = await fetch('https://alcalog.onrender.com/api/health', {
          method: 'GET',
          headers: {
            'User-Agent': 'DeployMonitor/1.0',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.status === 'ok') {
            console.log('✅ Deploy completato! Servizio live e healthy');
            console.log('🌐 URL: https://alcalog.onrender.com');
            deployReady = true;
            break;
          }
        }
      } catch (error) {
        // Servizio ancora in risveglio o non disponibile
      }

      if (attempts % 6 === 0) {
        const minutes = Math.floor((attempts * 10) / 60);
        const seconds = (attempts * 10) % 60;
        console.log(`⏳ Ancora in attesa... (${minutes}m ${seconds}s)`);
      } else {
        process.stdout.write('.');
      }

      await new Promise(resolve => setTimeout(resolve, 10000)); // 10 secondi
    }

    if (!deployReady) {
      console.log('');
      console.log('⏰ Timeout raggiunto. Il servizio potrebbe essere ancora in fase di risveglio.');
      console.log('ℹ️  Verifica manualmente su: https://dashboard.render.com');
    }

    process.exit(deployReady ? 0 : 1);
  } catch (error) {
    console.error('❌ Errore:', error.message);
    process.exit(1);
  }
}

pushAndMonitor();

