'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function PianificazionePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pianificazioni, setPianificazioni] = useState<any[]>([]);

  useEffect(() => {
    loadPianificazioni();
  }, []);

  const loadPianificazioni = async () => {
    try {
      setLoading(true);
      // TODO: Implementare API pianificazione
      // Per ora mostra pagina vuota
      setPianificazioni([]);
    } catch (err) {
      setError('Errore nel caricamento della pianificazione');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pianificazione Scorte</h1>
        <p className="text-gray-600 mt-2">
          Pianificazione scorte e proposte di acquisto
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Proposte di Acquisto</CardTitle>
          <CardDescription>
            Calcolo automatico delle scorte basato su media ponderata e indicizzata
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Caricamento...</div>
          ) : pianificazioni.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nessuna proposta di acquisto disponibile
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Articolo</TableHead>
                  <TableHead>Scorta Attuale</TableHead>
                  <TableHead>Scorta Minima</TableHead>
                  <TableHead>Media 12 Mesi</TableHead>
                  <TableHead>Proposta Acquisto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pianificazioni.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.articolo}</TableCell>
                    <TableCell>{p.scorta_attuale}</TableCell>
                    <TableCell>{p.scorta_minima}</TableCell>
                    <TableCell>{p.scorta_media_12m}</TableCell>
                    <TableCell>{p.proposta_acquisto}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


