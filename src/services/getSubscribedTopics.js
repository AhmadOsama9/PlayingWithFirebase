const API_URL = "http://localhost:4000";

export const fetchSubscribedTopics = async (token) => {
    try {
      const response = await fetch(`${API_URL}/topics`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) return response.json();
      throw new Error("Failed to fetch subscribed topics");
    } catch (error) {
      console.error("Error fetching subscribed topics:", error);
      throw error;
    }
  };
  