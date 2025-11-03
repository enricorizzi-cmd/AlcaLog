/**
 * Generazione template ZPL per etichette Zebra
 * Formato: ZPL via TCP/IP
 * Fallback: PDF
 */

export interface EtichettaData {
  batchId: string;
  codiceArticolo: string;
  descrizione: string;
  lottoFornitore: string;
  scadenza: string; // YYYY-MM-DD
  quantita?: number;
}

/**
 * Genera template ZPL per etichetta
 * Dimensioni: 100x50mm standard Zebra
 */
export function generaTemplateZPL(data: EtichettaData): string {
  const { batchId, codiceArticolo, descrizione, lottoFornitore, scadenza, quantita } = data;
  
  // Formatta scadenza
  const scadenzaFormattata = new Date(scadenza).toLocaleDateString('it-IT');
  
  // Template ZPL base
  const zpl = `
^XA
^FO20,20^A0N,30,30^FDALCA LOG^FS
^FO20,60^A0N,20,20^FD${codiceArticolo}^FS
^FO20,90^A0N,18,18^FD${descrizione.substring(0, 30)}^FS
^FO20,120^A0N,15,15^FDLotto: ${lottoFornitore}^FS
^FO20,150^A0N,15,15^FDScadenza: ${scadenzaFormattata}^FS
${quantita ? `^FO20,180^A0N,15,15^FDQtà: ${quantita}^FS` : ''}
^FO20,220^BY3^BCN,60,Y,N,N^FD${batchId}^FS
^XZ
`.trim();

  return zpl;
}

/**
 * Genera PDF fallback per etichetta (usando libreria esterna se necessario)
 */
export function generaPDFEtichetta(data: EtichettaData): Blob {
  // Implementazione base - da espandere con libreria PDF
  const canvas = document.createElement('canvas');
  canvas.width = 400; // 100mm @ 96 DPI
  canvas.height = 200; // 50mm @ 96 DPI
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Impossibile creare canvas');
  }

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 24px Arial';
  ctx.fillText('ALCA LOG', 20, 30);
  
  ctx.font = '16px Arial';
  ctx.fillText(data.codiceArticolo, 20, 60);
  ctx.fillText(data.descrizione.substring(0, 40), 20, 90);
  ctx.fillText(`Lotto: ${data.lottoFornitore}`, 20, 120);
  ctx.fillText(`Scadenza: ${new Date(data.scadenza).toLocaleDateString('it-IT')}`, 20, 150);
  ctx.fillText(`BATCH: ${data.batchId}`, 20, 180);

  // Converti canvas a blob (implementazione semplificata)
  return new Blob(['PDF placeholder'], { type: 'application/pdf' });
}


