const { collection, getDocs, doc, updateDoc, writeBatch } = require("firebase/firestore");

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

  async setCollection(collectionName, collectionData) {

    if (!Array.isArray(collectionData)) {
      throw new Error("Os dados da coleção devem ser um array de objetos.");
    }

    const batch = writeBatch(this.db);
    const colRef = collection(this.db, collectionName);

    for (const item of collectionData) {
      if (item.id) {
        // Caso o item já tenha um ID, usamos ele
        const docRef = doc(this.db, collectionName, item.id);
        batch.set(docRef, item);
      } else {
        // Se não tiver um ID, criamos um novo documento
        await addDoc(colRef, item);
      }
    }

    await batch.commit();
    console.log(`✅ Coleção "${collectionName}" salva com sucesso.`);
  }

  async editCollection(collectionName, updateFunction) {
    const colRef = collection(this.db, collectionName);
    const snapshot = await getDocs(colRef);

    for (const document of snapshot.docs) {
      const register = { id: document.id, ...document.data() };
      const updatedSale = await updateFunction(register);

      if (updatedSale) {
        const docRef = doc(this.db, collectionName, document.id);
        await updateDoc(docRef, updatedSale.data);
        console.log(`✅ Documento ${document.id} atualizado!`);
      }
    }
  }
}

module.exports = FirestoreWrapper;
