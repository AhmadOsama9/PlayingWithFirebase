import React, { createContext, useContext, useState } from "react";
import { getMessaging, getToken } from "firebase/messaging";
import { app } from "../conf/firebase"; 

const FirebaseMessagingContext = createContext();

export const FirebaseMessagingProvider = ({ children }) => {
  const [token, setToken] = useState(null);

  const requestPermission = async () => {
    const messaging = getMessaging(app);

    try {
      const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      const currentToken = await getToken(messaging, {
        vapidKey: "BDTLU5jxvCxzIXp6YGinMfN3kiXw8to285DIj0KVLpZ7ckcko9zb4qbjcsZsnWWCjXW3JNIw6ZGmaYgpouqi4po",
        serviceWorkerRegistration: registration,
      });
      if (currentToken) {
        console.log("Current Token:", currentToken);
        setToken(currentToken);
        return currentToken;
        // Optionally, update the backend with the token here
      } else {
        console.log("No registration token available. Request permission to generate one.");
      }
    } catch (error) {
      console.error("Error fetching FCM token:", error);
    }
  };

  return (
    <FirebaseMessagingContext.Provider value={{ token, requestPermission }}>
      {children}
    </FirebaseMessagingContext.Provider>
  );
};

export const useFirebaseMessaging = () => useContext(FirebaseMessagingContext);