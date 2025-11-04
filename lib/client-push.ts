'use client';

/**
 * Utility client-side per gestire le push notifications
 */

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Questo browser non supporta le notifiche');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.warn('Notifiche rifiutate dall\'utente');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker non supportati');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    return registration;
  } catch (error) {
    console.error('Errore registrazione service worker:', error);
    return null;
  }
}

export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  try {
    // Richiedi permesso
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      return null;
    }

    // Registra service worker
    const registration = await registerServiceWorker();
    if (!registration) {
      return null;
    }

    // Ottieni VAPID public key
    const vapidResponse = await fetch('/api/notifiche/push/vapid-key');
    if (!vapidResponse.ok) {
      throw new Error('Errore recupero VAPID key');
    }

    const { publicKey } = await vapidResponse.json();

    // Sottoscrivi push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey) as Uint8Array,
    });

    // Invia subscription al server
    const subscribeResponse = await fetch('/api/notifiche/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscription }),
    });

    if (!subscribeResponse.ok) {
      throw new Error('Errore registrazione subscription');
    }

    return subscription;
  } catch (error) {
    console.error('Errore sottoscrizione push:', error);
    return null;
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(base64.length);

  for (let i = 0; i < base64.length; ++i) {
    outputArray[i] = base64.charCodeAt(i);
  }
  return outputArray;
}

