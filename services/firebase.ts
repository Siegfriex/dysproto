import { initializeApp } from 'firebase/app';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAu1H4QgBbTc0ptMWeabyvFCqzCMSzupqE",
  authDomain: "dysproto.firebaseapp.com",
  projectId: "dysproto",
  storageBucket: "dysproto.firebasestorage.app",
  messagingSenderId: "894139739522",
  appId: "1:894139739522:web:133dc9400f05814bd8739b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Functions with asia-northeast3 region
const functions = getFunctions(app, 'asia-northeast3');

// Initialize Firestore
const db = getFirestore(app);

// Initialize Auth
const auth = getAuth(app);

// Initialize Storage
const storage = getStorage(app);

// Uncomment for local development with emulators
// if (import.meta.env.DEV) {
//   connectFunctionsEmulator(functions, 'localhost', 5001);
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   connectAuthEmulator(auth, 'http://localhost:9099');
//   connectStorageEmulator(storage, 'localhost', 9199);
// }

export { app, functions, db, auth, storage };
