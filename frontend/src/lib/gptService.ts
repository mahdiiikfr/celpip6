import { API_ENDPOINTS, postJson } from './api';

export interface SentenceWordModel {
  sentence: string;
  translation: string;
}

export async function getSentencesWithWords(words: string[]): Promise<SentenceWordModel[]> {
  try {
    // The API expects a JSON body with a "words" key containing an array of strings.
    const result = await postJson<SentenceWordModel[]>(API_ENDPOINTS.gptSentence, { words });

    if (result.ok) {
        // Handle case where response is wrapped in Data
        if (result.envelope?.Data && Array.isArray(result.envelope.Data)) {
            return result.envelope.Data;
        }
        // Handle case where response is a direct array
        if (Array.isArray(result.envelope)) {
            return result.envelope as unknown as SentenceWordModel[];
        }
    }

    console.warn('Unexpected API response structure:', result);
    return [];
  } catch (error) {
    console.error('Failed to fetch sentences:', error);
    throw error; // Let the UI handle the error state
  }
}
