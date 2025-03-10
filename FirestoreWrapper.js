const { collection, getDocs } = require("firebase/firestore");

class FirestoreWrapper {
  constructor(firestore) {
    this.db = firestore;
  }

  async getCollectionData(collectionName) {
    const querySnapshot = await getDocs(collection(this.db, collectionName));
    const dataList = [];
    querySnapshot.forEach((doc) => {
      dataList.push({ id: doc.id, ...doc.data() });
    });
    return dataList;
  }
}

module.exports = FirestoreWrapper;
