import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../conf/firebase";

const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("Google Sign-In successful:", result.user);
  } catch (error) {
    console.error("Error with Google Sign-In:", error.message);
  }
};

export { loginWithGoogle };
