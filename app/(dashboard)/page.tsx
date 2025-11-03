import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Sistema di gestione e tracciabilità logistica
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fornitori</CardTitle>
            <CardDescription>Gestione anagrafica fornitori</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/fornitori">
              <Button variant="outline" className="w-full">
                Vai a Fornitori
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Articoli</CardTitle>
            <CardDescription>Anagrafica articoli e lotti</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/articoli">
              <Button variant="outline" className="w-full">
                Vai ad Articoli
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ordini</CardTitle>
            <CardDescription>Gestione ordini a fornitore</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/ordini">
              <Button variant="outline" className="w-full">
                Vai a Ordini
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ricevimento</CardTitle>
            <CardDescription>Ricevimento merci e carico</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/ricevimento">
              <Button variant="outline" className="w-full">
                Vai a Ricevimento
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prelievo</CardTitle>
            <CardDescription>Prelievo e scarico merci</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/prelievo">
              <Button variant="outline" className="w-full">
                Vai a Prelievo
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Giacenze</CardTitle>
            <CardDescription>Visualizzazione giacenze valorizzate</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/giacenze">
              <Button variant="outline" className="w-full">
                Vai a Giacenze
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Magazzini</CardTitle>
            <CardDescription>Gestione ubicazioni sede/sezione</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/magazzini">
              <Button variant="outline" className="w-full">
                Vai a Magazzini
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trasferimenti</CardTitle>
            <CardDescription>Trasferimenti intra-azienda</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/trasferimenti">
              <Button variant="outline" className="w-full">
                Vai a Trasferimenti
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventario</CardTitle>
            <CardDescription>Inventario e conteggio fisico</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/inventario">
              <Button variant="outline" className="w-full">
                Vai a Inventario
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Movimenti</CardTitle>
            <CardDescription>Storico movimenti magazzino</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/movimenti">
              <Button variant="outline" className="w-full">
                Vai a Movimenti
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pianificazione</CardTitle>
            <CardDescription>Pianificazione scorte e proposte</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/pianificazione">
              <Button variant="outline" className="w-full">
                Vai a Pianificazione
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
