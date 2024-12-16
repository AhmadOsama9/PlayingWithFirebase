import React, { createContext, useContext, useState } from "react";
import { getMessaging, getToken } from "firebase/messaging";
import { app } from "../conf/firebase"; 

const FirebaseMessagingContext = createContext();

export const FirebaseMessagingProvider = ({ children }) => {
  const [token, setToken] = useState(null);

  const requestPermission = async () => {
    const messaging = getMessaging(app);
  
    try {
      // Check service worker support
      if (!('serviceWorker' in navigator)) {
        console.error('Service Workers not supported');
        return null;
      }
  
      // Remove { type: 'module' }
      const registration = await navigator.serviceWorker.register(
        '/firebase-messaging-sw.js'
      );
  
      const currentToken = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration,
      });
  
      if (currentToken) {
        console.log("Current Token:", currentToken);
        setToken(currentToken);
        return currentToken;
      } else {
        console.log("No registration token available. Request permission to generate one.");
      }
    } catch (error) {
      console.error("Error fetching FCM token:", error);
      console.error("Registration error details:", error.message);
    }
  };

  return (
    <FirebaseMessagingContext.Provider value={{ token, requestPermission }}>
      {children}
    </FirebaseMessagingContext.Provider>
  );
};

export const useFirebaseMessaging = () => useContext(FirebaseMessagingContext);