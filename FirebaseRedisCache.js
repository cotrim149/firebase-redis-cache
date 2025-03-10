class FirebaseRedisCache {
  constructor({ firestoreWrapper, redis }) {
    this.firestoreWrapper = firestoreWrapper;
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

    // 2️⃣ Se não estiver no cache, busca no Firestore via wrapper
    console.log(`⏳ Buscando dados da coleção "${collectionName}" no Firestore...`);
    const dataList = await this.firestoreWrapper.getCollectionData(collectionName);

    if (dataList.length === 0) {
      console.log(`Nenhum documento encontrado na coleção "${collectionName}".`);
      return [];
    }

    // 3️⃣ Salva no cache com tempo de expiração (1 hora)
    await this.redis.set(cacheKey, JSON.stringify(dataList), "EX", 3600);

    console.log(`📥 Dados da coleção "${collectionName}" armazenados no cache.`);
    return dataList;
  }
}

module.exports = FirebaseRedisCache;
