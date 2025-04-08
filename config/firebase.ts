import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider  } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
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
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);