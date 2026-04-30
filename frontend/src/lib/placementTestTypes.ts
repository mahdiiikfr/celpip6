
export interface StartExamLevelRequest {
    username: string;
    force_new: boolean;
}

export interface StartExamLevelResponse {
    answeredCount: number;
    attemptId: number;
    attemptToken: string;
    username: string;
    exp: number;
    nextIndex: number;
    questions: Question[];
    resume: boolean;
    totalCount: number;
}

export type CategoryAnswer = 'listening' | 'reading' | 'pronunciation' | 'vocabulary' | 'grammar';

export interface Question {
    answered: boolean;
    attempt_item_id: number;
    audio?: string;
    correct_answer?: string;
    category: CategoryAnswer;
    id: number;
    options: string[];
    passage?: string;
    question: string;
    selected?: string;
}

export interface SingleAnswerExamLevel {
    attemptId: number;
    username: string;
    attemptToken: string;
    exp: number;
    attempt_item_id: number;
    selected: string;
}

export interface ResponseAnswerExam {
    answeredCount: number;
    totalCount: number;
    nextIndex: number;
    isFinished: boolean;
    sectionProgress: SectionProgress;
}

export interface SectionProgress {
    grammar: number;
    vocabulary: number;
    pronunciation: number;
    reading: number;
    listening: number;
    total: number;
}

export interface FinishExamLevelRequest {
    username: string;
    attemptId: number;
    attemptToken: string;
    exp: number;
}

export interface SectionDetail {
    percentage: number;
    level: string;
}

export interface BySection {
    grammar: SectionDetail;
    vocabulary: SectionDetail;
    pronunciation: SectionDetail;
    reading: SectionDetail;
    listening: SectionDetail;
}

export interface FinishExamLevelResponse {
    attemptId: number;
    username: string;
    totalScore?: number;
    totalPossible?: number;
    percentage?: number;
    level: string;
    bySection?: BySection;
    progress?: BySection;
    createdAt?: string;
    started_at?: string;
    finished_at?: string | null;
    isFinished?: boolean;
    attemptToken?: string;
}

// Updated HistoryModelItem to match API response
export interface HistoryModelItem {
    attemptId: number;
    started_at: string;
    finished_at: string;
    skills: BySection; // Structure matches BySection (grammar: {percentage, level}, etc.)
    overall: {
        percentage: number;
        level: string;
    };
}

export interface ReviewModel {
    attemptId: number;
    items: ReviewItem[];
    summary: ReviewSummary;
    username: string;
}

export interface ReviewItem {
    audio?: string;
    category: CategoryAnswer;
    correct_answer: string;
    isCorrect: boolean;
    options: string[];
    passage?: string;
    question: string;
    user_answer: string;
}

export interface ReviewSummary {
    bySection: BySection;
    correct: number;
    level: string;
    percentage: number;
    total: number;
}
