import { firestore, messaging } from '../conf/firebase';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  setDoc,
  doc, 
  getDocs, 
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';


// Get channels
export const getChannels = async () => {
  try {
    const channelsRef = collection(firestore, 'channels');
    const snapshot = await getDocs(channelsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching channels:', error);
    return [];
  }
};

// Add a new channel
export const addChannel = async (name, description) => {
  try {
    const channelsRef = collection(firestore, 'channels');
    const docRef = await addDoc(channelsRef, { name, description });
    return docRef.id;
  } catch (error) {
    console.error('Error adding channel:', error);
    throw error;
  }
};

// Delete a channel
export const deleteChannel = async (name) => {
  try {
    // Find the document with the matching name
    const channelsRef = collection(firestore, 'channels');
    const querySnapshot = await getDocs(channelsRef);
    
    const channelDoc = querySnapshot.docs.find(doc => doc.data().name === name);
    
    if (channelDoc) {
      // Delete the channel document
      await deleteDoc(doc(firestore, 'channels', channelDoc.id));
      
      // Remove the channel from user subscriptions
      const subscriptionsRef = collection(firestore, 'subscriptions');
      const subscriptionsSnapshot = await getDocs(subscriptionsRef);
      
      const batch = [];
      subscriptionsSnapshot.forEach(subDoc => {
        const userData = subDoc.data();
        if (userData.channels && userData.channels.includes(name)) {
          batch.push(
            updateDoc(doc(firestore, 'subscriptions', subDoc.id), {
              channels: arrayRemove(name)
            })
          );
        }
      });
      
      await Promise.all(batch);
      
      return 'Channel deleted successfully';
    }
    
    throw new Error('Channel not found');
  } catch (error) {
    console.error('Error deleting channel:', error);
    throw error;
  }
};

export const subscribeToChannel = async (name, token) => {
  try {
    // Make an API call to your backend to subscribe the user
    const response = await fetch(`https://playingwithfirebaseserver.onrender.com/channels/${name}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token
      }),
    });

    if (response.ok) {
      const data = await response.text();
      console.log(data);  // 'Subscribed to channel: [name]'
      return 'Subscribed successfully';
    } else {
      throw new Error('Failed to subscribe to channel');
    }
  } catch (error) {
    console.error('Error subscribing to channel:', error);
    throw error;
  }
};

// Unsubscribe from a channel
export const unsubscribeFromChannel = async (name, token) => {
  try {
    console.log("it enters in the unsubscribe function")
    const response = await fetch(`https://playingwithfirebaseserver.onrender.com/channels/${name}/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token
      }),
    });

    if (response.ok) {
      const data = await response.text();
      console.log(data);  // 'Unsubscribed from channel: [name]'
      return 'Unsubscribed successfully';
    } else {
      throw new Error('Failed to unsubscribe from channel');
    }
  } catch (error) {
    console.error('Error unsubscribing from channel:', error);
    throw error;
  }
};
// Get user's subscriptions
export const getSubscriptions = async (token) => {
  try {
    const subscriptionRef = doc(firestore, 'subscriptions', token);
    const docSnap = await getDoc(subscriptionRef);
    
    if (docSnap.exists()) {
      return docSnap.data().channels || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    return [];
  }
};

// Request FCM token
export const requestNotificationPermission = async () => {
  try {
    const messaging = getMessaging();
    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      // Get the token
      const token = await getToken(messaging, {
        vapidKey: 'YOUR_VAPID_KEY_HERE' // Replace with your actual VAPID key
      });
      
      return token;
    }
    
    throw new Error('Notification permission denied');
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    throw error;
  }
};

// Listen for messages
export const onMessageListener = () => {
  const messaging = getMessaging();
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
};