import { API_ENDPOINTS, ApiEnvelope, ApiResult } from './api';
import CryptoJS from 'crypto-js';

// VITE_API_BASE_URL allows direct connection bypassing proxies on PaaS providers.
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const useDirectProxyFallback = !rawBaseUrl;

const buildPrefix = (pathSuffix: string) => {
  if (useDirectProxyFallback) {
    return `/api/proxy/${pathSuffix}`;
  }
  const cleanBase = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
  return `${cleanBase}/${pathSuffix}`;
};

// Fixed API path to include 'memory_bank/apiNew/'
const GRAMMAR_API_PATH = 'memory_bank/apiNew/grammar/v2/getVideoGrammar.php';
const GRAMMAR_URL = buildPrefix(GRAMMAR_API_PATH);

// Grammar-specific Encryption Constants
const GRAMMAR_KEY_STRING = 'e5G]{31ktjM}shMpRja.P)i)Pzc';

export type GrammarLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | string;

export interface GrammarLesson {
    id: number;
    title: string;
    dayQuiz: string;
    titleEn: string;
    nameLesson: string;
    time: string;
    language_level: GrammarLevel;
    level_type: string;
    linkVideo: string;
    languageCode: string;
    isQuiz: string;
}

let cachedLessons: GrammarLesson[] | null = null;

function decryptGrammarData(encryptedString: string): string | null {
    try {
        // Expected format: "BASE64_DATA::BASE64_IV"
        const parts = encryptedString.split('::');
        if (parts.length !== 2) {
            console.warn("[GrammarService] Invalid format, missing '::' separator.");
            return null;
        }

        const base64Data = parts[0];
        const base64Iv = parts[1];

        // Prepare Key: SHA-256 hash of the key string
        const fullKeyHash = CryptoJS.SHA256(GRAMMAR_KEY_STRING);
        // AES-128 uses 16 bytes (first 4 words of the 32-byte hash)
        const key = CryptoJS.lib.WordArray.create(fullKeyHash.words.slice(0, 4), 16);

        // Prepare IV: Decode from Base64
        const iv = CryptoJS.enc.Base64.parse(base64Iv);

        // Prepare Ciphertext: Parse from Base64
        const ciphertext = CryptoJS.enc.Base64.parse(base64Data);

        const decrypted = CryptoJS.AES.decrypt(
            { ciphertext: ciphertext } as any,
            key,
            {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7 // Default for openssl_encrypt
            }
        );

        const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
        if (decryptedString && (decryptedString.trim().startsWith('{') || decryptedString.trim().startsWith('['))) {
             return decryptedString;
        }
        return null;

    } catch (e) {
        console.error("[GrammarService] Specific Decryption Failed:", e);
        return null;
    }
}

export async function fetchGrammarLessons(): Promise<GrammarLesson[]> {
    if (cachedLessons) {
        return cachedLessons;
    }

    try {
        console.log(`[GrammarService] Fetching from ${GRAMMAR_URL}`);
        const response = await fetch(GRAMMAR_URL);
        const text = await response.text();
        console.log(`[GrammarService] Raw response length: ${text.length}`);

        let envelope: ApiEnvelope<any>;

        try {
             envelope = JSON.parse(text);
        } catch (e) {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                envelope = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("Invalid JSON response");
            }
        }

        let data = envelope.Data;

        // Decrypt if string
        if (typeof data === 'string') {
            console.log(`[GrammarService] Decrypting response (Length: ${data.length}). Preview: ${data.substring(0, 20)}...`);

            // Try Grammar-specific decryption first (looks for ::)
            let decrypted = decryptGrammarData(data);

            // Fallback 1: Maybe it's just the Data part without :: (unlikely given PHP code, but good for safety)
            // or maybe the user code provided is for saving, and reading is different?
            // Assuming the PHP code is what produces the output.

            // Fallback 2: Check if it's just Base64 encoded JSON (no encryption)
            if (!decrypted) {
                try {
                    const decoded = atob(data);
                    if (decoded.trim().startsWith('{') || decoded.trim().startsWith('[')) {
                        console.warn("[GrammarService] Decryption failed, using plain Base64 fallback.");
                        decrypted = decoded;
                    }
                } catch (e) { /* ignore */ }
            }

            if (decrypted) {
                data = JSON.parse(decrypted);
            } else {
                throw new Error("Failed to decrypt grammar data");
            }
        }

        if (Array.isArray(data)) {
            cachedLessons = data.map((item: any) => ({
                ...item,
                id: Number(item.id),
            }));
            return cachedLessons!;
        } else {
            console.error("[GrammarService] Data is not an array:", data);
            return [];
        }

    } catch (error) {
        console.error("[GrammarService] Error fetching grammar:", error);
        return [];
    }
}

export function getLessonById(id: number): GrammarLesson | undefined {
    return cachedLessons?.find(l => l.id === id);
}

export function clearGrammarCache() {
    cachedLessons = null;
}
