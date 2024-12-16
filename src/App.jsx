import React from "react";
import { FirebaseMessagingProvider } from "./context/FirebaseMessagingContext";
import TopicsManager from "./components/TopicsManager";
import "./firebase-messaging";
import { Routes, Route } from "react-router-dom";
import AuthComponent from "./components/AuthComponent";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import ChannelManager from "./components/ChannelManager";

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
        <Route path="*" element={<h1 className="text-center text-red-500">404 - Page Not Found</h1>} />
      </Routes>
    </FirebaseMessagingProvider>
  );
}

export default App;
