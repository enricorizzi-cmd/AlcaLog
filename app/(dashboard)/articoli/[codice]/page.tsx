'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function ArticoloDettaglioPage() {
  const params = useParams();
  const codice = params.codice as string;
  
  const [articolo, setArticolo] = useState<any>(null);
  const [lotti, setLotti] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogLottoOpen, setDialogLottoOpen] = useState(false);
  const [formLotto, setFormLotto] = useState({
    lotto_fornitore: '',
    scadenza: '',
    quantita: '',
    prezzo_unitario: '',
    sede: '',
    sezione: '',
  });
  const [magazzini, setMagazzini] = useState<Array<{ sede: string; sezione: string }>>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadArticolo();
    loadMagazzini();
  }, [codice]);

  const loadArticolo = async () => {
    try {
      const response = await fetch(`/api/articoli/${codice}`);
      if (response.ok) {
        const data = await response.json();
        setArticolo(data);
        setLotti(data.lotti || []);
      }
    } catch (err) {
      console.error('Errore caricamento articolo:', err);
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

  const handleCreaLotto = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!formLotto.lotto_fornitore || !formLotto.scadenza) {
      setError('Lotto fornitore e scadenza sono obbligatori');
      setSubmitting(false);
      return;
    }

    // Se quantità > 0, prezzo obbligatorio
    if (formLotto.quantita && parseFloat(formLotto.quantita) || '0') > 0) {
      if (!formLotto.prezzo_unitario || (!formLotto.sede || !formLotto.sezione)) {
        setError('Per quantità > 0, prezzo, sede e sezione sono obbligatori');
        setSubmitting(false);
        return;
      }
    }

    try {
      const response = await fetch(`/api/articoli/${codice}/lotti`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formLotto),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Errore nella creazione del lotto');
        return;
      }

      setDialogLottoOpen(false);
      setFormLotto({
        lotto_fornitore: '',
        scadenza: '',
        quantita: '',
        prezzo_unitario: '',
        sede: '',
        sezione: '',
      });
      loadArticolo();
    } catch (err) {
      setError('Errore nella creazione del lotto');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !articolo) {
    return <div className="flex items-center justify-center p-8">Caricamento...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link href="/dashboard/articoli">
            <Button variant="ghost" size="sm">← Indietro</Button>
          </Link>
          <h1 className="text-3xl font-bold mt-2">{articolo.codice_interno}</h1>
          <p className="text-gray-600">{articolo.descrizione}</p>
        </div>
        <Dialog open={dialogLottoOpen} onOpenChange={setDialogLottoOpen}>
          <DialogTrigger asChild>
            <Button>Nuovo Lotto</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuovo Lotto</DialogTitle>
              <DialogDescription>
                Crea un nuovo lotto per {articolo.codice_interno}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreaLotto} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Lotto Fornitore *</label>
                <Input
                  value={formLotto.lotto_fornitore}
                  onChange={(e) => setFormLotto({ ...formLotto, lotto_fornitore: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Scadenza *</label>
                <Input
                  type="date"
                  value={formLotto.scadenza}
                  onChange={(e) => setFormLotto({ ...formLotto, scadenza: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Quantità (opzionale - crea anche carico)</label>
                <Input
                  type="number"
                  step="0.0001"
                  value={formLotto.quantita}
                  onChange={(e) => setFormLotto({ ...formLotto, quantita: e.target.value })}
                />
              </div>

              {formLotto.quantita && parseFloat(formLotto.quantita || '0') > 0 && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Prezzo Unitario *</label>
                    <Input
                      type="number"
                      step="0.0001"
                      value={formLotto.prezzo_unitario}
                      onChange={(e) => setFormLotto({ ...formLotto, prezzo_unitario: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sede *</label>
                      <select
                        className="w-full p-2 border rounded"
                        value={formLotto.sede}
                        onChange={(e) => setFormLotto({ ...formLotto, sede: e.target.value, sezione: '' })}
                        required
                      >
                        <option value="">Seleziona...</option>
                        {Array.from(new Set(magazzini.map(m => m.sede))).map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sezione *</label>
                      <select
                        className="w-full p-2 border rounded"
                        value={formLotto.sezione}
                        onChange={(e) => setFormLotto({ ...formLotto, sezione: e.target.value })}
                        disabled={!formLotto.sede}
                        required
                      >
                        <option value="">Seleziona...</option>
                        {magazzini
                          .filter(m => m.sede === formLotto.sede)
                          .map((m) => (
                            <option key={`${m.sede}-${m.sezione}`} value={m.sezione}>
                              {m.sezione}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogLottoOpen(false)} disabled={submitting}>
                  Annulla
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creazione...' : 'Crea Lotto'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informazioni Articolo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Codice Interno:</span> {articolo.codice_interno}
            </div>
            <div>
              <span className="font-medium">Descrizione:</span> {articolo.descrizione}
            </div>
            {articolo.tipologia && (
              <div>
                <span className="font-medium">Tipologia:</span> <Badge>{articolo.tipologia}</Badge>
              </div>
            )}
            {articolo.categoria && (
              <div>
                <span className="font-medium">Categoria:</span> <Badge>{articolo.categoria}</Badge>
              </div>
            )}
            {articolo.unita_misura && (
              <div>
                <span className="font-medium">Unità di Misura:</span> {articolo.unita_misura}
              </div>
            )}
            {articolo.scorta_minima && (
              <div>
                <span className="font-medium">Scorta Minima:</span> {articolo.scorta_minima.toFixed(4)}
              </div>
            )}
            {articolo.fornitore_predefinito && (
              <div>
                <span className="font-medium">Fornitore Predefinito:</span> {articolo.fornitore_predefinito.descrizione}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lotti e Scadenze</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lotto Fornitore</TableHead>
                    <TableHead>BATCH_ID</TableHead>
                    <TableHead>Scadenza</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lotti.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-500">
                        Nessun lotto
                      </TableCell>
                    </TableRow>
                  ) : (
                    lotti.map((lotto) => (
                      <TableRow key={lotto.id}>
                        <TableCell>{lotto.lotto_fornitore}</TableCell>
                        <TableCell className="font-mono">{lotto.id}</TableCell>
                        <TableCell>
                          {new Date(lotto.scadenza).toLocaleDateString('it-IT')}
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
    </div>
  );
}

