import { CelpipWritingTestResponse, AiGradingResult } from '@/types/celpip';
// Mock fetch helpers to match original implementation but hitting local backend
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

async function postFormArray<T>(endpoint: string, data: Record<string, string>): Promise<T[]> {
    const formData = new URLSearchParams();
    for (const key in data) {
        formData.append(key, data[key]);
    }
    const response = await fetch(`${BACKEND_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
}

export const celpipService = {
    getMockTestsList: () => {
        const listTest = [];
        const isLock = false;

        for (let i = 0; i < 12; i++) {
            const openKey = (i + 1).toString();
            const testType = (i % 2 === 0) ? "A" : "B";
            const position = Math.floor(i / 2) + 1;

            listTest.push({
                title: "CELPIP Mock ",
                isLock: isLock,
                testType: testType,
                openKey: openKey,
                position: position
            });
        }
        return listTest;
    },

    getTestContent: async (testName: string): Promise<any[]> => {
        return celpipService.getWritingTest(testName);
    },

    getWritingTest: async (testName: string): Promise<CelpipWritingTestResponse[]> => {
        try {
            const result = await postFormArray<CelpipWritingTestResponse>('get_writing_test.php', {
                test_name: testName
            });
            if (result && result.length > 0) return result;
            throw new Error("Empty result from API");
        } catch (e) {
            console.error("API request failed:", e);
            throw e;
        }
    },

    getSpeakingTest: async (testName: string): Promise<any[]> => {
        try {
            const result = await postFormArray<any>('get_writing_test.php', {
                test_name: testName
            });

            if (result && result.length > 0 && result[0].test_content) {
                try {
                    const parsedContent = JSON.parse(result[0].test_content);
                    return parsedContent;
                } catch (parseError) {
                    console.error("Failed to parse inner test_content JSON", parseError);
                    throw new Error("Invalid test content format");
                }
            }
            throw new Error("Empty or invalid result from API");
        } catch (e) {
            console.error("Speaking API request failed:", e);
            throw e;
        }
    },

    submitAiGrading: async (prompt: string): Promise<AiGradingResult | null> => {
        // Since we are standalone, the AI proxy may not be accessible if it relies on the original user session or base URL.
        // For standalone, we can mock this or just try hitting a relative proxy (which would fail without Vite proxy config)
        // Let's implement a dummy fallback for standalone if it fails.
        console.log("Mocking AI Grading for standalone...", prompt.substring(0, 50));

        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    Task_Fulfillment: 8,
                    Grammar: 7,
                    Vocabulary: 8,
                    Coherence_and_Cohesion: 7,
                    Overall_Score: 7.5,
                    Grammar_Corrections: [
                        { Original: "I is happy", Corrected: "I am happy", Explanation: "Subject-verb agreement." }
                    ],
                    Vocabulary_Suggestions: [
                        { Original: "good", Suggested: "excellent", Context: "Instead of 'good idea'." }
                    ],
                    Feedback: "This is a mocked AI grading response for the standalone app."
                });
            }, 2000);
        });
    }
};
