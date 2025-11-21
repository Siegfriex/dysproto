import { initializeApp } from 'firebase/app';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyDRytnL806Xzh4RW341bfW-kRPrT7zic6Y",
  authDomain: "dysproto.firebaseapp.com",
  projectId: "dysproto",
  storageBucket: "dysproto.firebasestorage.app",
  messagingSenderId: "894139739522",
  appId: "1:894139739522:web:YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Functions with asia-northeast3 region
const functions = getFunctions(app, 'asia-northeast3');

// Uncomment for local development
// if (import.meta.env.DEV) {
//   connectFunctionsEmulator(functions, 'localhost', 5001);
// }

export { app, functions };
