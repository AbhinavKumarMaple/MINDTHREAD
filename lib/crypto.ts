import crypto from 'node:crypto';

// AES-256-GCM encryption for secrets at rest (the user's Gemini API key).
// Server-only. ENCRYPTION_KEY must be 32 bytes encoded as 64 hex chars.

const ALGO = 'aes-256-gcm';

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex) throw new Error('ENCRYPTION_KEY is not set');
  const buf = Buffer.from(hex, 'hex');
  if (buf.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
  }
  return buf;
}

export function encryptSecret(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    iv.toString('base64'),
    tag.toString('base64'),
    enc.toString('base64'),
  ].join(':');
}

export function decryptSecret(payload: string): string {
  const [ivb, tagb, encb] = payload.split(':');
  if (!ivb || !tagb || !encb) throw new Error('Malformed ciphertext');
  const decipher = crypto.createDecipheriv(
    ALGO,
    getKey(),
    Buffer.from(ivb, 'base64'),
  );
  decipher.setAuthTag(Buffer.from(tagb, 'base64'));
  return Buffer.concat([
    decipher.update(Buffer.from(encb, 'base64')),
    decipher.final(),
  ]).toString('utf8');
}
