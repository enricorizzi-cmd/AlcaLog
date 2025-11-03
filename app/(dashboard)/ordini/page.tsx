'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { OrdineFornitore } from '@/types/database';

export default function OrdiniPage() {
  const [ordini, setOrdini] = useState<OrdineFornitore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrdini();
  }, []);

  const loadOrdini = async () => {
    try {
      const response = await fetch('/api/ordini');
      if (response.ok) {
        const data = await response.json();
        setOrdini(data);
      }
    } catch (err) {
      console.error('Errore caricamento ordini:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Caricamento...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Ordini</h1>
          <p className="text-gray-600 mt-2">Gestione ordini a fornitore</p>
        </div>
        <Link href="/dashboard/ordini/nuovo">
          <Button>Nuovo Ordine</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista Ordini</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numero Ordine</TableHead>
                  <TableHead>Data Ordine</TableHead>
                  <TableHead>Fornitore</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordini.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500">
                      Nessun ordine trovato
                    </TableCell>
                  </TableRow>
                ) : (
                  ordini.map((ordine) => (
                    <TableRow key={ordine.id}>
                      <TableCell className="font-medium">
                        {ordine.numero_ordine || `#${ordine.id}`}
                      </TableCell>
                      <TableCell>
                        {new Date(ordine.data_ordine).toLocaleDateString('it-IT')}
                      </TableCell>
                      <TableCell>
                        {ordine.fornitore_movimento || '-'}
                      </TableCell>
                      <TableCell>{ordine.note_totali || '-'}</TableCell>
                      <TableCell>
                        <Link href={`/dashboard/ordini/${ordine.id}`}>
                          <Button variant="outline" size="sm">
                            Dettaglio
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

