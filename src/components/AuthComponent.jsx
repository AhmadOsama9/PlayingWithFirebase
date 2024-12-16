import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithEmail, signUpWithEmail } from "../authFunctions/emailAuth";
import { loginWithGoogle } from "../authFunctions/signInWithPopup";
import { sendOTP, verifyOTP } from "../authFunctions/setupRecaptcha";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { firestore, messaging } from "../conf/firebase";
import { logEvent } from "firebase/analytics";
import { analytics, auth } from "../conf/firebase";
import { useAuth } from "../context/AuthContext";
import { onAuthStateChanged } from "firebase/auth";
import { useFirebaseMessaging } from "../context/FirebaseMessagingContext";


const AuthComponent = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false); // To track OTP status
  const [loading, setLoading] = useState(false); // Loading indicator
  const [message, setMessage] = useState(""); // Feedback message
  const { currentUser } = useAuth();
  const { token } = useFirebaseMessaging();
  const { requestPermission } = useFirebaseMessaging();

  
  const navigate = useNavigate();

  const monitorAuthState = () => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("User logged in:", user);
        await checkUserInFirestore(user); // Pass the user object to your function
      } else {
        console.log("No user logged in");
      }
    });
  };
  
  const checkUserInFirestore = async (user) => {
    const userId = user.uid; // Use the user object passed from `onAuthStateChanged`
    const userRef = doc(firestore, "users", userId);
    const userDoc = await getDoc(userRef);
  
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        createdAt: new Date(),
        email: user.email, // Optionally store email
      });
  
      logEvent(analytics, "user_created", { userId });
      console.log("User document created and event logged");

      sendWelcomeNotification();

    } else {
      console.log("User document already exists");
    }
  };

  const sendWelcomeNotification = async () => {
    try {

      const token = await requestPermission();


      const message = {
        token,
        notification: {
          title: "Welcome!",
          body: "Thank you for logging in for the first time.",
        },
      };
      await sendFCMNotification(message);
    } catch (error) {
      console.error("Error sending welcome notification:", error);
    }
  };
  
  const sendFCMNotification = async (message) => {
    try {

      if (!message | !message.token | !message.notification.title | !message.notification.body) {
        throw new Error("Invalid message object");
      }

      const response = await fetch('http://localhost:4000/send-notification', {  // Adjust the URL as needed
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
  

  const handleLogin = async () => {
    try {
      await loginWithEmail(email, password);
      await monitorAuthState();
      navigate("/chat");
    } catch (error) {
      console.error("Login failed", error);
      setMessage(`Login failed: ${error.message}`);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      await monitorAuthState();
      navigate("/chat");
    } catch (error) {
      console.error("Google login failed", error);
      setMessage(`Google login failed: ${error.message}`);
    }
  };

  const handleSignUp = async () => {
    try {
      await signUpWithEmail(email, password);
      await monitorAuthState();
      navigate("/chat");
    } catch (error) {
      console.error("Sign-up failed", error);
      setMessage(`Sign-up failed: ${error.message}`);
    }
  };

  const handleSendOTP = async () => {
    setLoading(true);
    try {
      await sendOTP(phone);
      setOtpSent(true);
      setMessage("OTP sent successfully!");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      const user = await verifyOTP(otp);
      setMessage("Phone verified successfully!");
      await monitorAuthState();
      navigate("/chat");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-center text-gray-800">Authentication</h1>

        {/* Email/Password Section */}
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex justify-between">
            <button
              onClick={handleSignUp}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Sign Up
            </button>
            <button
              onClick={handleLogin}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Login
            </button>
          </div>
        </div>

        {/* Google Login */}
        <div className="text-center">
          <button
            onClick={handleGoogleLogin}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Login with Google
          </button>
          {/* Test welcome notification with a button*/} 
          {/* <button
            onClick={sendWelcomeNotification}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Send Welcome Notification
          </button> */}
        </div>

        {/* Phone Authentication */}
        <div className="space-y-4 border-t pt-4">
          <h2 className="text-lg font-medium text-gray-700">Phone Authentication</h2>
          <input
            type="tel"
            placeholder="Phone Number"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setPhone(e.target.value)}
          />
          <button
            onClick={handleSendOTP}
            className={`w-full px-4 py-2 rounded-lg text-white ${
              loading ? "bg-gray-400" : "bg-yellow-500 hover:bg-yellow-600"
            }`}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>

          {otpSent && (
            <>
              <input
                type="text"
                placeholder="Enter OTP"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setOtp(e.target.value)}
              />
              <button
                onClick={handleVerifyOTP}
                className={`w-full px-4 py-2 rounded-lg text-white ${
                  loading ? "bg-gray-400" : "bg-purple-500 hover:bg-purple-600"
                }`}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </>
          )}

          {message && <p className="text-sm text-center text-gray-600">{message}</p>}
        </div>

        {/* Recaptcha Container */}
        <div id="recaptcha-container"></div> {/* Add this div for reCAPTCHA */}
      </div>
    </div>
  );
};

export default AuthComponent;
