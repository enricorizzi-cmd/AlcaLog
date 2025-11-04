import { createClient } from '@/lib/supabase/server';
import { sendPushNotificationToRole } from '@/lib/push-notifications';

export interface NotificationData {
  evento: string;
  messaggio: string;
  riferimento?: string;
  url?: string;
}

/**
 * Trigger notifiche per un evento specifico
 * Recupera i ruoli configurati e invia notifiche push
 */
export async function triggerNotifiche(
  evento: string,
  messaggio: string,
  riferimento?: string,
  url?: string
): Promise<number> {
  try {
    const supabase = await createClient();

    // Recupera configurazione notifiche per questo evento
    const { data: configs, error: configError } = await supabase
      .from('notifiche_eventi_config')
      .select('ruolo_codice')
      .eq('evento', evento);

    if (configError || !configs || configs.length === 0) {
      console.log(`Nessuna configurazione notifiche per evento: ${evento}`);
      return 0;
    }

    // Crea record in notifiche_log per ogni ruolo
    const ruoliUnici = Array.from(new Set(configs.map((c: any) => c.ruolo_codice)));
    let notificheInviate = 0;

    for (const ruoloCodice of ruoliUnici) {
      // Invia push notification a tutti gli utenti con quel ruolo
      const inviati = await sendPushNotificationToRole(ruoloCodice, {
        title: 'AlcaLog',
        body: messaggio,
        icon: '/logo.svg',
        badge: '/logo.svg',
        data: {
          evento,
          riferimento,
          url: url || '/dashboard',
        },
        tag: evento,
        requireInteraction: false,
      });

      notificheInviate += inviati;

      // Crea record in notifiche_log
      const { data: utenti } = await supabase
        .from('utenti_profilo')
        .select('id')
        .eq('ruolo_codice', ruoloCodice);

      if (utenti && utenti.length > 0) {
        const logEntries = utenti.map((utente: any) => ({
          evento,
          messaggio,
          riferimento: riferimento || null,
          destinatario_utente_id: utente.id,
          destinatario_ruolo_codice: ruoloCodice,
          letto: false,
        }));

        await supabase.from('notifiche_log').insert(logEntries);
      }
    }

    return notificheInviate;
  } catch (error) {
    console.error('Errore trigger notifiche:', error);
    return 0;
  }
}

