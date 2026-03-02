const TEMPLE_ICON = '/icon-192.png';

export function notificationsSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission() {
  if (!notificationsSupported()) {
    return 'unsupported';
  }

  return Notification.permission;
}

export async function requestNotificationPermission() {
  if (!notificationsSupported()) {
    return 'unsupported';
  }

  return Notification.requestPermission();
}

export async function showTempleNotification(title, options = {}) {
  if (!notificationsSupported() || Notification.permission !== 'granted') {
    return false;
  }

  const payload = {
    icon: TEMPLE_ICON,
    badge: TEMPLE_ICON,
    ...options,
  };

  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, payload);
    return true;
  }

  new Notification(title, payload);
  return true;
}

export function buildReminderStorageKey(dateKey, habitId, leadMinutes) {
  return `templo-reminder:${dateKey}:${habitId}:${leadMinutes}`;
}
