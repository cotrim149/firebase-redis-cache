class FirebaseRedisCache {
  constructor({ firestore, redis }) {
    this.db = firestore;
    this.redis = redis;
  }

  async getCollectionData(collectionName) {
    const cacheKey = `cache_${collectionName}`;

    // 1️⃣ Tenta obter os dados do cache Redis
    const cachedData = await this.redis.get(cacheKey);
    if (cachedData) {
      console.log(`✅ Dados da coleção "${collectionName}" carregados do cache.`);
      return JSON.parse(cachedData);
    }

    // 2️⃣ Se não estiver no cache, busca no Firestore
    console.log(`⏳ Buscando dados da coleção "${collectionName}" no Firestore...`);
    const snapshot = await this.db.collection(collectionName).get();

    if (snapshot.empty) {
      console.log(`Nenhum documento encontrado na coleção "${collectionName}".`);
      return [];
    }

    const dataList = [];
    snapshot.forEach((doc) => {
      dataList.push({ id: doc.id, ...doc.data() });
    });

    // 3️⃣ Salva no cache com tempo de expiração (1 hora)
    await this.redis.set(cacheKey, JSON.stringify(dataList), "EX", 3600);

    console.log(`📥 Dados da coleção "${collectionName}" armazenados no cache.`);
    return dataList;
  }
}

module.exports = FirebaseRedisCache;