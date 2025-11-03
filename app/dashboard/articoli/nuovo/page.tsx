'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

export default function NuovoArticoloPage() {
  const router = useRouter();
  const [fornitori, setFornitori] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    codice_interno: '',
    descrizione: '',
    tipologia: '',
    categoria: '',
    codice_fornitore: '',
    fornitore_predefinito: '',
    peso_netto: '',
    unita_misura: '',
    ultimo_prezzo: '',
    scorta_minima: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFornitori();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    // Converti "none" in null per fornitore_predefinito
    const submitData = {
      ...formData,
      fornitore_predefinito: formData.fornitore_predefinito === 'none' ? null : formData.fornitore_predefinito || null,
    };

    if (!formData.codice_interno || !formData.descrizione) {
      setError('Codice interno e descrizione sono obbligatori');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/articoli', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Errore nella creazione dell\'articolo');
        return;
      }

      router.push(`/dashboard/articoli/${formData.codice_interno}`);
    } catch (err) {
      setError('Errore nella creazione dell\'articolo');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/articoli">
          <Button variant="ghost" size="sm">← Indietro</Button>
        </Link>
        <h1 className="text-3xl font-bold mt-2">Nuovo Articolo</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dati Articolo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Codice Interno *</label>
                <Input
                  value={formData.codice_interno}
                  onChange={(e) => setFormData({ ...formData, codice_interno: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Descrizione *</label>
                <Input
                  value={formData.descrizione}
                  onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tipologia</label>
                <Input
                  value={formData.tipologia}
                  onChange={(e) => setFormData({ ...formData, tipologia: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Categoria</label>
                <Input
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Codice Fornitore</label>
                <Input
                  value={formData.codice_fornitore}
                  onChange={(e) => setFormData({ ...formData, codice_fornitore: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Fornitore Predefinito</label>
                <Select 
                  value={formData.fornitore_predefinito || 'none'} 
                  onValueChange={(v) => setFormData({ ...formData, fornitore_predefinito: v === 'none' ? '' : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona Fornitore" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nessuno</SelectItem>
                    {fornitori.map((f) => (
                      <SelectItem key={f.codice} value={f.codice}>
                        {f.descrizione}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Peso Netto</label>
                <Input
                  type="number"
                  step="0.0001"
                  value={formData.peso_netto}
                  onChange={(e) => setFormData({ ...formData, peso_netto: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Unità di Misura</label>
                <Input
                  value={formData.unita_misura}
                  onChange={(e) => setFormData({ ...formData, unita_misura: e.target.value })}
                  placeholder="es: kg, pz, etc."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ultimo Prezzo</label>
                <Input
                  type="number"
                  step="0.0001"
                  value={formData.ultimo_prezzo}
                  onChange={(e) => setFormData({ ...formData, ultimo_prezzo: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Scorta Minima</label>
                <Input
                  type="number"
                  step="0.0001"
                  value={formData.scorta_minima}
                  onChange={(e) => setFormData({ ...formData, scorta_minima: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Link href="/dashboard/articoli">
                <Button type="button" variant="outline" disabled={submitting}>
                  Annulla
                </Button>
              </Link>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creazione...' : 'Crea Articolo'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

