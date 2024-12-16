import { db, firestore } from '../conf/firebase';
import { 
  ref, 
  push, 
  query, 
  limitToLast, 
  orderByKey, 
  endAt, 
  get,
  set,
} from 'firebase/database';

import { 
  collection, 
  getDocs, 
  doc, 
  getDoc 
} from 'firebase/firestore';

// Send a message to a channel
export const sendMessage = async (token, channelName, message) => {
  try {
    // Check if user is subscribed to the channel
    const subscriptionRef = doc(firestore, 'subscriptions', token);
    const docSnap = await getDoc(subscriptionRef);
    
    if (!docSnap.exists() || !docSnap.data().channels.includes(channelName)) {
      throw new Error('User not subscribed to this channel');
    }
    
    // Create a new message in Realtime Database
    const channelRef = ref(db, `channels/${channelName}/messages`);
    const newMessageRef = push(channelRef);
    
    await set(newMessageRef, {
      text: message,
      timestamp: Date.now(),
      sender: token
    });
    
    return 'Message sent successfully';
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Fetch messages with pagination
export const fetchMessages = async (channelName, lastMessageId = '') => {
  try {
    const channelRef = ref(db, `channels/${channelName}/messages`);
    
    // Prepare query with pagination
    let messagesQuery = query(
      channelRef, 
      orderByKey(), 
      limitToLast(10)
    );
    
    // If lastMessageId is provided, fetch messages before that
    if (lastMessageId) {
      messagesQuery = query(
        messagesQuery,
        endAt(lastMessageId)
      );
    }
    
    const snapshot = await get(messagesQuery);
    
    if (snapshot.exists()) {
      const messages = snapshot.val();
      return Object.keys(messages).map(key => ({
        id: key,
        ...messages[key]
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

// Fetch user's subscribed channels (chats)
export const fetchChats = async (token) => {
  try {
    const subscriptionRef = doc(firestore, 'subscriptions', token);
    const docSnap = await getDoc(subscriptionRef);
    
    if (docSnap.exists()) {
      return docSnap.data().channels || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching chats:', error);
    throw error;
  }
};