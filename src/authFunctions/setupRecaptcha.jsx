import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../conf/firebase";

// Set up Recaptcha
const setupRecaptcha = () => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,  // The auth instance
      "recaptcha-container",  // The div ID for reCAPTCHA
      {
        size: "invisible", // Invisible reCAPTCHA
        callback: (response) => {
          console.log("reCAPTCHA solved:", response);
        },
      }
    );
  }
};

// Send OTP
const sendOTP = async (phoneNumber) => {
  setupRecaptcha();
  try {
    const appVerifier = window.recaptchaVerifier;
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    window.confirmationResult = confirmationResult; // Save confirmation result globally
    console.log("OTP sent to", phoneNumber);
  } catch (error) {
    console.error("Error sending OTP:", error.message);
    window.recaptchaVerifier?.reset(); // Reset reCAPTCHA if there’s an error
    throw new Error(error.message); // Throw error to handle it in the UI
  }
};

// Verify OTP
const verifyOTP = async (otp) => {
  try {
    if (!window.confirmationResult) {
      throw new Error("No OTP sent. Please try again.");
    }
    const result = await window.confirmationResult.confirm(otp);
    console.log("Phone verified, user:", result.user);
    return result.user;
  } catch (error) {
    if (error.code === "auth/invalid-verification-code") {
      console.error("Invalid OTP. Please try again.");
    } else {
      console.error("Error verifying OTP:", error.message);
    }
    throw new Error(error.message); // Throw error to handle it in the UI
  }
};

export { sendOTP, verifyOTP };
