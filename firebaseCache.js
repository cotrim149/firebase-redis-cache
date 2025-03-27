const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
const Redis = require("ioredis");
const FirestoreWrapper = require("./FirestoreWrapper");
const FirebaseRedisCache = require("./FirebaseRedisCache");

function initializeFirebase(credentials) {
  const firebaseApp = initializeApp(credentials);
  return getFirestore(firebaseApp);
}

function createCacheInstance(credentials) {
  const firestore = initializeFirebase(credentials);
  const firestoreWrapper = new FirestoreWrapper(firestore);
  const redis = new Redis();

  return new FirebaseRedisCache({ firestoreWrapper, redis });
}

module.exports = {createCacheInstance, initializeFirebase};
