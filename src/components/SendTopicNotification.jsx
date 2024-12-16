import React, { useState } from "react";
import { sendNotification } from "../services/sendService";

const SendNotification = () => {
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await sendNotification({ topic, title, body });
      setMessage(`Success: ${response}`);
      setTopic("");
      setTitle("");
      setBody("");
    } catch (error) {
      setMessage(`Error: ${error.response?.data || error.message}`);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-md shadow-md">
      <h2 className="text-xl font-bold mb-4">Send Notification</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
            Topic
          </label>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="mt-1 p-2 w-full border rounded-md"
            placeholder="Enter topic (e.g., news)"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 p-2 w-full border rounded-md"
            placeholder="Enter notification title"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="body" className="block text-sm font-medium text-gray-700">
            Body
          </label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="mt-1 p-2 w-full border rounded-md"
            placeholder="Enter notification body"
            required
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Send Notification
        </button>
      </form>
      {message && (
        <div className={`mt-4 p-2 rounded-md ${message.startsWith("Success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default SendNotification;
