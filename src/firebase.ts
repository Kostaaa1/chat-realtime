import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDY7kUoZ3M78jTqs5Pyg9ZOI8GRoEk18Ko",
  authDomain: "chatapp-8c7b2.firebaseapp.com",
  projectId: "chatapp-8c7b2",
  storageBucket: "chatapp-8c7b2.appspot.com",
  messagingSenderId: "425242484422",
  appId: "1:425242484422:web:a4b2241c4f45c5a32781c7",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore();
export const auth = getAuth();
export const storage = getStorage();
