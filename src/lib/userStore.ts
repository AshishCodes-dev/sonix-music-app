export interface LocalUserRecord {
  id: string;
  email: string;
  password?: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
}

const USERS_KEY = 'soniq_local_user_accounts';
const SESSION_KEY = 'soniq_local_active_session';

export function getLocalUsers(): LocalUserRecord[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function registerLocalUser(email: string, password: string, displayName: string): LocalUserRecord {
  const users = getLocalUsers();
  const cleanEmail = email.toLowerCase().trim();
  const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (existing) {
    // Update existing user's password and name
    existing.password = password;
    if (displayName) existing.displayName = displayName;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return existing;
  }

  const newUser: LocalUserRecord = {
    id: `local_user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    email: cleanEmail,
    password,
    displayName: displayName || cleanEmail.split('@')[0],
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return newUser;
}

export function findLocalUser(email: string): LocalUserRecord | undefined {
  const cleanEmail = email.toLowerCase().trim();
  return getLocalUsers().find((u) => u.email.toLowerCase() === cleanEmail);
}

export function verifyLocalUser(email: string, password?: string): LocalUserRecord | null {
  const user = findLocalUser(email);
  if (!user) return null;
  if (!password || user.password === password) return user;
  return null;
}

export function saveActiveLocalSession(user: LocalUserRecord | null) {
  try {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch {}
}

export function getActiveLocalSession(): LocalUserRecord | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearActiveLocalSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}
