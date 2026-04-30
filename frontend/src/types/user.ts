export interface UserProfile {
  type: 'phone' | 'email' | 'guest';
  identifier: string; // Phone number, Email, or Guest ID
  displayName?: string; // For UI display (e.g., "Ali Reza", "Guest")
  referralCode?: string;
  nationality?: {
    code: string;
    name: string;
    nativeName: string;
    flagUrl: string;
  };
  avatarUrl?: string;
}

// Helper to retrieve user profile
export const getUserProfile = (): UserProfile | null => {
  try {
    // 1. Try reading the new standardized profile
    const stored = localStorage.getItem('userProfile');
    if (stored) {
       return JSON.parse(stored);
    }

    // 2. Fallback to legacy userInfo if profile is missing
    const legacy = localStorage.getItem('userInfo');
    if (legacy) {
      const parsed = JSON.parse(legacy);

      // Guest Check
      if (parsed.email && (parsed.email.toString().toLowerCase().includes('guest') || parsed.email.toString().includes('مهمان'))) {
          return { type: 'guest', identifier: parsed.email, displayName: parsed.email };
      }

      // Email Check
      if (parsed.email && parsed.email.includes('@')) {
          return { type: 'email', identifier: parsed.email, displayName: parsed.name, avatarUrl: parsed.picture };
      }

      // Phone Check
      // API responses might put phone in: mobile, phone, phoneNumber, userId, or even just 'mobile' property
      const phone = parsed.mobile || parsed.phone || parsed.phoneNumber || parsed.userId;
      if (phone) {
          return { type: 'phone', identifier: phone, displayName: phone };
      }
    }

    return null;
  } catch (e) {
    console.error("Error parsing user profile:", e);
    return null;
  }
};

export const saveUserProfile = (profile: UserProfile) => {
  localStorage.setItem('userProfile', JSON.stringify(profile));
  // Reset auto backup time to trigger a backup right after login
  localStorage.removeItem('last_auto_backup_time');
  // Dispatch event for components to sync
  window.dispatchEvent(new Event('storage'));
};

export const updateUserProfile = (updates: Partial<UserProfile>) => {
  const current = getUserProfile();
  if (current) {
    const updated = { ...current, ...updates };
    localStorage.setItem('userProfile', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  }
};
