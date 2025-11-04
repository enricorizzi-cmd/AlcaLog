'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Settings, Bell, Users, Shield, Database } from 'lucide-react';

export default function ImpostazioniPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Notifiche
  const [notificheConfig, setNotificheConfig] = useState<any[]>([]);
  const [ruoli, setRuoli] = useState<any[]>([]);
  const [eventiNotifiche] = useState([
    'CREAZIONE_ORDINE',
    'EVASIONE_RICEVIMENTO',
    'CREAZIONE_QR',
    'RIGA_AGGIUNTA_PREZZO_DA_DEFINIRE',
    'PRELIEVO_NEGATIVO_O_LOTTO_ASSENTE',
    'INVENTARIO_INVIATO',
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [notificheRes, ruoliRes] = await Promise.all([
        fetch('/api/notifiche/config'),
        fetch('/api/ruoli'),
      ]);

      if (notificheRes.ok) {
        const data = await notificheRes.json();
        setNotificheConfig(data);
      }

      if (ruoliRes.ok) {
        const data = await ruoliRes.json();
        setRuoli(data);
      }
    } catch (err) {
      console.error('Errore caricamento dati:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvaNotifiche = async () => {
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/notifiche/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificheConfig),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Errore nel salvataggio');
        return;
      }

      setSuccess('Configurazione notifiche salvata con successo');
    } catch (err) {
      setError('Errore nel salvataggio della configurazione');
    }
  };

  const toggleNotifica = (evento: string, ruoloCodice: string) => {
    const existing = notificheConfig.find(
      (c) => c.evento === evento && c.ruolo_codice === ruoloCodice
    );

    if (existing) {
      setNotificheConfig(notificheConfig.filter((c) => c.id !== existing.id));
    } else {
      setNotificheConfig([
        ...notificheConfig,
        { evento, ruolo_codice: ruoloCodice },
      ]);
    }
  };

  const isNotificaAbilitata = (evento: string, ruoloCodice: string) => {
    return notificheConfig.some(
      (c) => c.evento === evento && c.ruolo_codice === ruoloCodice
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Caricamento...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Impostazioni</h1>
        <p className="text-gray-600 mt-2">Gestione configurazioni e preferenze sistema</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="notifiche" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notifiche">
            <Bell className="h-4 w-4 mr-2" />
            Notifiche
          </TabsTrigger>
          <TabsTrigger value="generale">
            <Settings className="h-4 w-4 mr-2" />
            Generale
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifiche" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurazione Notifiche</CardTitle>
              <CardDescription>
                Configura quali ruoli ricevono notifiche per ogni evento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium">Evento</th>
                        {ruoli.map((ruolo) => (
                          <th key={ruolo.codice} className="text-center p-2 font-medium">
                            {ruolo.descrizione || ruolo.codice}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {eventiNotifiche.map((evento) => (
                        <tr key={evento} className="border-b">
                          <td className="p-2 font-medium">{evento}</td>
                          {ruoli.map((ruolo) => (
                            <td key={ruolo.codice} className="p-2 text-center">
                              <Switch
                                checked={isNotificaAbilitata(evento, ruolo.codice)}
                                onCheckedChange={() => toggleNotifica(evento, ruolo.codice)}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label>Notifiche Push</Label>
                      <p className="text-sm text-gray-600">
                        Abilita notifiche push sul tuo dispositivo
                      </p>
                    </div>
                    <Button
                      onClick={async () => {
                        const { subscribeToPushNotifications } = await import('@/lib/client-push');
                        const subscription = await subscribeToPushNotifications();
                        if (subscription) {
                          setSuccess('Notifiche push abilitate con successo!');
                        } else {
                          setError('Errore nell\'abilitazione delle notifiche push');
                        }
                      }}
                      variant="outline"
                    >
                      Abilita Push
                    </Button>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSalvaNotifiche}>
                      Salva Configurazione
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generale" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Impostazioni Generali</CardTitle>
              <CardDescription>Configurazioni generali del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nome Applicazione</Label>
                <Input value="ALCA LOG" disabled />
              </div>
              <div className="space-y-2">
                <Label>Versione</Label>
                <Input value="1.0.0" disabled />
              </div>
              <div className="space-y-2">
                <Label>Database</Label>
                <Input value="Supabase PostgreSQL" disabled />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

