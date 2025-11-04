'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Plus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Utente {
  id: string;
  email: string;
  nome: string;
  cognome: string;
  ruolo_codice: string;
  ruolo?: {
    codice: string;
    descrizione: string;
  };
  sede_predefinita: string | null;
  sezione_predefinita: string | null;
}

export default function UtentiPage() {
  const [utenti, setUtenti] = useState<Utente[]>([]);
  const [ruoli, setRuoli] = useState<any[]>([]);
  const [magazzini, setMagazzini] = useState<Array<{ sede: string; sezione: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Utente | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    ruolo_codice: '',
    sede_predefinita: '',
    sezione_predefinita: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [utentiRes, ruoliRes, magazziniRes] = await Promise.all([
        fetch('/api/utenti'),
        fetch('/api/ruoli'),
        fetch('/api/magazzini'),
      ]);

      if (utentiRes.ok) {
        const data = await utentiRes.json();
        setUtenti(data);
      }

      if (ruoliRes.ok) {
        const data = await ruoliRes.json();
        setRuoli(data);
      }

      if (magazziniRes.ok) {
        const data = await magazziniRes.json();
        setMagazzini(data);
      }
    } catch (err) {
      console.error('Errore caricamento dati:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApriModifica = (utente: Utente) => {
    setEditingUser(utente);
    setFormData({
      nome: utente.nome,
      cognome: utente.cognome,
      ruolo_codice: utente.ruolo_codice,
      sede_predefinita: utente.sede_predefinita || '',
      sezione_predefinita: utente.sezione_predefinita || '',
    });
    setDialogOpen(true);
  };

  const handleSalva = async () => {
    if (!editingUser) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/utenti/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Errore nel salvataggio');
        return;
      }

      setDialogOpen(false);
      setEditingUser(null);
      loadData();
    } catch (err) {
      setError('Errore nel salvataggio');
    } finally {
      setSubmitting(false);
    }
  };

  const handleElimina = async (utenteId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo utente?')) {
      return;
    }

    try {
      const response = await fetch(`/api/utenti/${utenteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        alert('Errore nell\'eliminazione dell\'utente');
        return;
      }

      loadData();
    } catch (err) {
      alert('Errore nell\'eliminazione dell\'utente');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Caricamento...</div>;
  }

  const sediUniche = Array.from(new Set(magazzini.map(m => m.sede)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestione Utenti</h1>
          <p className="text-gray-600 mt-2">Gestione utenti e permessi</p>
        </div>
        <Link href="/registrazione">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Utente
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Utenti</CardTitle>
          <CardDescription>Lista degli utenti del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Ruolo</TableHead>
                  <TableHead>Sede/Sezione</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {utenti.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500">
                      Nessun utente trovato
                    </TableCell>
                  </TableRow>
                ) : (
                  utenti.map((utente) => (
                    <TableRow key={utente.id}>
                      <TableCell className="font-medium">
                        {utente.nome} {utente.cognome}
                      </TableCell>
                      <TableCell>{utente.email}</TableCell>
                      <TableCell>
                        <Badge>{utente.ruolo?.descrizione || utente.ruolo_codice}</Badge>
                      </TableCell>
                      <TableCell>
                        {utente.sede_predefinita && utente.sezione_predefinita
                          ? `${utente.sede_predefinita}/${utente.sezione_predefinita}`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApriModifica(utente)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleElimina(utente.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Modifica */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifica Utente</DialogTitle>
            <DialogDescription>
              Modifica i dati dell'utente {editingUser?.nome} {editingUser?.cognome}
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
                <Label>Nome</Label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Cognome</Label>
                <Input
                  value={formData.cognome}
                  onChange={(e) => setFormData({ ...formData, cognome: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ruolo</Label>
              <Select
                value={formData.ruolo_codice}
                onValueChange={(v) => setFormData({ ...formData, ruolo_codice: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona ruolo" />
                </SelectTrigger>
                <SelectContent>
                  {ruoli.map((ruolo) => (
                    <SelectItem key={ruolo.codice} value={ruolo.codice}>
                      {ruolo.descrizione || ruolo.codice}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sede Predefinita</Label>
                <Select
                  value={formData.sede_predefinita}
                  onValueChange={(v) => {
                    setFormData({ ...formData, sede_predefinita: v, sezione_predefinita: '' });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona sede" />
                  </SelectTrigger>
                  <SelectContent>
                    {sediUniche.map((sede) => (
                      <SelectItem key={sede} value={sede}>
                        {sede}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sezione Predefinita</Label>
                <Select
                  value={formData.sezione_predefinita}
                  onValueChange={(v) => setFormData({ ...formData, sezione_predefinita: v })}
                  disabled={!formData.sede_predefinita}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona sezione" />
                  </SelectTrigger>
                  <SelectContent>
                    {magazzini
                      .filter(m => m.sede === formData.sede_predefinita)
                      .map((m) => (
                        <SelectItem key={`${m.sede}-${m.sezione}`} value={m.sezione}>
                          {m.sezione}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                Annulla
              </Button>
              <Button onClick={handleSalva} disabled={submitting}>
                {submitting ? 'Salvataggio...' : 'Salva'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

