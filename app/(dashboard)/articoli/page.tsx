'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import type { Articolo } from '@/types/database';

export default function ArticoliPage() {
  const [articoli, setArticoli] = useState<Articolo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipologia, setFiltroTipologia] = useState<string>('all');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('all');

  useEffect(() => {
    loadArticoli();
  }, []);

  const loadArticoli = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('ricerca', searchTerm);
      if (filtroTipologia !== 'all') params.append('tipologia', filtroTipologia);
      if (filtroCategoria !== 'all') params.append('categoria', filtroCategoria);

      const response = await fetch(`/api/articoli?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setArticoli(data);
      }
    } catch (err) {
      console.error('Errore caricamento articoli:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading) loadArticoli();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, filtroTipologia, filtroCategoria]);

  if (loading) {
    return <div className="flex items-center justify-center p-8">Caricamento...</div>;
  }

  const tipologie = Array.from(new Set(articoli.map(a => a.tipologia).filter(Boolean)));
  const categorie = Array.from(new Set(articoli.map(a => a.categoria).filter(Boolean)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Articoli</h1>
          <p className="text-gray-600 mt-2">Gestione anagrafica articoli e lotti</p>
        </div>
        <Link href="/dashboard/articoli/nuovo">
          <Button>Nuovo Articolo</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <CardTitle>Lista Articoli</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Cerca articolo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="sm:flex-1"
              />
              <Select value={filtroTipologia} onValueChange={setFiltroTipologia}>
                <SelectTrigger className="sm:w-48">
                  <SelectValue placeholder="Tutte le tipologie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le tipologie</SelectItem>
                  {tipologie.map((tip) => (
                    <SelectItem key={tip} value={tip!}>{tip}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger className="sm:w-48">
                  <SelectValue placeholder="Tutte le categorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le categorie</SelectItem>
                  {categorie.map((cat) => (
                    <SelectItem key={cat} value={cat!}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Codice Interno</TableHead>
                  <TableHead>Descrizione</TableHead>
                  <TableHead>Tipologia</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>U.M.</TableHead>
                  <TableHead>Fornitore</TableHead>
                  <TableHead>Scorta Min</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articoli.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500">
                      Nessun articolo trovato
                    </TableCell>
                  </TableRow>
                ) : (
                  articoli.map((articolo) => (
                    <TableRow key={articolo.codice_interno}>
                      <TableCell className="font-medium">{articolo.codice_interno}</TableCell>
                      <TableCell>{articolo.descrizione}</TableCell>
                      <TableCell>
                        {articolo.tipologia && (
                          <Badge variant="outline">{articolo.tipologia}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {articolo.categoria && (
                          <Badge variant="outline">{articolo.categoria}</Badge>
                        )}
                      </TableCell>
                      <TableCell>{articolo.unita_misura || '-'}</TableCell>
                      <TableCell>{articolo.fornitore_predefinito?.descrizione || '-'}</TableCell>
                      <TableCell>{articolo.scorta_minima || '-'}</TableCell>
                      <TableCell>
                        <Link href={`/dashboard/articoli/${articolo.codice_interno}`}>
                          <Button variant="outline" size="sm">
                            Dettaglio
                          </Button>
                        </Link>
                      </TableCell>
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

