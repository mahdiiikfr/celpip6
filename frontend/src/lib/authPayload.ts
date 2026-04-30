import { normalizeIranPhone } from './phoneNumber';

const pad = (value: number) => value.toString().padStart(2, '0');

const isLeapYear = (year: number) =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

const buildLifecycleFields = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const firstDayOfMonth = '01';
  const firstMonth = month;
  const timestamp = Math.floor(now.getTime() / 1000).toString();

  // FIX: Backend expects yyyy/MM/dd (slashes) not yyyy-MM-dd
  return {
    firstStartDate: `${year}/${month}/${day}`,
    firstDayOfMonth,
    firstDayWeek: ((now.getDay() + 1) % 7 || 7).toString(),
    firstMonth,
    lastTimestamp: timestamp,
    firstYearDay: '1',
    lastDayOfYear: (isLeapYear(year) ? 366 : 365).toString(),
    firstYear: year.toString(),
    firstTimestamp: timestamp,
  };
};

// Generate a consistent device ID (simulating ANDROID_ID)
export const getDeviceId = (): string => {
    // Check localStorage first
    let deviceId = '';
    try {
        deviceId = localStorage.getItem('device_id') || '';
        if (!deviceId) {
            // Generate a random 16-char hex string to mimic Android ID
            const array = new Uint8Array(8);
            crypto.getRandomValues(array);
            deviceId = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
            localStorage.setItem('device_id', deviceId);
        }
    } catch (e) {
        // Fallback if localStorage fails
        deviceId = `web-${Date.now()}`;
    }
    return deviceId;
};

// **MODIFIED:** Now accepts an identifier (email or phone) and an optional explicit userId
const createAccountIdentifiers = (identifier?: string, explicitUserId?: string) => {
  // Use persistent device ID as usernameID (simulating Android behavior)
  const deviceId = getDeviceId();

  // Also keep username as the identifier (phone/email) or fallback
  const username = identifier || deviceId;

  // Check if identifier is a phone number
  const isPhone = /^\d+$/.test(identifier?.replace('+', '') || '');
  const phone = isPhone ? normalizeIranPhone(identifier!) : '';

  // The `usernameID` MUST match the `userId` sent in the SMS verification step.
  // If explicitUserId is provided (from LoginScreen), use it.
  // Otherwise fall back to deviceId.
  const finalUsernameID = explicitUserId || deviceId;

  return {
    usernameID: finalUsernameID,
    username: username,
    backup: '0',
    phone: phone,
  };
};

// Phase 1: Request OTP
export const buildSmsPayload = (mobile: string, userId: string) => ({
    mobile,
    userId
});

// Phase 2: Verify & Login
export const buildPhoneLoginPayload = (phone: string, codeVerify: string, userId: string) => ({
  ...createAccountIdentifiers(phone, userId),
  ...buildLifecycleFields(),
  codeVerify,
});

// **MODIFIED:** Now accepts email to pass to the identifier function
export const buildGoogleLoginPayload = (
  idToken: string,
  email: string,
) => ({
  idToken,
  ...createAccountIdentifiers(email), // Use email as the main identifier, usernameID will be deviceId
  ...buildLifecycleFields(),
});
