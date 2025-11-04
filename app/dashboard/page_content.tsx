'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Package,
  Building2,
  ShoppingCart,
  Truck,
  ClipboardCheck,
  TrendingUp,
  AlertTriangle,
  Boxes,
  FileText,
} from 'lucide-react';

interface DashboardStats {
  kpi: {
    totalArticoli: number;
    totalFornitori: number;
    ordiniAperti: number;
    ordiniInEvasione: number;
    inventariAperti: number;
    totaleValoreGiacenze: string;
    articoliSottoScorta: number;
    movimentiOggi: number;
  };
  movimentiStats: Record<string, number>;
  ordiniRecenti: any[];
  movimentiRecenti: any[];
}

export default function DashboardPageContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Errore caricamento statistiche:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Caricamento statistiche...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Errore nel caricamento delle statistiche</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Panoramica generale del sistema di gestione magazzino
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Articoli Totali</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.kpi.totalArticoli}</div>
            <Link href="/dashboard/articoli" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
              Visualizza articoli →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fornitori</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.kpi.totalFornitori}</div>
            <Link href="/dashboard/fornitori" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
              Gestisci fornitori →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ordini Aperti</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.kpi.ordiniAperti}</div>
            <Link href="/dashboard/ordini" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
              Visualizza ordini →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valore Giacenze</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€ {parseFloat(stats.kpi.totaleValoreGiacenze).toLocaleString('it-IT', { minimumFractionDigits: 2 })}</div>
            <Link href="/dashboard/giacenze" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
              Dettagli giacenze →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ordini in Evasione</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.kpi.ordiniInEvasione}</div>
            <Link href="/dashboard/ricevimento" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
              Evadi ordini →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Articoli Sotto Scorta</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.kpi.articoliSottoScorta}</div>
            <Link href="/dashboard/giacenze?filtro=sotto_scorta" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
              Verifica scorte →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventari Aperti</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.kpi.inventariAperti}</div>
            <Link href="/dashboard/inventario" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
              Gestisci inventari →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movimenti Oggi</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.kpi.movimentiOggi}</div>
            <Link href="/dashboard/movimenti" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
              Storico movimenti →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Movimenti per Tipo */}
      <Card>
        <CardHeader>
          <CardTitle>Movimenti Oggi per Tipo</CardTitle>
          <CardDescription>Distribuzione movimenti di oggi per categoria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.movimentiStats || {}).map(([tipo, count]) => (
              <div key={tipo} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-gray-600 mt-1">{tipo}</div>
              </div>
            ))}
            {Object.keys(stats.movimentiStats || {}).length === 0 && (
              <div className="col-span-4 text-center text-gray-500 py-8">
                Nessun movimento oggi
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ordini Recenti e Movimenti Recenti */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ordini Recenti</CardTitle>
            <CardDescription>Ultimi ordini creati</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.ordiniRecenti.length === 0 ? (
              <div className="text-center text-gray-500 py-8">Nessun ordine recente</div>
            ) : (
              <div className="space-y-3">
                {stats.ordiniRecenti.slice(0, 5).map((ordine: any) => (
                  <Link
                    key={ordine.id}
                    href={`/dashboard/ordini/${ordine.id}`}
                    className="block p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">
                          {ordine.numero_ordine || `Ordine #${ordine.id}`}
                        </div>
                        <div className="text-sm text-gray-600">
                          {ordine.fornitore?.descrizione || '-'}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {new Date(ordine.data_ordine).toLocaleDateString('it-IT')}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <div className="mt-4">
              <Link href="/dashboard/ordini">
                <Button variant="outline" className="w-full">
                  Visualizza tutti gli ordini
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Movimenti Recenti</CardTitle>
            <CardDescription>Ultimi movimenti registrati</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.movimentiRecenti.length === 0 ? (
              <div className="text-center text-gray-500 py-8">Nessun movimento recente</div>
            ) : (
              <div className="space-y-3">
                {stats.movimentiRecenti.slice(0, 5).map((movimento: any) => (
                  <div
                    key={movimento.id}
                    className="p-3 rounded-lg border border-gray-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">
                          {movimento.articolo} - {movimento.articolo?.descrizione || '-'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {movimento.tipo_movimento} - {movimento.sede}/{movimento.sezione}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{movimento.quantita}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(movimento.data_effettiva).toLocaleDateString('it-IT')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
              <Link href="/dashboard/movimenti">
                <Button variant="outline" className="w-full">
                  Visualizza tutti i movimenti
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Azioni Rapide</CardTitle>
          <CardDescription>Accesso rapido alle funzionalità principali</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Link href="/dashboard/articoli/nuovo">
              <Button variant="outline" className="w-full">
                <Package className="h-4 w-4 mr-2" />
                Nuovo Articolo
              </Button>
            </Link>
            <Link href="/dashboard/ordini/nuovo">
              <Button variant="outline" className="w-full">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Nuovo Ordine
              </Button>
            </Link>
            <Link href="/dashboard/ricevimento">
              <Button variant="outline" className="w-full">
                <Truck className="h-4 w-4 mr-2" />
                Ricevi Ordine
              </Button>
            </Link>
            <Link href="/dashboard/prelievo">
              <Button variant="outline" className="w-full">
                <PackageSearch className="h-4 w-4 mr-2" />
                Prelievo
              </Button>
            </Link>
            <Link href="/dashboard/inventario">
              <Button variant="outline" className="w-full">
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Nuovo Inventario
              </Button>
            </Link>
            <Link href="/dashboard/trasferimenti">
              <Button variant="outline" className="w-full">
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Trasferimento
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
