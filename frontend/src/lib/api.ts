// VITE_API_BASE_URL allows direct connection (e.g. https://naturrregenius.ir) bypassing proxies on PaaS providers.
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const useDirectProxyFallback = !rawBaseUrl; // if no base URL, fallback to Vercel/Local proxy approach

// Helper to construct the prefix based on environment
const buildPrefix = (pathSuffix: string) => {
  if (useDirectProxyFallback) {
    return `/api/proxy/${pathSuffix}`;
  }
  const cleanBase = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
  return `${cleanBase}/${pathSuffix}`;
};

// Base endpoints
const DEFAULT_BASE_URL = buildPrefix('memory_bank/apiNew/');
const DEFAULT_SMS_URL = buildPrefix('memory_bank/sms/sendSms.php');
const DEFAULT_LOGIN_PHONE_PATH = 'login/login_or_sign_phone.php';
const DEFAULT_LOGIN_EMAIL_PATH = 'login/checkTokenSignEmail.php';
const DEFAULT_DELETE_LIMIT_URL = buildPrefix('memory_bank/apiNew/delete_limit.php');
const DEFAULT_BOOKS_LIST_URL = 'books/v4/getListCategoryBook.php';
const DEFAULT_DAILY_LESSON_URL = buildPrefix('memory_bank/apiNew/daily_lessons/getDataDay.php');
const DEFAULT_GPT_URL = buildPrefix('memory_bank/gpt/MakingSentencesWithWords.php');

const DEFAULT_GOOGLE_CLIENT_ID =
  '141360819251-8du8ppvmeqj1ctck0b67n362tvth9gg5.apps.googleusercontent.com';

const ensureEndsWithSlash = (value: string) =>
  value.endsWith('/') ? value : `${value}/`;

const baseUrl = ensureEndsWithSlash(DEFAULT_BASE_URL);

const resolveEndpoint = (override: string | undefined, path: string) => {
  if (override?.trim()) return override.trim();
  return `${baseUrl}${path}`;
};

// NEW: Helper for transforming raw backup URLs to the proxy format equivalent to Android's makeBackupUrl
export const makeBackupUrl = (rawUrl: string): string => {
    // rawUrl looks like "https://something.com/memory_bank/..."
    // We want to just use our configured base url build logic
    if (!rawUrl) return rawUrl;

    // Find everything after /memory_bank/
    const marker = '/memory_bank/';
    const markerIndex = rawUrl.indexOf(marker);

    if (markerIndex !== -1) {
        const relativePath = rawUrl.substring(markerIndex + marker.length);
        // By replacing 'apiNew/' with an empty string, we can use resolveEndpoint
        // to properly construct the full proxy/domain URL for the backup file.
        const pathWithoutApiNew = relativePath.replace(/^apiNew\//, '');
        return resolveEndpoint(undefined, `../${pathWithoutApiNew}`);
    }

    return rawUrl;
};

export const API_ENDPOINTS = {
  sendSms: DEFAULT_SMS_URL,
  loginWithPhone: resolveEndpoint(
    undefined,
    DEFAULT_LOGIN_PHONE_PATH,
  ),
  loginWithGoogle: resolveEndpoint(
    undefined,
    DEFAULT_LOGIN_EMAIL_PATH,
  ),
  booksList: resolveEndpoint(
    undefined,
    DEFAULT_BOOKS_LIST_URL,
  ),
  deleteLimit: DEFAULT_DELETE_LIMIT_URL,
  dailyLesson: DEFAULT_DAILY_LESSON_URL,
  // PLACEMENT TEST ENDPOINTS
  levelStart: resolveEndpoint(undefined, 'levelUser/start.php'),
  levelAnswer: resolveEndpoint(undefined, 'levelUser/answer.php'),
  levelFinish: resolveEndpoint(undefined, 'levelUser/finish.php'),
  levelReview: resolveEndpoint(undefined, 'levelUser/review.php'),
  levelHistory: resolveEndpoint(undefined, 'levelUser/history.php'),
  levelLastAttempt: resolveEndpoint(undefined, 'levelUser/last_attempt.php'),
  levelDeleteAttempt: resolveEndpoint(undefined, 'levelUser/delete_attempt.php'),

  // BACKUP
  uploadBackup: resolveEndpoint(undefined, 'backup/backupMultipart.php'),
  restoreBackup: resolveEndpoint(undefined, '../restore_new.php'),

  // GPT
  gptSentence: DEFAULT_GPT_URL,

} as const;

export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || DEFAULT_GOOGLE_CLIENT_ID;

export interface ApiEnvelope<T> {
  Message?: string | number;
  Data?: T;
  [key: string]: unknown;
}

export interface ApiResult<T> {
  ok: boolean;
  status: number;
  envelope: ApiEnvelope<T>;
}

export async function fetchBooksList<T>(): Promise<ApiResult<T>> {
  const url = API_ENDPOINTS.booksList;
  console.log(`[API Request] GET ${url}`);

  const response = await fetch(url, {
    method: 'GET', // Or POST if required by PHP, but usually lists are GET. Wait, the API uses PHP which might expect POST even for lists. I'll stick to POST with empty body or standard GET. Let's try POST first as `postForm` is standard here.
    // Actually, let's allow `postForm` to handle it if we want consistency, but `fetchBooksList` implies no payload.
  });

  // Re-using logic below...
  let envelope: ApiEnvelope<T> = {};
  const text = await response.text();
  console.log(`[API Response] ${url} | Status: ${response.status} ${response.statusText}`, text);

  if (!response.ok) {
    console.error(`[API HTTP Error] GET ${url} returned ${response.status} ${response.statusText}`);
    const headersObj: Record<string, string> = {};
    response.headers.forEach((value, key) => { headersObj[key] = value; });
    console.error(`[API HTTP Error Headers]`, headersObj);
  }


  try {
    envelope = JSON.parse(text) as ApiEnvelope<T>;
  } catch (error) {
     // ... same dirty JSON logic
    console.warn('Initial JSON parse failed, attempting extraction...');
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            envelope = JSON.parse(jsonMatch[0]) as ApiEnvelope<T>;
        } else {
            throw new Error('No JSON found');
        }
    } catch (extractError) {
        console.error('API Response Parse Error:', text);
        throw new Error(text.substring(0, 100) + (text.length > 100 ? '...' : ''));
    }
  }

  return {
    ok: response.ok,
    status: response.status,
    envelope,
  };
}

export async function postForm<T>(
  url: string,
  payload: Record<string, string | number | boolean>, // Allow string | number | boolean for flexibility
  headers?: Record<string, string>
): Promise<ApiResult<T>> {
  const body = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => {
      body.append(key, String(value));
  });

  console.log(`[API Request] POST Form ${url}`, payload);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...(headers || {})
    },
    body,
  });

  let envelope: ApiEnvelope<T> = {};
  const text = await response.text();
  console.log(`[API Response] ${url} | Status: ${response.status} ${response.statusText}`, text);

  if (!response.ok) {
    console.error(`[API HTTP Error] POST Form ${url} returned ${response.status} ${response.statusText}`);
    const headersObj: Record<string, string> = {};
    response.headers.forEach((value, key) => { headersObj[key] = value; });
    console.error(`[API HTTP Error Headers]`, headersObj);
  }

  try {
    envelope = JSON.parse(text) as ApiEnvelope<T>;
  } catch (error) {
    // Attempt to sanitize "dirty" JSON (e.g. PHP warnings before JSON)
    console.warn('Initial JSON parse failed, attempting extraction...');
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            envelope = JSON.parse(jsonMatch[0]) as ApiEnvelope<T>;
        } else {
            throw new Error('No JSON found');
        }
    } catch (extractError) {
        console.error('API Response Parse Error:', text);
        // Return the raw text as the error message so the user sees "PHP Warning..." if that's what it is
        throw new Error(text.substring(0, 100) + (text.length > 100 ? '...' : ''));
    }
  }

  return {
    ok: response.ok,
    status: response.status,
    envelope,
  };
}

// NEW: Helper for JSON body requests
export async function postJson<T>(
  url: string,
  payload: any,
  headers?: Record<string, string>
): Promise<ApiResult<T>> {
  console.log(`[API Request] POST JSON ${url}`, payload);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {})
    },
    body: JSON.stringify(payload),
  });

  let envelope: ApiEnvelope<T> = {};
  const text = await response.text();
  console.log(`[API Response] ${url} | Status: ${response.status} ${response.statusText}`, text);

  if (!response.ok) {
    console.error(`[API HTTP Error] POST JSON ${url} returned ${response.status} ${response.statusText}`);
    const headersObj: Record<string, string> = {};
    response.headers.forEach((value, key) => { headersObj[key] = value; });
    console.error(`[API HTTP Error Headers]`, headersObj);
  }

  try {
    envelope = JSON.parse(text) as ApiEnvelope<T>;
  } catch (error) {
    console.warn('Initial JSON parse failed, attempting extraction...');
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            envelope = JSON.parse(jsonMatch[0]) as ApiEnvelope<T>;
        } else {
            throw new Error('No JSON found');
        }
    } catch (extractError) {
        console.error('API Response Parse Error:', text);
        throw new Error(text.substring(0, 100) + (text.length > 100 ? '...' : ''));
    }
  }

  return {
    ok: response.ok,
    status: response.status,
    envelope,
  };
}
