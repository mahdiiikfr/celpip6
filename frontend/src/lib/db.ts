// src/lib/db.ts
import { Word, BookData } from '@/types/book';
import i18n from '@/i18n';

// ==============================
// 📚 ثابت‌ها و تنظیمات
// ==============================
const DB_NAME = 'ZabanFlyDB';
const DB_VERSION = 14; // Updated to 14 to force clear all books & leitner to apply global unique word IDs
export const BOOKS_STORE_NAME = 'books';
export const FAVORITES_STORE_NAME = 'favorites';
export const LEITNER_STORE_NAME = 'leitnerItems';
export const DAILY_ACTIVITY_STORE_NAME = 'dailyActivity';

let db: IDBDatabase | null = null;
let dbOpeningPromise: Promise<IDBDatabase> | null = null;

// ==============================
// 🧱 رابط‌ها (Interfaces)
// ==============================
export interface LeitnerItem {
  wordID: string;
  bookId: string;
  boxLevel: number;
  nextReviewDate: number;
  isArchived?: boolean;
  isFavorite?: boolean;
}

export interface DailyActivity {
  id: string;
  bookId: string;
  date: string;
  correctAnswer: number;
  wrongAnswer: number;
}

// ==============================
// 🛠️ عملیات کمکی - ایجاد Request
// ==============================

// ==============================
// ⏱️ ردیابی تغییرات داده‌ها برای بکاپ
// ==============================
export const markDataModified = () => {
    try {
        localStorage.setItem('last_data_modification_time', Date.now().toString());
    } catch (e) {
        console.warn("Could not mark data as modified", e);
    }
};

export const requestToPromise = <T>(request: IDBRequest<T>): Promise<T> => {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => {
            const error = (event.target as IDBRequest).error;
            console.error("[DB Request] Request failed:", error);
            reject(error);
        };
    });
};

const getFormattedDate = (date: Date = new Date()): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// ==============================
// ⚙️ اولیه سازی پایگاه داده
// ==============================
export const initDB = (): Promise<IDBDatabase> => {
    if (db && db.version === DB_VERSION && db.objectStoreNames.contains(BOOKS_STORE_NAME) && db.objectStoreNames.contains(LEITNER_STORE_NAME) && db.objectStoreNames.contains(DAILY_ACTIVITY_STORE_NAME)) {
        return new Promise((resolve, reject) => {
            try {
                if (!db || db.readyState === 'closed') {
                    console.warn('[DB Init] DB instance was null or closed, reopening.');
                    db = null; dbOpeningPromise = null;
                    initDB().then(resolve).catch(reject);
                    return;
                }
                // Check connection with a dummy transaction
                const transaction = db.transaction(BOOKS_STORE_NAME, 'readonly');
                transaction.objectStore(BOOKS_STORE_NAME).count();
                transaction.oncomplete = () => resolve(db!);
                transaction.onerror = transaction.onabort = (event) => {
                    console.warn('[DB Init] Existing connection check failed, reopening:', (event.target as IDBTransaction).error);
                    db = null; dbOpeningPromise = null;
                    initDB().then(resolve).catch(reject);
                };
            } catch (e) {
                console.warn('[DB Init] Error during existing connection check (catch), reopening:', e);
                db = null; dbOpeningPromise = null;
                initDB().then(resolve).catch(reject);
            }
        });
    }

    if (dbOpeningPromise) return dbOpeningPromise;

    dbOpeningPromise = new Promise((resolve, reject) => {
        console.log(`[DB Open] Attempting to open IndexedDB ${DB_NAME} version ${DB_VERSION}`);
        if (db) { try { db.close(); } catch (e) { console.error("Error closing old DB:", e); } db = null; }

        const request = indexedDB.open(DB_NAME, DB_VERSION);
        const clearPromise = () => { dbOpeningPromise = null; };

        request.onerror = (event) => {
            console.error(`[DB Open] IndexedDB error opening ${DB_NAME}:`, request.error);
            clearPromise();
            reject(new Error(`Error opening IndexedDB: ${request.error?.message || 'Unknown error'}`));
        };

        request.onsuccess = (event) => {
            console.log(`[DB Open] IndexedDB ${DB_NAME} opened successfully with version ${DB_VERSION}`);
            const newlyOpenedDb = (event.target as IDBOpenDBRequest).result;
            db = newlyOpenedDb;
            newlyOpenedDb.onversionchange = () => { console.warn("[DB Event] Database version change requested elsewhere. Closing connection."); newlyOpenedDb.close(); db = null; };
            newlyOpenedDb.onclose = () => { console.log(`[DB Event] IndexedDB connection ${DB_NAME} closed.`); db = null; };
            newlyOpenedDb.onerror = (errorEvent) => { console.error("[DB Event] Unexpected error on DB connection:", (errorEvent.target as IDBDatabase).error); };
            clearPromise();
            resolve(newlyOpenedDb);
        };

        request.onupgradeneeded = (event) => {
            console.log(`[DB Upgrade] Upgrading IndexedDB ${DB_NAME} from version ${event.oldVersion} to ${event.newVersion}`);
            const dbInstance = (event.target as IDBOpenDBRequest).result;
            const transaction = (event.target as IDBOpenDBRequest).transaction;
            if (!transaction) return;

            // ✅ Force clear all books and leitner/favorites to apply global unique word IDs correctly
            if (event.oldVersion < 14) {
                const storesToClear = [BOOKS_STORE_NAME, FAVORITES_STORE_NAME, LEITNER_STORE_NAME, DAILY_ACTIVITY_STORE_NAME];
                storesToClear.forEach(storeName => {
                    if (dbInstance.objectStoreNames.contains(storeName)) {
                        try {
                            transaction.objectStore(storeName).clear();
                            console.log(`[DB Upgrade] Cleared store ${storeName} to force ID regeneration.`);
                        } catch (e) {
                            console.warn(`[DB Upgrade] Failed to clear store ${storeName}:`, e);
                        }
                    }
                });
            }

            const storesToEnsure: { name: string, options?: IDBObjectStoreParameters }[] = [
                { name: BOOKS_STORE_NAME, options: { keyPath: 'id' } },
                { name: FAVORITES_STORE_NAME, options: { keyPath: 'id' } },
                { name: LEITNER_STORE_NAME, options: { keyPath: 'wordID' } },
                { name: DAILY_ACTIVITY_STORE_NAME, options: { keyPath: 'id' } },
            ];

            storesToEnsure.forEach(storeInfo => {
                 if (!dbInstance.objectStoreNames.contains(storeInfo.name)) {
                     dbInstance.createObjectStore(storeInfo.name, storeInfo.options);
                 }
            });

            try {
                if (dbInstance.objectStoreNames.contains(LEITNER_STORE_NAME)) {
                    const leitnerStore = transaction.objectStore(LEITNER_STORE_NAME);
                    const requiredIndexes: { name: string; keyPath: string | string[]; options?: IDBIndexParameters }[] = [
                        { name: 'by_bookId_level', keyPath: ['bookId', 'boxLevel'] },
                        { name: 'by_nextReviewDate', keyPath: 'nextReviewDate' },
                        { name: 'by_bookId', keyPath: 'bookId' },
                        { name: 'by_bookId_archived', keyPath: ['bookId', 'isArchived'], options: { unique: false } },
                        { name: 'by_archived_nextReviewDate', keyPath: ['isArchived', 'nextReviewDate'], options: { unique: false } }
                    ];

                    requiredIndexes.forEach(indexInfo => {
                        // Recreate index if needed by deleting old one first in version upgrade (implicitly handled by IDB usually if logic differs, but here we just ensure existence)
                        if (!leitnerStore.indexNames.contains(indexInfo.name)) {
                            leitnerStore.createIndex(indexInfo.name, indexInfo.keyPath, indexInfo.options);
                        }
                    });
                }
            } catch(e) { console.error(`[DB Upgrade] Error accessing ${LEITNER_STORE_NAME}:`, e); }

            try {
                if (dbInstance.objectStoreNames.contains(DAILY_ACTIVITY_STORE_NAME)) {
                     const activityStore = transaction.objectStore(DAILY_ACTIVITY_STORE_NAME);
                     const requiredIndexes: { name: string; keyPath: string | string[]; options?: IDBIndexParameters }[] = [
                          { name: 'by_bookId_date', keyPath: ['bookId', 'date'], options: { unique: false } },
                          { name: 'by_date', keyPath: 'date', options: { unique: false } }
                     ];
                     requiredIndexes.forEach(indexInfo => {
                          if (!activityStore.indexNames.contains(indexInfo.name)) {
                              activityStore.createIndex(indexInfo.name, indexInfo.keyPath, indexInfo.options);
                          }
                     });
                 }
            } catch (e) { console.error(`[DB Upgrade] Error accessing ${DAILY_ACTIVITY_STORE_NAME}:`, e); }
        };

        request.onblocked = () => {
             alert(i18n.t('db.closeTabs', { defaultValue: 'لطفاً سایر تب‌های باز این برنامه را ببندید و دوباره تلاش کنید.' }));
             clearPromise();
             reject(new Error("Database opening blocked"));
        };
    });
    return dbOpeningPromise;
};

// ==============================
// 🔄 عملیات کمکی - تراکنش
// ==============================
export const performTransaction = <T>(
    storeName: string | string[],
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore | Record<string, IDBObjectStore>) => Promise<T> | T
): Promise<T> => {
    let dbInstance: IDBDatabase;
    return initDB().then(currentDbInstance => {
        dbInstance = currentDbInstance;
        return new Promise<T>((resolve, reject) => {
            let transaction: IDBTransaction;
            const storeNames = Array.isArray(storeName) ? storeName : [storeName];
            try {
                transaction = dbInstance.transaction(storeNames, mode);
            } catch (e: any) {
                return reject(new Error(`Tx creation failed: ${e.message}`));
            }

            const storeArg = storeNames.length === 1
                ? transaction.objectStore(storeNames[0])
                : storeNames.reduce((acc, name) => {
                    acc[name] = transaction.objectStore(name); return acc;
                    }, {} as Record<string, IDBObjectStore>);

            // ✅ Key Fix: Wait for oncomplete for readwrite transactions to ensure persistence
            let operationResult: T;

            transaction.oncomplete = () => {
                if (mode === 'readwrite') {
                    // Only resolve here if we haven't rejected yet
                    resolve(operationResult);
                }
            };

            transaction.onerror = (event) => reject((event.target as IDBTransaction)?.error || new Error(`Transaction error`));
            transaction.onabort = (event) => reject((event.target as IDBTransaction)?.error || new Error(`Transaction aborted`));

            Promise.resolve()
                .then(() => operation(storeArg))
                .then((res) => {
                    operationResult = res;
                    // If readonly, we can resolve immediately (or wait for oncomplete, but immediately is faster for reads)
                    if (mode === 'readonly') {
                        resolve(res);
                    }
                    // If readwrite, we wait for oncomplete above
                })
                .catch(reject);
        });
    });
};

// ==============================
// 📘 توابع مدیریت کتاب (BOOKS)
// ==============================
export const saveBook = (id: string, data: Blob, metadata?: any): Promise<void> =>
    performTransaction(BOOKS_STORE_NAME, 'readwrite', (store) =>
        requestToPromise((store as IDBObjectStore).put({ id, data, metadata })).then(() => { markDataModified(); })
    );

export const getBook = (id: string): Promise<Blob | null> =>
    performTransaction(BOOKS_STORE_NAME, 'readonly', (store) =>
        requestToPromise<{ id: string, data: Blob, metadata?: any } | undefined>((store as IDBObjectStore).get(id))
            .then(result => result ? result.data : null)
    );

export const getDownloadedBookIds = (): Promise<string[]> =>
    performTransaction(BOOKS_STORE_NAME, 'readonly', (store) =>
        requestToPromise( (store as IDBObjectStore).getAllKeys() ).then(keys => keys as string[])
    );

export const deleteBook = (id: string): Promise<void> =>
    performTransaction(BOOKS_STORE_NAME, 'readwrite', (store) =>
        requestToPromise((store as IDBObjectStore).delete(id)).then(() => { })
    );

export const getBooks = (): Promise<{ id: string; blob: Blob; title: string; coverImage?: string }[]> =>
    performTransaction(BOOKS_STORE_NAME, 'readonly', (store) =>
        requestToPromise((store as IDBObjectStore).getAll())
    ).then((blobs: {id: string, data: Blob}[]) => {
         return blobs.map(item => ({ id: item.id, blob: item.data, title: item.id }));
    });

// ==============================
// 🧠 توابع کلمات (WORDS)
// ==============================
export const getWords = async (bookId: string): Promise<Word[]> => {
    const blob = await getBook(bookId);
    if (!blob) return [];
    try {
        const text = await blob.text();
        const data = JSON.parse(text) as BookData;
        const allWords: Word[] = [];
        data.forEach(lesson => {
            if (lesson.listWord) {
                allWords.push(...lesson.listWord);
            }
        });
        return allWords;
    } catch (e) {
        return [];
    }
};

// ==============================
// ⭐️ توابع مدیریت کلمات مورد علاقه (FAVORITES)
// ==============================
export const addFavorite = (word: Word): Promise<void> =>
    performTransaction([FAVORITES_STORE_NAME, LEITNER_STORE_NAME], 'readwrite', async (stores) => {
        const favStore = (stores as Record<string, IDBObjectStore>)[FAVORITES_STORE_NAME];
        const leitnerStore = (stores as Record<string, IDBObjectStore>)[LEITNER_STORE_NAME];

        await requestToPromise(favStore.put(word));
        markDataModified();

        try {
            const item = await requestToPromise<LeitnerItem | undefined>(leitnerStore.get(word.wordID));
            if (item) {
                item.isFavorite = true;
                await requestToPromise(leitnerStore.put(item));
            } else {
                const newItem: LeitnerItem = {
                    wordID: word.wordID,
                    bookId: String(word.bookId),
                    boxLevel: 0, // Unread state
                    nextReviewDate: 0,
                    isArchived: false,
                    isFavorite: true
                };
                await requestToPromise(leitnerStore.put(newItem));
            }
        } catch (e) {
            console.warn("Could not sync favorite to Leitner:", e);
        }
    });

export const removeFavorite = (wordId: string): Promise<void> =>
    performTransaction([FAVORITES_STORE_NAME, LEITNER_STORE_NAME], 'readwrite', async (stores) => {
        const favStore = (stores as Record<string, IDBObjectStore>)[FAVORITES_STORE_NAME];
        const leitnerStore = (stores as Record<string, IDBObjectStore>)[LEITNER_STORE_NAME];

        await requestToPromise(favStore.delete(wordId));
        markDataModified();

        try {
            const item = await requestToPromise<LeitnerItem | undefined>(leitnerStore.get(wordId));
            if (item) {
                item.isFavorite = false;
                if (item.boxLevel === 0 && !item.isArchived) {
                    await requestToPromise(leitnerStore.delete(wordId));
                } else {
                    await requestToPromise(leitnerStore.put(item));
                }
            }
        } catch (e) {
            console.warn("Could not sync favorite removal to Leitner:", e);
        }
    });

export const getFavorites = (): Promise<Word[]> =>
    performTransaction(FAVORITES_STORE_NAME, 'readonly', (store) =>
        requestToPromise((store as IDBObjectStore).getAll())
            .then(results => (results as Word[]) || [])
    );

export const getAllFavorites = getFavorites;

export const getFavoriteItems = (): Promise<LeitnerItem[]> =>
    performTransaction(LEITNER_STORE_NAME, 'readonly', (store) => {
         return requestToPromise((store as IDBObjectStore).getAll()).then((items: LeitnerItem[]) => {
             return items.filter(i => i.isFavorite && !i.isArchived);
         });
    });

// ==============================
// 🧠 توابع سیستم لایتنر (LEITNER)
// ==============================
export const addWordsToLeitner = async (bookId: string, words: Word[]): Promise<void> => {
    return performTransaction(LEITNER_STORE_NAME, 'readwrite', (store) => {
        const objectStore = store as IDBObjectStore;
        const now = Date.now();
        let addedCount = 0;

        console.log(`[DB] Adding ${words.length} words to Leitner for book ${bookId}`);

        // Use a more robust batch addition that doesn't rely on 'await' loops inside transaction setup
        const promises = words.map(word => {
            const newItem: LeitnerItem = {
                wordID: word.wordID,
                bookId: String(bookId),
                boxLevel: 0,
                nextReviewDate: now,
                isArchived: false
            };
            return new Promise<void>((resolve, reject) => {
                // Use add() which fails if key exists, avoiding read-before-write
                const request = objectStore.add(newItem);
                request.onsuccess = () => {
                    addedCount++;
                    resolve();
                };
                request.onerror = (e) => {
                    const error = (e.target as IDBRequest).error;
                    // Ignore ConstraintError (duplicate key), reject others
                    if (error && error.name === 'ConstraintError') {
                        e.preventDefault(); // Prevent transaction abort
                        e.stopPropagation();
                        resolve();
                    } else {
                        console.error("Leitner add error:", error);
                        // We choose to swallow errors to ensure partial success
                        e.preventDefault();
                        resolve();
                    }
                };
            });
        });

        return Promise.all(promises).then(() => {
            if (addedCount > 0) markDataModified();
            console.log(`[DB] Successfully added/verified ${addedCount} new words to Leitner.`);
        });
    });
};

export const updateLeitnerItem = (item: LeitnerItem): Promise<void> =>
    performTransaction(LEITNER_STORE_NAME, 'readwrite', (store) =>
        requestToPromise((store as IDBObjectStore).put(item)).then(() => { markDataModified(); })
    );

export const getLeitnerItem = (wordID: string): Promise<LeitnerItem | undefined> =>
    performTransaction(LEITNER_STORE_NAME, 'readonly', (store) =>
        requestToPromise((store as IDBObjectStore).get(wordID))
    );

export const getLeitnerStatsForBook = (bookId: string): Promise<{ [level: number]: number }> => {
    return performTransaction(LEITNER_STORE_NAME, 'readonly', (store) => {
        return new Promise((resolve, reject) => {
            const stats: { [level: number]: number } = {};
            const index = (store as IDBObjectStore).index('by_bookId_level');
            const range = IDBKeyRange.bound([bookId, 0], [bookId, 10]);
            const request = index.openCursor(range);

            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;
                if (cursor) {
                    const item = cursor.value as LeitnerItem;
                    if (!item.isArchived) {
                        stats[item.boxLevel] = (stats[item.boxLevel] || 0) + 1;
                    }
                    cursor.continue();
                } else {
                    resolve(stats);
                }
            };
            request.onerror = (event) => reject((event.target as IDBRequest).error);
        });
    });
};

export const getDueReviewItems = (): Promise<LeitnerItem[]> => {
    return performTransaction(LEITNER_STORE_NAME, 'readonly', (store) => {
        return new Promise((resolve) => {
            try {
                const index = (store as IDBObjectStore).index('by_archived_nextReviewDate');
                const now = Date.now();
                const range = IDBKeyRange.upperBound([false, now]);
                const request = index.getAll(range);

                request.onsuccess = (event) => {
                    try {
                        const result = (event.target as IDBRequest<LeitnerItem[]>).result;
                        const finalResult = (Array.isArray(result) ? result : []).filter(item => !item.isArchived);
                        resolve(finalResult);
                    } catch (e) { resolve([]); }
                };
                request.onerror = () => resolve([]);
            } catch { resolve([]); }
        });
    });
};

export const getNewItemsForBook = (bookId: string, limit: number): Promise<LeitnerItem[]> => {
    if (limit <= 0) return Promise.resolve([]);
    return performTransaction(LEITNER_STORE_NAME, 'readonly', (store) => {
        return new Promise((resolve, reject) => {
            const items: LeitnerItem[] = [];
            try {
                const index = (store as IDBObjectStore).index('by_bookId_level');
                const range = IDBKeyRange.only([bookId, 0]);
                const request = index.openCursor(range);
                request.onsuccess = (event) => {
                    const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;
                    if (cursor && items.length < limit) {
                        const item = cursor.value as LeitnerItem;
                        if (!item.isArchived) items.push(item);
                        cursor.continue();
                    } else {
                        resolve(items);
                    }
                };
                request.onerror = (event) => reject((event.target as IDBRequest).error);
            } catch (e) { reject(e); }
        });
    });
};

export const getNewLeitnerItemCountForBook = (bookId: string): Promise<number> => {
    return performTransaction(LEITNER_STORE_NAME, 'readonly', (store) => {
        return new Promise<number>((resolve, reject) => {
            let count = 0;
            try {
                const index = (store as IDBObjectStore).index('by_bookId_level');
                const range = IDBKeyRange.only([bookId, 0]);
                const request = index.openCursor(range);
                request.onsuccess = (event) => {
                    const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;
                    if (cursor) {
                        const item = cursor.value as LeitnerItem;
                        if (!item.isArchived) count++;
                        cursor.continue();
                    } else {
                        resolve(count);
                    }
                };
                request.onerror = (event) => reject((event.target as IDBRequest).error);
            } catch (e) { reject(e); }
        });
    });
};

export const getArchivedItems = (): Promise<LeitnerItem[]> => {
    return performTransaction(LEITNER_STORE_NAME, 'readonly', (store) => {
        return new Promise((resolve) => {
            try {
                const index = (store as IDBObjectStore).index('by_archived_nextReviewDate');
                const rangeBoolean = IDBKeyRange.bound([true, -Infinity], [true, Infinity]);
                const request = index.getAll(rangeBoolean);
                request.onsuccess = (event) => {
                    resolve((event.target as IDBRequest<LeitnerItem[]>).result || []);
                };
                request.onerror = () => resolve([]);
            } catch { resolve([]); }
        });
    });
};

export const getArchivedWordsWithDetails = async (): Promise<(LeitnerItem & { wordDetails?: Word })[]> => {
    try {
        const archivedItems = await getArchivedItems();
        if (archivedItems.length === 0) return [];
        const bookIds = Array.from(new Set(archivedItems.map(i => i.bookId)));
        const wordMap = new Map<string, Word>();
        for (const bookId of bookIds) {
            const blob = await getBook(bookId);
            if (blob) {
                try {
                    const text = await blob.text();
                    const lessons = JSON.parse(text) as BookData;
                    lessons.forEach(lesson => {
                        lesson.listWord.forEach(word => wordMap.set(word.wordID, word));
                    });
                } catch { }
            }
        }
        return archivedItems.map(item => ({ ...item, wordDetails: wordMap.get(item.wordID) }));
    } catch { return []; }
};

// ==============================
// 📊 توابع آمار روزانه (DAILY ACTIVITY)
// ==============================
export const getDailyActivity = (bookId: string, date: string = getFormattedDate()): Promise<DailyActivity> => {
    const activityId = `${bookId}_${date}`;
    return performTransaction<DailyActivity | undefined>(DAILY_ACTIVITY_STORE_NAME, 'readonly', (store) =>
        requestToPromise((store as IDBObjectStore).get(activityId))
    ).then(activity => activity || { id: activityId, bookId, date, correctAnswer: 0, wrongAnswer: 0 });
};

export const updateDailyActivity = async (bookId: string, isCorrect: boolean, date: string = getFormattedDate()): Promise<void> => {
    const activityId = `${bookId}_${date}`;
    return performTransaction(DAILY_ACTIVITY_STORE_NAME, 'readwrite', async (store) => {
        const objectStore = store as IDBObjectStore;
        let currentActivity: DailyActivity;
        try {
            const existing = await requestToPromise<DailyActivity | undefined>(objectStore.get(activityId));
            currentActivity = existing || { id: activityId, bookId, date, correctAnswer: 0, wrongAnswer: 0 };
        } catch {
            currentActivity = { id: activityId, bookId, date, correctAnswer: 0, wrongAnswer: 0 };
        }
        if (isCorrect) currentActivity.correctAnswer += 1;
        else currentActivity.wrongAnswer += 1;
        await requestToPromise(objectStore.put(currentActivity));
        markDataModified();
    });
};

export const getTodayAnsweredCountForBook = (bookId: string, date: string = getFormattedDate()): Promise<number> => {
     return getDailyActivity(bookId, date).then(activity => activity.correctAnswer + activity.wrongAnswer);
};

export const getAllDailyActivities = (): Promise<DailyActivity[]> =>
    performTransaction(DAILY_ACTIVITY_STORE_NAME, 'readonly', (store) =>
        requestToPromise((store as IDBObjectStore).getAll())
            .then(results => (results as DailyActivity[]) || [])
    );

// ==============================
// 🧹 توابع پاکسازی حافظه
// ==============================
export const resetLeitnerDataForBook = (bookId: string): Promise<void> => {
     return performTransaction(LEITNER_STORE_NAME, 'readwrite', (store) => {
         return new Promise((resolve, reject) => {
             const index = (store as IDBObjectStore).index('by_bookId');
             const request = index.openKeyCursor(IDBKeyRange.only(bookId));
             const deletePromises: Promise<void>[] = [];
             request.onsuccess = (event) => {
                 const cursor = (event.target as IDBRequest<IDBCursor | null>).result;
                 if (cursor) {
                     deletePromises.push(requestToPromise((store as IDBObjectStore).delete(cursor.primaryKey)).then(() => {}));
                     cursor.continue();
                 } else {
                     Promise.all(deletePromises).then(() => resolve()).catch(reject);
                 }
             };
             request.onerror = (event) => reject((event.target as IDBRequest).error);
         });
     });
};

export const resetAllLeitnerData = (): Promise<void> =>
    performTransaction(LEITNER_STORE_NAME, 'readwrite', (store) =>
        requestToPromise((store as IDBObjectStore).clear()).then(() => { })
    );

export const deleteBookAndRelatedData = async (bookId: string): Promise<void> => {
    const storeNames = [BOOKS_STORE_NAME, LEITNER_STORE_NAME, DAILY_ACTIVITY_STORE_NAME];
    return performTransaction(storeNames, 'readwrite', async (stores) => {
        const {
            [BOOKS_STORE_NAME]: booksStore,
            [LEITNER_STORE_NAME]: leitnerStore,
            [DAILY_ACTIVITY_STORE_NAME]: activityStore
        } = stores as Record<string, IDBObjectStore>;
        const deletePromises: Promise<any>[] = [];
        deletePromises.push(requestToPromise(booksStore.delete(bookId)));

        deletePromises.push(new Promise((resolve, reject) => {
             try {
                 const index = leitnerStore.index('by_bookId');
                 const request = index.openKeyCursor(IDBKeyRange.only(bookId));
                 const itemDeletePromises: Promise<void>[] = [];
                 request.onsuccess = (event) => {
                     const cursor = (event.target as IDBRequest<IDBCursor | null>).result;
                     if (cursor) {
                         itemDeletePromises.push(requestToPromise(leitnerStore.delete(cursor.primaryKey)).then(()=>{}));
                         cursor.continue();
                     } else { Promise.all(itemDeletePromises).then(resolve).catch(reject); }
                 };
                 request.onerror = (event) => reject((event.target as IDBRequest).error);
             } catch (e) { reject(e); }
        }));

        deletePromises.push(new Promise((resolve, reject) => {
            try {
                 const index = activityStore.index('by_bookId_date');
                 const range = IDBKeyRange.bound([bookId, ''], [bookId, '\uffff']);
                 const request = index.openKeyCursor(range);
                 const activityDeletePromises: Promise<void>[] = [];
                 request.onsuccess = (event) => {
                     const cursor = (event.target as IDBRequest<IDBCursor | null>).result;
                     if (cursor) {
                         activityDeletePromises.push(requestToPromise(activityStore.delete(cursor.primaryKey)).then(()=>{}));
                         cursor.continue();
                     } else { Promise.all(activityDeletePromises).then(resolve).catch(reject); }
                 };
                 request.onerror = (event) => reject((event.target as IDBRequest).error);
             } catch(e) { reject(e); }
        }));

        await Promise.all(deletePromises);
    });
};
export { deleteBookAndRelatedData as deleteBookAndLeitnerData };

export const deleteAllBooks = (): Promise<void> => {
    const storeNames = [BOOKS_STORE_NAME, LEITNER_STORE_NAME, DAILY_ACTIVITY_STORE_NAME];
    return performTransaction(storeNames, 'readwrite', async (stores) => {
        const {
            [BOOKS_STORE_NAME]: booksStore,
            [LEITNER_STORE_NAME]: leitnerStore,
            [DAILY_ACTIVITY_STORE_NAME]: activityStore
        } = stores as Record<string, IDBObjectStore>;
        await Promise.all([
            requestToPromise(booksStore.clear()),
            requestToPromise(leitnerStore.clear()),
            requestToPromise(activityStore.clear())
        ]);
    });
};

export const clearDailyHistory = (): Promise<void> => {
    return performTransaction(DAILY_ACTIVITY_STORE_NAME, 'readwrite', (store) =>
        requestToPromise((store as IDBObjectStore).clear())
    );
};

export const clearFavorites = (): Promise<void> => {
    return performTransaction(FAVORITES_STORE_NAME, 'readwrite', (store) =>
        requestToPromise((store as IDBObjectStore).clear())
    );
};

export const getBooksMetadata = async (): Promise<{ id: string; title: string; totalWords: number; image?: string; metadata?: any }[]> => {
    try {
        // Updated to use getAll() instead of cursor to avoid 'TransactionInactiveError' caused by awaiting inside cursor callback
        return performTransaction(BOOKS_STORE_NAME, 'readonly', async (store) => {
             const allRecords = await requestToPromise((store as IDBObjectStore).getAll());
             const results: { id: string; title: string; totalWords: number; image?: string; metadata?: any }[] = [];

             for (const item of allRecords) {
                 const id = item.id;
                 const blob = item.data;
                 const metadata = item.metadata;

                 // If metadata is saved along with the blob, we use the title/image from it if possible
                 let title = metadata?.title || id;
                 let image = metadata?.image;
                 let totalWords = 0;

                 try {
                     const text = await blob.text();
                     const data = JSON.parse(text) as BookData;
                     if (!metadata?.title) {
                         title = data[0]?.bookName || data[0]?.title || title;
                     }
                     if (!metadata?.image) {
                         image = data[0]?.image || image;
                     }
                     totalWords = data.reduce((acc: any, lesson: any) => acc + (lesson.listWord?.length || 0), 0);
                     results.push({ id, title, totalWords, image, metadata });
                 } catch (e) {
                     console.warn("Error parsing book metadata", id, e);
                     results.push({ id, title, totalWords, image, metadata });
                 }
             }
             return results;
        });
    } catch { return []; }
};
