'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function InventarioPage() {
  const [inventari, setInventari] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [magazzini, setMagazzini] = useState<Array<{ sede: string; sezione: string }>>([]);
  const [sede, setSede] = useState('');
  const [sezione, setSezione] = useState('');
  const [righeInventario, setRigheInventario] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInventari();
    loadMagazzini();
  }, []);

  const loadInventari = async () => {
    try {
      const response = await fetch('/api/inventari?solo_aperti=true');
      if (response.ok) {
        const data = await response.json();
        setInventari(data);
      }
    } catch (err) {
      console.error('Errore caricamento inventari:', err);
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

  const handleCreaInventario = async () => {
    if (!sede || !sezione) {
      setError('Sede e sezione sono obbligatorie');
      return;
    }

    setError(null);
    
    // Recupera giacenze per questa ubicazione
    try {
      const response = await fetch(`/api/giacenze?sede=${sede}&sezione=${sezione}`);
      if (response.ok) {
        const giacenze = await response.json();
        
        // Prepara righe inventario
        const righe = giacenze.map((g: any) => ({
          articolo: g.articolo,
          lotto_id: null, // Da completare manualmente
          unita_misura: null,
          giacenza_teorica: g.quantita_giacente,
          conteggio_fisico: null,
        }));

        setRigheInventario(righe);
      }
    } catch (err) {
      console.error('Errore caricamento giacenze:', err);
    }
  };

  const handleSalvaInventario = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/inventari', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sede,
          sezione,
          righe: righeInventario,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Errore nella creazione dell\'inventario');
        return;
      }

      setDialogOpen(false);
      setSede('');
      setSezione('');
      setRigheInventario([]);
      loadInventari();
    } catch (err) {
      setError('Errore nella creazione dell\'inventario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInviaInventario = async (inventarioId: number) => {
    if (!confirm('Sei sicuro di voler inviare questo inventario? Verranno generate le rettifiche automatiche.')) {
      return;
    }

    try {
      const response = await fetch(`/api/inventari/${inventarioId}/invia`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Errore nell\'invio dell\'inventario');
        return;
      }

      alert(`Inventario inviato! Movimenti creati: ${data.movimenti_creati}`);
      loadInventari();
    } catch (err) {
      alert('Errore nell\'invio dell\'inventario');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Caricamento...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Inventario</h1>
          <p className="text-gray-600 mt-2">Inventario e conteggio fisico</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Nuovo Inventario</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nuovo Inventario</DialogTitle>
              <DialogDescription>
                Crea un nuovo inventario per un'ubicazione
              </DialogDescription>
            </DialogHeader>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sede *</label>
                  <Select value={sede} onValueChange={(v) => {
                    setSede(v);
                    setSezione('');
                    setRigheInventario([]);
                  }}>
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
                  <Select value={sezione} onValueChange={(v) => {
                    setSezione(v);
                    setRigheInventario([]);
                  }} disabled={!sede}>
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
              </div>

              {sede && sezione && righeInventario.length === 0 && (
                <Button onClick={handleCreaInventario} variant="outline">
                  Carica Giacenze per Inventario
                </Button>
              )}

              {righeInventario.length > 0 && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Righe Inventario</label>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Articolo</TableHead>
                            <TableHead>Giacenza Teorica</TableHead>
                            <TableHead>Conteggio Fisico</TableHead>
                            <TableHead>Differenza</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {righeInventario.map((riga, idx) => {
                            const diff = riga.conteggio_fisico !== null 
                              ? riga.conteggio_fisico - riga.giacenza_teorica 
                              : null;

                            return (
                              <TableRow key={idx}>
                                <TableCell className="font-medium">{riga.articolo}</TableCell>
                                <TableCell>{riga.giacenza_teorica.toFixed(4)}</TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    step="0.0001"
                                    value={riga.conteggio_fisico || ''}
                                    onChange={(e) => {
                                      const nuoveRighe = [...righeInventario];
                                      nuoveRighe[idx].conteggio_fisico = e.target.value 
                                        ? parseFloat(e.target.value) 
                                        : null;
                                      setRigheInventario(nuoveRighe);
                                    }}
                                    placeholder="Inserisci conteggio"
                                  />
                                </TableCell>
                                <TableCell>
                                  {diff !== null && (
                                    <span className={diff !== 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                                      {diff > 0 ? '+' : ''}{diff.toFixed(4)}
                                    </span>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                      Annulla
                    </Button>
                    <Button onClick={handleSalvaInventario} disabled={submitting}>
                      {submitting ? 'Salvataggio...' : 'Salva Inventario'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventari Aperti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data Creazione</TableHead>
                  <TableHead>Sede/Sezione</TableHead>
                  <TableHead>Righe</TableHead>
                  <TableHead>Utente</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventari.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500">
                      Nessun inventario aperto
                    </TableCell>
                  </TableRow>
                ) : (
                  inventari.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell>
                        {new Date(inv.creato_at).toLocaleDateString('it-IT')}
                      </TableCell>
                      <TableCell>{inv.sede}/{inv.sezione}</TableCell>
                      <TableCell>
                        <Badge>{inv.righe?.length || 0}</Badge>
                      </TableCell>
                      <TableCell>{inv.utente?.nome || '-'}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleInviaInventario(inv.id)}
                        >
                          Invia
                        </Button>
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

