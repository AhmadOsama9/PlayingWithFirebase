import React, { useState, useEffect } from "react";
import { ref, onChildAdded, off } from "firebase/database";
import { db } from "../conf/firebase";
import { sendMessage, fetchMessages } from "../services/chatService";

const ChatRoom = ({ token, channelName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    // Create a reference to the messages in the Realtime Database
    const messagesRef = ref(db, `channels/${channelName}/messages`);

    // Real-time listener for new messages
    const onMessageAdded = onChildAdded(messagesRef, (snapshot) => {
      const message = snapshot.val();
      setMessages((prevMessages) => [message, ...prevMessages]); // Add new message to the top
    });

    // Clean up listener when component unmounts or channel changes
    return () => {
      off(messagesRef, "child_added", onMessageAdded);
    };
  }, [channelName]);

  // Fetch initial messages when the component mounts
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const fetchedMessages = await fetchMessages(token, channelName);
        setMessages(fetchedMessages);
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    };

    loadMessages();
  }, [token, channelName]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return; // Prevent sending empty messages

    try {
        console.log("Sending message:", newMessage);
      await sendMessage(token, channelName, newMessage);
      setNewMessage(""); // Clear the input field
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <div className="flex flex-col space-y-4 overflow-y-auto max-h-96 p-4 bg-gray-100 rounded-lg mb-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-2 rounded-lg ${
              message.sender === token ? "bg-blue-100 self-end" : "bg-gray-200 self-start"
            }`}
          >
            <p className="text-sm text-gray-600">{message.text}</p>
            <p className="text-xs text-gray-400">
              {new Date(message.timestamp).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      <div className="flex items-center space-x-2 mt-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSendMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
