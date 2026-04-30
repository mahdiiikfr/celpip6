
import { API_ENDPOINTS, postForm, postJson, ApiResult } from './api';
import {
    StartExamLevelResponse,
    SingleAnswerExamLevel,
    ResponseAnswerExam,
    FinishExamLevelResponse,
    ReviewModel,
    HistoryModelItem,
    FinishExamLevelRequest,
    StartExamLevelRequest
} from './placementTestTypes';

export const placementTestService = {
    // Start Exam: @FormUrlEncoded
    startExam: async (username: string, forceNew: boolean = false): Promise<ApiResult<StartExamLevelResponse>> => {
        return postForm<StartExamLevelResponse>(API_ENDPOINTS.levelStart, {
            username,
            force_new: forceNew.toString() // API expects string "true"/"false" often in PHP, but let's check Kotlin: @Field("force_new") forceNew: Boolean. Retrofit sends string representation.
        });
    },

    // Answer Single: @Body (JSON)
    submitAnswer: async (answer: SingleAnswerExamLevel): Promise<ApiResult<ResponseAnswerExam>> => {
        return postJson<ResponseAnswerExam>(API_ENDPOINTS.levelAnswer, answer);
    },

    // Finish Exam: @FormUrlEncoded
    finishExam: async (request: FinishExamLevelRequest): Promise<ApiResult<FinishExamLevelResponse>> => {
        return postForm<FinishExamLevelResponse>(API_ENDPOINTS.levelFinish, {
            username: request.username,
            attemptId: request.attemptId.toString(),
            attemptToken: request.attemptToken,
            exp: request.exp.toString()
        });
    },

    // Review Exam: @FormUrlEncoded
    reviewExam: async (username: string, attemptId: number, attemptToken: string, exp: number): Promise<ApiResult<ReviewModel>> => {
        return postForm<ReviewModel>(API_ENDPOINTS.levelReview, {
            username,
            attemptId: attemptId.toString(),
            attemptToken,
            exp: exp.toString()
        });
    },

    // History: @FormUrlEncoded
    getHistory: async (username: string): Promise<ApiResult<HistoryModelItem[]>> => {
        return postForm<HistoryModelItem[]>(API_ENDPOINTS.levelHistory, { username });
    },

    // Last Attempt: @FormUrlEncoded
    getLastAttempt: async (username: string): Promise<ApiResult<FinishExamLevelResponse>> => {
         return postForm<FinishExamLevelResponse>(API_ENDPOINTS.levelLastAttempt, { username });
    }
};
