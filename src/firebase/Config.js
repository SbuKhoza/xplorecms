import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const env = import.meta.env

// Env vars win; the fallbacks keep the project working out of the box.
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyBn2qVzwq2MAsvo552yRVufZoiq9ka0jcA',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'the-steady-hotel.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'the-steady-hotel',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'the-steady-hotel.appspot.com',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '289244799504',
  appId: env.VITE_FIREBASE_APP_ID || '1:289244799504:web:0663b34ee6afde815d2095',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app