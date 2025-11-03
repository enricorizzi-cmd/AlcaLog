'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

interface OrdineRicevimento {
  id: number;
  numero_ordine: string | null;
  data_ordine: string;
  fornitore_movimento: any;
  righe: Array<{
    id: number;
    articolo: string;
    descrizione: string | null;
    quantita_ordine: number;
    residuo?: {
      quantita_residua: number;
    };
  }>;
}

export default function RicevimentoPage() {
  const [ordini, setOrdini] = useState<OrdineRicevimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrdine, setSelectedOrdine] = useState<OrdineRicevimento | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [magazzini, setMagazzini] = useState<Array<{ sede: string; sezione: string }>>([]);
  const [righeEvasione, setRigheEvasione] = useState<any[]>([]);
  const [sede, setSede] = useState('');
  const [sezione, setSezione] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrdini();
    loadMagazzini();
  }, []);

  const loadOrdini = async () => {
    try {
      const response = await fetch('/api/ricevimenti');
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

  const handleApriEvasione = (ordine: OrdineRicevimento) => {
    setSelectedOrdine(ordine);
    
    // Prepara righe per evasione (solo quelle con residui > 0)
    const righeDaEvadere = (ordine.righe || [])
      .filter((r: any) => r.residuo && r.residuo.quantita_residua > 0)
      .map((r: any) => ({
        ordine_riga_id: r.id,
        articolo: r.articolo,
        quantita: r.residuo.quantita_residua,
        lotto_fornitore: '',
        scadenza: '',
        prezzo_unitario: null,
      }));

    setRigheEvasione(righeDaEvadere);
    setDialogOpen(true);
  };

  const handleEvadi = async () => {
    if (!selectedOrdine || !sede || !sezione) {
      setError('Sede e sezione sono obbligatorie');
      return;
    }

    // Valida righe
    for (const riga of righeEvasione) {
      if (!riga.lotto_fornitore || !riga.scadenza) {
        setError(`Lotto fornitore e scadenza obbligatorie per ${riga.articolo}`);
        return;
      }
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/ricevimenti/${selectedOrdine.id}/evadi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          righe: righeEvasione,
          sede,
          sezione,
          note_totali: note,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Errore nell\'evasione');
        return;
      }

      // Successo
      setDialogOpen(false);
      setRigheEvasione([]);
      setNote('');
      loadOrdini();
    } catch (err) {
      setError('Errore nell\'evasione del ricevimento');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Caricamento...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ricevimento Merci</h1>
        <p className="text-gray-600 mt-2">Evasione ordini e carico merci</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ordini da Ricevere</CardTitle>
          <CardDescription>Ordini con residui da evadere</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numero Ordine</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Fornitore</TableHead>
                  <TableHead>Righe con Residui</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordini.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500">
                      Nessun ordine da ricevere
                    </TableCell>
                  </TableRow>
                ) : (
                  ordini.map((ordine) => {
                    const righeConResidui = (ordine.righe || []).filter(
                      (r: any) => r.residuo && r.residuo.quantita_residua > 0
                    );

                    return (
                      <TableRow key={ordine.id}>
                        <TableCell className="font-medium">
                          {ordine.numero_ordine || `#${ordine.id}`}
                        </TableCell>
                        <TableCell>
                          {new Date(ordine.data_ordine).toLocaleDateString('it-IT')}
                        </TableCell>
                        <TableCell>{ordine.fornitore_movimento?.descrizione || '-'}</TableCell>
                        <TableCell>
                          <Badge>{righeConResidui.length}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApriEvasione(ordine)}
                          >
                            Evadi
                          </Button>
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

      {/* Dialog Evasione */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Evasione Ordine {selectedOrdine?.numero_ordine || `#${selectedOrdine?.id}`}</DialogTitle>
            <DialogDescription>
              Completa i dati per evadere l'ordine
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select value={sede} onValueChange={setSede}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona Sede" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(new Set(magazzini.map(m => m.sede))).map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sezione} onValueChange={setSezione} disabled={!sede}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona Sezione" />
                </SelectTrigger>
                <SelectContent>
                  {magazzini
                    .filter(m => m.sede === sede)
                    .map((m) => (
                      <SelectItem key={`${m.sede}-${m.sezione}`} value={m.sezione}>
                        {m.sezione}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Note</label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Note opzionali..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Righe da Evadere</label>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Articolo</TableHead>
                      <TableHead>Quantità</TableHead>
                      <TableHead>Lotto Fornitore</TableHead>
                      <TableHead>Scadenza</TableHead>
                      <TableHead>Prezzo Unitario</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {righeEvasione.map((riga, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{riga.articolo}</TableCell>
                        <TableCell>{riga.quantita}</TableCell>
                        <TableCell>
                          <Input
                            value={riga.lotto_fornitore}
                            onChange={(e) => {
                              const nuoveRighe = [...righeEvasione];
                              nuoveRighe[idx].lotto_fornitore = e.target.value;
                              setRigheEvasione(nuoveRighe);
                            }}
                            placeholder="Lotto fornitore"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="date"
                            value={riga.scadenza}
                            onChange={(e) => {
                              const nuoveRighe = [...righeEvasione];
                              nuoveRighe[idx].scadenza = e.target.value;
                              setRigheEvasione(nuoveRighe);
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.0001"
                            value={riga.prezzo_unitario || ''}
                            onChange={(e) => {
                              const nuoveRighe = [...righeEvasione];
                              nuoveRighe[idx].prezzo_unitario = e.target.value ? parseFloat(e.target.value) : null;
                              setRigheEvasione(nuoveRighe);
                            }}
                            placeholder="Prezzo (opzionale)"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                Annulla
              </Button>
              <Button onClick={handleEvadi} disabled={submitting || !sede || !sezione}>
                {submitting ? 'Evasione in corso...' : 'Evadi Ordine'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

