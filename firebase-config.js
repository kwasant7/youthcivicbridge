// Firebase Configuration
// CivicRising Firebase Project

const firebaseConfig = {
    apiKey: "AIzaSyDYvvivpNSaJOoQ_rlr2rlPQ1kG52GUOgo",
    authDomain: "civicrising-c9431.firebaseapp.com",
    projectId: "civicrising-c9431",
    storageBucket: "civicrising-c9431.firebasestorage.app",
    messagingSenderId: "689558451915",
    appId: "1:689558451915:web:adbc2514e746beda05cd4e"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the Firestore service
const db = firebase.firestore();
