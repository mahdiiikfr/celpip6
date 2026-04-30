import { API_ENDPOINTS, postForm, ApiResult } from "./api";
import {
  CelpipTestModel,
  OpenKey,
  AiGradingResult,
  CelpipWritingTestResponse,
} from "./celpip";
import { decryptBase64String, decryptGrammarStyle } from "./cryptoHelper"; // Import the new helper

// Custom helper to fetch array responses
async function postFormArray<T>(
  url: string,
  payload: Record<string, string | number | boolean>,
): Promise<T[]> {
  const body = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => {
    body.append(key, String(value));
  });

  try {
    // Construct full URL if relative
    let fullUrl = "";
    if (url.startsWith("http")) {
      fullUrl = url;
    } else {
      // In browser, relative is fine. In Node (tests), we need absolute.
      // Detect Node environment by checking for window
      if (typeof window === "undefined") {
        fullUrl = `http://localhost/api/proxy${url.startsWith("/") ? "" : "/"}${url}`;
      } else {
        fullUrl = `/api/proxy${url.startsWith("/") ? "" : "/"}${url}`;
      }
    }

    // Add timeout to prevent hanging if proxy/server is unreachable
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const text = await response.text();
    // Try to parse array
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data)) return data;
      // If it's an object (maybe error), wrap it or return empty
      return [];
    } catch (e) {
      // Try to find array in text (handling PHP warnings/errors in output)
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        return JSON.parse(match[0]);
      }
      console.error("Failed to parse array from CELPIP response", text);
      return [];
    }
  } catch (e) {
    console.error("Network error in CELPIP service", e);
    // Rethrow to allow fallback in caller
    throw e;
  }
}

export const celpipService = {
  getTestList: (): CelpipTestModel[] => {
    const listTest: CelpipTestModel[] = [];

    // Generate 27 tests (positions 1 to 14 approx)
    for (let i = 0; i < 27; i++) {
      // Lock logic: First 8 tests (indices 0-7) are unlocked
      const isLock = i >= 8;

      // OpenKey logic: First ~19 tests are Part 1, rest are Part 2
      const openKey =
        i <= 18 ? OpenKey.THE_FIRST_PART : OpenKey.THE_SECOND_PART;

      // Type logic: Even=A, Odd=B
      const testType = i % 2 === 0 ? "A" : "B";

      // Position logic: 1-based, incrementing every 2 items
      const position = Math.floor(i / 2) + 1;

      listTest.push({
        title: "CELPIP Mock ",
        isLock: isLock,
        testType: testType,
        openKey: openKey,
        position: position,
      });
    }

    return listTest;
  },

  getTestContent: async (testName: string): Promise<any[]> => {
    // Generic wrapper for backward compatibility if used elsewhere
    return celpipService.getWritingTest(testName);
  },

  getWritingTest: async (
    testName: string,
  ): Promise<CelpipWritingTestResponse[]> => {
    // testName example: "writing test 1"
    // Endpoint: memory_bank/celpip_test/get_writing_test.php
    try {
      const result = await postFormArray<CelpipWritingTestResponse>(
        "memory_bank/celpip_test/get_writing_test.php",
        {
          test_name: testName,
        },
      );
      if (result && result.length > 0) return result;
      throw new Error("Empty result from API");
    } catch (e) {
      console.error("API request failed:", e);
      throw e; // Propagate error to UI so it can show Retry
    }
  },

  getSpeakingTest: async (testName: string): Promise<any[]> => {
    // Reusing the same endpoint as writing test, just different payload logic handled by caller
    try {
      const result = await postFormArray<any>(
        "memory_bank/celpip_test/get_writing_test.php",
        {
          test_name: testName,
        },
      );

      if (result && result.length > 0 && result[0].test_content) {
        // Double parse logic specific to this API's weird structure
        // 1. First parse: The API returns an array with an object containing `test_content` string
        // 2. Second parse: `test_content` is a stringified JSON array of arrays [[...], [...]]
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
    const rawBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
    const useDirectProxyFallback = !rawBaseUrl;
    const gptPath = "memory_bank/gptChatV2.php";

    let url = `/api/proxy/${gptPath}`;
    if (!useDirectProxyFallback) {
      const cleanBase = rawBaseUrl.endsWith("/")
        ? rawBaseUrl.slice(0, -1)
        : rawBaseUrl;
      url = `${cleanBase}/${gptPath}`;
    }

    const body = new URLSearchParams();
    body.append("message", prompt);

    try {
      console.log("Submitting to AI for grading...", url);

      // Timeout handling (increased for AI generation time)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for AI

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`AI Service Error: ${response.status}`);
      }

      const rawText = await response.text();

      // Clean Markdown wrappers (```json ... ```) - keep this just in case direct response is not encrypted
      let cleanText = rawText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      console.log("Raw AI Response:", rawText);

      try {
        // Parse initial JSON envelope or array
        const data = JSON.parse(cleanText);

        // If it's an envelope with Data field (API standard)
        if (data && data.Data && typeof data.Data === "string") {
          // It's encrypted!
          console.log("Response is encrypted, attempting decryption...");

          // TRY 1: Grammar Style (Data::IV) - as per user request
          let decrypted = decryptGrammarStyle(data.Data);

          // TRY 2: Standard Base64 (Data only) - fallback
          if (!decrypted) {
            console.log("Grammar decryption failed, trying standard Base64...");
            decrypted = decryptBase64String(data.Data);
          }

          if (decrypted) {
            // console.log("Decrypted AI Data:", decrypted.substring(0, 100) + "...");

            // Robust Parsing: The AI might return Markdown (```json ... ```) INSIDE the encrypted string
            let jsonStr = decrypted.trim();

            // 1. Remove Markdown code blocks if present
            jsonStr = jsonStr
              .replace(/```json/g, "")
              .replace(/```/g, "")
              .trim();

            // 2. Find first JSON char ([ or {)
            const firstChar = jsonStr.search(/[\[\{]/);
            if (firstChar !== -1) {
              jsonStr = jsonStr.substring(firstChar);
              // Find last JSON char (] or })
              const lastBracket = Math.max(
                jsonStr.lastIndexOf("]"),
                jsonStr.lastIndexOf("}"),
              );
              if (lastBracket !== -1) {
                jsonStr = jsonStr.substring(0, lastBracket + 1);
              }
            }

            // 3. Sanitize Control Characters (Newlines, Tabs) inside JSON strings
            // AI sometimes outputs formatted JSON with structural whitespace (valid)
            // BUT also puts literal newlines inside string values (invalid JSON).
            // We must escape newlines ONLY inside strings.
            // Regex: Match double-quoted strings, handling escaped quotes.
            try {
              // Try standard parsing first (in case it IS valid)
              // const resultObj = JSON.parse(jsonStr);
              // Actually, let's just sanitize first to be safe against the common error.
              // But wait, if we sanitize incorrectly, we break valid JSON.
              // So let's try to parse first.
              const resultObj = JSON.parse(jsonStr);
              if (Array.isArray(resultObj) && resultObj.length > 0) {
                return resultObj[0] as AiGradingResult;
              }
              if (typeof resultObj === "object") {
                return resultObj as AiGradingResult;
              }
            } catch (e) {
              // Failed. Likely "Bad control character".
              // Try to sanitize strings: Replace newlines/tabs inside quotes.
              // Regex explanation: " ( ([^"\\]) OR (\\.) )* "
              // We use a callback to replace only inside the match.
              jsonStr = jsonStr.replace(/"(?:[^"\\]|\\.)*"/g, (match) => {
                return match
                  .replace(/\n/g, "\\n")
                  .replace(/\r/g, "\\r")
                  .replace(/\t/g, "\\t");
              });

              const resultObj = JSON.parse(jsonStr);
              if (Array.isArray(resultObj) && resultObj.length > 0) {
                return resultObj[0] as AiGradingResult;
              }
              if (typeof resultObj === "object") {
                return resultObj as AiGradingResult;
              }
            }

            // If we got here, both parse attempts failed (because the second one throws)
            // Or if the first one succeeded, we already returned.
            // Actually, the catch block throws if the second parse fails.
            // So if we exit the catch block, we must have returned? No, the second parse block has duplicate returns.
            // We should structure this better, but let's just let the 'catch' propagate.

            throw new Error("Invalid response structure");
          } else {
            throw new Error("Failed to decrypt API response");
          }
        }

        // If it's already a plain array (fallback)
        if (Array.isArray(data) && data.length > 0) {
          return data[0] as AiGradingResult;
        }
        // Fallback if it returns just object
        else if (typeof data === "object" && data !== null) {
          return data as AiGradingResult;
        }

        throw new Error("Invalid response format or empty data");
      } catch (jsonError) {
        console.error("JSON Parse/Processing Error:", jsonError);
        throw new Error("Failed to process AI response");
      }
    } catch (e) {
      console.error("AI Grading Error:", e);
      throw e;
    }
  },
};
