'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bell, Check, X } from 'lucide-react';

interface Notifica {
  id: number;
  evento: string;
  messaggio: string;
  riferimento: string | null;
  destinatario_utente_id: string;
  letto: boolean;
  created_at: string;
}

export default function NotifichePage() {
  const [notifiche, setNotifiche] = useState<Notifica[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifiche();
  }, []);

  const loadNotifiche = async () => {
    try {
      const response = await fetch('/api/notifiche');
      if (response.ok) {
        const data = await response.json();
        setNotifiche(data);
      }
    } catch (err) {
      console.error('Errore caricamento notifiche:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarcaLetta = async (notificaId: number) => {
    try {
      const response = await fetch(`/api/notifiche/${notificaId}/letta`, {
        method: 'PUT',
      });

      if (response.ok) {
        setNotifiche((prev) =>
          prev.map((n) => (n.id === notificaId ? { ...n, letto: true } : n))
        );
      }
    } catch (err) {
      console.error('Errore marcatura notifica:', err);
    }
  };

  const handleMarcaTutteLette = async () => {
    try {
      const nonLette = notifiche.filter((n) => !n.letto);
      await Promise.all(
        nonLette.map((n) =>
          fetch(`/api/notifiche/${n.id}/letta`, { method: 'PUT' })
        )
      );
      setNotifiche((prev) => prev.map((n) => ({ ...n, letto: true })));
    } catch (err) {
      console.error('Errore marcatura notifiche:', err);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Caricamento...</div>;
  }

  const nonLette = notifiche.filter((n) => !n.letto).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Notifiche</h1>
          <p className="text-gray-600 mt-2">Storico notifiche e avvisi</p>
        </div>
        {nonLette > 0 && (
          <Button onClick={handleMarcaTutteLette} variant="outline">
            <Check className="h-4 w-4 mr-2" />
            Marca tutte come lette
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifiche
            {nonLette > 0 && (
              <Badge variant="destructive" className="ml-2">
                {nonLette} nuove
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Lista delle notifiche ricevute
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifiche.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nessuna notifica
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stato</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>Messaggio</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifiche.map((notifica) => (
                    <TableRow
                      key={notifica.id}
                      className={notifica.letto ? '' : 'bg-blue-50'}
                    >
                      <TableCell>
                        {notifica.letto ? (
                          <Badge variant="outline">Letta</Badge>
                        ) : (
                          <Badge variant="destructive">Nuova</Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{notifica.evento}</TableCell>
                      <TableCell>{notifica.messaggio}</TableCell>
                      <TableCell>
                        {new Date(notifica.created_at).toLocaleString('it-IT')}
                      </TableCell>
                      <TableCell>
                        {!notifica.letto && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarcaLetta(notifica.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

