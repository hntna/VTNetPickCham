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
    // Auth is optional (not needed on public page)
    try { firebaseAuth = firebase.auth(); } catch (e) { console.log("Auth SDK not loaded (OK for public page)"); }
    FIREBASE_READY = true;
    console.log("Firebase initialized successfully. Auth:", !!firebaseAuth);
    return true;
  } catch (e) {
    console.error("Firebase init error:", e);
    return false;
  }
}

// Write teams to Firebase
function saveTeams(teamsData) {
  if (!FIREBASE_READY) return Promise.reject("Firebase chưa cấu hình");
  return firebaseDb.ref('teams').set(teamsData).catch(error => {
    console.error("Error saving teams:", error);
    throw error;
  });
}

// Read scores from Firebase
function listenScores(callback) {
  if (!FIREBASE_READY) {
    console.warn("Firebase not ready, using demo scores");
    callback(getDemoScores());
    return;
  }
  firebaseDb.ref('scores').on('value', (snapshot) => {
    const data = snapshot.val() || {};
    callback(data);
  }, (error) => {
    console.error("Firebase read scores error:", error.message);
    callback(getDemoScores());
  });
}

// Read teams from Firebase
function listenTeams(callback) {
  if (!FIREBASE_READY) {
    console.warn("Firebase not ready for teams");
    callback(null);
    return;
  }
  firebaseDb.ref('teams').on('value', (snapshot) => {
    callback(snapshot.val());
  }, (error) => {
    console.error("Firebase read teams error:", error.message);
    callback(null);
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
