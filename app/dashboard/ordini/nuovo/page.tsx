'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

export default function NuovoOrdinePage() {
  const router = useRouter();
  const [fornitori, setFornitori] = useState<any[]>([]);
  const [articoli, setArticoli] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    data_ordine: new Date().toISOString().split('T')[0],
    numero_ordine: '',
    fornitore_movimento: '',
    note_totali: '',
  });
  const [righe, setRighe] = useState<Array<{
    articolo: string;
    descrizione: string;
    quantita_ordine: string;
    data_arrivo_prevista: string;
  }>>([{ articolo: '', descrizione: '', quantita_ordine: '', data_arrivo_prevista: '' }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFornitori();
    loadArticoli();
  }, []);

  const loadFornitori = async () => {
    try {
      const response = await fetch('/api/fornitori');
      if (response.ok) {
        const data = await response.json();
        setFornitori(data);
      }
    } catch (err) {
      console.error('Errore caricamento fornitori:', err);
    }
  };

  const loadArticoli = async () => {
    try {
      const response = await fetch('/api/articoli?archiviato=false');
      if (response.ok) {
        const data = await response.json();
        setArticoli(data || []);
      }
    } catch (err) {
      console.error('Errore caricamento articoli:', err);
    }
  };

  const handleAddRiga = () => {
    setRighe([...righe, { articolo: '', descrizione: '', quantita_ordine: '', data_arrivo_prevista: '' }]);
  };

  const handleRemoveRiga = (idx: number) => {
    setRighe(righe.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!formData.fornitore_movimento) {
      setError('Fornitore obbligatorio');
      setSubmitting(false);
      return;
    }

    const righeValide = righe.filter(r => r.articolo && r.quantita_ordine);
    if (righeValide.length === 0) {
      setError('Almeno una riga valida è obbligatoria');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/ordini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testata: {
            data_ordine: formData.data_ordine,
            numero_ordine: formData.numero_ordine || null,
            fornitore_movimento: formData.fornitore_movimento,
            note_totali: formData.note_totali || null,
          },
          righe: righeValide.map(r => ({
            articolo: r.articolo,
            descrizione: r.descrizione || null,
            quantita_ordine: parseFloat(r.quantita_ordine),
            data_arrivo_prevista: r.data_arrivo_prevista || null,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Errore nella creazione dell\'ordine');
        return;
      }

      router.push(`/dashboard/ordini/${data.id}`);
    } catch (err) {
      setError('Errore nella creazione dell\'ordine');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/ordini">
          <Button variant="ghost" size="sm">← Indietro</Button>
        </Link>
        <h1 className="text-3xl font-bold mt-2">Nuovo Ordine</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Testata Ordine</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Ordine *</label>
                <Input
                  type="date"
                  value={formData.data_ordine}
                  onChange={(e) => setFormData({ ...formData, data_ordine: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Numero Ordine</label>
                <Input
                  value={formData.numero_ordine}
                  onChange={(e) => setFormData({ ...formData, numero_ordine: e.target.value })}
                  placeholder="Opzionale"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Fornitore *</label>
                <Select value={formData.fornitore_movimento} onValueChange={(v) => setFormData({ ...formData, fornitore_movimento: v })} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona Fornitore" />
                  </SelectTrigger>
                  <SelectContent>
                    {fornitori.map((f) => (
                      <SelectItem key={f.codice} value={f.codice}>
                        {f.descrizione}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Note</label>
                <Input
                  value={formData.note_totali}
                  onChange={(e) => setFormData({ ...formData, note_totali: e.target.value })}
                  placeholder="Note opzionali..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Righe Ordine</CardTitle>
              <Button type="button" variant="outline" onClick={handleAddRiga}>
                Aggiungi Riga
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Articolo *</TableHead>
                    <TableHead>Descrizione</TableHead>
                    <TableHead className="text-right">Quantità *</TableHead>
                    <TableHead>Data Arrivo Prevista</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {righe.map((riga, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Select
                          value={riga.articolo || 'none'}
                          onValueChange={(v) => {
                            const nuoveRighe = [...righe];
                            if (v === 'none') {
                              nuoveRighe[idx].articolo = '';
                              nuoveRighe[idx].descrizione = '';
                            } else {
                              nuoveRighe[idx].articolo = v;
                              // Auto-riempire la descrizione se l'articolo è selezionato
                              const articoloSelezionato = articoli.find(a => a.codice_interno === v);
                              if (articoloSelezionato) {
                                nuoveRighe[idx].descrizione = articoloSelezionato.descrizione || '';
                              }
                            }
                            setRighe(nuoveRighe);
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleziona articolo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nessuno</SelectItem>
                            {articoli.map((articolo) => (
                              <SelectItem key={articolo.codice_interno} value={articolo.codice_interno}>
                                {articolo.codice_interno} - {articolo.descrizione}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={riga.descrizione}
                          onChange={(e) => {
                            const nuoveRighe = [...righe];
                            nuoveRighe[idx].descrizione = e.target.value;
                            setRighe(nuoveRighe);
                          }}
                          placeholder="Descrizione"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.0001"
                          value={riga.quantita_ordine}
                          onChange={(e) => {
                            const nuoveRighe = [...righe];
                            nuoveRighe[idx].quantita_ordine = e.target.value;
                            setRighe(nuoveRighe);
                          }}
                          placeholder="Quantità"
                          required
                          className="text-right"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={riga.data_arrivo_prevista}
                          onChange={(e) => {
                            const nuoveRighe = [...righe];
                            nuoveRighe[idx].data_arrivo_prevista = e.target.value;
                            setRighe(nuoveRighe);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRiga(idx)}
                        >
                          Rimuovi
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Link href="/dashboard/ordini">
            <Button type="button" variant="outline" disabled={submitting}>
              Annulla
            </Button>
          </Link>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creazione...' : 'Crea Ordine'}
          </Button>
        </div>
      </form>
    </div>
  );
}

