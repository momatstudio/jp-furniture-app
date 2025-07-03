import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
// import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyBKbwZ2puURDLPj_e6nvxPVhePzD13ZlHA",
  authDomain: "products-managment-app.firebaseapp.com",
  projectId: "products-managment-app",
  storageBucket: "products-managment-app.firebasestorage.app",
  messagingSenderId: "445628004677",
  appId: "1:445628004677:web:b25108257b9dcd8fc3e62c",
};

const app = initializeApp(firebaseConfig);
const database = getFirestore(app);

// Initialize Auth with AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { app, database, auth };
