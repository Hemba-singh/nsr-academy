// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB7xuk8WZnYbY9utDHgtuHL3CiO41G32yQ",
    authDomain: "nsr-sport-academy.firebaseapp.com",
    projectId: "nsr-sport-academy",
    storageBucket: "nsr-sport-academy.appspot.com",
    messagingSenderId: "39368077918",
    appId: "1:39368077918:web:45c5de8a7ccd794bd2facf"
};

// Import Firebase modules from full CDN URLs
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js';
const app = initializeApp(firebaseConfig);

// Verify Firebase Initialization
console.log('Firebase Initialization Status:', app);
if (app) {
    console.log('Firebase has been successfully initialized');
} else {
    console.error('Firebase initialization failed');
}

// Import auth services
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut,
    sendPasswordResetEmail,
    sendEmailVerification,
    setPersistence,
    browserSessionPersistence,
    browserLocalPersistence
} from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js';

const auth = getAuth(app);

// Verify Auth Initialization
console.log('Auth Initialization Status:', auth);
if (auth) {
    console.log('Firebase Authentication has been successfully initialized');
} else {
    console.error('Firebase Authentication initialization failed');
}

// Import Firestore services
import { 
    getFirestore, 
    collection, 
    getDocs,
    query,
    orderBy,
    limit,
    onSnapshot,
    addDoc,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js';

const db = getFirestore(app);

// Verify Firestore Initialization
console.log('Firestore Initialization Status:', db);
if (db) {
    console.log('Firestore has been successfully initialized');
} else {
    console.error('Firestore initialization failed');
}

// Password validation rules
const PASSWORD_RULES = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: true,
    specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

export { 
    auth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    sendEmailVerification,
    setPersistence,
    browserSessionPersistence,
    browserLocalPersistence,
    PASSWORD_RULES,
    db,
    collection, 
    getDocs,
    query,
    orderBy,
    limit,
    onSnapshot,
    addDoc,
    serverTimestamp
};
