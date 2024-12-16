import React, { useState } from "react";
import { useFirebaseMessaging } from "../context/FirebaseMessagingContext"; 
import { subscribeToTopic, unsubscribeFromTopic } from "../services/notificationService";

const TopicsManager = () => {
  const { token } = useFirebaseMessaging(); 
  const [topics, setTopics] = useState(["nasheed", "quran", "hadith"]); 
  const [subscribedTopics, setSubscribedTopics] = useState([]);

  const handleSubscribe = async (topic) => {
    if (!token) {
      console.error("FCM token is not available.");
      return;
    }
    await subscribeToTopic(token, topic);
    setSubscribedTopics((prev) => [...prev, topic]);
  };

  const handleUnsubscribe = async (topic) => {
    if (!token) {
      console.error("FCM token is not available.");
      return;
    }
    await unsubscribeFromTopic(token, topic);
    setSubscribedTopics((prev) => prev.filter((t) => t !== topic));
  };

  return (
    <div>
      <h2 className="">Manage Topics</h2>
      <ul>
        {topics.map((topic) => (
          <li key={topic}>
            {topic}
            {subscribedTopics.includes(topic) ? (
              <button onClick={() => handleUnsubscribe(topic)}>Unsubscribe</button>
            ) : (
              <button onClick={() => handleSubscribe(topic)}>Subscribe</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopicsManager;
