import { API_ENDPOINTS, postForm } from './api';
import { isContentDay } from './dailyLessonUtils';

export interface DailyVocabulary {
    id: number;
    word: string;
    translation: string;
    exampleEn: string;
    exampleFa: string;
    audioUs: string; // URL or path
    audioUk: string;
}

export interface DailyPronunciation {
    id: number;
    sentence: string;
    translation: string;
}

export interface DailySpelling {
    id: number;
    word: string;
    translation: string;
    scrambled: string[]; // ['h', 'e', 'l', 'l', 'o']
}

export interface DailyReadingQuestion {
    id: string;
    readingId: string;
    dayId: string;
    question: string;
    answer: string;
    options: string[]; // "Los Angeles,Austin Texas,London,New York" -> split
}

export interface DailyReading {
    id: string;
    dayId: string;
    text: string;
    linkVoice: string;
    translation: string;
    questions: DailyReadingQuestion[];
}

export interface DailyDialogue {
    speaker: string;
    text: string;
    dayId: string;
    translation: string;
}

export interface DailyListening {
    title: string;
    linkSound: string[];
    dayId: number;
    dialogues: DailyDialogue[];
}

export interface DailyQuiz {
    id: string;
    dayId: string;
    question: string;
    answer: string;
    options: string[]; // "He,She,I,You" -> split
}

// New Types for Verbs and EndExam
export interface DailyVerb {
    id: number;
    verb: string;
    translation: string;
    past: string;
    exampleEn: string;
    exampleFa: string;
}

export interface DailyEndExam {
    id: string;
    dayId: string;
    question: string;
    answer: string;
    options: string[];
}

export interface DailyGrammarQuestion {
    id: string;
    dayId: string;
    question: string;
    answer: string;
    options: string[];
}

export interface DailyGrammarVideo {
    id: string;
    title: string;
    titleEn: string;
    linkVideo: string;
}

export interface DailyGrammar {
    dayId: number;
    questions: DailyGrammarQuestion[];
    video: DailyGrammarVideo | null;
}

export interface DailyLesson {
    id: number; // Day number (1, 2, ...)
    vocabulary: DailyVocabulary[];
    pronunciation: DailyPronunciation[];
    spelling: DailySpelling[];
    reading: DailyReading | null;
    listening: DailyListening | null;
    finalQuiz: DailyQuiz[];
    verbs: DailyVerb[];
    endExam: DailyEndExam[];
    grammar: DailyGrammar | null;
}

// Logic to manage "Unlocked" state in localStorage
const PROGRESS_KEY = 'dailyLesson_progress';
const COMPLETED_DAYS_KEY = 'dailyLesson_completed_days';

export interface DayProgress {
    vocab: boolean;
    pronunciation: boolean;
    spelling: boolean;
    reading: boolean;
    listening: boolean;
    quiz: boolean;
    verbs: boolean;
    endExam: boolean;
    grammarVideo: boolean;
    grammarQuiz: boolean;
}

// Helper to shuffle array for scrambled words
function shuffleArray(array: string[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export const dailyLessonService = {
    async getLesson(dayId: number): Promise<DailyLesson | null> {
        try {
            const response = await postForm<any>(API_ENDPOINTS.dailyLesson,
                { day: dayId.toString() },
                { 'X-App-mode-learning': 'english' }
            );

            if (!response.ok || !response.envelope.Data) {
                console.error("Failed to fetch daily lesson", response);
                return null;
            }

            const data = response.envelope.Data;

            // Map Vocabularies
            const vocabulary: DailyVocabulary[] = (data.vocabularies || []).map((v: any) => ({
                id: Number(v.vocabulary_id),
                word: v.word,
                translation: v.translation,
                exampleEn: v.example_sentence,
                exampleFa: v.example_translation,
                audioUs: "", // API doesn't seem to provide this yet
                audioUk: ""
            }));

            // Map Pronunciations
            const pronunciation: DailyPronunciation[] = (data.pronunciations || []).map((p: any) => ({
                id: Number(p.pronunciation_id),
                sentence: p.sentence,
                translation: p.translation
            }));

            // Map Spelling (Dictation) -> Generate scrambled
            const spelling: DailySpelling[] = (data.dictations || []).map((d: any) => ({
                id: Number(d.dictation_id),
                word: d.word,
                translation: d.translation,
                scrambled: shuffleArray(d.word.split(''))
            }));

            // Map Reading
            let reading: DailyReading | null = null;
            if (data.reading) {
                reading = {
                    id: data.reading.reading_id,
                    dayId: data.reading.day_id,
                    text: data.reading.text,
                    linkVoice: data.reading.linkVoice,
                    translation: data.reading.translation,
                    questions: (data.reading.questions || []).map((q: any) => ({
                        id: q.question_id,
                        readingId: q.reading_id,
                        dayId: q.day_id,
                        question: q.question,
                        answer: q.answer,
                        options: q.option_question ? q.option_question.split(',') : []
                    }))
                };
            }

            // Map Listening
            let listening: DailyListening | null = null;
            if (data.listening) {
                listening = {
                    title: data.listening.title,
                    linkSound: data.listening.linkSound || [],
                    dayId: Number(data.listening.day_id),
                    dialogues: (data.listening.dialogues || []).map((d: any) => ({
                        speaker: d.speaker,
                        text: d.text,
                        dayId: d.day_id,
                        translation: d.translation
                    }))
                };
            }

            // Map Final Quiz
            const finalQuiz: DailyQuiz[] = (data.finalQuiz || data.final_quiz || []).map((q: any) => ({
                id: q.id,
                dayId: q.day_id,
                question: q.question,
                answer: q.answer,
                options: q.option_question ? q.option_question.split(',') : []
            }));

            // Map Verbs
            const verbs: DailyVerb[] = (data.verbs || []).map((v: any) => ({
                id: Number(v.vocabulary_id),
                verb: v.verb,
                translation: v.translation,
                past: v.past,
                exampleEn: v.example_sentence,
                exampleFa: v.example_translation
            }));

            // Map End Exam
            const endExam: DailyEndExam[] = (data.endExam || data.EndExam || []).map((q: any) => ({
                id: q.id,
                dayId: q.day_id,
                question: q.question,
                answer: q.answer,
                options: q.option_question ? q.option_question.split(',') : []
            }));

            // Map Grammar
            let grammar: DailyGrammar | null = null;
            if (data.grammar) {
                const gData = data.grammar;
                grammar = {
                    dayId: Number(gData.day_id),
                    questions: (gData.questions || []).map((q: any) => ({
                        id: q.id,
                        dayId: q.day_id,
                        question: q.question,
                        answer: q.answer,
                        options: q.option_question ? q.option_question.split(',') : []
                    })),
                    video: gData.video ? {
                        id: gData.video.id,
                        title: gData.video.title,
                        titleEn: gData.video.titleEn,
                        linkVideo: gData.video.linkVideo
                    } : null
                };
            }

            return {
                id: dayId,
                vocabulary,
                pronunciation,
                spelling,
                reading,
                listening,
                finalQuiz,
                verbs,
                endExam,
                grammar
            };

        } catch (e) {
            console.error("Error in dailyLessonService.getLesson", e);
            return null;
        }
    },

    isDayUnlocked(dayId: number): boolean {
        if (dayId === 1) return true;
        // Check if previous day is completed
        return this.isDayCompleted(dayId - 1);
    },

    isRestDay(dayId: number): boolean {
        // Standard rule: normal days (not multiples of 7) are never rest days.
        if (dayId % 7 !== 0) return false;

        // For multiples of 7, check if they are explicitly marked as content days.
        return !isContentDay(dayId);
    },

    unlockDay(dayId: number) {
        // No-op for now
    },

    // New methods for granular progress
    getDayProgress(dayId: number): DayProgress {
        try {
            const allProgress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
            return allProgress[dayId] || {
                vocab: false, pronunciation: false, spelling: false,
                reading: false, listening: false, quiz: false,
                verbs: false, endExam: false,
                grammarVideo: false, grammarQuiz: false
            };
        } catch {
            return {
                vocab: false, pronunciation: false, spelling: false,
                reading: false, listening: false, quiz: false,
                verbs: false, endExam: false,
                grammarVideo: false, grammarQuiz: false
            };
        }
    },

    isDayCompleted(dayId: number): boolean {
        try {
            const completedDays = JSON.parse(localStorage.getItem(COMPLETED_DAYS_KEY) || '[]');
            return completedDays.includes(dayId);
        } catch {
            return false;
        }
    },

    setDayComplete(dayId: number) {
        try {
            const completedDays = JSON.parse(localStorage.getItem(COMPLETED_DAYS_KEY) || '[]');
            if (!completedDays.includes(dayId)) {
                completedDays.push(dayId);
                localStorage.setItem(COMPLETED_DAYS_KEY, JSON.stringify(completedDays));
            }
        } catch (e) {
            console.error("Failed to mark day as complete", e);
        }
    },

    completeSection(dayId: number, section: 'vocab' | 'pronunciation' | 'spelling' | 'reading' | 'listening' | 'quiz' | 'verbs' | 'endExam' | 'grammarVideo' | 'grammarQuiz') {
        try {
            const allProgress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
            const dayProgress = allProgress[dayId] || {
                vocab: false, pronunciation: false, spelling: false,
                reading: false, listening: false, quiz: false,
                verbs: false, endExam: false,
                grammarVideo: false, grammarQuiz: false
            };

            dayProgress[section] = true;
            allProgress[dayId] = dayProgress;

            localStorage.setItem(PROGRESS_KEY, JSON.stringify(allProgress));
        } catch (e) {
            console.error("Failed to save progress", e);
        }
    },

    resetDayProgress(dayId: number) {
        try {
            const allProgress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
            if (allProgress[dayId]) {
                delete allProgress[dayId];
                localStorage.setItem(PROGRESS_KEY, JSON.stringify(allProgress));
            }
            // Also unmark completion
             const completedDays = JSON.parse(localStorage.getItem(COMPLETED_DAYS_KEY) || '[]');
             const newCompleted = completedDays.filter((d: number) => d !== dayId);
             localStorage.setItem(COMPLETED_DAYS_KEY, JSON.stringify(newCompleted));

        } catch (e) {
             console.error("Failed to reset progress", e);
        }
    },

    getTotalCompletedDays(): number {
        try {
            const completedDays = JSON.parse(localStorage.getItem(COMPLETED_DAYS_KEY) || '[]');
            return completedDays.length;
        } catch {
            return 0;
        }
    }
};
