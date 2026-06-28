// Firebase: Auth (Google) + Firestore với offline-cache (sống sót khi F5/mất mạng)
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

// Cùng project Firebase đã nhúng sẵn trong index.html
const firebaseConfig = {
  apiKey: 'AIzaSyAbxTERtSoTrBuwMNKHhrN_f42qpg_tsCY',
  authDomain: 'smartdoc-sync.firebaseapp.com',
  projectId: 'smartdoc-sync',
  storageBucket: 'smartdoc-sync.firebasestorage.app',
  messagingSenderId: '165608470904',
  appId: '1:165608470904:web:c35e8b1af0e5c247ac308d',
};

const app = initializeApp(firebaseConfig, 'sde-sync');

// Firestore với cache bền (IndexedDB) → offline + nhiều tab
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

export const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

// Giữ phiên đăng nhập qua F5
setPersistence(auth, browserLocalPersistence).catch(() => {});

export function signInWithGoogle() {
  return signInWithPopup(auth, provider);
}

export function signOutUser() {
  return fbSignOut(auth);
}

export function onAuthChange(cb) {
  return onAuthStateChanged(auth, cb);
}
