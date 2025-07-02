// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { Firestore, getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCLJesTXivtDRa8-Q2-tQIXY1FytCCexRk",
  authDomain: "accounts-monitoring-system.firebaseapp.com",
  projectId: "accounts-monitoring-system",
  storageBucket: "accounts-monitoring-system.firebasestorage.app",
  messagingSenderId: "993718980614",
  appId: "1:993718980614:web:5c7a8596e982273933b387",
  measurementId: "G-B3K5P25GPK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app)