// src/lib/leitnerService.ts
import * as db from './db';
import { Word, BookData } from '@/types/book';

// فواصل زمانی مرور به روز طبق کد کاتلین
// State 1: 2 days
// State 2: 5 days
// State 3: 10 days
// State 4: 20 days
// State 5: 30 days
// State 6: Finished / Learned
const STATE_INTERVALS: Record<number, number> = {
    1: 2,
    2: 5,
    3: 10,
    4: 20,
    5: 30
};

const MIN_STATE = 1;
const MAX_STATE = 6;

/**
 * Creates a queue of words for a Leitner review session for a specific book.
 * It combines **non-archived** due review items and new items up to the specified limit.
 */
export async function createSessionQueue(bookId: string, newWordLimit: number): Promise<Word[]> {
    console.log(`[LeitnerService] Creating session queue for bookId: "${bookId}" with newWordLimit: ${newWordLimit}`);
    try {
        await db.initDB(); // Ensure DB is ready

        // 1. Get **non-archived** due review items FOR THIS BOOK
        //    Logic must ensure we don't pick items that are "Finished" (Level 6) if the DB query doesn't already exclude them.
        //    Currently db.getDueReviewItems checks (nextReviewDate <= now).
        //    If we set Finished items to far future, they won't appear here. Good.
        const allDueItems = await db.getDueReviewItems();
        const dueItemsForBook = allDueItems.filter(item => item.bookId === bookId);
        console.log(`[LeitnerService] Found ${dueItemsForBook.length} due, non-archived items for book ${bookId}.`);

        // 2. Get **non-archived** new items FOR THIS BOOK up to the limit
        const newItemsForBook = await db.getNewItemsForBook(bookId, newWordLimit);
        console.log(`[LeitnerService] Found ${newItemsForBook.length} new, non-archived items for book ${bookId} (limit: ${newWordLimit}).`);

        // 3. Combine unique word IDs from both lists
        const sessionItemIds = new Set([
            ...dueItemsForBook.map(item => item.wordID),
            ...newItemsForBook.map(item => item.wordID)
        ]);
        console.log(`[LeitnerService] Total unique words in session queue: ${sessionItemIds.size}`);

        if (sessionItemIds.size === 0) {
            console.log(`[LeitnerService] No words found for session queue for book ${bookId}.`);
            return []; // No words to review
        }

        // 4. Fetch the full Word details from the book's JSON data
        const bookBlob = await db.getBook(bookId);
        if (!bookBlob) {
            console.error(`[LeitnerService] Could not retrieve book data blob for bookId: ${bookId}`);
            throw new Error(`Book data not found for book ID: ${bookId}`);
        }

        const jsonText = await bookBlob.text();
        const bookData: BookData = JSON.parse(jsonText);
        const sessionWords: Word[] = [];

        bookData.forEach(lesson => {
            lesson.listWord?.forEach(word => {
                if (sessionItemIds.has(word.wordID)) {
                    // Ensure bookId is attached, crucial for processAnswer
                    sessionWords.push({ ...word, bookId: bookId });
                }
            });
        });

        console.log(`[LeitnerService] Retrieved details for ${sessionWords.length} words.`);

        // 5. Order items based on preference
        const leitnerOrderPreserved = localStorage.getItem('leitnerOrderPreserved') === 'true';

        if (!leitnerOrderPreserved) {
             // Default: Shuffle the words for the session
            sessionWords.sort(() => Math.random() - 0.5);
            console.log(`[LeitnerService] Shuffled ${sessionWords.length} words (order preserved: false).`);
        } else {
             console.log(`[LeitnerService] Preserved order for ${sessionWords.length} words.`);
        }

        return sessionWords;

    } catch (error) {
        console.error(`[LeitnerService] Error creating session queue for book ${bookId}:`, error);
        return []; // Return empty array on error
    }
}

/**
 * Retrieves all words from all currently downloaded books.
 * Ensures the bookId is attached to each word object.
 */
export async function getAllWordsFromDownloadedBooks(): Promise<Word[]> {
    console.log("[LeitnerService] Getting all words from downloaded books...");
    const allWords: Word[] = [];
    try {
        await db.initDB();
        const downloadedBookIds = await db.getDownloadedBookIds();
        console.log(`[LeitnerService] Found downloaded book IDs:`, downloadedBookIds);

        for (const bookId of downloadedBookIds) {
            const bookBlob = await db.getBook(bookId);
            if (bookBlob) {
                try {
                    const jsonText = await bookBlob.text();
                    const bookData: BookData = JSON.parse(jsonText);
                    bookData.forEach(lesson => {
                        lesson.listWord?.forEach(word => {
                            // Attach bookId to each word
                            allWords.push({ ...word, bookId: bookId });
                        });
                    });
                } catch (parseError) {
                    console.error(`[LeitnerService] Error parsing book data for bookId ${bookId}:`, parseError);
                }
            } else {
                console.warn(`[LeitnerService] Could not retrieve blob for bookId ${bookId}`);
            }
        }
        console.log(`[LeitnerService] Total words retrieved from all books: ${allWords.length}`);
        return allWords;
    } catch (error) {
        console.error("[LeitnerService] Error getting all words from books:", error);
        return [];
    }
}

/**
 * Processes the user's answer for a word, updates its Leitner status,
 * and updates the daily activity stats. **Ignores archived words.**
 */
export async function processAnswer(wordID: string, bookId: string, knewIt: boolean): Promise<void> {
    console.log(`[LeitnerService] Processing answer for wordId: ${wordID}, bookId: ${bookId}, knewIt: ${knewIt}`);
    let leitnerItemUpdated = false; // Flag to track successful Leitner update

    try {
        const item = await db.getLeitnerItem(wordID);
        let currentItem: db.LeitnerItem; // Variable to hold the item being saved

        // Check if the item is archived
        if (item?.isArchived) {
            console.warn(`[LeitnerService] Attempted to process answer for archived wordId: ${wordID}. Skipping.`);
            return; // Do nothing for archived words
        }

        if (!item) {
            // New Item Logic (Matches Kotlin createCard)
            // Starts at MIN_STATE (1)
            console.warn(`[LeitnerService] Leitner item not found for wordId: ${wordID}. Creating new entry.`);
            const newItem: db.LeitnerItem = {
                wordID: wordID,
                bookId: bookId,
                boxLevel: MIN_STATE, // 1
                nextReviewDate: Date.now(),
                isArchived: false
            };

            // Calculate next review based on MIN_STATE (1) -> 2 days
            const daysToAdd = STATE_INTERVALS[MIN_STATE];
            const nextReview = new Date();
            nextReview.setHours(0, 0, 0, 0); // Start of day
            nextReview.setDate(nextReview.getDate() + daysToAdd);
            newItem.nextReviewDate = nextReview.getTime();

            currentItem = newItem;
            await db.updateLeitnerItem(currentItem);
            console.log(`[LeitnerService] Created new item at State ${MIN_STATE}. Next review in ${daysToAdd} days.`);

        } else {
            // Existing Item Logic
            if (item.bookId !== bookId) {
                item.bookId = bookId;
            }

            // Logic from Kotlin: calculateNextState
            // Correct: Current + 1 (capped at 6)
            // Wrong: MIN_STATE (1)

            if (knewIt) {
                item.boxLevel = Math.min(item.boxLevel + 1, MAX_STATE);
                console.log(`[LeitnerService] Correct. Moving to State ${item.boxLevel}`);
            } else {
                item.boxLevel = MIN_STATE; // Reset to 1
                console.log(`[LeitnerService] Wrong. Resetting to State ${MIN_STATE}`);
            }

            // Logic from Kotlin: calculateNextExamDate
            // If state >= MAX_STATE (6) -> Finished (Empty date in Kotlin, Far Future here)
            if (item.boxLevel >= MAX_STATE) {
                // Set to a very distant future to effectively "finish" it
                const farFuture = new Date();
                farFuture.setFullYear(farFuture.getFullYear() + 100); // 100 years later
                item.nextReviewDate = farFuture.getTime();
                console.log(`[LeitnerService] Word ${wordID} reached MAX_STATE (${MAX_STATE}). Marked as learned (review in 100 years).`);
            } else {
                // Regular Interval
                const daysToAdd = STATE_INTERVALS[item.boxLevel];
                const nextReview = new Date();
                nextReview.setHours(0, 0, 0, 0);
                nextReview.setDate(nextReview.getDate() + daysToAdd);
                item.nextReviewDate = nextReview.getTime();

                console.log(`[LeitnerService] Next review in ${daysToAdd} days (${new Date(item.nextReviewDate).toLocaleDateString()})`);
            }

            item.isArchived = false;

            currentItem = item;
            await db.updateLeitnerItem(currentItem);
        }

        leitnerItemUpdated = true;

        // Update Daily Activity
        try {
            await db.updateDailyActivity(bookId, knewIt);
        } catch (activityError) {
            console.error(`[LeitnerService] Failed to update daily activity`, activityError);
        }

    } catch (error) {
        console.error(`[LeitnerService] Error processing answer for ${wordID}:`, error);
        throw error;
    }
}

// ==============================
// 📦 توابع بایگانی (Archive)
// ==============================

export async function archiveWord(wordID: string): Promise<void> {
    console.log(`[LeitnerService] Archiving wordId: ${wordID}`);
    try {
        const item = await db.getLeitnerItem(wordID);
        if (!item) return;
        if (item.isArchived) return;

        item.isArchived = true;
        await db.updateLeitnerItem(item);
        console.log(`[LeitnerService] Archived wordId: ${wordID}.`);
    } catch (error) {
        console.error(`[LeitnerService] Error archiving wordId ${wordID}:`, error);
        throw error;
    }
}

export async function unarchiveWord(wordID: string): Promise<void> {
    console.log(`[LeitnerService] Unarchiving wordId: ${wordID}`);
    try {
        const item = await db.getLeitnerItem(wordID);
        if (!item) return;
        if (!item.isArchived) return;

        item.isArchived = false;
        item.boxLevel = 0; // Reset progress to 'new' or 1? Kotlin unarchive uses MIN_STATE (1).

        // Match Kotlin unarchiveCard logic: newState = MIN_STATE, nextExam = +2 days
        item.boxLevel = MIN_STATE;

        const daysToAdd = STATE_INTERVALS[MIN_STATE];
        const nextReview = new Date();
        nextReview.setHours(0, 0, 0, 0); // Start of day
        nextReview.setDate(nextReview.getDate() + daysToAdd);
        item.nextReviewDate = nextReview.getTime();

        await db.updateLeitnerItem(item);
        console.log(`[LeitnerService] Unarchived wordId: ${wordID}. Reset to State ${MIN_STATE}.`);
    } catch (error) {
        console.error(`[LeitnerService] Error unarchiving wordId ${wordID}:`, error);
        throw error;
    }
}
