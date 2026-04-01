/**
 * E2E шифрование на основе Web Crypto API (AES-GCM 256-bit)
 * Ключи генерируются на устройстве, на сервер передаётся только зашифрованный текст.
 */

const ALGO = 'AES-GCM';
const KEY_LENGTH = 256;

// ── Конвертация ──────────────────────────────────────────────────────────────

export function bufToBase64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

export function base64ToBuf(b64: string): ArrayBuffer {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// ── Генерация ключа ───────────────────────────────────────────────────────────

export async function generateChatKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: ALGO, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function exportKey(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey('raw', key);
  return bufToBase64(raw);
}

export async function importKey(b64: string): Promise<CryptoKey> {
  const raw = base64ToBuf(b64);
  return crypto.subtle.importKey('raw', raw, { name: ALGO }, true, ['encrypt', 'decrypt']);
}

// ── Шифрование/дешифрование ───────────────────────────────────────────────────

export async function encryptMessage(text: string, key: CryptoKey): Promise<{ ciphertext: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(text);
  const encrypted = await crypto.subtle.encrypt({ name: ALGO, iv }, key, encoded);
  return {
    ciphertext: bufToBase64(encrypted),
    iv: bufToBase64(iv.buffer),
  };
}

export async function decryptMessage(ciphertext: string, iv: string, key: CryptoKey): Promise<string> {
  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: ALGO, iv: base64ToBuf(iv) },
      key,
      base64ToBuf(ciphertext)
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    return '[Зашифровано]';
  }
}

// ── LocalStorage ключей (per-device) ─────────────────────────────────────────

const KEYS_STORAGE_KEY = 'tg_chat_keys';

function loadStoredKeys(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(KEYS_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveStoredKeys(keys: Record<string, string>) {
  localStorage.setItem(KEYS_STORAGE_KEY, JSON.stringify(keys));
}

export async function storeKey(chatId: string, key: CryptoKey): Promise<void> {
  const stored = loadStoredKeys();
  stored[chatId] = await exportKey(key);
  saveStoredKeys(stored);
}

export async function loadKey(chatId: string): Promise<CryptoKey | null> {
  const stored = loadStoredKeys();
  if (!stored[chatId]) return null;
  try {
    return await importKey(stored[chatId]);
  } catch {
    return null;
  }
}

export async function getOrCreateKey(chatId: string): Promise<CryptoKey> {
  const existing = await loadKey(chatId);
  if (existing) return existing;
  const key = await generateChatKey();
  await storeKey(chatId, key);
  return key;
}
