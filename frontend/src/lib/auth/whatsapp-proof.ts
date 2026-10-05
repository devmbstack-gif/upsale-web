import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

type Proof = { email: string; phone: string; exp: number };
function secret() { const value = process.env.AUTH_SECRET || process.env.JWT_SECRET; if (!value) throw new Error("AUTH_SECRET or JWT_SECRET is required."); return value; }
function sign(body: string) { return createHmac("sha256", secret()).update(body).digest("base64url"); }

export function createWhatsAppProof(email: string, phone: string) {
  const body = Buffer.from(JSON.stringify({ email: email.toLowerCase(), phone, exp: Date.now() + 10 * 60 * 1000 } satisfies Proof)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifyWhatsAppProof(token: string, email: string, phone: string) {
  const [body, signature] = token.split("."); if (!body || !signature) return false;
  const expected = Buffer.from(sign(body)); const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return false;
  try { const proof = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Proof; return proof.exp > Date.now() && proof.email === email.toLowerCase() && proof.phone === phone; } catch { return false; }
}
