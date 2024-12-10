export class IndexedDBService {
  private dbName: string;
  private dbVersion: number;
  private db: IDBDatabase | null = null;

  constructor(dbName: string, dbVersion: number = 1) {
    this.dbName = dbName;
    this.dbVersion = dbVersion;
  }

  // Ініціалізація IndexedDB
  init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBRequest).result;

        if (!db.objectStoreNames.contains('categories')) {
          const categoriesStore = db.createObjectStore('categories', {
            keyPath: 'id',
            autoIncrement: true,
          });
          categoriesStore.createIndex('name', 'name', { unique: false });
        }

        if (!db.objectStoreNames.contains('orders')) {
          const ordersStore = db.createObjectStore('orders', {
            keyPath: 'id',
            autoIncrement: true,
          });
          ordersStore.createIndex('created_at', 'created_at', { unique: false });
        }
      };
    });
  }

  // ***** Методи для category *****

  addCategory(category: Omit<Category.Item, 'id'>): Promise<number> {
    return this.transaction('categories', 'readwrite', (store) => {
      return new Promise<number>((resolve, reject) => {
        const request = store.add(category);

        request.onsuccess = () => {
          resolve(request.result as number);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    });
  }

  getCategories(): Promise<Category.Item[]> {
    return this.transaction('categories', 'readonly', (store) => {
      return new Promise<Category.Item[]>((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = () => {
          resolve(request.result as Category.Item[]);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    });
  }

  updateCategory(category: Category.Item): Promise<void> {
    return this.transaction('categories', 'readwrite', (store) => {
      return new Promise<void>((resolve, reject) => {
        const request = store.put(category);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    });
  }

  deleteCategory(id: number): Promise<void> {
    return this.transaction('categories', 'readwrite', (store) => {
      return new Promise<void>((resolve, reject) => {
        const request = store.delete(id);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    });
  }

  // ***** Методи для order *****

  addOrder(order: Omit<Order.Item, 'id'>): Promise<number> {
    return this.transaction('orders', 'readwrite', (store) => {
      return new Promise<number>((resolve, reject) => {
        const request = store.add(order);

        request.onsuccess = () => {
          resolve(request.result as number);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    });
  }

  getOrders(filter?: Order.Filter): Promise<Order.Item[]> {
    return this.transaction('orders', 'readonly', (store) => {
      return new Promise<Order.Item[]>((resolve, reject) => {
        const createdAtIndex = store.index('created_at');
        const results: Order.Item[] = [];

        // Фільтрація по created_at
        let createdAtRange: IDBKeyRange | undefined = undefined;
        if (filter?.createdAt) {
          const fromDate = filter.createdAt.from ? new Date(filter.createdAt.from).getTime() : undefined;
          const toDate = filter.createdAt.to ? new Date(filter.createdAt.to).getTime() : undefined;
          createdAtRange = IDBKeyRange.bound(fromDate, toDate);
        }

        // Якщо фільтр не вказано, отримуємо всі записи
        const cursorRequest = createdAtRange ? createdAtIndex.openCursor(createdAtRange) : store.openCursor();

        cursorRequest.onsuccess = () => {
          const cursor = cursorRequest.result;
          if (cursor) {
            const order: Order.Item = cursor.value;

            // Фільтрація по categories
            if (filter?.categories && filter.categories.length > 0) {
              const categoryMatch = filter.categories.some((cat) => order.categories.includes(cat));
              if (!categoryMatch) {
                cursor.continue();
                return;
              }
            }

            results.push(order);
            cursor.continue();
          } else {
            resolve(results); // Завершення запиту
          }
        };

        cursorRequest.onerror = () => {
          reject(cursorRequest.error);
        };
      });
    });
  }

  updateOrder(order: Order.Item): Promise<void> {
    return this.transaction('orders', 'readwrite', (store) => {
      return new Promise<void>((resolve, reject) => {
        const request = store.put(order);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    });
  }

  deleteOrder(id: number): Promise<void> {
    return this.transaction('orders', 'readwrite', (store) => {
      return new Promise<void>((resolve, reject) => {
        const request = store.delete(id);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    });
  }

  // ***** Загальний метод для транзакцій *****

  private transaction<T>(
    storeName: string,
    mode: IDBTransactionMode,
    callback: (store: IDBObjectStore) => Promise<T>
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      if (this.db) {
        const transaction = this.db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);

        transaction.onerror = () => reject(transaction.error);

        callback(store).then(resolve).catch(reject);
      } else {
        reject('Database not initialized');
      }
    });
  }
}
