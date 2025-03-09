const FirebaseRedisCache = require("./FirebaseRedisCache");

const collectionTestName = "test-sales";
describe("FirebaseRedisCache", () => {
  let cache, mockFirestore, mockRedis;

  beforeEach(() => {
    // Mock do Firestore
    mockFirestore = {
      collection: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          empty: false,
          forEach: (callback) => {
            callback({ id: "1", data: () => ({ name: "Item 1" }) });
            callback({ id: "2", data: () => ({ name: "Item 2" }) });
          },
        }),
      }),
    };

    // Mock do Redis
    mockRedis = {
      get: jest.fn().mockResolvedValue(null), // Simula cache vazio
      set: jest.fn().mockResolvedValue("OK"),
    };

    cache = new FirebaseRedisCache({ firestore: mockFirestore, redis: mockRedis });
  });

  it("deve buscar dados do Firestore e armazenar no cache", async () => {
    const data = await cache.getCollectionData(collectionTestName);

    expect(data).toEqual([
      { id: "1", name: "Item 1" },
      { id: "2", name: "Item 2" },
    ]);

    expect(mockFirestore.collection).toHaveBeenCalledWith(collectionTestName);
    expect(mockRedis.set).toHaveBeenCalledWith(`cache_${collectionTestName}`, JSON.stringify(data), "EX", 3600);
  });

  it("deve retornar dados do cache se disponíveis", async () => {
    mockRedis.get.mockResolvedValue(JSON.stringify([{ id: "1", name: "Item Cacheado" }]));

    const data = await cache.getCollectionData(collectionTestName);

    expect(data).toEqual([{ id: "1", name: "Item Cacheado" }]);
    expect(mockFirestore.collection).not.toHaveBeenCalled(); // Não deve acessar Firestore
  });
});
