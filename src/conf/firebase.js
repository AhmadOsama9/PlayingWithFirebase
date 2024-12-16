// Import the necessary Firebase modules
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";  // Import the database module
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get the Realtime Database
const db = getDatabase(app);  // Using the new `getDatabase` function

const auth = getAuth(app);

const analytics = getAnalytics(app);

const firestore = getFirestore(app);

const messaging = getMessaging(app);

export { app, auth, analytics, db, firestore, messaging };
