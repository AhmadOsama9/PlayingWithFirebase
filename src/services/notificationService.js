const API_URL = "http://localhost:4000";

export const subscribeToTopic = async (token, topic) => {
  try {
    const response = await fetch(`${API_URL}/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, topic }),
    });
    if (response.ok) {
      console.log(`Subscribed to topic: ${topic}`);
    } else {
      console.error("Failed to subscribe to topic.");
    }
  } catch (error) {
    console.error("Error subscribing to topic:", error);
  }
};

export const unsubscribeFromTopic = async (token, topic) => {
  try {
    const response = await fetch(`${API_URL}/unsubscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, topic }),
    });
    if (response.ok) {
      console.log(`Unsubscribed from topic: ${topic}`);
    } else {
      console.error("Failed to unsubscribe from topic.");
    }
  } catch (error) {
    console.error("Error unsubscribing from topic:", error);
  }
};
