// firebase/config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBn2Vzwq2MAsvo552yRVufZoiq9ka0jcA",
  authDomain: "the-steady-hotel.firebaseapp.com",
  projectId: "the-steady-hotel",
  storageBucket: "the-steady-hotel.appspot.com",
  messagingSenderId: "289244799504",
  appId: "1:289244799504:web:0663b34ee6afde815d2095",
  measurementId: "G-DSBYCXC322",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Web-based Auth and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
