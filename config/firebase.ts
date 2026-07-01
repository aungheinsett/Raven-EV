import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBS8dNwwtNC5H7E0ofiiy_wQ1LG8V1mea0",
  authDomain: "cs-project-27748.firebaseapp.com",
  projectId: "cs-project-27748",
  storageBucket: "cs-project-27748.firebasestorage.app",
  messagingSenderId: "205512522175",
  appId: "1:205512522175:web:44b3265afa4c4a12f9090a",
  measurementId: "G-LJ1XC716H4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the database and auth tools so your app tabs can use them!
export const db = getFirestore(app);
export const auth = getAuth(app);