// IndexedDB para cache de cartas offline
const DB_NAME = "dia-d-offline";
const DB_VERSION = 1;
const STORE_NAME = "cartas";

export interface CachedItem {
  id: string;
  modo: string;
  categoria: string;
  nivel: number;
  tipo: string;
  quem: string;
  conteudo: string;
  cached_at: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("modo", "modo", { unique: false });
        store.createIndex("categoria", "categoria", { unique: false });
        store.createIndex("tipo", "tipo", { unique: false });
        store.createIndex("nivel", "nivel", { unique: false });
      }
    };
  });
}

export async function cacheCartas(cartas: CachedItem[]): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  const promises = cartas.map((carta) =>
    new Promise<void>((resolve, reject) => {
      const request = store.put({ ...carta, cached_at: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    })
  );

  await Promise.all(promises);
  db.close();
}

export async function getCartasFromCache(
  modo: string,
  categoria: string,
  tipo: string,
  nivelMax: number
): Promise<CachedItem[]> {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, "readonly");
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.getAll();

    request.onsuccess = () => {
      const allCartas = request.result as CachedItem[];
      const filtered = allCartas.filter(
        (c) =>
          c.modo === modo &&
          c.categoria === categoria &&
          c.tipo === tipo &&
          c.nivel <= nivelMax
      );
      resolve(filtered);
      db.close();
    };

    request.onerror = () => {
      reject(request.error);
      db.close();
    };
  });
}

export async function getAllCartasFromCache(): Promise<CachedItem[]> {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, "readonly");
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result as CachedItem[]);
      db.close();
    };

    request.onerror = () => {
      reject(request.error);
      db.close();
    };
  });
}

export async function clearCache(): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.clear();
    request.onsuccess = () => {
      resolve();
      db.close();
    };
    request.onerror = () => {
      reject(request.error);
      db.close();
    };
  });
}

export async function getCacheStats(): Promise<{
  total: number;
  byModo: Record<string, number>;
  oldestCache: number | null;
}> {
  const cartas = await getAllCartasFromCache();
  
  const byModo: Record<string, number> = {};
  let oldestCache: number | null = null;

  cartas.forEach((carta) => {
    byModo[carta.modo] = (byModo[carta.modo] || 0) + 1;
    if (oldestCache === null || carta.cached_at < oldestCache) {
      oldestCache = carta.cached_at;
    }
  });

  return {
    total: cartas.length,
    byModo,
    oldestCache,
  };
}
