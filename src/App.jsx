import React, { useEffect } from "react";
import { FirebaseMessagingProvider } from "./context/FirebaseMessagingContext";
import TopicsManager from "./components/TopicsManager";
import { Routes, Route, useNavigate } from "react-router-dom";
import AuthComponent from "./components/AuthComponent";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import ChannelManager from "./components/ChannelManager";

function NotFoundPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/auth"); // Redirect to the login page after 3 seconds
    }, 3000);

    return () => clearTimeout(timer); // Cleanup timer on component unmount
  }, [navigate]);

  return (
    <div className="text-center">
      <h1 className="text-red-500 text-xl font-bold">404 - Page Not Found</h1>
      <p className="text-gray-500 mt-2">Redirecting to the login page in 3 seconds...</p>
    </div>
  );
}

function App() {
  return (
    <FirebaseMessagingProvider>
      <Routes>
        {/* Public Route for Authentication */}
        <Route
          path="/auth"
          element={
            <PublicRoute>
              <AuthComponent />
            </PublicRoute>
          }
        />

        {/* Protected Route for Chat */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChannelManager />
            </ProtectedRoute>
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </FirebaseMessagingProvider>
  );
}

export default App;
