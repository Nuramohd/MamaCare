import { initializeApp } from "firebase/app";
import { getAuth, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export function signInWithGoogle() {
  return signInWithRedirect(auth, provider);
}

export function handleRedirectResult() {
  return getRedirectResult(auth)
    .then((result) => {
      if (result) {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        const user = result.user;
        return { user, token };
      }
      return null;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.customData?.email;
      const credential = GoogleAuthProvider.credentialFromError(error);
      throw { errorCode, errorMessage, email, credential };
    });
}

export function signOutUser() {
  return signOut(auth);
}
