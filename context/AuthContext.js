import React, { createContext, useState, useEffect, useContext } from "react";
import { app } from "../config/firebaseConfig";
import {
  getAuth,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
  updatePassword,
  updatePhoneNumber,
  updateProfile,
} from "firebase/auth";
import { Alert } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useAsyncStorage from "@/hooks/useAsyncStorage";

const auth = getAuth(app);

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useAsyncStorage("user", null);
  const [loading, setLoading] = useState(true);
  const [loginResult, setLoginResult] = useState("");
  const [status, setStatus] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const getFriendlyErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/invalid-credential":
        return "Invalid email or password";
      case "auth/user-not-found":
        return "No user found with this email.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      // Add more cases as needed
      default:
        return "An unexpected error occurred. Please try again later.";
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const currentUser = userCredential.user;

      if (!currentUser.displayName) {
        await updateProfile(currentUser, {
          displayName: "User",
        });
      }

      setUser({
        ...currentUser,
        displayName: currentUser.displayName || "User",
      });
      setLoading(false);
      router.replace("(tabs)/");
    } catch (error) {
      setLoading(false);
      const friendlyMessage = getFriendlyErrorMessage(error.code);
      setLoginResult(friendlyMessage);
    } finally {
      setTimeout(() => {
        setLoginResult("");
      }, 4000);
    }
  };
  // End of Login

  const updateUser = async (updates) => {
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("No user is currently signed in.");

      if (updates.displayName || updates.photoURL) {
        await updateProfile(currentUser, {
          displayName: updates.displayName,
          photoURL: updates.photoURL,
        });
      }
      if (updates.email && updates.email !== currentUser.email) {
        await sendEmailVerification(currentUser);
        console.log("Verification email sent. Please verify before updating.");
      }

      if (updates.phoneNumber) {
        await updatePhoneNumber(currentUser, updates.phoneNumber);
      }

      if (updates.password) {
        await updatePassword(currentUser, updates.password);
      }

      setUser({
        ...currentUser,
        displayName: updates.displayName || currentUser.displayName,
        email: updates.email || currentUser.email,
        photoURL: updates.photoURL || currentUser.photoURL,
      });

      setLoading(false);

      // update the status
      setStatus(true);
      setTimeout(() => {
        setStatus(false);
      }, 4000);
    } catch (error) {
      // update the status
      setLoginResult(error.message);
      console.error("Error updating user:", error.message);

      setTimeout(() => {
        setLoginResult("");
      }, 4000);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      console.log(user);
    } catch (error) {
      console.error("Logout Error", error.message);
      setLoginResult(error.message);
    } finally {
      setLoading(false);
    }
  };
  // End of logout

  const value = {
    user,
    loading,
    status,
    setStatus,
    loginResult,
    setLoginResult,
    setLoading,
    login,
    updateUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
