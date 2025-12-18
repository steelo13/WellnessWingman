
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBkfmetIiPKYDThD3p_bdiLmd4TN6q0JO0",
  authDomain: "wellness-wingman-working.firebaseapp.com",
  projectId: "wellness-wingman-working",
  storageBucket: "wellness-wingman-working.firebasestorage.app",
  messagingSenderId: "743037096204",
  appId: "1:743037096204:web:d4d10b983c326b5c4cb929",
  measurementId: "G-H4MKYZTQEQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);

// Initialize Firestore with offline persistence
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});
