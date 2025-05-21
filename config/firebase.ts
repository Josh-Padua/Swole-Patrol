import { initializeApp } from "firebase/app";
import { GoogleAuthProvider  } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';


export const firebaseConfig = {
    apiKey: "AIzaSyAcsXRcN31Qhpa2BKEM9suss2OfB71BQJE",
    authDomain: "swole-patrol-d82f6.firebaseapp.com",
    projectId: "swole-patrol-d82f6",
    storageBucket: "swole-patrol-d82f6.firebasestorage.app",
    messagingSenderId: "861827564573",
    appId: "1:861827564573:web:1b8e2dd80144e2613db2f4",
    measurementId: "G-PDED5WDECP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Initialize Auth with persistence for React Native
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const provider = new GoogleAuthProvider();
