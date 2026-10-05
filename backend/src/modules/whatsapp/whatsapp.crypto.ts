import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';

export function encryptWhatsAppSecret(value: string, masterKey: string) {
  const key = scryptSync(masterKey, 'upsale-whatsapp-v1', 32);
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return ['v1', iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), encrypted.toString('base64url')].join(':');
}

export function decryptWhatsAppSecret(value: string, masterKey: string) {
  const [version, iv, tag, encrypted] = value.split(':');
  if (version !== 'v1' || !iv || !tag || !encrypted) throw new Error('Invalid encrypted WhatsApp credential.');
  const key = scryptSync(masterKey, 'upsale-whatsapp-v1', 32);
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64url'));
  decipher.setAuthTag(Buffer.from(tag, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(encrypted, 'base64url')), decipher.final()]).toString('utf8');
}
