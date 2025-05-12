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

async function getCollection(credentials, collectionName) {
  const firestore = initializeFirebase(credentials);
  const firestoreWrapper = new FirestoreWrapper(firestore);  

  return await firestoreWrapper.getCollectionData(collectionName);
}

async function createCollection(credentials, collectionName, collectionData) {

  const firestore = initializeFirebase(credentials);
  const firestoreWrapper = new FirestoreWrapper(firestore);
  await firestoreWrapper.setCollection(collectionName, collectionData);
  return await firestoreWrapper.getCollectionData(collectionName);
}

async function editCollection(credentials, collectionName, updateFuction) {

  const firestore = initializeFirebase(credentials);
  const firestoreWrapper = new FirestoreWrapper(firestore);

  await firestoreWrapper.editCollection(collectionName, updateFuction);
}

module.exports = {createCacheInstance, getCollection, createCollection, editCollection};
