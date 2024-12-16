// components/ChatList.js
import React, { useState, useEffect } from 'react';
import { getSubscriptions } from "../services/channelService";
import ChatRoom from './ChatRoom';
import { useFirebaseMessaging } from '../context/FirebaseMessagingContext';

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const { token } = useFirebaseMessaging();

  useEffect(() => {
    const loadChats = async () => {
      // Fetch all available chats from your server or Firebase
      try {
        const chatList = await getSubscriptions(token);
        console.log("ChatList", chatList);
        setChats(chatList);
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };

    loadChats();
  }, [token]);

  const handleChatClick = (chatName) => {
    setSelectedChat((prevSelectedChat) => 
      prevSelectedChat === chatName ? null : chatName
    );
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <div className="space-y-2 mb-4">
        <h3 className="text-lg font-semibold">Chats</h3>
        {chats.map((chat) => (
          <button
            key={chat}
            onClick={() => handleChatClick(chat)}
            className="w-full text-left p-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
          >
            {chat}
          </button>
        ))}
      </div>

      {selectedChat && <ChatRoom token={token} channelName={selectedChat} />}
    </div>
  );
};

export default ChatList;
