/* Firebase Configuration - VTNet Pickleball Championship 2026 */

// ========================================================
// HƯỚNG DẪN: Thay thế config bên dưới bằng config từ
// Firebase Console > Project Settings > Your apps > Web app
// ========================================================
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCrCVkx-_mFZKxL4sRmOEkNyV9IO3F7cvQ",
  authDomain: "vtnet-pickleball.firebaseapp.com",
  databaseURL: "https://vtnet-pickleball-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "vtnet-pickleball",
  storageBucket: "vtnet-pickleball.firebasestorage.app",
  messagingSenderId: "1032925274571",
  appId: "1:1032925274571:web:486264a5fb22a66dc6964e"
};

let firebaseApp = null;
let firebaseDb = null;
let firebaseAuth = null;
let FIREBASE_READY = false;

function initFirebase() {
  try {
    if (FIREBASE_CONFIG.apiKey === "YOUR_API_KEY") {
      console.warn("Firebase chưa được cấu hình. Chạy ở chế độ demo.");
      return false;
    }
    firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
    firebaseDb = firebase.database();
    firebaseAuth = firebase.auth();
    FIREBASE_READY = true;
    console.log("Firebase initialized successfully.");
    return true;
  } catch (e) {
    console.error("Firebase init error:", e);
    return false;
  }
}

// Read scores from Firebase
function listenScores(callback) {
  if (!FIREBASE_READY) {
    callback(getDemoScores());
    return;
  }
  firebaseDb.ref('scores').on('value', (snapshot) => {
    const data = snapshot.val() || {};
    callback(data);
  });
}

// Write score to Firebase
function saveScore(stage, matchKey, s1, s2) {
  if (!FIREBASE_READY) return Promise.reject("Firebase not ready");
  const path = stage === 'final' ? 'scores/final' : 'scores/' + stage + '/' + matchKey;
  return firebaseDb.ref(path).set({ s1: s1, s2: s2 });
}

// Demo scores (empty - no results yet)
function getDemoScores() {
  return { group: {}, ko: {}, qf: {}, sf: {}, final: null };
}
