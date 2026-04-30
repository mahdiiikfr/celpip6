import {
    BackupData,
    CURRENT_VERSION,
    BoxType,
    CardSourceType,
    LeitnerCard,
    LeitnerBox,
    WordActivity,
    DayLessonProgress,
    DataDay,
    DayLessonActivity,
    DayLessonActivityVersion,
    BookActivity,
    BookActivityInfo,
    FavoriteWord,
    StudiedWord,
    LeitnerCustomCard
} from './backupModels';
import { getAllDailyActivities, performTransaction, requestToPromise, LEITNER_STORE_NAME, DAILY_ACTIVITY_STORE_NAME, FAVORITES_STORE_NAME, getBook, getDownloadedBookIds, deleteAllBooks, clearFavorites, getAllFavorites } from './db';
import { fetchBooksList } from './api';
import { RemoteBook, downloadAndSaveBook } from './bookService';
import { BOOKS_STORE_NAME } from './db';
import { ApiBook, BookData } from '@/types/book';

// Date utility to format YYYY/MM/DD
function getCurrentDateFormatted(): string {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
}

function timestampToDateString(ts: number): string {
    if (!ts || ts === 0) return getCurrentDateFormatted();
    const d = new Date(ts);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
}

async function getLeitnerItems(): Promise<any[]> {
    return performTransaction(LEITNER_STORE_NAME, 'readonly', async (store) => {
        const items = await requestToPromise((store as IDBObjectStore).getAll());
        return items || [];
    });
}

async function getBookMappings(): Promise<{ idToName: Map<string, number>, nameToId: Map<number, string> }> {
    const idToName = new Map<string, number>();
    const nameToId = new Map<number, string>();

    try {
        const { ok, envelope } = await fetchBooksList<ApiBook[]>();
        const booksData = Array.isArray(envelope.Data) ? envelope.Data : (envelope as any)?.data || [];

        if (ok && Array.isArray(booksData)) {
            booksData.forEach((item: any) => {
                const id = String(item.id || item.Id);
                const bookName = Number(item.bookName || 0);
                if (id && bookName) {
                    idToName.set(id, bookName);
                    nameToId.set(bookName, id);
                }
            });
        }
    } catch (e) {
        console.warn("[Backup Converter] API Fetch failed, mapping might be incomplete.", e);
    }

    // Fallback to local DB metadata to ensure mapping is complete if offline
    try {
        const localBooks = await performTransaction(BOOKS_STORE_NAME, 'readonly', async (store) => {
            return requestToPromise((store as IDBObjectStore).getAll());
        });

        if (Array.isArray(localBooks)) {
            localBooks.forEach(item => {
                const id = String(item.id);
                const bookName = Number(item.metadata?.bookName || 0);
                if (id && bookName && !idToName.has(id)) {
                    idToName.set(id, bookName);
                    nameToId.set(bookName, id);
                }
            });
        }
    } catch(e) {
         console.warn("[Backup Converter] Error reading local books metadata for mapping", e);
    }

    return { idToName, nameToId };
}

export async function createBackupDataPayload(): Promise<BackupData> {
    // 0. Fetch Book mappings
    const { idToName } = await getBookMappings();

    // 1. Fetch data from local IndexedDB
    const activeLeitner = await getLeitnerItems(); // We implement locally
    const activeFavorites = await getAllFavorites();
    const dailyActivities = await getAllDailyActivities();

    // 2. Map Leitner Items to LeitnerCard & LeitnerBox
    const leitnerCards: LeitnerCard[] = [];
    const leitnerBoxes: LeitnerBox[] = [];
    const favoriteWords: FavoriteWord[] = [];

    const studiedWords: StudiedWord[] = [];
    const addedStudiedWordIds = new Set<string>();


    const uniqueBookIds = new Set<number>();

    // Add default favorites box
    leitnerBoxes.push({
        versionAware: CURRENT_VERSION,
        id: 1, // Favorites box ID is 1 according to logic
        name: "Favorites",
        boxType: BoxType.FAVORITES,
        bookName: null,
        description: "باکس لغات مورد علاقه",
        createdDate: getCurrentDateFormatted(),
        colorHex: "#FFD700"
    });

    let cardIdCounter = 1;
    let favIdCounter = 1;

    // A set to keep track of words we've added to favorites to avoid duplicates between Leitner Store and Favorites Store
    const addedFavoriteWordIds = new Set<string>();

    activeLeitner.forEach((item: any) => {
        let localBookIdStr = String(item.bookId || "0");
        const wordIdStr = item.wordID.toString();
        // In Android backup, wordId is an integer, so we must parse it, but if it has dashes from web generation
        // e.g., "123-1-1" or "2131951670_13", we extract bookId and wordId properly.
        let wordIdNum = parseInt(wordIdStr, 10);

        if (wordIdStr.includes('_')) {
            const parts = wordIdStr.split('_');
            if (parts.length >= 2) {
                localBookIdStr = parts[0];
                const parsedEnd = parseInt(parts[parts.length - 1], 10);
                if (!isNaN(parsedEnd)) wordIdNum = parsedEnd;
            }
        } else if (wordIdStr.includes('-')) {
            const parts = wordIdStr.split('-');
            const parsedEnd = parseInt(parts[parts.length - 1], 10);
            if (!isNaN(parsedEnd)) {
                wordIdNum = parsedEnd;
            }
        }

        if (isNaN(wordIdNum)) wordIdNum = 0;

        // Map local bookId to numeric bookName for export payload
        const bookIdNum = idToName.get(localBookIdStr) || parseInt(localBookIdStr, 10) || 0;

        uniqueBookIds.add(bookIdNum);

        const studiedCompositeKey = `${bookIdNum}_${wordIdNum}`;

        // If it has been studied (moved past box 0)
        if (item.boxLevel > 0 || item.isArchived) {
            if (!addedStudiedWordIds.has(studiedCompositeKey)) {
                addedStudiedWordIds.add(studiedCompositeKey);
                studiedWords.push({
                    versionAware: CURRENT_VERSION,
                    id: favIdCounter++,
                    wordID: wordIdNum,
                    bookName: bookIdNum,
                    createDate: getCurrentDateFormatted(),
                });
            }
        }

        // If it's a favorite, push to FavoriteWord
        if (item.isFavorite) {
            addedFavoriteWordIds.add(`${bookIdNum}_${wordIdNum}`);
            favoriteWords.push({
                versionAware: CURRENT_VERSION,
                id: favIdCounter++,
                wordID: wordIdNum,
                bookName: bookIdNum,
                createDate: getCurrentDateFormatted(),
            });
        }

        // Push the actual learning card
        if (item.boxLevel >= 0 || item.isArchived || item.isFavorite) {
            let cardState = item.boxLevel;
            if (item.isArchived) {
                cardState = 6;
            } else if (item.boxLevel === 0 && item.isFavorite) {
                cardState = 0; // Don't force state to 1 if it's just a favorite
            } else if (item.boxLevel === 0) {
                cardState = 0; // Unread box is 0
            }

            leitnerCards.push({
                versionAware: CURRENT_VERSION,
                id: cardIdCounter++,
                boxId: (item.isFavorite && item.boxLevel === 0) ? 1 : bookIdNum, // Map to favorites box if 0
                sourceType: CardSourceType.BOOK,
                state: cardState,
                dateOfNextExam: timestampToDateString(item.nextReviewDate),
                bookWordId: wordIdNum,
                bookName: bookIdNum, // Will use parsed book id rather than 0
                customCardId: null,
                correctCount: 0, // Not explicitly tracked in web DB per-word
                wrongCount: 0,
                lastReviewDate: null,
                addedDate: getCurrentDateFormatted(),
            });
        }
    });

    activeFavorites.forEach((favWord: any) => {
        let localBookIdStr = String(favWord.bookId || "0");
        let wordIdNum = parseInt(favWord.wordID, 10);

        // Dynamic ID resolution logic if wordID has dashes or underscores
        const wordIdStr = favWord.wordID.toString();
        if (wordIdStr.includes('_')) {
            const parts = wordIdStr.split('_');
            if (parts.length >= 2) {
                localBookIdStr = parts[0];
                const parsedEnd = parseInt(parts[parts.length - 1], 10);
                if (!isNaN(parsedEnd)) wordIdNum = parsedEnd;
            }
        } else if (wordIdStr.includes('-')) {
            const parts = wordIdStr.split('-');
            const parsedEnd = parseInt(parts[parts.length - 1], 10);
            if (!isNaN(parsedEnd)) {
                wordIdNum = parsedEnd;
            }
        }

        if (isNaN(wordIdNum)) wordIdNum = 0;

        // Map local bookId to numeric bookName for export payload
        const bookIdNum = idToName.get(localBookIdStr) || parseInt(localBookIdStr, 10) || 0;

        const compositeKey = `${bookIdNum}_${wordIdNum}`;
        if (!addedFavoriteWordIds.has(compositeKey)) {
            addedFavoriteWordIds.add(compositeKey);
            favoriteWords.push({
                versionAware: CURRENT_VERSION,
                id: favIdCounter++,
                wordID: wordIdNum,
                bookName: bookIdNum,
                createDate: getCurrentDateFormatted(),
            });

            leitnerCards.push({
                versionAware: CURRENT_VERSION,
                id: cardIdCounter++,
                boxId: 1, // Map to favorites box if it's purely a standalone favorite
                sourceType: CardSourceType.BOOK,
                state: 0, // Unread state
                dateOfNextExam: getCurrentDateFormatted(),
                bookWordId: wordIdNum,
                bookName: bookIdNum,
                customCardId: null,
                correctCount: 0,
                wrongCount: 0,
                lastReviewDate: null,
                addedDate: getCurrentDateFormatted(),
            });
        }
    });

    // Create DEFAULT boxes for each unique book
    uniqueBookIds.forEach(bookId => {
        if (bookId !== 0 && !isNaN(bookId)) {
            leitnerBoxes.push({
                versionAware: CURRENT_VERSION,
                id: bookId,
                name: bookId.toString(), // or real name if we have it
                boxType: BoxType.DEFAULT,
                bookName: bookId,
                description: "باکس پیش‌فرض",
                createdDate: getCurrentDateFormatted(),
                colorHex: null
            });
        }
    });

    // 3. Map Daily Activities to WordActivity (and DayLessonProgress approximation)
    const wordActivities: WordActivity[] = [];
    const dayLessonProgress: DayLessonProgress[] = [];
    const bookActivities: BookActivity[] = [];

    let activityIdCounter = 1;
    let bookActivityIdCounter = 1;

    dailyActivities.forEach((act: any) => {
        // DailyActivity id in web app might be structured as `bookId_wordId_date`
        // We must properly parse this and use a valid wordId.
        let localBookIdStr = String(act.bookId);
        let actualWordId = -1;

        // Try to extract from the key
        if (localBookIdStr.includes('_')) {
            const parts = localBookIdStr.split('_');
            if (parts.length >= 2) {
                localBookIdStr = parts[0];
                const parsedWord = parseInt(parts[1], 10);
                if (!isNaN(parsedWord)) actualWordId = parsedWord;
            }
        }

        let bookIdNum = idToName.get(localBookIdStr);
        if (bookIdNum === undefined) {
             bookIdNum = (localBookIdStr === "daily" || localBookIdStr === "0")
                                ? -1
                                : (parseInt(localBookIdStr, 10) || -1);
        }

        // We synthesize WordActivity records
        for (let i = 0; i < (act.correctAnswer || 0); i++) {
            wordActivities.push({
                versionAware: CURRENT_VERSION,
                id: activityIdCounter++,
                wordId: actualWordId !== -1 ? actualWordId : 1,
                bookName: bookIdNum !== -1 ? bookIdNum : 1,
                date: act.date.replace(/-/g, '/'), // Local format YYYY-MM-DD to YYYY/MM/DD
                isCorrect: true,
                isStreakBonus: false,
                boxId: bookIdNum === -1 ? null : bookIdNum,
                cardId: null
            });
        }
        for (let i = 0; i < (act.wrongAnswer || 0); i++) {
            wordActivities.push({
                versionAware: CURRENT_VERSION,
                id: activityIdCounter++,
                wordId: actualWordId !== -1 ? actualWordId : 1,
                bookName: bookIdNum !== -1 ? bookIdNum : 1,
                date: act.date.replace(/-/g, '/'),
                isCorrect: false,
                isStreakBonus: false,
                boxId: bookIdNum === -1 ? null : bookIdNum,
                cardId: null
            });
        }

        // Also map to BookActivity to preserve streak metadata
            if (bookIdNum !== -1) {
                bookActivities.push({
                    versionAware: CURRENT_VERSION,
                    id: bookActivityIdCounter++,
                    bookName: bookIdNum,
                    date: act.date.replace(/-/g, '/'),
                    sumDictation: act.correctAnswer, // Proxy for total activities done
                    sumPronunciation: act.wrongAnswer
                });
            }
    });

    // Extract DayLessonProgress from localStorage if available
    try {
        const progressRaw = localStorage.getItem('dailyLesson_progress');
        if (progressRaw) {
            const parsed = JSON.parse(progressRaw);
            const addedDays = new Set<number>();

            for (const [dayStr, progress] of Object.entries(parsed)) {
                const dayId = parseInt(dayStr, 10);
                if (isNaN(dayId) || addedDays.has(dayId)) continue;

                addedDays.add(dayId);

                const p: any = progress;
                dayLessonProgress.push({
                    versionAware: CURRENT_VERSION,
                    day: dayId,
                    vocabulariesPosition: p.vocab ? 1 : 0,
                    vocabulariesSize: 1,
                    pronunciationsPosition: p.pronunciation ? 1 : 0,
                    pronunciationsSize: 1,
                    dictationsPosition: p.spelling ? 1 : 0,
                    dictationsSize: 1,
                    grammarPosition: 0,
                    grammarSize: 0,
                    readingPosition: p.reading ? 1 : 0,
                    readingSize: 1,
                    verbsPosition: p.verbs ? 1 : 0,
                    verbsSize: 1,
                    listeningPosition: p.listening ? 1 : 0,
                    listeningSize: 1,
                    finalQuizPosition: p.quiz ? 1 : 0,
                    finalQuizSize: 1,
                    endExamPosition: p.endExam ? 1 : 0,
                    endExamSize: 1,
                    videosWatched: false,
                    grammarVideoWatched: p.grammarVideo || false,
                    videoZero: false,
                    lastActivityDate: getCurrentDateFormatted(),
                    languageCode: "ENGLISH"
                });
            }
        }
    } catch(e) {
        console.error("Error parsing dailyLesson_progress", e);
    }

    return {
        listWord: [], // Empty per user doc
        listWordActivity: wordActivities,
        listDayLessonProgress: dayLessonProgress,
        listDayData: [],
        listDayLessonActivity: [],
        listDayLessonActivityVersion: [],
        listBookActivity: bookActivities,
        listBookActivityInfo: [],
        listFavoriteWord: favoriteWords,
        listStudiedWord: studiedWords,
        listLeitnerBox: leitnerBoxes,
        listLeitnerCard: leitnerCards,
        listLeitnerCustomCard: [],
    };
}

// Safely convert string date back to timestamp for DB
function parseDateToTimestamp(dateStr: string): number {
    if (!dateStr) return 0;
    // Android format is usually YYYY/MM/DD
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.getTime();
    }
    return 0;
}

export async function processRestoredBackupData(backupData: BackupData): Promise<boolean> {
    try {
        // 0. Fetch Book mappings
        const { nameToId } = await getBookMappings();

        // 1. Clear existing local data to avoid duplicates/conflicts.
        // This completely wipes books, Leitner cards, and daily activity.
        await deleteAllBooks();
        await clearFavorites();

        // 2. Restore Leitner Cards and Favorites into IndexedDB
        // NOTE: We do this AFTER step 2.5 (Ensure all necessary books are downloaded)
        // to guarantee we have mapping for Web word IDs, but logic here will wait to be merged lower.
        // Actually, we need mapping to save the EXACT word.wordID in LeitnerItems too,
        // otherwise Leitner DB will just have the integer ID which doesn't match the Web's word objects.
        // I will move the Leitner DB population below the book parsing step.

        // 2.5. Ensure all necessary books are downloaded
        const bookIdsToFetch = new Set<string>();

        // Helper to resolve bookName back to local bookId, fallback to the bookName itself if unknown
        const getLocalBookIdStr = (bookName: number | undefined | null) => {
             if (!bookName) return null;
             return nameToId.get(bookName) || String(bookName);
        };

        if (backupData.listFavoriteWord) {
            backupData.listFavoriteWord.forEach(fav => {
                const localId = getLocalBookIdStr(fav.bookName);
                if (localId) bookIdsToFetch.add(localId);
            });
        }

        if (backupData.listLeitnerCard) {
            backupData.listLeitnerCard.forEach(card => {
                const localId = getLocalBookIdStr(card.bookName);
                if (localId) bookIdsToFetch.add(localId);
            });
        }

        if (backupData.listWord) {
            backupData.listWord.forEach(word => {
                const localId = getLocalBookIdStr(word.bookName);
                if (localId) bookIdsToFetch.add(localId);
            });
        }

        if (bookIdsToFetch.size > 0) {
            try {
                const downloadedBookIds = await getDownloadedBookIds();
                // handle number vs string correctly
                const stringDownloadedBookIds = downloadedBookIds.map(id => id.toString());
                const missingBookIds = Array.from(bookIdsToFetch).filter(id => !stringDownloadedBookIds.includes(id));

                if (missingBookIds.length > 0) {
                    console.log(`[Backup] Missing books: ${missingBookIds.join(', ')}. Fetching book list...`);
                    try {
                        const { ok, envelope } = await fetchBooksList<any[]>();
                        const booksData = Array.isArray(envelope.Data) ? envelope.Data : (envelope as any)?.data || [];

                        if (ok && Array.isArray(booksData)) {
                            const apiBooks: RemoteBook[] = booksData.map((item: any) => ({
                                id: Number(item.id || item.Id),
                                title: item.titleFa || item.title || item.name || 'Unknown',
                                subTitle: item.subTitleFa || item.subTitle || '',
                                titleEn: item.titleEn || '',
                                subTitleEn: item.subTitleEn || '',
                                image: item.image || item.Image || '',
                                downloadUrl: item.link || item.file || item.File || '',
                                version: Number(item.version || item.Version || 1),
                                isLocked: item.isLock === true || item.isLock === "true",
                                languageCode: item.languageCode || 'English',
                                isShow: item.isShow === true || item.isShow === "true",
                                counterClick: Number(item.counterClick || 0),
                                priceCoin: Number(item.priceCoin || 0),
                                token: item.token || '',
                                localVersion: item.localVersion || '',
                                isPine: item.isPine === true || item.isPine === "true",
                                order: Number(item.order || 0),
                                contentType: item.contentType || '',
                                itemType: item.itemType || item.ItemType || '',
                                bookName: Number(item.bookName || 0),
                                bookSize: Number(item.bookSize || 0),
                                helpTitleFa: item.helpTitleFa || '',
                                helpTitleEn: item.helpTitleEn || '',
                                helpDescriptionFa: item.helpDescriptionFa || '',
                                helpDescriptionEn: item.helpDescriptionEn || '',
                                keyBook: item.keyBook || ''
                            }));

                            for (const missingId of missingBookIds) {
                                const remoteBook = apiBooks.find(b => b.id.toString() === missingId);
                                if (remoteBook && remoteBook.downloadUrl) {
                                    console.log(`[Backup] Auto-downloading book: ${remoteBook.title} (${missingId})`);
                                    await downloadAndSaveBook(remoteBook);
                                } else {
                                    console.warn(`[Backup] Could not find download URL for book ${missingId}`);
                                }
                            }
                        }
                    } catch (e) {
                        console.error("[Backup] Error downloading missing books during restore", e);
                    }
                }
            } catch (e) {
                console.error("[Backup] Error downloading missing books during restore", e);
            }
        }

        // Build global wordMap for both Favorites and Leitner Cards
        const wordMap = new Map<string, any>(); // Map mapping various possible ID formats to the actual Word object

        console.log(`[Backup Restore] Starting word mapping for ${bookIdsToFetch.size} books...`, Array.from(bookIdsToFetch));

        for (const bookId of bookIdsToFetch) {
            try {
                const blob = await getBook(bookId);
                if (blob) {
                    const text = await blob.text();
                    const lessons = JSON.parse(text) as BookData;

                    let totalWordsInBook = 0;

                    let flatWordIndex = 1;
                    lessons.forEach(lesson => {
                        lesson.listWord.forEach(word => {
                            totalWordsInBook++;
                            // 1. Direct exact match
                            wordMap.set(`${bookId}_${word.wordID}`, word);

                            // 2. Direct exact match with local bookId
                            wordMap.set(`${word.bookId}_${word.wordID}`, word);

                            // Extract the raw number if the ID is namespaced (e.g. "10058_13" -> "13")
                            let rawWordNum = word.wordID;
                            if (typeof word.wordID === 'string' && word.wordID.includes('_')) {
                                const parts = word.wordID.split('_');
                                rawWordNum = parts[parts.length - 1];
                                wordMap.set(`${bookId}_${rawWordNum}`, word);
                                wordMap.set(`${word.bookId}_${rawWordNum}`, word);
                            }

                            // 3. Fallback matching for Android backup index vs Flat Index
                            wordMap.set(`${bookId}_index_${flatWordIndex}`, word);
                            wordMap.set(`${word.bookId}_index_${flatWordIndex}`, word);

                            // 4. Fallback: just use the last part of the wordID if it's the web format (dashes)
                            if (typeof word.wordID === 'string' && word.wordID.includes('-')) {
                                const parts = word.wordID.split('-');
                                const lastPart = parts[parts.length - 1];
                                wordMap.set(`${bookId}_${lastPart}`, word);
                                wordMap.set(`${word.bookId}_${lastPart}`, word);
                            }

                            flatWordIndex++;
                        });
                    });

                    console.log(`[Backup Restore] Loaded book ${bookId} into wordMap. Total words: ${totalWordsInBook}`);
                } else {
                    console.warn(`[Backup Restore] getBook(${bookId}) returned null! Book might not be downloaded or is missing.`);
                }
            } catch (e) {
                console.warn(`[Backup Restore] Could not load book ${bookId} to map words for restore`, e);
            }
        }

        // Helper to resolve the correct Word object based on backup ID
        const resolveWord = (bookName: number | string, backupWordId: number | string) => {
            const localBookId = nameToId.get(Number(bookName)) || String(bookName);
            const directKey = `${localBookId}_${backupWordId}`;
            const indexKey = `${localBookId}_index_${backupWordId}`;

            let matchType = "None";

            // 1. Try exact match with the translated localBookId
            let wordObj = wordMap.get(directKey);
            if (wordObj) matchType = "Direct";

            // 2. Try the index match with the translated localBookId
            if (!wordObj) {
                wordObj = wordMap.get(indexKey);
                if (wordObj) matchType = "Index";
            }

            // 3. Try splitting backupWordId if it is a compound format from Web (rare in android backups, but possible)
            if (!wordObj) {
                 const parts = String(backupWordId).split('-');
                 if (parts.length > 0) {
                     const lastPart = parts[parts.length - 1];
                     wordObj = wordMap.get(`${localBookId}_${lastPart}`);
                     if (wordObj) matchType = "SplitDash";
                 }
            }

            console.log(`[Backup Restore] resolveWord(bookName: ${bookName}, localBookId: ${localBookId}, wordId: ${backupWordId}) -> Match: ${matchType}, Found Word: ${wordObj ? wordObj.word : 'NOT FOUND'}`);

            return wordObj;
        };

        // 2.6. Restore full word objects to FAVORITES_STORE_NAME
        const favoriteWordMap = new Map<string, boolean>();

        if (backupData.listFavoriteWord && backupData.listFavoriteWord.length > 0) {
            console.log(`[Backup Restore] Processing ${backupData.listFavoriteWord.length} favorite words...`);
            try {
                await performTransaction(FAVORITES_STORE_NAME, 'readwrite', async (store) => {
                    const putPromises: Promise<any>[] = [];
                    backupData.listFavoriteWord!.forEach(fav => {
                        const wordObj = resolveWord(fav.bookName, fav.wordID);

                        if (wordObj) {
                            // Fix old DB entries on the fly if word.wordID is not unique
                            // For example, if it's "1" and doesn't start with bookId, we force it to be unique so it doesn't overwrite
                            const isShortOrNumeric = /^\d+$/.test(wordObj.wordID) && wordObj.wordID.length < 5;
                            if (isShortOrNumeric && !wordObj.wordID.startsWith(`${String(wordObj.bookId)}_`)) {
                                console.log(`[Backup Restore] Dynamically prefixing favorite word ID: ${wordObj.wordID} -> ${String(wordObj.bookId)}_${wordObj.wordID}`);
                                wordObj.wordID = `${String(wordObj.bookId)}_${wordObj.wordID}`;
                                wordObj.id = wordObj.wordID; // Keep them synced
                            }

                            // Mark in favoriteWordMap using the CORRECT Web wordID and BookID
                            favoriteWordMap.set(`${String(wordObj.bookId)}_${wordObj.wordID}`, true);
                            favoriteWordMap.set(`${fav.bookName}_${wordObj.wordID}`, true);
                            console.log(`[Backup Restore] Saving favorite word: ${wordObj.word} (ID: ${wordObj.wordID})`);
                            putPromises.push(requestToPromise((store as IDBObjectStore).put(wordObj)));
                        } else {
                            console.warn(`[Backup Restore] Could not find full word object for favorite word ID ${fav.wordID} in book ${fav.bookName}`);
                            // Keep raw just in case
                            favoriteWordMap.set(`${fav.bookName}_${fav.wordID}`, true);
                        }
                    });
                    await Promise.all(putPromises);
                    console.log(`[Backup Restore] Successfully saved ${putPromises.length} favorite words to IndexedDB.`);
                });
            } catch (e) {
                console.error("[Backup Restore] Failed to restore favorite word objects", e);
            }
        }

        // 2.7. Restore Leitner Cards into IndexedDB
        if ((backupData.listLeitnerCard && backupData.listLeitnerCard.length > 0) || favoriteWordMap.size > 0) {
            console.log(`[Backup Restore] Processing ${backupData.listLeitnerCard?.length || 0} Leitner cards...`);

            // Dynamically find the favorite box ID if Android defined it differently than 1
            let favoriteBoxId = 1;
            if (backupData.listLeitnerBox) {
                const favBox = backupData.listLeitnerBox.find(b => b.boxType === BoxType.FAVORITES);
                if (favBox) {
                    favoriteBoxId = favBox.id;
                }
            }

            await performTransaction(LEITNER_STORE_NAME, 'readwrite', async (store) => {
                const putPromises: Promise<any>[] = [];
                const addedCards = new Set<string>();

                // First process cards
                if (backupData.listLeitnerCard) {
                    backupData.listLeitnerCard.forEach(card => {
                        if (card.sourceType === CardSourceType.BOOK && card.bookName != null && card.bookWordId != null) {

                            const wordObj = resolveWord(card.bookName, card.bookWordId);
                            let actualWordId = wordObj ? wordObj.wordID : card.bookWordId.toString();
                            const actualBookId = wordObj ? String(wordObj.bookId) : getLocalBookIdStr(card.bookName) || String(card.bookName);

                            // Apply same dynamic prefixing to Leitner cards to prevent overwriting
                            if (wordObj) {
                                const isShortOrNumeric = /^\d+$/.test(actualWordId) && actualWordId.length < 5;
                                if (isShortOrNumeric && !actualWordId.startsWith(`${actualBookId}_`)) {
                                    actualWordId = `${actualBookId}_${actualWordId}`;
                                }
                            }

                            // State 6 usually means archived/completed in Android. 1-5 is active.
                            const isArchived = card.state >= 6;
                            // Favorites are kept in the favoriteBoxId or through listFavoriteWord
                            const isFavorite = card.boxId === favoriteBoxId || favoriteWordMap.has(`${card.bookName}_${actualWordId}`);

                            // Map 1-5 box levels. If state is not active but is favorite, boxLevel can be 0.
                            // Handle unread cards properly (state === 0 is unread/boxLevel 0)
                            const boxLevel = card.state >= 1 && card.state <= 5 ? card.state : (card.state === 6 ? 6 : 0); // Preserve 6 if archived, 0 otherwise

                            const leitnerItem = {
                                wordID: actualWordId,
                                bookId: actualBookId, // Use the matched local book ID
                                boxLevel: boxLevel,
                                nextReviewDate: parseDateToTimestamp(card.dateOfNextExam),
                                isArchived: isArchived,
                                isFavorite: isFavorite
                            };

                            const uniqueKey = `${actualBookId}_${actualWordId}`;
                            if (!addedCards.has(uniqueKey)) {
                                addedCards.add(uniqueKey);
                                putPromises.push(requestToPromise((store as IDBObjectStore).put(leitnerItem)));
                            }
                        }
                    });
                }

                // Next, make sure any standalone favorite words are added even if they aren't in leitner cards
                if (backupData.listFavoriteWord) {
                    backupData.listFavoriteWord.forEach(fav => {
                        const wordObj = resolveWord(fav.bookName, fav.wordID);
                        let actualWordId = wordObj ? wordObj.wordID : fav.wordID.toString();
                        const actualBookId = wordObj ? String(wordObj.bookId) : getLocalBookIdStr(fav.bookName) || String(fav.bookName);

                        if (wordObj) {
                            const isShortOrNumeric = /^\d+$/.test(actualWordId) && actualWordId.length < 5;
                            if (isShortOrNumeric && !actualWordId.startsWith(`${actualBookId}_`)) {
                                actualWordId = `${actualBookId}_${actualWordId}`;
                            }
                        }

                        const uniqueKey = `${actualBookId}_${actualWordId}`;
                        if (!addedCards.has(uniqueKey)) {
                            const leitnerItem = {
                                wordID: actualWordId,
                                bookId: actualBookId,
                                boxLevel: 0,
                                nextReviewDate: 0,
                                isArchived: false,
                                isFavorite: true
                            };
                            addedCards.add(uniqueKey);
                            putPromises.push(requestToPromise((store as IDBObjectStore).put(leitnerItem)));
                        }
                    });
                }

                await Promise.all(putPromises);
            });
        }

        // 3. Restore Daily Activities
        if (backupData.listWordActivity && backupData.listWordActivity.length > 0) {
            await performTransaction(DAILY_ACTIVITY_STORE_NAME, 'readwrite', async (store) => {
                const putPromises: Promise<any>[] = [];

                // Aggregate WordActivities back into DailyActivity
                // Android saves per-word, Web saves per-book-per-day
                const activityMap = new Map<string, { correctAnswer: number; wrongAnswer: number }>();

                backupData.listWordActivity.forEach(wa => {
                    const localBookId = getLocalBookIdStr(wa.bookName) || String(wa.bookName);
                    const dateDash = wa.date.replace(/\//g, '-'); // Web uses YYYY-MM-DD
                    const actId = `${localBookId}_${dateDash}`;

                    if (!activityMap.has(actId)) {
                        activityMap.set(actId, { correctAnswer: 0, wrongAnswer: 0 });
                    }

                    const current = activityMap.get(actId)!;
                    if (wa.isCorrect) {
                        current.correctAnswer++;
                    } else {
                        current.wrongAnswer++;
                    }
                });

                activityMap.forEach((data, actId) => {
                    const parts = actId.split('_');
                    if (parts.length === 2) {
                        const dailyAct = {
                            id: actId,
                            bookId: parts[0],
                            date: parts[1],
                            correctAnswer: data.correctAnswer,
                            wrongAnswer: data.wrongAnswer
                        };
                        putPromises.push(requestToPromise((store as IDBObjectStore).put(dailyAct)));
                    }
                });

                await Promise.all(putPromises);
            });
        }

        // 4. Restore Day Lesson Progress
        // Based on the user data, listDayLessonProgress stores things like: { day: 205, vocabulariesPosition: 0, endExamPosition: 26, endExamSize: 26, videosWatched: false, videoZero: false }
        // The Web app saves daily lesson progress to localStorage under 'dailyLesson_progress'
        // Format expected by web app: { [bookId: string]: { [dayId: string]: DayProgress } }
        // BUT web app groups this by bookId. Android's listDayLessonProgress just has `day` (which is day_id).
        // Let's create a format similar to what dailyLessonService.ts expects.
        if (backupData.listDayLessonProgress && backupData.listDayLessonProgress.length > 0) {
            try {
                // In dailyLessonService, it is keyed by `bookId`, then `dayId`.
                // However, daily progress in backupData does not specify a bookId. Android's `listDayLessonProgress` just has `day`.
                // Daily Lessons are global, so we typically use 'global' or '1' as a generic bookId if none exists,
                // actually in ZabanFly, daily lessons are usually fetched with a `bookId=0` or it's a specific API endpoint.
                // Let's look at how the web app reads it: `const allProgress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');`
                // `return allProgress[bookId]?.[dayId] || {...}` -> Usually bookId is `daily` or the language code.
                // Wait, if we don't know the exact bookId for daily lessons, typically the app uses `"0"` or `"daily"` for daily lessons.
                // Let's just group them all under a generic '0' or restore them as `dayId` -> progress.
                // Wait, `saveProgress(bookId, dayId, ...)` uses bookId and dayId.
                // A better approach is to merge it with existing or default to '0'.

                // Let's create a clean object for the generic "0" (or fallback bookId)
                const newProgressMap: Record<string, any> = {};
                const newCompletedMap: string[] = [];

                backupData.listDayLessonProgress.forEach(progress => {
                    const dayId = progress.day.toString();

                    // We need to convert it to the `DayProgress` structure the web app uses:
                    // vocab, pronunciation, spelling, reading, listening, quiz, verbs, endExam, grammarVideo, grammarQuiz
                    const dayProgress = {
                        vocab: progress.vocabulariesSize > 0 && progress.vocabulariesPosition >= progress.vocabulariesSize,
                        pronunciation: progress.pronunciationsSize > 0 && progress.pronunciationsPosition >= progress.pronunciationsSize,
                        spelling: progress.dictationsSize > 0 && progress.dictationsPosition >= progress.dictationsSize,
                        reading: progress.readingSize > 0 && progress.readingPosition >= progress.readingSize,
                        listening: progress.listeningSize > 0 && progress.listeningPosition >= progress.listeningSize,
                        quiz: progress.finalQuizSize > 0 && progress.finalQuizPosition >= progress.finalQuizSize,
                        verbs: progress.verbsSize > 0 && progress.verbsPosition >= progress.verbsSize,
                        endExam: progress.endExamSize > 0 && progress.endExamPosition >= progress.endExamSize,
                        grammarVideo: progress.grammarVideoWatched,
                        grammarQuiz: false // Approximation
                    };

                    // Directly map it without generic nesting. Web app expects: { [dayId]: DayProgress }
                    newProgressMap[dayId] = dayProgress;

                    // If progress is high enough, we can consider it completed
                    const isCompleted = Object.values(dayProgress).some(v => v === true);
                    if (isCompleted) {
                        if (!newCompletedMap.includes(dayId)) {
                            newCompletedMap.push(dayId);
                        }
                    }
                });

                localStorage.setItem('dailyLesson_progress', JSON.stringify(newProgressMap));
                localStorage.setItem('dailyLesson_completed_days', JSON.stringify(newCompletedMap));

            } catch(e) {
                console.error("Failed to restore listDayLessonProgress", e);
            }
        }

        return true;
    } catch (error) {
        console.error('Error processing restored backup data', error);
        return false;
    }
}
