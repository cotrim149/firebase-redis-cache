const admin = require("firebase-admin");
const Redis = require("ioredis");
const FirebaseRedisCache = require("./FirebaseRedisCache");

function initializeFirebase(credentials) {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(credentials),
    });
  }
  return admin.firestore();
}

function createCacheInstance(credentials) {
  const firestore = initializeFirebase(credentials);
  const redis = new Redis(); // Conexão real com Redis

  return new FirebaseRedisCache({ firestore, redis });
}

module.exports = createCacheInstance;
