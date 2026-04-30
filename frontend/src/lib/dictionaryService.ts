import { postForm } from './api';

export interface DictionaryDefinition {
    meaning: string;
    meaning_translation: string;
}

export interface DictionaryExample {
    sentence?: string;
    translation?: string;
    en?: string;
    fa?: string;
    textEn?: string;
    textFa?: string;
    [key: string]: any;
}

export interface DictionarySynonym {
    word: string;
    translation: string;
    [key: string]: any;
}

export interface DictionaryAntonym {
    word: string;
    translation: string;
    [key: string]: any;
}

export interface DictionaryData {
    input?: string;
    word?: string; // Fallback for input
    translated_word?: string;
    translation?: string; // Fallback for translated_word
    phonetic?: string;
    definitions?: (DictionaryDefinition | string)[];
    examples?: DictionaryExample[];
    synonyms?: (DictionarySynonym | string)[];
    antonyms?: (DictionaryAntonym | string)[];
    [key: string]: any;
}

export const dictionaryService = {
    async search(word: string): Promise<DictionaryData | null> {
        try {
            // Proxied URL for the Dictionary API
            // Original: https://naturrregenius.ir/memory_bank/apiNew/Ai/smart_dictionary_f_e.php
            const proxyUrl = '/api/proxy/memory_bank/apiNew/Ai/smart_dictionary_f_e.php';

            const response = await postForm<any>(
                proxyUrl,
                { word },
                { 'X-App-Language': 'fa-IR' }
            );

            // Based on logs, the data is inside "Data" field of the envelope
            if (response.envelope && response.envelope.Data) {
                return response.envelope.Data as DictionaryData;
            }
            // Fallback for different API structures
            return (response.envelope as unknown) as DictionaryData;

        } catch (error) {
            console.error("Dictionary Service Error:", error);
            return null;
        }
    }
};
