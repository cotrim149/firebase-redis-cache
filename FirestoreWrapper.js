const { collection, getDocs, doc, updateDoc, writeBatch } = require("firebase/firestore");

class FirestoreWrapper {
  constructor(firestore) {
    this.db = firestore;
  }

  async getCollectionData(collectionName) {
    
    console.log(`Fetching collection ${collectionName} ...`);

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
  
    // Obtém todos os documentos existentes na coleção
    const existingDocsSnapshot = await getDocs(colRef);
    
    // Transforma os documentos existentes em um array de objetos para comparação
    const existingDocs = existingDocsSnapshot.docs.map(doc => doc.data());
  
    for (const item of collectionData) {
      // Verifica se o item já existe na coleção comparando os valores
      const alreadyExists = existingDocs.some(existingItem =>
        JSON.stringify(existingItem) === JSON.stringify(item)
      );
  
      if (alreadyExists) {
        console.log(`⚠️ Item já existe na coleção. Ignorando:`, item);
        continue;
      }
  
      // Cria um novo documento (sem ID, o Firestore gera automaticamente)
      const docRef = doc(colRef);
      batch.set(docRef, item);
    }
  
    await batch.commit();
    console.log(`✅ Coleção "${collectionName}" salva com sucesso.`);
  }  

  async editCollection(collectionName, updateFunction) {
    const colRef = collection(this.db, collectionName);
    const snapshot = await getDocs(colRef);

    for (const document of snapshot.docs) {
      const register = { id: document.id, ...document.data() };
      const updatedItem = await updateFunction(register);

      if (updatedItem) {
        const docRef = doc(this.db, collectionName, document.id);
        await updateDoc(docRef, { data: updatedItem.data });
        console.log(`✅ Documento ${document.id} atualizado!`);
      }
    }
  }
}

module.exports = FirestoreWrapper;
