// Celpip Test Types

export enum OpenKey {
    THE_FIRST_PART = "THE_FIRST_PART",
    THE_SECOND_PART = "THE_SECOND_PART",
}

export interface CelpipTestModel {
    title: string;
    isLock: boolean;
    testType: string;
    openKey: OpenKey;
    position: number;
}

export interface AiGradingResult {
    overal_score: string;
    coherance_score: string;
    vocabulary_score: string;
    readability_score: string;
    fullfilment_score: string;
    coherance_issue: string;
    coherance_improve: string;
    coherance_advice: string;
    vocabulary_issue: string;
    vocabulary_improve: string;
    vocabulary_advice: string;
    readability_issue: string;
    readability_improve: string;
    readability_advice: string;
    fullfilment_issue: string;
    fullfilment_improve: string;
    fullfilment_advice: string;
    advice: string;
    "Score Improvement Tips": string;
    revise_version: string;
}

// Writing Test Response Types
export interface CelpipWritingTestResponse {
    id: string;
    test_name: string;
    test_content: string; // JSON string that needs parsing
}

export interface CelpipWritingTaskData {
    txt_title: string;
    txt_title_2?: string;
    txt_description_1?: string;
    txt_description_2?: string;
    txt_title_3?: string;
    txt_description_3?: string;
    rdb_1?: string;
    rdb_2?: string;
}
