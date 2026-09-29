import { createHmac, timingSafeEqual } from "crypto";

export const SESSION_COOKIE = "upsale_session";

export type SessionPayload = {
  sub: string;
  email: string;
  businessName: string;
  plan: "Free Trial";
  category: string;
  country: string;
  currency: string;
  timezone: string;
  city: string;
  whatsapp: string;
  exp: number;
};

function secret() {
  return process.env.JWT_SECRET ?? "upsale-dev-secret-change-me";
}

function sign(data: string) {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

function encode(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function token(payload: object) {
  const header = encode({ alg: "HS256", typ: "JWT" });
  const body = encode(payload);
  return `${header}.${body}.${sign(`${header}.${body}`)}`;
}

function read<T>(jwt: string | undefined | null): T | null {
  if (!jwt) return null;
  const [header, body, signature] = jwt.split(".");
  if (!header || !body || !signature) return null;
  const expected = sign(`${header}.${body}`);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(actualBuffer, expectedBuffer)) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

export function createSessionToken(payload: SessionPayload) {
  return token(payload);
}

export function readSessionToken(jwt: string | undefined | null): SessionPayload | null {
  const payload = read<SessionPayload>(jwt);
  if (!payload?.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
  if (payload.plan !== "Free Trial" || !payload.email) return null;
  return payload;
}
