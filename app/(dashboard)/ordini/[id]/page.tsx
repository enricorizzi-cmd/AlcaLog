'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function OrdineDettaglioPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [ordine, setOrdine] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrdine();
  }, [id]);

  const loadOrdine = async () => {
    try {
      const response = await fetch(`/api/ordini/${id}`);
      if (response.ok) {
        const data = await response.json();
        setOrdine(data);
      }
    } catch (err) {
      console.error('Errore caricamento ordine:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !ordine) {
    return <div className="flex items-center justify-center p-8">Caricamento...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link href="/dashboard/ordini">
            <Button variant="ghost" size="sm">← Indietro</Button>
          </Link>
          <h1 className="text-3xl font-bold mt-2">
            Ordine {ordine.numero_ordine || `#${ordine.id}`}
          </h1>
          <p className="text-gray-600">
            Data: {new Date(ordine.data_ordine).toLocaleDateString('it-IT')}
          </p>
        </div>
        <Link href={`/dashboard/ricevimento?ordine=${ordine.id}`}>
          <Button>Ricevi Ordine</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informazioni Ordine</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="font-medium">Fornitore:</span> {ordine.fornitore_movimento?.descrizione || '-'}
          </div>
          <div>
            <span className="font-medium">Data Ordine:</span> {new Date(ordine.data_ordine).toLocaleDateString('it-IT')}
          </div>
          {ordine.note_totali && (
            <div>
              <span className="font-medium">Note:</span> {ordine.note_totali}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Righe Ordine</CardTitle>
          <CardDescription>Righe ordine con residui</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Articolo</TableHead>
                  <TableHead>Descrizione</TableHead>
                  <TableHead className="text-right">Quantità Ordine</TableHead>
                  <TableHead className="text-right">Quantità Evasa</TableHead>
                  <TableHead className="text-right">Residuo</TableHead>
                  <TableHead>Stato</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordine.righe && ordine.righe.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500">
                      Nessuna riga
                    </TableCell>
                  </TableRow>
                ) : (
                  ordine.righe.map((riga: any) => {
                    const residuo = riga.residuo?.quantita_residua || 0;
                    const evaso = (riga.quantita_ordine || 0) - residuo;

                    return (
                      <TableRow key={riga.id}>
                        <TableCell className="font-medium">
                          {riga.articolo || riga.descrizione || '-'}
                        </TableCell>
                        <TableCell>{riga.descrizione || '-'}</TableCell>
                        <TableCell className="text-right">{riga.quantita_ordine.toFixed(4)}</TableCell>
                        <TableCell className="text-right">{evaso.toFixed(4)}</TableCell>
                        <TableCell className={`text-right font-medium ${residuo > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                          {residuo.toFixed(4)}
                        </TableCell>
                        <TableCell>
                          {residuo > 0 ? (
                            <Badge variant="outline">Da Ricevere</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800">Evaso</Badge>
                          )}
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

