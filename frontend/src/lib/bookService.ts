import { saveBook, addWordsToLeitner } from './db';
import { decryptResponse } from './cryptoHelper';
import { Lesson, Word } from '@/types/book';

export interface RemoteBook {
  id: number; // mapped to numeric ID
  title: string;
  subTitle?: string; // e.g. "Essential"
  titleEn?: string;
  subTitleEn?: string;
  image: string; // URL
  downloadUrl: string; // URL to the encrypted content file
  version: number; // to check for updates
  isLocked?: boolean;
  languageCode?: string;
  isShow?: boolean;
  counterClick?: number;
  priceCoin?: number;
  token?: string;
  localVersion?: string;
  isPine?: boolean;
  order?: number;
  contentType?: string;
  itemType?: string;
  bookName?: number;
  bookSize?: number;
  helpTitleFa?: string;
  helpTitleEn?: string;
  helpDescriptionFa?: string;
  helpDescriptionEn?: string;
  keyBook?: string;
}

export type DownloadProgressCallback = (info: {
    stage: 'downloading' | 'decrypting' | 'parsing' | 'saving' | 'done';
    // Removed loaded/total/percent as we are now simulating the visual progress
}) => void;

/**
 * Maps the raw decrypted JSON structure to the application's internal structure.
 */
function parseBookData(remoteBook: RemoteBook, rawData: any[]): Lesson[] {
  // Group by lesson
  const lessonsMap = new Map<number, Lesson>();

  // Helper to extract word data from an object row
  const extractWordFromObject = (row: any): { originalWordId: string, lessonNum: number, wordText: string, pronun: string, meaning: string, examples: string[], exampleMeanings: string[], englishDefinition: string, seeMore: string } | null => {
      // Try common keys case-insensitively or by index string
      const getVal = (keys: string[]) => {
          for (const k of keys) {
              if (row[k] !== undefined) return row[k];
              const lowerK = k.toLowerCase();
              const foundKey = Object.keys(row).find(rk => rk.toLowerCase() === lowerK);
              if (foundKey) return row[foundKey];
          }
          return undefined;
      };

      const originalWordId = String(getVal(['vocabulary_id', 'word_id', 'wordID', 'id', 'Id']) || '');

      const lVal = getVal(['lesson', 'Lesson', '0', 'lessonNumber']);
      if (lVal === undefined || lVal === null) return null;
      const lessonNum = Number(lVal);
      if (isNaN(lessonNum)) return null;

      const wordText = getVal(['word', 'Word', 'text', '1']) || '';
      const pronun = getVal(['pronunciation', 'pronun', 'phonetic', '2']) || '';
      const meaning = getVal(['meaning', 'translation', 'farsi', '3']) || '';

      // Extract English Definition (often stored in dateOfLastExam)
      const englishDefinition = getVal(['dateOfLastExam', 'dateoflastexam', 'definition', 'englishdef']) || '';

      // Extract See More Data (usually a JSON string)
      const seeMore = getVal(['seeMore', 'see_more', 'SeeMore', 'seemore']) || '';

      let examples: string[] = [];
      let exampleMeanings: string[] = [];

      const exArr = getVal(['examples', 'Examples', 'allExamples']);
      if (Array.isArray(exArr)) {
            examples = exArr.map((e: any) => typeof e === 'string' ? e : e.english || e.text || '');
            exampleMeanings = exArr.map((e: any) => typeof e === 'string' ? '' : e.farsi || e.meaning || '');
      } else {
            // Try legacy numbered keys if present. Iterate through potential indexes 1..5
            // Key patterns: 'example', 'example1', 'example2' etc.
            const keysToCheck = [
                { ex: ['example', 'example1'], mean: ['exampleMeaning', 'exampleMeaning1'] },
                { ex: ['example2'], mean: ['exampleMeaning2', 'example2Meaning'] },
                { ex: ['example3'], mean: ['exampleMeaning3', 'example3Meaning', 'exampeMeaning3'] }, // Typo coverage
                { ex: ['example4'], mean: ['exampleMeaning4'] },
                { ex: ['example5'], mean: ['exampleMeaning5'] }
            ];

            keysToCheck.forEach(k => {
                const ex = getVal(k.ex);
                if (ex) {
                    examples.push(ex);
                    const mean = getVal(k.mean) || '';
                    exampleMeanings.push(mean);
                }
            });
      }
      return { originalWordId, lessonNum, wordText, pronun, meaning, examples, exampleMeanings, englishDefinition, seeMore };
  };

  rawData.forEach((row, index) => {
    let originalWordId: string = '';
    let lessonNum: number | null = null;
    let wordText: string = '';
    let pronun: string = '';
    let meaning: string = '';
    let englishDefinition: string = '';
    let seeMore: string = '';
    let examples: string[] = [];
    let exampleMeanings: string[] = [];
    let isNestedLesson = false;

    // --- Format 3: Nested Lesson Object (contains listWord) ---
    if (row && typeof row === 'object' && Array.isArray(row.listWord)) {
        isNestedLesson = true;
        const lNum = Number(row.lessonNumber || row.id);
        if (isNaN(lNum)) return;

        lessonNum = lNum;

        // Ensure Lesson exists
        if (!lessonsMap.has(lessonNum)) {
            lessonsMap.set(lessonNum, {
                id: Number(`${remoteBook.id}${lessonNum}`),
                bookId: Number(remoteBook.id) || 0,
                bookName: remoteBook.id, // Ensure it's a number (was title before)
                image: remoteBook.image,
                lessonNumber: lessonNum,
                title: row.title || `Lesson ${lessonNum}`,
                lessonTitle: row.lessonTitle || row.title || `Lesson ${lessonNum}`,
                listWord: [],
            });
        }

        const currentLesson = lessonsMap.get(lessonNum)!;

        // Process words in this lesson
        row.listWord.forEach((wObj: any) => {
             // Use helper to parse word object, but override lessonNum check since we are inside a lesson
             const wData = extractWordFromObject({ ...wObj, lesson: lessonNum }); // Inject lessonNum if missing in word

             if (wData && wData.wordText) {
                 const generatedWordId = `${remoteBook.id}-${lessonNum}-${currentLesson.listWord.length + 1}`;

                 // If the original ID is something very short like "1", "2", "3" from different lessons, it will conflict globally.
                 // In the database output from user, wordID is "1" but bookId is "2". This is dangerous as primary keys in Favorites and Leitner must be unique.
                 // We will prefix originalWordId with bookId to guarantee uniqueness while preserving the underlying int.
                 const isShortOrNumeric = wData.originalWordId && /^\d+$/.test(wData.originalWordId) && wData.originalWordId.length < 5;
                 const safeOriginalWordId = isShortOrNumeric ? `${remoteBook.id}_${wData.originalWordId}` : wData.originalWordId;

                 const finalWordId = safeOriginalWordId || generatedWordId;
                 const word: Word = {
                      id: finalWordId,
                      wordID: finalWordId,
                      bookId: remoteBook.id,
                      word: wData.wordText,
                      meaning: wData.meaning,
                      pronun: wData.pronun,
                      lessonNumber: String(lessonNum),
                      wordNumberInLesson: String(currentLesson.listWord.length + 1),
                      example: wData.examples[0] || '',
                      exampleMeaning: wData.exampleMeanings[0] || '',
                      dateOfLastExam: wData.englishDefinition, // Map captured definition here
                      seeMore: wData.seeMore, // ✅ Added seeMore mapping
                      details: {
                         derivations: [],
                         synonyms: [],
                         collocations: [],
                         allExamples: wData.examples.map((ex, i) => ({ english: ex, farsi: wData.exampleMeanings[i] || '' }))
                      }
                 };
                 currentLesson.listWord.push(word);
             }
        });
        return; // Done with this row (Lesson)
    }

    // --- Format 1: Array of Arrays (Original CSV/ODS style) ---
    else if (Array.isArray(row)) {
        // Skip header if first col is string "lesson"
        if (index === 0 && (typeof row[0] === 'string' && isNaN(Number(row[0])))) return;

        lessonNum = Number(row[0]);
        if (isNaN(lessonNum)) return; // Skip invalid rows

        wordText = row[1] || '';
        pronun = row[2] || '';
        meaning = row[3] || '';
        // Note: Array format doesn't seem to have a slot for english definition/dateOfLastExam in this logic.
        // If it does, we need to know the index. Assuming it might be missing or in a high index.
        // For now, leaving empty as this format is legacy.

        // Extract examples (Cols 4, 6, ...) and meanings (Cols 5, 7, ...)
        for (let i = 4; i < row.length - 1; i += 2) {
           if (row[i]) examples.push(row[i]);
           if (row[i+1]) exampleMeanings.push(row[i+1]);
        }
    }
    // --- Format 2: Flat Array of Objects (JSON style) ---
    else if (typeof row === 'object' && row !== null) {
        const wData = extractWordFromObject(row);
        if (!wData) return;

        originalWordId = wData.originalWordId;
        lessonNum = wData.lessonNum;
        wordText = wData.wordText;
        pronun = wData.pronun;
        meaning = wData.meaning;
        englishDefinition = wData.englishDefinition;
        seeMore = wData.seeMore;
        examples = wData.examples;
        exampleMeanings = wData.exampleMeanings;
    } else {
        return; // Unknown format
    }

    // --- Validation (for Flat formats) ---
    if (!lessonNum || !wordText) return;

    // --- Construction (for Flat formats) ---
    if (!lessonsMap.has(lessonNum)) {
      lessonsMap.set(lessonNum, {
        id: Number(`${remoteBook.id}${lessonNum}`),
        bookId: Number(remoteBook.id) || 0,
        bookName: remoteBook.id,
        image: remoteBook.image,
        lessonNumber: lessonNum,
        title: `Lesson ${lessonNum}`,
        lessonTitle: `Lesson ${lessonNum}`,
        listWord: [],
      });
    }

    const lesson = lessonsMap.get(lessonNum)!;

    // Construct Word ID
    const generatedWordId = `${remoteBook.id}-${lessonNum}-${lesson.listWord.length + 1}`;

    // Safely namespace original word ids to prevent global IndexedDB collisions
    const isShortOrNumeric = originalWordId && /^\d+$/.test(originalWordId) && originalWordId.length < 5;
    const safeOriginalWordId = isShortOrNumeric ? `${remoteBook.id}_${originalWordId}` : originalWordId;

    const finalWordId = safeOriginalWordId || generatedWordId;

    const word: Word = {
      id: finalWordId,
      wordID: finalWordId,
      bookId: remoteBook.id,
      word: wordText,
      meaning: meaning,
      pronun: pronun,
      lessonNumber: String(lessonNum),
      wordNumberInLesson: String(lesson.listWord.length + 1),
      example: examples[0] || '',
      exampleMeaning: exampleMeanings[0] || '',
      dateOfLastExam: englishDefinition, // Map here too
      seeMore: seeMore, // ✅ Added seeMore mapping
      details: {
         derivations: [],
         synonyms: [],
         collocations: [],
         allExamples: examples.map((ex, i) => ({ english: ex, farsi: exampleMeanings[i] || '' }))
      }
    };

    lesson.listWord.push(word);
  });

  return Array.from(lessonsMap.values()).sort((a, b) => a.lessonNumber - b.lessonNumber);
}

export function getProxiedUrl(originalUrl: string): string {
  const domain = 'https://naturrregenius.ir';
  if (originalUrl && originalUrl.startsWith(domain)) {
    return originalUrl.replace(domain, '/api/proxy');
  }
  return originalUrl;
}

export async function downloadAndSaveBook(remoteBook: RemoteBook, onProgress?: DownloadProgressCallback): Promise<boolean> {
    try {
        const proxiedUrl = getProxiedUrl(remoteBook.downloadUrl);
        console.log(`[BookService] Downloading from: ${proxiedUrl}`);

        onProgress?.({ stage: 'downloading' });

        // Using simple fetch + arrayBuffer for max robustness
        const response = await fetch(proxiedUrl);

        if (!response.ok) {
            throw new Error(`Download failed with status: ${response.status}`);
        }

        const encryptedData = await response.arrayBuffer();

        onProgress?.({ stage: 'decrypting' });
        const decryptedJsonString = decryptResponse(encryptedData);
        if (!decryptedJsonString) {
            throw new Error("Decryption failed. Invalid format or key.");
        }

        onProgress?.({ stage: 'parsing' });
        let rawData: any[];
        try {
             rawData = JSON.parse(decryptedJsonString);
        } catch (e) {
             throw new Error("Invalid JSON after decryption");
        }

        if (!Array.isArray(rawData)) {
            throw new Error(`Data format invalid (expected array). Received: ${typeof rawData}`);
        }

        onProgress?.({ stage: 'saving' });
        const lessons = parseBookData(remoteBook, rawData);

        if (lessons.length === 0) {
            throw new Error(`Parsed 0 lessons. Data format mismatch?`);
        }

        console.log(`[BookService] Parsed ${lessons.length} lessons.`);

        const jsonString = JSON.stringify(lessons);
        const jsonBlob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });

        await saveBook(String(remoteBook.id), jsonBlob, remoteBook);

        const allWords = lessons.flatMap(l => l.listWord);
        await addWordsToLeitner(String(remoteBook.id), allWords);

        onProgress?.({ stage: 'done' });
        return true;
    } catch (error: any) {
        console.error("Failed to download book:", error);
        throw new Error(error.message || "Unknown download error");
    }
}
