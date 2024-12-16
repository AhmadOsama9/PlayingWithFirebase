import React, { useState, useEffect } from 'react';
import { getChannels, addChannel, deleteChannel, subscribeToChannel, unsubscribeFromChannel, getSubscriptions } from '../services/channelService';
import { useFirebaseMessaging } from '../context/FirebaseMessagingContext';
import ChatList from './ChatList';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { logEvent } from "firebase/analytics";
import { analytics, messaging } from '../conf/firebase';


const ChannelManager = () => {
  const [channels, setChannels] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [newChannel, setNewChannel] = useState({ name: '', description: '' });
  const { token, requestPermission } = useFirebaseMessaging();
  const [error, setError] = useState(null);
  const [subscribeError, setSubscribeError] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChannels = async () => {
      const channelsData = await getChannels();
      setChannels(channelsData);
    };
    fetchChannels();
  }, []);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (token) {
        const userSubscriptions = await getSubscriptions(token);
        setSubscriptions(userSubscriptions);
      } else {
        setError("You must allow notifications to get your token to act as a loggedIn user");
      }
    };
    fetchSubscriptions();
  }, [token]);

  const handleAddChannel = async () => {
    if (newChannel.name && newChannel.description) {
      await addChannel(newChannel.name, newChannel.description);
      setNewChannel({ name: '', description: '' });
      const updatedChannels = await getChannels();
      logEvent(analytics, 'add_channel', { channel: newChannel.name });
      setChannels(updatedChannels);
    }
  };

  const handleDeleteChannel = async (name) => {
    await deleteChannel(name);
    const updatedChannels = await getChannels();
    logEvent(analytics, 'delete_channel', { channel: name });
    setChannels(updatedChannels);
  };

  const handleSubscribe = async (name) => {
    try { // Add the try-block specially to make sure event only called if the backend was correct
      if (token) {
        console.log('Subscribing to channel', name);
        await subscribeToChannel(name, token);
        const updatedSubscriptions = await getSubscriptions(token);
        setSubscriptions(updatedSubscriptions);
        logEvent(analytics, 'subscribe', { channel: name });
        console.log("After calling the even log for subscribe");

        sendSubscriptionNotification(name);

      } else {
        setSubscribeError("You must allow notifications to get your token to act as a loggedIn user");
      }
    } catch (error) {
      console.error("Error subscribing to channel:", error.message);
      setSubscribeError("Error subscribing to channel");
    }
  };

  const handleUnsubscribe = async (name) => {
    try {
      if (token) {
        await unsubscribeFromChannel(name, token);
        const updatedSubscriptions = await getSubscriptions(token);
        setSubscriptions(updatedSubscriptions);
        logEvent(analytics, 'unsubscribe', { channel: name });
        console.log("After calling the even log for unsubscribe");

        sendUnsubscribeNotification(name);

      } else {
        setError("You must allow notifications to get your token to act as a loggedIn user");
      }
    } catch (error) {
      console.error("Error unsubscribing from channel:", error.message);
      setSubscribeError("Error unsubscribing from channel");
    }
  };

  const sendSubscriptionNotification = async (channel) => {
    try {
      const message = {
        token,
        notification: {
          title: "Subscription Update",
          body: `You have successfully subscribed to the ${channel} channel!`,
        },
      };
      await sendFCMNotification(message);
    } catch (error) {
      console.error("Error sending subscription notification:", error);
    }
  };
  
  const sendUnsubscribeNotification = async (channel) => {
    try {
      const message = {
        token,
        notification: {
          title: "Unsubscribe Update",
          body: `You have unsubscribed from the ${channel} channel.`,
        },
      };
      await sendFCMNotification(message);
    } catch (error) {
      console.error("Error sending unsubscribe notification:", error);
    }
  };

  const sendFCMNotification = async (message) => {
    try {
      const response = await fetch('https://playingwithfirebaseserver.onrender.com/send-notification', {  // Adjust the URL as needed
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: message.token,  // Pass the FCM token
          title: message.notification.title,  // Pass the title
          body: message.notification.body,  // Pass the body
        }),
      });
  
      if (response.ok) {
        console.log("Notification sent successfully");
      } else {
        console.error("Error sending notification:", response.statusText);
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };
  


  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  }

  return (
    <div className="p-4">
      <div>
       <h1 className="text-xl font-bold mb-4">Channel Manager</h1>
        <button
          onClick={handleLogout}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Add New Channel</h2>
        <input
          type="text"
          placeholder="Channel Name"
          value={newChannel.name}
          onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
          className="border p-2 mr-2"
        />
        <input
          type="text"
          placeholder="Description"
          value={newChannel.description}
          onChange={(e) => setNewChannel({ ...newChannel, description: e.target.value })}
          className="border p-2"
        />
        <button
          onClick={handleAddChannel}
          className="ml-4 bg-blue-500 text-white p-2"
        >
          Add Channel
        </button>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div>
        <h2 className="text-lg font-semibold mb-2">Available Channels</h2>
        <ul className="mb-4">
          {channels.map((channel) => (
            <li key={channel.name} className="flex items-center mb-2">
              <span className="mr-2">{channel.name} - {channel.description}</span>
              {subscriptions.includes(channel.name) ? (
                <button
                  onClick={() => handleUnsubscribe(channel.name)}
                  className="bg-red-500 text-white p-1 rounded"
                >
                  Unsubscribe
                </button>
              ) : (
                <button
                  onClick={() => handleSubscribe(channel.name)}
                  className="bg-green-500 text-white p-1 rounded"
                >
                  Subscribe
                </button>
              )}
              <button
                onClick={() => handleDeleteChannel(channel.name)}
                className="ml-2 bg-gray-500 text-white p-1 rounded"
              >
                Delete
              </button>
                {subscribeError && <div className="text-red-500 ml-2">{subscribeError}</div>}
            </li>
          ))}
        </ul>
      </div>
      

      <ChatList />


      <button 
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300"
        onClick={requestPermission}
      >
        Enable Notifications
      </button>
    </div>
  );
};

export default ChannelManager;
