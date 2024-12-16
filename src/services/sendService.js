import axios from "axios";

const API_BASE_URL = "http://localhost:4000"; // Update to your backend's base URL if deployed

export const sendNotification = async ({ topic, title, body }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/send`, { topic, title, body });
    return response.data;
  } catch (error) {
    console.error("Error sending notification:", error.response?.data || error.message);
    throw error;
  }
};
