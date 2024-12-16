import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "./src/conf/firebase";

const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
  try {
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    if (token) {
      console.log("FCM Token:", token);
    } else {
      console.log("No registration token available. Request permission to generate one.");
    }
  } catch (error) {
    console.error("An error occurred while retrieving token.", error);
  }
};


onMessage(messaging, (payload) => {
  console.log("Message received: ", payload);

  // Extract notification details
  const { title, body } = payload.notification;

  // Check if the browser supports notifications
  if (Notification.permission === "granted") {
    // Show the notification
    new Notification(title, {
      body: body,
      icon: payload.notification.icon, // Optional: if you have an icon for your notification
    });
  } else {
    console.log("Notification permission not granted.");
  }
});