'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import QRScanner from '@/components/QRScanner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TrasferimentiPage() {
  const [trasferimenti, setTrasferimenti] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [magazzini, setMagazzini] = useState<Array<{ sede: string; sezione: string }>>([]);
  const [formData, setFormData] = useState({
    articolo: '',
    lotto_id: '',
    batch_id: '',
    sede_origine: '',
    sezione_origine: '',
    sede_destinazione: '',
    sezione_destinazione: '',
    quantita: '',
    note: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrScanned, setQrScanned] = useState(false);

  useEffect(() => {
    loadTrasferimenti();
    loadMagazzini();
  }, []);

  const loadTrasferimenti = async () => {
    try {
      const response = await fetch('/api/trasferimenti');
      if (response.ok) {
        const data = await response.json();
        setTrasferimenti(data);
      }
    } catch (err) {
      console.error('Errore caricamento trasferimenti:', err);
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

  const handleQRScan = async (decodedText: string) => {
    setFormData({ ...formData, batch_id: decodedText });
    setQrScanned(true);
    setError(null);

    // Decodifica QR per pre-compilare form
    try {
      const response = await fetch(`/api/prelievi/qr/${decodedText}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          ...formData,
          articolo: data.articolo || '',
          lotto_id: data.lottoId || '',
          batch_id: decodedText,
        });
      }
    } catch (err) {
      console.error('Errore decodifica QR:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!formData.articolo || !formData.quantita || 
        !formData.sede_origine || !formData.sezione_origine ||
        !formData.sede_destinazione || !formData.sezione_destinazione) {
      setError('Tutti i campi obbligatori devono essere compilati');
      setSubmitting(false);
      return;
    }

    if (!formData.lotto_id && !formData.batch_id) {
      setError('Lotto o BATCH_ID obbligatorio');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/trasferimenti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Errore nella creazione del trasferimento');
        return;
      }

      // Successo
      setDialogOpen(false);
      setFormData({
        articolo: '',
        lotto_id: '',
        batch_id: '',
        sede_origine: '',
        sezione_origine: '',
        sede_destinazione: '',
        sezione_destinazione: '',
        quantita: '',
        note: '',
      });
      setQrScanned(false);
      loadTrasferimenti();
    } catch (err) {
      setError('Errore nella creazione del trasferimento');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Caricamento...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Trasferimenti</h1>
          <p className="text-gray-600 mt-2">Trasferimenti intra-azienda</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Nuovo Trasferimento</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nuovo Trasferimento</DialogTitle>
              <DialogDescription>
                Trasferisci merce tra ubicazioni
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Tabs defaultValue="manual" className="w-full">
                <TabsList>
                  <TabsTrigger value="manual">Manuale</TabsTrigger>
                  <TabsTrigger value="qr">QR Scanner</TabsTrigger>
                </TabsList>

                <TabsContent value="manual" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Articolo *</label>
                      <Input
                        value={formData.articolo}
                        onChange={(e) => setFormData({ ...formData, articolo: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Lotto ID / BATCH_ID *</label>
                      <Input
                        value={formData.lotto_id || formData.batch_id}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val.startsWith('ALCA')) {
                            setFormData({ ...formData, batch_id: val, lotto_id: '' });
                          } else {
                            setFormData({ ...formData, lotto_id: val, batch_id: '' });
                          }
                        }}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sede Origine *</label>
                      <Select value={formData.sede_origine} onValueChange={(v) => setFormData({ ...formData, sede_origine: v, sezione_origine: '' })}>
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
                      <label className="text-sm font-medium">Sezione Origine *</label>
                      <Select value={formData.sezione_origine} onValueChange={(v) => setFormData({ ...formData, sezione_origine: v })} disabled={!formData.sede_origine}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona Sezione" />
                        </SelectTrigger>
                        <SelectContent>
                          {magazzini
                            .filter(m => m.sede === formData.sede_origine)
                            .map((m) => (
                              <SelectItem key={`${m.sede}-${m.sezione}`} value={m.sezione}>
                                {m.sezione}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sede Destinazione *</label>
                      <Select value={formData.sede_destinazione} onValueChange={(v) => setFormData({ ...formData, sede_destinazione: v, sezione_destinazione: '' })}>
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
                      <label className="text-sm font-medium">Sezione Destinazione *</label>
                      <Select value={formData.sezione_destinazione} onValueChange={(v) => setFormData({ ...formData, sezione_destinazione: v })} disabled={!formData.sede_destinazione}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona Sezione" />
                        </SelectTrigger>
                        <SelectContent>
                          {magazzini
                            .filter(m => m.sede === formData.sede_destinazione)
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
                        value={formData.quantita}
                        onChange={(e) => setFormData({ ...formData, quantita: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium">Note</label>
                      <Input
                        value={formData.note}
                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                        placeholder="Note opzionali..."
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="qr" className="space-y-4">
                  <QRScanner onScanSuccess={handleQRScan} />
                  {qrScanned && (
                    <Alert>
                      <AlertDescription>
                      QR Scansionato! Articolo: {formData.articolo}, BATCH_ID: {formData.batch_id}
                    </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sede Origine *</label>
                      <Select value={formData.sede_origine} onValueChange={(v) => setFormData({ ...formData, sede_origine: v, sezione_origine: '' })}>
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
                      <label className="text-sm font-medium">Sezione Origine *</label>
                      <Select value={formData.sezione_origine} onValueChange={(v) => setFormData({ ...formData, sezione_origine: v })} disabled={!formData.sede_origine}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona Sezione" />
                        </SelectTrigger>
                        <SelectContent>
                          {magazzini
                            .filter(m => m.sede === formData.sede_origine)
                            .map((m) => (
                              <SelectItem key={`${m.sede}-${m.sezione}`} value={m.sezione}>
                                {m.sezione}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sede Destinazione *</label>
                      <Select value={formData.sede_destinazione} onValueChange={(v) => setFormData({ ...formData, sede_destinazione: v, sezione_destinazione: '' })}>
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
                      <label className="text-sm font-medium">Sezione Destinazione *</label>
                      <Select value={formData.sezione_destinazione} onValueChange={(v) => setFormData({ ...formData, sezione_destinazione: v })} disabled={!formData.sede_destinazione}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona Sezione" />
                        </SelectTrigger>
                        <SelectContent>
                          {magazzini
                            .filter(m => m.sede === formData.sede_destinazione)
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
                        value={formData.quantita}
                        onChange={(e) => setFormData({ ...formData, quantita: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Note</label>
                      <Input
                        value={formData.note}
                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                        placeholder="Note opzionali..."
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                  Annulla
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creazione...' : 'Crea Trasferimento'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista Trasferimenti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Ora</TableHead>
                  <TableHead>Articolo</TableHead>
                  <TableHead>Quantità</TableHead>
                  <TableHead>Da</TableHead>
                  <TableHead>A</TableHead>
                  <TableHead>Utente</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trasferimenti.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500">
                      Nessun trasferimento trovato
                    </TableCell>
                  </TableRow>
                ) : (
                  trasferimenti.map((tr) => (
                    <TableRow key={tr.id}>
                      <TableCell>
                        {new Date(tr.data_effettiva).toLocaleDateString('it-IT')} {tr.ora_effettiva}
                      </TableCell>
                      <TableCell className="font-medium">{tr.articolo}</TableCell>
                      <TableCell>{tr.quantita.toFixed(4)}</TableCell>
                      <TableCell>{tr.sede_origine}/{tr.sezione_origine}</TableCell>
                      <TableCell>{tr.sede_destinazione}/{tr.sezione_destinazione}</TableCell>
                      <TableCell>{tr.utente?.nome || '-'}</TableCell>
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

