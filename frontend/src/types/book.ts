// src/types/book.ts

// این ساختار یک کلمه تنها را تعریف می‌کند
export interface Word {
  id: string;
  wordID: string;
  bookId?: number | string; // ✅ این خط اضافه شد تا شناسه کتاب همراه کلمه ذخیره شود
  word: string;
  meaning: string;
  pronun: string;
  example: string;
  exampleMeaning: string;
  dateOfLastExam: string; // این فیلد به نظر می‌رسد حاوی مترادف‌های انگلیسی است
  example2?: string;
  exampleMeaning2?: string;
  example3?: string;
  exampeMeaning3?: string; // توجه: در JSON شما غلط املایی وجود دارد
  lessonNumber: string;
  wordNumberInLesson: string;
  details?: any; // Contains detailed JSON info (synonyms, derivations, etc.)
  seeMore?: string; // JSON string containing DataSeeMore structure
}

// Structure for the parsed 'seeMore' JSON string
export interface DataSeeMore {
  collocations: Collocation[];
  countable?: string;
  derivations: Derivation[];
  example?: string;
  mean?: string;
  persian?: string;
  phrasal_verbs: PhrasalVerb[];
  plural?: string;
  plural_example?: string;
  plural_persian?: string;
  registers?: string;
  synonyms?: Synonyms | null;
  type?: string;
  voice?: string;
  word?: string;
}

export interface Collocation {
  collocation: string;
  example: string;
  translation?: string; // Changed from example_translation to translation based on JSON
  example_translation?: string; // Kept for backward compatibility if needed
}

export interface Derivation {
  display: string;
  example: string;
  example_translation?: string; // Added field
  type: string;
  word: string;
}

export interface PhrasalVerb {
  definition: string;
  example: string;
  example_translation?: string; // Added field
  verb: string;
}

export interface Synonyms {
  formal: string[];
  informal: string[];
  neutral: string[];
}

// این ساختار یک درس را تعریف می‌کند که شامل لیستی از کلمات است
export interface Lesson {
  id: number;
  bookId: number;
  bookName: number;
  lessonNumber: number;
  title: string;
  lessonTitle?: string; // For compatibility with some mock data
  image: string;
  listWord: Word[];
}

// این ساختار کل فایل کتاب را تعریف می‌کند که شامل آرایه‌ای از درس‌هاست
export type BookData = Lesson[];

// ==============================
// 📚 Book Metadata Interfaces
// ==============================
export interface ApiBook {
    id: number;
    order: number;
    keyBook: string;
    version: string;
    contentType: string;
    ItemType: string;
    isNewVersion: string;
    bookName: number;
    titleFa: string;
    titleEn: string;
    subTitleFa: string;
    subTitleEn: string;
    helpTitleFa: string;
    helpTitleEn: string;
    helpDescriptionFa: string;
    helpDescriptionEn: string;
    image: string;
    link: string;
    lessonWordCount: string;
    isLock: boolean;
    bookSize: number;
    languageCode?: string;
    isShow?: boolean;
    counterClick?: number;
    priceCoin?: number;
    token?: string;
    localVersion?: string;
    isPine?: boolean;
}

export interface Book extends ApiBook {
    isSuggestion?: boolean;
    bgColor?: string;
}
