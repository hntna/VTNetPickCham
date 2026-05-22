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

// Tracking listeners
let _scoresRef = null;
let _teamsRef = null;
let _scoresCallback = null;
let _teamsCallback = null;

// Write teams to Firebase
function saveTeams(teamsData) {
  if (!FIREBASE_READY) return Promise.reject("Firebase chưa cấu hình");
  return firebaseDb.ref(CURRENT_CATEGORY + '/teams').set(teamsData).catch(error => {
    console.error("Error saving teams:", error);
    throw error;
  });
}

// Read scores from Firebase
function listenScores(callback) {
  if (callback) _scoresCallback = callback;
  if (!_scoresCallback) return;

  if (!FIREBASE_READY) {
    console.warn("Firebase not ready, using demo scores");
    _scoresCallback(getDemoScores());
    return;
  }
  
  if (_scoresRef) _scoresRef.off('value');
  _scoresRef = firebaseDb.ref(CURRENT_CATEGORY + '/scores');
  
  _scoresRef.on('value', (snapshot) => {
    const data = snapshot.val() || {};
    _scoresCallback(data);
  }, (error) => {
    console.error("Firebase read scores error:", error.message);
    _scoresCallback(getDemoScores());
  });
}

// Read teams from Firebase
function listenTeams(callback) {
  if (callback) _teamsCallback = callback;
  if (!_teamsCallback) return;

  if (!FIREBASE_READY) {
    console.warn("Firebase not ready for teams");
    _teamsCallback(null);
    return;
  }
  
  if (_teamsRef) _teamsRef.off('value');
  _teamsRef = firebaseDb.ref(CURRENT_CATEGORY + '/teams');
  
  _teamsRef.on('value', (snapshot) => {
    _teamsCallback(snapshot.val());
  }, (error) => {
    console.error("Firebase read teams error:", error.message);
    _teamsCallback(null);
  });
}

// Write score to Firebase
function saveScore(stage, matchKey, s1, s2) {
  if (!FIREBASE_READY) return Promise.reject("Firebase not ready");
  const path = stage === 'final' ? CURRENT_CATEGORY + '/scores/final' : CURRENT_CATEGORY + '/scores/' + stage + '/' + matchKey;
  return firebaseDb.ref(path).set({ s1: s1, s2: s2 });
}

// Demo scores (empty - no results yet)
function getDemoScores() {
  return { group: {}, ko: {}, qf: {}, sf: {}, final: null };
}
