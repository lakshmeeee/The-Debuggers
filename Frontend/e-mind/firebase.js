import 'firebase/compat/firestore';
import firebase from 'firebase/compat/app';


const firebaseConfig = {
  apiKey: "AIzaSyAElKPT5EfEa_8AhGBVjlltDZBNnCs2ZaY",
  authDomain: "e-mind-debuggers.firebaseapp.com",
  projectId: "e-mind-debuggers",
  storageBucket: "e-mind-debuggers.appspot.com",
  messagingSenderId: "379791251414",
  appId: "1:379791251414:web:606fbbab89a435814df677"
};


// initialing the firebase
if (firebase.apps.length === 0) {
  app = firebase.initializeApp(firebaseConfig)
} else {
  app = firebase.app();
}

// getting access to realtime database( firestore )
const db = firebase.firestore()

export { db }