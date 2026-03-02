import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const requiredFirebaseConfig = {
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
};

export const firebaseReady = Object.values(requiredFirebaseConfig).every(Boolean);

const app = firebaseReady ? initializeApp(firebaseConfig) : null;
let analyticsInstance = null;
let analyticsPromise = null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const googleProvider = app ? new GoogleAuthProvider() : null;

export async function initializeAnalytics() {
  if (!app || !firebaseConfig.measurementId || typeof window === 'undefined') {
    return null;
  }

  if (analyticsInstance) {
    return analyticsInstance;
  }

  if (analyticsPromise) {
    return analyticsPromise;
  }

  analyticsPromise = isSupported()
    .then((supported) => {
      if (!supported) {
        return null;
      }

      analyticsInstance = getAnalytics(app);
      return analyticsInstance;
    })
    .catch(() => null)
    .finally(() => {
      analyticsPromise = null;
    });

  return analyticsPromise;
}
