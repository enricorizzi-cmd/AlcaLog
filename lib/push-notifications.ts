import webpush from 'web-push';
import type { PushSubscription as WebPushSubscription } from 'web-push';
import { createClient } from '@/lib/supabase/server';

// Inizializza VAPID keys (dovrebbero essere in env vars)
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@alcalog.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  tag?: string;
  requireInteraction?: boolean;
}

/**
 * Invia una notifica push a un utente specifico
 */
export async function sendPushNotification(
  userId: string,
  payload: NotificationPayload
): Promise<boolean> {
  try {
    const supabase = await createClient();

    // Recupera la subscription dell'utente
    const { data: subscription, error: subError } = await supabase
      .from('notifiche_push_subscriptions')
      .select('subscription')
      .eq('user_id', userId)
      .eq('active', true)
      .single();

    if (subError || !subscription) {
      console.error('Subscription non trovata per utente:', userId);
      return false;
    }

    // Invia push notification
    try {
      await webpush.sendNotification(
        subscription.subscription as unknown as WebPushSubscription,
        JSON.stringify(payload)
      );
      return true;
    } catch (pushError: any) {
      console.error('Errore invio push:', pushError);

      // Se la subscription è invalida, disattivala
      if (pushError.statusCode === 410 || pushError.statusCode === 404) {
        await supabase
          .from('notifiche_push_subscriptions')
          .update({ active: false })
          .eq('user_id', userId);
      }

      return false;
    }
  } catch (error) {
    console.error('Errore invio notifica push:', error);
    return false;
  }
}

/**
 * Invia notifiche a tutti gli utenti con un ruolo specifico
 */
export async function sendPushNotificationToRole(
  ruoloCodice: string,
  payload: NotificationPayload
): Promise<number> {
  try {
    const supabase = await createClient();

    // Recupera tutti gli utenti con quel ruolo
    const { data: utenti, error: utentiError } = await supabase
      .from('utenti_profilo')
      .select('id')
      .eq('ruolo_codice', ruoloCodice);

    if (utentiError || !utenti) {
      console.error('Errore recupero utenti:', utentiError);
      return 0;
    }

    let inviati = 0;
    for (const utente of utenti) {
      const success = await sendPushNotification(utente.id, payload);
      if (success) inviati++;
    }

    return inviati;
  } catch (error) {
    console.error('Errore invio notifiche per ruolo:', error);
    return 0;
  }
}

/**
 * Registra una nuova subscription push per un utente
 */
export async function registerPushSubscription(
  userId: string,
  subscription: PushSubscription
): Promise<boolean> {
  try {
    const supabase = await createClient();

    // Verifica se esiste già una subscription per questo endpoint
    const { data: existing } = await supabase
      .from('notifiche_push_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('subscription->>endpoint', subscription.endpoint)
      .single();

    if (existing) {
      // Aggiorna la subscription esistente
      const { error } = await supabase
        .from('notifiche_push_subscriptions')
        .update({
          subscription,
          active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      return !error;
    } else {
      // Crea nuova subscription
      const { error } = await supabase
        .from('notifiche_push_subscriptions')
        .insert({
          user_id: userId,
          subscription,
          active: true,
        });

      return !error;
    }
  } catch (error) {
    console.error('Errore registrazione subscription:', error);
    return false;
  }
}

