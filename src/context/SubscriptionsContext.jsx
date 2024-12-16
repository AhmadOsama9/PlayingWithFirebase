// context/SubscriptionsContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSubscriptions } from '../services/channelService';
import { useFirebaseMessaging } from './FirebaseMessagingContext';

const SubscriptionsContext = createContext();

export const SubscriptionsProvider = ({ children }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const { token } = useFirebaseMessaging();

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (token) {
        const userSubscriptions = await getSubscriptions(token);
        setSubscriptions(userSubscriptions);
      }
    };
    fetchSubscriptions();
  }, [token]);

  const updateSubscriptions = async () => {
    if (token) {
      const userSubscriptions = await getSubscriptions(token);
      setSubscriptions(userSubscriptions);
    }
  };

  return (
    <SubscriptionsContext.Provider value={{ subscriptions, updateSubscriptions }}>
      {children}
    </SubscriptionsContext.Provider>
  );
};

export const useSubscriptions = () => useContext(SubscriptionsContext);
