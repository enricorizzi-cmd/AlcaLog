'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Giacenza } from '@/types/database';

export default function GiacenzePage() {
  const [giacenze, setGiacenze] = useState<Giacenza[]>([]);
  const [loading, setLoading] = useState(true);
  const [sede, setSede] = useState<string>('all');
  const [sezione, setSezione] = useState<string>('all');
  const [magazzini, setMagazzini] = useState<Array<{ sede: string; sezione: string }>>([]);

  useEffect(() => {
    loadMagazzini();
    loadGiacenze();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadGiacenze();
    }
  }, [sede, sezione]);

  const loadMagazzini = async () => {
    try {
      const response = await fetch('/api/magazzini');
      if (response.ok) {
        const data = await response.json();
        setMagazzini(data);
      }
    } catch (err) {
      console.error('Errore caricamento magazzini:', err);
    }
  };

  const loadGiacenze = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (sede !== 'all') params.append('sede', sede);
      if (sezione !== 'all') params.append('sezione', sezione);

      const response = await fetch(`/api/giacenze?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setGiacenze(data);
      }
    } catch (err) {
      console.error('Errore caricamento giacenze:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (formato: 'xlsx' | 'csv') => {
    try {
      const params = new URLSearchParams();
      if (sede !== 'all') params.append('sede', sede);
      if (sezione !== 'all') params.append('sezione', sezione);
      params.append('formato', formato);

      const response = await fetch(`/api/export/giacenze?${params.toString()}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `giacenze_${new Date().toISOString().split('T')[0]}.${formato === 'xlsx' ? 'xlsx' : 'csv'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Errore export:', err);
      alert('Errore nell\'export');
    }
  };

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return '-';
    return `€ ${value.toFixed(4)}`;
  };

  const getTarget = (scortaMin: number | null, scortaMedia: number) => {
    if (!scortaMin) return scortaMedia;
    return Math.max(scortaMin, scortaMedia);
  };

  const getBilancio = (giacenza: Giacenza) => {
    const target = getTarget(giacenza.scorta_minima, giacenza.scorta_media_12m);
    const diff = giacenza.quantita_giacente - target;
    
    if (diff < 0) {
      return { tipo: 'deficit', valore: Math.abs(diff), colore: 'text-red-600' };
    } else if (diff > 0) {
      return { tipo: 'surplus', valore: diff, colore: 'text-green-600' };
    }
    return { tipo: 'bilanciato', valore: 0, colore: 'text-gray-600' };
  };

  if (loading && giacenze.length === 0) {
    return <div className="flex items-center justify-center p-8">Caricamento...</div>;
  }

  const sediUniche = Array.from(new Set(magazzini.map(m => m.sede)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Giacenze</h1>
          <p className="text-gray-600 mt-2">Visualizzazione giacenze valorizzate con FIFO e scorte</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => handleExport('xlsx')}>
            Export Excel
          </Button>
          <Button variant="outline" onClick={() => handleExport('csv')}>
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <CardTitle>Giacenze Valorizzate</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={sede} onValueChange={setSede}>
                <SelectTrigger className="sm:w-48">
                  <SelectValue placeholder="Tutte le sedi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le sedi</SelectItem>
                  {sediUniche.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {sede !== 'all' && (
                <Select value={sezione} onValueChange={setSezione}>
                  <SelectTrigger className="sm:w-48">
                    <SelectValue placeholder="Tutte le sezioni" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutte le sezioni</SelectItem>
                    {magazzini
                      .filter(m => m.sede === sede)
                      .map((m) => (
                        <SelectItem key={`${m.sede}-${m.sezione}`} value={m.sezione}>
                          {m.sezione}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <CardDescription>
            Prezzo medio FIFO: calcolo globale • Scorta media: 12 mesi ponderata
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Articolo</TableHead>
                  <TableHead>Descrizione</TableHead>
                  <TableHead className="text-right">Sede</TableHead>
                  <TableHead className="text-right">Sezione</TableHead>
                  <TableHead className="text-right">Qtà Giacente</TableHead>
                  <TableHead className="text-right">Prezzo FIFO</TableHead>
                  <TableHead className="text-right">Valore FIFO</TableHead>
                  <TableHead className="text-right">Scorta Min</TableHead>
                  <TableHead className="text-right">Scorta Media 12m</TableHead>
                  <TableHead className="text-right">Target</TableHead>
                  <TableHead className="text-right">Bilancio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {giacenze.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center text-gray-500">
                      Nessuna giacenza trovata
                    </TableCell>
                  </TableRow>
                ) : (
                  giacenze.map((g) => {
                    const bilanciamento = getBilancio(g);
                    const valoreFifo = g.prezzo_medio_FIFO 
                      ? g.quantita_giacente * g.prezzo_medio_FIFO 
                      : null;
                    const target = getTarget(g.scorta_minima, g.scorta_media_12m);

                    return (
                      <TableRow key={`${g.articolo}-${g.sede}-${g.sezione}`}>
                        <TableCell className="font-medium">{g.articolo}</TableCell>
                        <TableCell>{g.descrizione}</TableCell>
                        <TableCell className="text-right">{g.sede}</TableCell>
                        <TableCell className="text-right">{g.sezione}</TableCell>
                        <TableCell className={`text-right font-medium ${g.quantita_giacente < 0 ? 'text-red-600' : ''}`}>
                          {g.quantita_giacente.toFixed(4)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(g.prezzo_medio_FIFO)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(valoreFifo)}
                        </TableCell>
                        <TableCell className="text-right">
                          {g.scorta_minima ? g.scorta_minima.toFixed(4) : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {g.scorta_media_12m.toFixed(4)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {target.toFixed(4)}
                        </TableCell>
                        <TableCell className={`text-right font-medium ${bilanciamento.colore}`}>
                          {bilanciamento.tipo === 'deficit' && '-'}
                          {bilanciamento.valore.toFixed(4)}
                          {bilanciamento.tipo === 'surplus' && ' +'}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
