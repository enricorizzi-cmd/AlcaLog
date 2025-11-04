'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        let errorMessage = 'Errore durante il login';
        try {
          const data = await response.json();
          errorMessage = data.error || errorMessage;
        } catch {
          // Se non riesce a parsare il JSON, usa il testo della risposta
          errorMessage = `Errore ${response.status}: ${response.statusText}`;
        }
        setError(errorMessage);
        return;
      }

      const data = await response.json();

      // Login riuscito, reindirizza alla dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      console.error('Errore fetch login:', err);
      const errorMessage = err instanceof Error 
        ? `Errore di connessione: ${err.message}` 
        : 'Impossibile connettersi al server. Verifica la connessione.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <img src="/logo.svg" alt="ALCA LOG" className="h-16 w-auto" />
          </div>
          <CardTitle className="text-2xl text-center">Accedi</CardTitle>
          <CardDescription className="text-center">
            Inserisci le tue credenziali per accedere
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="nome@esempio.it"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Accesso in corso...' : 'Accedi'}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Non hai un account?{' '}
              <Link href="/registrazione" className="text-blue-600 hover:underline">
                Registrati
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

