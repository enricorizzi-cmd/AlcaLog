import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import ExcelJS from 'exceljs';

// GET /api/export/giacenze - Export giacenze in Excel o CSV
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const formato = searchParams.get('formato') || 'xlsx'; // xlsx o csv
    const sede = searchParams.get('sede');
    const sezione = searchParams.get('sezione');

    // Recupera giacenze
    let query = supabase.from('giacenze_v').select('*');
    if (sede) query = query.eq('sede', sede);
    if (sezione) query = query.eq('sezione', sezione);

    const { data: giacenze, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (formato === 'csv') {
      // Genera CSV
      const headers = [
        'Articolo',
        'Descrizione',
        'Sede',
        'Sezione',
        'Qtà Giacente',
        'Prezzo FIFO',
        'Valore FIFO',
        'Scorta Minima',
        'Scorta Media 12m',
        'Target',
        'Bilancio',
      ];

      const rows = (giacenze || []).map((g: any) => {
        const target = Math.max(g.scorta_minima || 0, g.scorta_media_12m || 0);
        const bilanciamento = g.quantita_giacente - target;
        
        return [
          g.articolo,
          g.descrizione,
          g.sede,
          g.sezione,
          g.quantita_giacente.toFixed(4),
          g.prezzo_medio_FIFO ? g.prezzo_medio_FIFO.toFixed(4) : '',
          g.prezzo_medio_FIFO ? (g.quantita_giacente * g.prezzo_medio_FIFO).toFixed(4) : '',
          g.scorta_minima ? g.scorta_minima.toFixed(4) : '',
          g.scorta_media_12m.toFixed(4),
          target.toFixed(4),
          bilanciamento.toFixed(4),
        ];
      });

      const csvContent = [
        headers.join(';'),
        ...rows.map((row: any[]) => row.join(';')),
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="giacenze_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else {
      // Genera Excel
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Giacenze');

      // Intestazioni
      worksheet.columns = [
        { header: 'Articolo', key: 'articolo', width: 15 },
        { header: 'Descrizione', key: 'descrizione', width: 30 },
        { header: 'Sede', key: 'sede', width: 10 },
        { header: 'Sezione', key: 'sezione', width: 10 },
        { header: 'Qtà Giacente', key: 'quantita', width: 15 },
        { header: 'Prezzo FIFO', key: 'prezzo_fifo', width: 15 },
        { header: 'Valore FIFO', key: 'valore_fifo', width: 15 },
        { header: 'Scorta Minima', key: 'scorta_min', width: 15 },
        { header: 'Scorta Media 12m', key: 'scorta_media', width: 18 },
        { header: 'Target', key: 'target', width: 15 },
        { header: 'Bilancio', key: 'bilancio', width: 15 },
      ];

      // Stile intestazioni
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE30613' },
      };
      worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

      // Dati
      (giacenze || []).forEach((g: any) => {
        const target = Math.max(g.scorta_minima || 0, g.scorta_media_12m || 0);
        const bilanciamento = g.quantita_giacente - target;
        const valoreFifo = g.prezzo_medio_FIFO 
          ? g.quantita_giacente * g.prezzo_medio_FIFO 
          : null;

        worksheet.addRow({
          articolo: g.articolo,
          descrizione: g.descrizione,
          sede: g.sede,
          sezione: g.sezione,
          quantita: parseFloat(g.quantita_giacente.toFixed(4)),
          prezzo_fifo: g.prezzo_medio_FIFO ? parseFloat(g.prezzo_medio_FIFO.toFixed(4)) : null,
          valore_fifo: valoreFifo ? parseFloat(valoreFifo.toFixed(4)) : null,
          scorta_min: g.scorta_minima ? parseFloat(g.scorta_minima.toFixed(4)) : null,
          scorta_media: parseFloat(g.scorta_media_12m.toFixed(4)),
          target: parseFloat(target.toFixed(4)),
          bilancio: parseFloat(bilanciamento.toFixed(4)),
        });
      });

      // Formato numeri
      worksheet.getColumn('quantita').numFmt = '#,##0.0000';
      worksheet.getColumn('prezzo_fifo').numFmt = '#,##0.0000';
      worksheet.getColumn('valore_fifo').numFmt = '#,##0.0000';
      worksheet.getColumn('scorta_min').numFmt = '#,##0.0000';
      worksheet.getColumn('scorta_media').numFmt = '#,##0.0000';
      worksheet.getColumn('target').numFmt = '#,##0.0000';
      worksheet.getColumn('bilancio').numFmt = '#,##0.0000';

      const buffer = await workbook.xlsx.writeBuffer();

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="giacenze_${new Date().toISOString().split('T')[0]}.xlsx"`,
        },
      });
    }
  } catch (error) {
    console.error('Errore export giacenze:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}


