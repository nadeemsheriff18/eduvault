import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyB6ezDh46c9AbzUpJxtmdOiV1Q19xeqB4c",
    authDomain: "studentstudy-2a371.firebaseapp.com",
    projectId: "studentstudy-2a371",
    storageBucket: "studentstudy-2a371.firebasestorage.app",
    messagingSenderId: "656456618136",
    appId: "1:656456618136:web:21642b40c148d226e740ed",
    measurementId: "G-RTRF3B74ZJ"
  };

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Set up authentication and Google provider
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, provider,db,storage};
