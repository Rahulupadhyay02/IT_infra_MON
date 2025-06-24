import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCf_BTW1leJ1bXX_OKWS7WVmcFv9WwdrSs",
  authDomain: "rr-group0208.firebaseapp.com",
  databaseURL: "https://rr-group0208-default-rtdb.firebaseio.com",
  projectId: "rr-group0208",
  storageBucket: "rr-group0208.firebasestorage.app",
  messagingSenderId: "751994974470",
  appId: "1:751994974470:web:a8a567bead51262ce4ee87",
  measurementId: "G-1XE9XK2DQL"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);

export default app;