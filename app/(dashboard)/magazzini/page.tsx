'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function MagazziniPage() {
  const [magazzini, setMagazzini] = useState<Array<{ sede: string; sezione: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ sede: '', sezione: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/magazzini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Errore nella creazione');
        return;
      }

      setFormData({ sede: '', sezione: '' });
      setDialogOpen(false);
      loadMagazzini();
    } catch (err) {
      setError('Errore nella creazione');
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
          <h1 className="text-3xl font-bold">Magazzini</h1>
          <p className="text-gray-600 mt-2">Gestione ubicazioni sede/sezione</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Nuova Ubicazione</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuova Ubicazione</DialogTitle>
              <DialogDescription>
                Crea una nuova ubicazione magazzino
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Sede *</label>
                <Input
                  value={formData.sede}
                  onChange={(e) => setFormData({ ...formData, sede: e.target.value })}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Sezione *</label>
                <Input
                  value={formData.sezione}
                  onChange={(e) => setFormData({ ...formData, sezione: e.target.value })}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                  Annulla
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Salvataggio...' : 'Salva'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ubicazioni</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sede</TableHead>
                  <TableHead>Sezione</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {magazzini.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-gray-500">
                      Nessuna ubicazione trovata
                    </TableCell>
                  </TableRow>
                ) : (
                  magazzini.map((mag, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{mag.sede}</TableCell>
                      <TableCell>{mag.sezione}</TableCell>
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

