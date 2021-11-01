// Import the functions you need from the SDKs you need
import firebase from "firebase";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAV87PLsUxQ4VvMUG27K3WOy3DZPCe30M0",
    authDomain: "privs-78c2c.firebaseapp.com",
    projectId: "privs-78c2c",
    storageBucket: "privs-78c2c.appspot.com",
    messagingSenderId: "555688102058",
    appId: "1:555688102058:web:ebf3bd3cd5cd8ad05da8d3",
    measurementId: "G-9R9RSPCHQ1"
  };

// Initialize Firebase
let app;
if (firebase.apps.length === 0) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app()
}

const auth = firebase.auth()

export { auth };