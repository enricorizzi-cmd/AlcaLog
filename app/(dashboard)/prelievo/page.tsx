'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QRScanner from '@/components/QRScanner';
import { Badge } from '@/components/ui/badge';

export default function PrelievoPage() {
  const [sede, setSede] = useState('');
  const [sezione, setSezione] = useState('');
  const [articolo, setArticolo] = useState('');
  const [lottoId, setLottoId] = useState('');
  const [batchId, setBatchId] = useState('');
  const [quantita, setQuantita] = useState('');
  const [note, setNote] = useState('');
  const [magazzini, setMagazzini] = useState<Array<{ sede: string; sezione: string }>>([]);
  const [qrDecoded, setQrDecoded] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadMagazzini();
  }, []);

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

  const handleQRScan = async (decodedText: string) => {
    setBatchId(decodedText);
    setError(null);
    setQrDecoded(null);

    try {
      const response = await fetch(`/api/prelievi/qr/${decodedText}`);
      if (response.ok) {
        const data = await response.json();
        setQrDecoded(data);
        setArticolo(data.articolo || '');
        setLottoId(data.lottoId || '');
      } else {
        setError('BATCH_ID non trovato');
      }
    } catch (err) {
      setError('Errore nella decodifica QR');
    }
  };

  const handleScarico = async () => {
    if (!quantita || !sede || !sezione) {
      setError('Quantità, sede e sezione sono obbligatorie');
      return;
    }

    if (!articolo || (!lottoId && !batchId)) {
      setError('Articolo e lotto/BATCH_ID sono obbligatori');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/prelievi/scarico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articolo,
          lotto_id: lottoId,
          batch_id: batchId || undefined,
          quantita: parseFloat(quantita),
          sede,
          sezione,
          note,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Errore nello scarico');
        return;
      }

      setSuccess(true);
      // Reset form
      setArticolo('');
      setLottoId('');
      setBatchId('');
      setQuantita('');
      setNote('');
      setQrDecoded(null);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Errore nello scarico');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Prelievo Merci</h1>
        <p className="text-gray-600 mt-2">Scarico merci con ricerca o QR</p>
      </div>

      <Tabs defaultValue="ricerca" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ricerca">Ricerca Manuale</TabsTrigger>
          <TabsTrigger value="qr">Scanner QR</TabsTrigger>
        </TabsList>

        <TabsContent value="ricerca">
          <Card>
            <CardHeader>
              <CardTitle>Scarico Manuale</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sede *</label>
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
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sezione *</label>
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
                  <label className="text-sm font-medium">Articolo *</label>
                  <Input
                    value={articolo}
                    onChange={(e) => setArticolo(e.target.value)}
                    placeholder="Codice articolo"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Lotto ID / BATCH_ID</label>
                  <Input
                    value={lottoId || batchId}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.startsWith('ALCA')) {
                        setBatchId(val);
                        setLottoId('');
                      } else {
                        setLottoId(val);
                        setBatchId('');
                      }
                    }}
                    placeholder="Lotto o BATCH_ID"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantità *</label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={quantita}
                    onChange={(e) => setQuantita(e.target.value)}
                    placeholder="Quantità"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Note</label>
                  <Input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Note opzionali..."
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription>Scarico effettuato con successo!</AlertDescription>
                </Alert>
              )}

              <Button onClick={handleScarico} disabled={submitting} className="w-full">
                {submitting ? 'Scarico in corso...' : 'Esegui Scarico'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qr">
          <Card>
            <CardHeader>
              <CardTitle>Scanner QR Code</CardTitle>
              <CardDescription>Scansiona il QR code dell'etichetta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <QRScanner onScanSuccess={handleQRScan} onError={(err) => setError(err)} />

              {qrDecoded && (
                <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold">Dati QR Decodificati:</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">BATCH_ID:</span> {qrDecoded.batchId}
                    </div>
                    <div>
                      <span className="font-medium">Articolo:</span> {qrDecoded.articolo}
                    </div>
                    <div>
                      <span className="font-medium">Lotto Fornitore:</span> {qrDecoded.lotto_fornitore}
                    </div>
                    <div>
                      <span className="font-medium">Scadenza:</span>{' '}
                      {new Date(qrDecoded.scadenza).toLocaleDateString('it-IT')}
                    </div>
                  </div>
                  {qrDecoded.giacenze && qrDecoded.giacenze.length > 0 && (
                    <div className="mt-2">
                      <span className="font-medium">Giacenze:</span>
                      <div className="flex gap-2 mt-1">
                        {qrDecoded.giacenze.map((g: any, idx: number) => (
                          <Badge key={idx} variant="outline">
                            {g.sede}/{g.sezione}: {g.quantita_giacente.toFixed(4)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {batchId && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sede *</label>
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
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sezione *</label>
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
                      <label className="text-sm font-medium">Quantità *</label>
                      <Input
                        type="number"
                        step="0.0001"
                        value={quantita}
                        onChange={(e) => setQuantita(e.target.value)}
                        placeholder="Quantità"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Note</label>
                      <Input
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Note opzionali..."
                      />
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert>
                      <AlertDescription>Scarico effettuato con successo!</AlertDescription>
                    </Alert>
                  )}

                  <Button onClick={handleScarico} disabled={submitting} className="w-full">
                    {submitting ? 'Scarico in corso...' : 'Esegui Scarico'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

