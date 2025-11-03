'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function MovimentiPage() {
  const [movimenti, setMovimenti] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtri, setFiltri] = useState({
    data_da: '',
    data_a: '',
    tipo_movimento: 'all',
    articolo: '',
    sede: 'all',
    sezione: 'all',
  });
  const [magazzini, setMagazzini] = useState<Array<{ sede: string; sezione: string }>>([]);

  useEffect(() => {
    loadMagazzini();
    loadMovimenti();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMovimenti();
    }, 500);
    return () => clearTimeout(timer);
  }, [filtri]);

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

  const loadMovimenti = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtri.data_da) params.append('data_da', filtri.data_da);
      if (filtri.data_a) params.append('data_a', filtri.data_a);
      if (filtri.tipo_movimento !== 'all') params.append('tipo_movimento', filtri.tipo_movimento);
      if (filtri.articolo) params.append('articolo', filtri.articolo);
      if (filtri.sede !== 'all') params.append('sede', filtri.sede);
      if (filtri.sezione !== 'all') params.append('sezione', filtri.sezione);
      params.append('limit', '500');

      const response = await fetch(`/api/movimenti?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setMovimenti(data);
      }
    } catch (err) {
      console.error('Errore caricamento movimenti:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTipoMovimentoColor = (tipo: string) => {
    switch (tipo) {
      case 'CARICO':
        return 'bg-green-100 text-green-800';
      case 'SCARICO':
        return 'bg-red-100 text-red-800';
      case 'TRASF_IN':
        return 'bg-blue-100 text-blue-800';
      case 'TRASF_OUT':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && movimenti.length === 0) {
    return <div className="flex items-center justify-center p-8">Caricamento...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Movimenti Magazzino</h1>
          <p className="text-gray-600 mt-2">Storico movimenti di magazzino</p>
        </div>
        <Link href="/dashboard/giacenze">
          <Button variant="outline">Export Giacenze</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Da</label>
              <Input
                type="date"
                value={filtri.data_da}
                onChange={(e) => setFiltri({ ...filtri, data_da: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data A</label>
              <Input
                type="date"
                value={filtri.data_a}
                onChange={(e) => setFiltri({ ...filtri, data_a: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo Movimento</label>
              <Select value={filtri.tipo_movimento} onValueChange={(v) => setFiltri({ ...filtri, tipo_movimento: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti</SelectItem>
                  <SelectItem value="CARICO">Carico</SelectItem>
                  <SelectItem value="SCARICO">Scarico</SelectItem>
                  <SelectItem value="TRASF_IN">Trasferimento In</SelectItem>
                  <SelectItem value="TRASF_OUT">Trasferimento Out</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Articolo</label>
              <Input
                value={filtri.articolo}
                onChange={(e) => setFiltri({ ...filtri, articolo: e.target.value })}
                placeholder="Codice articolo"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sede</label>
              <Select value={filtri.sede} onValueChange={(v) => setFiltri({ ...filtri, sede: v, sezione: 'all' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte</SelectItem>
                  {Array.from(new Set(magazzini.map(m => m.sede))).map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sezione</label>
              <Select value={filtri.sezione} onValueChange={(v) => setFiltri({ ...filtri, sezione: v })} disabled={filtri.sede === 'all'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte</SelectItem>
                  {magazzini
                    .filter(m => m.sede === filtri.sede)
                    .map((m) => (
                      <SelectItem key={`${m.sede}-${m.sezione}`} value={m.sezione}>
                        {m.sezione}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Movimenti ({movimenti.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Ora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Articolo</TableHead>
                  <TableHead>Sede/Sezione</TableHead>
                  <TableHead className="text-right">Quantità</TableHead>
                  <TableHead className="text-right">Prezzo Unit.</TableHead>
                  <TableHead className="text-right">Valore</TableHead>
                  <TableHead>Utente</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimenti.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500">
                      Nessun movimento trovato
                    </TableCell>
                  </TableRow>
                ) : (
                  movimenti.map((mov) => {
                    const valore = mov.prezzo_unitario && mov.quantita 
                      ? Math.abs(mov.quantita) * mov.prezzo_unitario 
                      : null;

                    return (
                      <TableRow key={mov.id}>
                        <TableCell>
                          {new Date(mov.data_effettiva).toLocaleDateString('it-IT')} {mov.ora_effettiva}
                        </TableCell>
                        <TableCell>
                          <Badge className={getTipoMovimentoColor(mov.tipo_movimento)}>
                            {mov.tipo_movimento}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{mov.articolo}</TableCell>
                        <TableCell>{mov.sede}/{mov.sezione}</TableCell>
                        <TableCell className={`text-right font-medium ${mov.quantita < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {mov.quantita > 0 ? '+' : ''}{mov.quantita.toFixed(4)}
                        </TableCell>
                        <TableCell className="text-right">
                          {mov.prezzo_unitario ? `€ ${mov.prezzo_unitario.toFixed(4)}` : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {valore ? `€ ${valore.toFixed(4)}` : '-'}
                        </TableCell>
                        <TableCell>{mov.utente?.nome || '-'}</TableCell>
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

