export const CURRENT_VERSION = 1;

export enum BoxType {
    DEFAULT = "DEFAULT",
    FAVORITES = "FAVORITES",
    CUSTOM = "CUSTOM"
}

export enum CardSourceType {
    BOOK = "BOOK",
    CUSTOM = "CUSTOM"
}

export interface Word {
    versionAware?: number;
    id?: number; // mapped from Long in Kotlin but Number in JSON
    wordID: number;
    bookName?: number | null;
    word: string;
    translation: string;
}

export interface BackupData {
    listWord: Word[];
    listWordActivity: WordActivity[];
    listDayLessonProgress: DayLessonProgress[];
    listDayData: DataDay[];
    listDayLessonActivity: DayLessonActivity[];
    listDayLessonActivityVersion: DayLessonActivityVersion[];
    listBookActivity: BookActivity[] | null;
    listBookActivityInfo: BookActivityInfo[] | null;
    listFavoriteWord: FavoriteWord[] | null;
    listStudiedWord: StudiedWord[] | null;
    listLeitnerBox: LeitnerBox[] | null;
    listLeitnerCard: LeitnerCard[] | null;
    listLeitnerCustomCard: LeitnerCustomCard[] | null;
}

export interface WordActivity {
    versionAware: number;
    id: number;
    wordId: number;
    bookName: number;
    date: string;
    isCorrect: boolean;
    isStreakBonus: boolean;
    boxId?: number | null; // mapped from Long
    cardId?: number | null; // mapped from Long
}

export interface LeitnerCard {
    versionAware: number;
    id: number; // mapped from Long
    boxId: number; // mapped from Long
    sourceType: CardSourceType;
    state: number;
    dateOfNextExam: string;
    bookWordId?: number | null;
    bookName?: number | null;
    customCardId?: number | null; // mapped from Long
    correctCount: number;
    wrongCount: number;
    lastReviewDate?: string | null;
    addedDate: string;
}

export interface LeitnerBox {
    versionAware: number;
    id: number; // mapped from Long
    name: string;
    boxType: BoxType;
    bookName?: number | null;
    description?: string | null;
    createdDate: string;
    colorHex?: string | null;
}

export interface LeitnerCustomCard {
    versionAware: number;
    id: number; // mapped from Long
    word: string;
    meaning: string;
    note: string;
    createdDate: string;
}

export interface DayLessonProgress {
    versionAware: number;
    day: number;
    vocabulariesPosition: number;
    vocabulariesSize: number;
    pronunciationsPosition: number;
    pronunciationsSize: number;
    dictationsPosition: number;
    dictationsSize: number;
    grammarPosition: number;
    grammarSize: number;
    readingPosition: number;
    readingSize: number;
    verbsPosition: number;
    verbsSize: number;
    listeningPosition: number;
    listeningSize: number;
    finalQuizPosition: number;
    finalQuizSize: number;
    endExamPosition: number;
    endExamSize: number;
    videosWatched: boolean;
    grammarVideoWatched: boolean;
    videoZero: boolean;
    lastActivityDate: string;
    languageCode?: string | null;
}

export interface DataDay {
    versionAware: number;
    day: number;
    vocabularies: Vocabulary[];
    verbs: VerbsModel[];
    endExam?: FinalQuiz[];
    EndExam?: FinalQuiz[];
    dictations: Dictation[];
    pronunciations: Pronunciation[];
    grammar?: GrammarDay | null;
    reading?: Reading | null;
    videoZero?: GrammarModel | null;
    listening?: Listening | null;
    finalQuiz?: FinalQuiz[];
    final_quiz?: FinalQuiz[];
    languageCode?: string | null;
}

export interface DayLessonActivity {
    versionAware: number;
    day: number;
    date: string;
    progress: string;
    version: number;
    languageCode?: string | null;
}

export interface DayLessonActivityVersion {
    versionAware: number;
    day: number;
    lastUpdateDate: string;
    version: number;
    languageCode?: string | null;
}

export interface BookActivity {
    versionAware: number;
    id: number;
    bookName: number;
    date: string;
    sumDictation: number;
    sumPronunciation: number;
}

export interface BookActivityInfo {
    versionAware: number;
    bookName: number;
    positionDictation: number;
    positionPronunciation: number;
    lastUpdateDate: string;
}

export interface FavoriteWord {
    versionAware: number;
    id: number; // mapped from Long
    wordID: number;
    bookName: number;
    createDate: string;
}

export interface StudiedWord {
    versionAware: number;
    id: number; // mapped from Long
    wordID: number;
    bookName: number;
    createDate: string;
}

export interface Vocabulary {
    versionAware: number;
    vocabulary_id: string;
    day_id: string;
    word: string;
    verb?: string;
    past?: string;
    translation: string;
    example_sentence: string;
    example_translation: string;
}

export interface VerbsModel {
    versionAware: number;
    Day_id: string;
    example_sentence: string;
    example_translation: string;
    past: string;
    translation: string;
    verb: string;
    vocabulary_id: string;
}

export interface FinalQuiz {
    versionAware: number;
    id: string;
    day_id: string;
    question: string;
    answer: string;
    image?: string | null;
    option_question: string;
    pronunciationWord?: string | null;
}

export interface Dictation {
    versionAware: number;
    dictation_id: string;
    day_id: string;
    word: string;
    translation?: string | null;
}

export interface Pronunciation {
    versionAware: number;
    pronunciation_id: string;
    day_id: string;
    sentence: string;
    translation: string;
}

export interface GrammarQuestion {
    versionAware: number;
    id: string;
    id_grammar: string;
    day_id: string;
    question: string;
    image?: string | null;
    answer: string;
    option_question: string;
    pronunciationWord?: string | null;
}

export interface GrammarModel {
    id: number;
    title: string;
    nameLesson?: string | null;
    time?: string | null;
    dayQuiz?: number | null;
    countSeen?: number | null;
    progressSeen?: number | null;
    level_type?: string | null;
    language_level?: string | null;
    linkVideo: string;
    isQuiz?: boolean | null;
    languageCode?: string | null;
}

export interface GrammarDay {
    versionAware: number;
    day_id: string;
    video?: GrammarModel | null;
    questions: GrammarQuestion[];
}

export interface ReadingQuestion {
    versionAware: number;
    question_id: string;
    reading_id: string;
    day_id: string;
    question: string;
    image?: string | null;
    answer: string;
    option_question: string;
}

export interface Reading {
    versionAware: number;
    reading_id: string;
    day_id: string;
    title?: string;
    text: string;
    linkVoice?: string;
    translation: string;
    textTranslation?: string | null;
    questions: ReadingQuestion[];
}

export interface Dialogue {
    versionAware: number;
    speaker: string;
    text: string;
    day_id: string;
    translation: string;
}

export interface Listening {
    versionAware: number;
    dialogues: Dialogue[];
    day_id: string;
    title?: string;
    linkSound?: string[] | null;
}
