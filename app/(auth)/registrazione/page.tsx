'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

export default function RegistrazionePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nome: '',
    cognome: '',
    ruolo: '',
    sede_predefinita: '',
    sezione_predefinita: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magazzini, setMagazzini] = useState<Array<{ sede: string; sezione: string }>>([]);
  const [ruoli, setRuoli] = useState<any[]>([]);

  useEffect(() => {
    loadMagazzini();
    loadRuoli();
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

  const loadRuoli = async () => {
    try {
      const response = await fetch('/api/ruoli');
      if (response.ok) {
        const data = await response.json();
        setRuoli(data);
      }
    } catch (err) {
      console.error('Errore caricamento ruoli:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validazioni
    if (formData.password !== formData.confirmPassword) {
      setError('Le password non corrispondono');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('La password deve essere di almeno 8 caratteri');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/registrazione', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          nome: formData.nome,
          cognome: formData.cognome,
          ruolo_codice: formData.ruolo,
          sede_predefinita: formData.sede_predefinita || null,
          sezione_predefinita: formData.sezione_predefinita || null,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Errore durante la registrazione';
        try {
          const data = await response.json();
          errorMessage = data.error || errorMessage;
        } catch {
          errorMessage = `Errore ${response.status}: ${response.statusText}`;
        }
        setError(errorMessage);
        return;
      }

      const data = await response.json();

      // Registrazione riuscita, reindirizza al login
      router.push('/login?registrato=true');
    } catch (err) {
      console.error('Errore fetch registrazione:', err);
      const errorMessage = err instanceof Error 
        ? `Errore di connessione: ${err.message}` 
        : 'Impossibile connettersi al server. Verifica la connessione.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const sediUniche = Array.from(new Set(magazzini.map(m => m.sede)));

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <img src="/logo.svg" alt="ALCA LOG" className="h-16 w-auto" />
          </div>
          <CardTitle className="text-2xl text-center">Registrazione</CardTitle>
          <CardDescription className="text-center">
            Crea un nuovo account per accedere al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cognome">Cognome *</Label>
                <Input
                  id="cognome"
                  value={formData.cognome}
                  onChange={(e) => setFormData({ ...formData, cognome: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@esempio.it"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  autoComplete="new-password"
                  required
                  disabled={loading}
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Conferma Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  autoComplete="new-password"
                  required
                  disabled={loading}
                  minLength={8}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ruolo">Ruolo *</Label>
              <Select value={formData.ruolo} onValueChange={(v) => setFormData({ ...formData, ruolo: v })} disabled={loading}>
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
                <Label htmlFor="sede">Sede Predefinita</Label>
                <Select 
                  value={formData.sede_predefinita} 
                  onValueChange={(v) => {
                    setFormData({ ...formData, sede_predefinita: v, sezione_predefinita: '' });
                  }} 
                  disabled={loading}
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
                <Label htmlFor="sezione">Sezione Predefinita</Label>
                <Select 
                  value={formData.sezione_predefinita} 
                  onValueChange={(v) => setFormData({ ...formData, sezione_predefinita: v })} 
                  disabled={loading || !formData.sede_predefinita}
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Registrazione in corso...' : 'Registrati'}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Hai già un account?{' '}
              <Link href="/login" className="text-blue-600 hover:underline">
                Accedi
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

