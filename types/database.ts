// Tipi TypeScript generati dal database Supabase
// Questi tipi riflettono lo schema del database

export type Fornitore = {
  codice: string;
  descrizione: string;
  referente: string | null;
  telefono: string | null;
  mail: string | null;
  indirizzo: string | null;
  archiviato: boolean;
  created_at: string;
  updated_at: string;
};

export type Articolo = {
  codice_interno: string;
  tipologia: string | null;
  categoria: string | null;
  codice_fornitore: string | null;
  fornitore_predefinito: string | null;
  descrizione: string;
  peso_netto: number | null;
  unita_misura: string | null;
  ultimo_prezzo: number | null;
  scorta_minima: number | null;
  archiviato: boolean;
  created_at: string;
  updated_at: string;
};

export type ArticoloLotto = {
  id: string; // BATCH_ID
  lotto_interno: number;
  lotto_fornitore: string;
  articolo: string;
  scadenza: string; // DATE
  created_at: string;
};

export type MagazzinoUbicazione = {
  sede: string;
  sezione: string;
};

export type Ruolo = {
  codice: string;
  descrizione: string;
};

export type UtenteProfilo = {
  id: string; // UUID
  nome: string;
  cognome: string;
  telefono: string | null;
  ruolo_codice: string | null;
  sede_predefinita: string | null;
  sezione_predefinita: string | null;
  created_at: string;
  updated_at: string;
};

export type RuoloTabAbilitata = {
  ruolo_codice: string;
  tab_nome: string;
  permesso_vista: boolean;
  permesso_modifica: boolean;
};

export type OrdineFornitore = {
  id: number;
  data_ordine: string; // DATE
  numero_ordine: string | null;
  fornitore_movimento: string;
  note_totali: string | null;
  created_at: string;
  created_by: string | null; // UUID
};

export type OrdineFornitoreRiga = {
  id: number;
  ordine_id: number;
  tipologia: string | null;
  categoria: string | null;
  codice_fornitore: string | null;
  fornitore_predef_articolo: string | null;
  articolo: string;
  descrizione: string | null;
  peso_netto: number | null;
  unita_misura: string | null;
  ultimo_prezzo: number | null;
  prezzo_medio_fifo_snapshot: number | null;
  quantita_ordine: number;
  data_arrivo_prevista: string | null; // DATE
};

export type MovimentoMagazzino = {
  id: number;
  tipo_movimento: 'CARICO' | 'SCARICO' | 'TRASF_OUT' | 'TRASF_IN';
  articolo: string;
  lotto_id: string;
  sede: string;
  sezione: string;
  quantita: number; // Consente negativi
  prezzo_unitario: number | null; // Obbligatorio solo per CARICO
  data_effettiva: string; // DATE
  ora_effettiva: string; // TIME
  note_riga: string | null;
  ordine_riga_id: number | null;
  trasferimento_id: number | null;
  utente_id: string | null; // UUID
  created_at: string;
};

export type Trasferimento = {
  id: number;
  articolo: string;
  lotto_id: string;
  sede_origine: string;
  sezione_origine: string;
  sede_destinazione: string;
  sezione_destinazione: string;
  quantita: number;
  data_effettiva: string; // DATE
  ora_effettiva: string; // TIME
  note: string | null;
  created_at: string;
};

export type Inventario = {
  id: number;
  sede: string;
  sezione: string;
  utente_id: string | null; // UUID
  creato_at: string;
  inviato_at: string | null;
  note: string | null;
};

export type InventarioRiga = {
  id: number;
  inventario_id: number;
  articolo: string;
  lotto_id: string;
  sede: string;
  sezione: string;
  unita_misura: string | null;
  giacenza_teorica: number;
  conteggio_fisico: number | null;
  differenza: number; // GENERATED
};

export type NotificaLog = {
  id: number;
  evento: string;
  destinatario_utente_id: string | null; // UUID
  destinatario_ruolo_codice: string | null;
  riferimento: string | null;
  messaggio: string;
  created_at: string;
  letto: boolean;
  letto_at: string | null;
};

export type Giacenza = {
  articolo: string;
  sede: string;
  sezione: string;
  tipologia: string | null;
  categoria: string | null;
  codice_fornitore: string | null;
  fornitore_predefinito: string | null;
  descrizione: string;
  unita_misura: string | null;
  peso_netto: number | null;
  quantita_giacente: number;
  prezzo_medio_FIFO: number | null;
  scorta_minima: number | null;
  scorta_media_12m: number;
};

export type OrdineResiduo = {
  ordine_riga_id: number;
  quantita_ordine: number;
  quantita_evasa: number;
  quantita_residua: number;
};

// Tab disponibili per permessi
export type TabNome =
  | 'Fornitori'
  | 'Articoli'
  | 'Magazzini'
  | 'Giacenze'
  | 'Ordini'
  | 'Ricevimento'
  | 'Prelievo'
  | 'Trasferimenti'
  | 'Inventario'
  | 'Movimenti'
  | 'Pianificazione'
  | 'Utenti'
  | 'Ruoli'
  | 'Notifiche';

// Eventi notifiche
export type NotificaEvento =
  | 'CREAZIONE_ORDINE'
  | 'EVASIONE_RICEVIMENTO'
  | 'CREAZIONE_QR'
  | 'RIGA_AGGIUNTA_PREZZO_DA_DEFINIRE'
  | 'PRELIEVO_NEGATIVO_O_LOTTO_ASSENTE'
  | 'INVENTARIO_INVIATO';


