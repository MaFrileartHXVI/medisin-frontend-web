import CryptoJS from 'crypto-js';

// Shared Encryption Key matching Backend PAYLOAD_ENCRYPTION_KEY in .env
export const CRYPTO_KEY = import.meta.env.VITE_PAYLOAD_KEY || 'SintasiSecurePayloadKey2026#X9!';

/**
 * Encrypt plaintext string using AES-256-CBC (CryptoJS OpenSSL standard format)
 * Produces base64 string beginning with 'Salted__' which Backend DecryptPayload decodes.
 */
export function encryptPayload(plainText) {
  if (!plainText) return '';
  return CryptoJS.AES.encrypt(String(plainText), CRYPTO_KEY).toString();
}

/**
 * Decrypt ciphertext string if needed
 */
export function decryptPayload(cipherText) {
  if (!cipherText) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, CRYPTO_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    console.error('Decryption failed:', e);
    return cipherText;
  }
}

