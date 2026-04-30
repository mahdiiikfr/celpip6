import CryptoJS from 'crypto-js';

const KEY_STRING = "P@ssw0rd!Xy#7qL2";
const IV_STRING = "X7p@9vL#1k$z!eQ2";

/**
 * Creates the Secret Key matching the Android implementation.
 * 1. Hash the password string with SHA-256 (32 bytes).
 * 2. Take the first 16 bytes.
 */
function createSecretKey(): CryptoJS.lib.WordArray {
    const fullKeyHash = CryptoJS.SHA256(KEY_STRING);

    // Create a new WordArray with just the first 4 words (16 bytes)
    // We explicitly slice to ensure we have a clean 128-bit key.
    return CryptoJS.lib.WordArray.create(fullKeyHash.words.slice(0, 4), 16);
}

/**
 * Creates the IV from the hardcoded string.
 */
function createIV(): CryptoJS.lib.WordArray {
    return CryptoJS.enc.Utf8.parse(IV_STRING);
}

const SECRET_KEY = createSecretKey();
const IV = createIV();

/**
 * Decrypts binary response using the fixed Key and IV.
 */
export function decryptResponse(response: ArrayBuffer): string | null {
    try {
        // Convert ArrayBuffer to WordArray
        // Note: CryptoJS handles ArrayBuffer directly in newer versions via lib.WordArray.create
        const encryptedWordArray = CryptoJS.lib.WordArray.create(response as any);

        const decrypted = CryptoJS.AES.decrypt(
            { ciphertext: encryptedWordArray } as any,
            SECRET_KEY,
            {
                iv: IV,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }
        );

        const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

        // Validation: Must look like JSON
        if (decryptedString && (decryptedString.trim().startsWith('{') || decryptedString.trim().startsWith('['))) {
             return decryptedString;
        }

        console.warn("Decrypted string does not look like JSON:", decryptedString.substring(0, 50));
        return null;

    } catch (e) {
        console.error("Decryption failed:", e);
        return null;
    }
}

/**
 * Decrypts a Base64 encoded string using the fixed Key and IV.
 */
export function decryptBase64String(base64String: string): string | null {
    try {
        const encryptedWordArray = CryptoJS.enc.Base64.parse(base64String);
        const decrypted = CryptoJS.AES.decrypt(
            { ciphertext: encryptedWordArray } as any,
            SECRET_KEY,
            {
                iv: IV,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }
        );

        const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

        if (decryptedString && (decryptedString.trim().startsWith('{') || decryptedString.trim().startsWith('['))) {
             return decryptedString;
        }

        return null;
    } catch (e) {
        console.error("Base64 Decryption failed:", e);
        return null;
    }
}

/**
 * Decrypts data using the specific "Grammar" logic/key.
 * Key: "e5G]{31ktjM}shMpRja.P)i)Pzc" (SHA-256 hashed, first 16 bytes)
 * Format: "IV::CIPHERTEXT" (Base64 encoded parts separated by ::)
 * OR maybe "CIPHERTEXT::IV"? Let's check the code I read.
 * The code I read said: `const parts = encryptedString.split('::'); const base64Data = parts[0]; const base64Iv = parts[1];`
 * So it's "CIPHERTEXT::IV".
 */
export function decryptGrammarStyle(encryptedString: string): string | null {
    const GRAMMAR_KEY_STRING = 'e5G]{31ktjM}shMpRja.P)i)Pzc';

    try {
        const parts = encryptedString.split('::');
        if (parts.length !== 2) {
            console.warn("[Crypto] Invalid Grammar format, missing '::'");
            // Fallback: Try straight Base64 just in case
            try {
                 const decoded = atob(encryptedString);
                 if (decoded.trim().startsWith('{') || decoded.trim().startsWith('[')) return decoded;
            } catch (e) {}
            return null;
        }

        const base64Data = parts[0];
        const base64Iv = parts[1];

        // Prepare Key
        const fullKeyHash = CryptoJS.SHA256(GRAMMAR_KEY_STRING);
        const key = CryptoJS.lib.WordArray.create(fullKeyHash.words.slice(0, 4), 16);

        // Prepare IV
        const iv = CryptoJS.enc.Base64.parse(base64Iv);

        // Prepare Ciphertext
        const ciphertext = CryptoJS.enc.Base64.parse(base64Data);

        const decrypted = CryptoJS.AES.decrypt(
            { ciphertext: ciphertext } as any,
            key,
            {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }
        );

        const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

        // Relaxed validation: If it decrypts to a non-empty string, return it.
        // The caller (celpipService) should handle JSON parsing or cleanup.
        if (decryptedString && decryptedString.length > 0) {
             return decryptedString;
        }

        console.warn("[Crypto] Grammar-style decryption produced empty string.");
        return null;

    } catch (e) {
        console.error("[Crypto] Grammar-style decryption failed:", e);
        return null;
    }
}
