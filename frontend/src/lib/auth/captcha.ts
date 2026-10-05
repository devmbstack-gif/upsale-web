import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const CAPTCHA_TTL_SECONDS = 10 * 60;
const GRANT_TTL_MS = 15 * 60 * 1000;

type CaptchaPayload = {
  ans: number;
  exp: number;
  jti: string;
};

type CaptchaStore = {
  used: Map<string, number>;
  grants: Map<string, number>;
};

const globalStore = globalThis as typeof globalThis & { __upsaleCaptchaStore?: CaptchaStore };

function store(): CaptchaStore {
  if (!globalStore.__upsaleCaptchaStore) {
    globalStore.__upsaleCaptchaStore = { used: new Map(), grants: new Map() };
  }
  return globalStore.__upsaleCaptchaStore;
}

function secret() {
  const value = process.env.JWT_SECRET;
  if (!value) throw new Error("JWT_SECRET must be configured.");
  return value;
}

function sign(data: string) {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

function encode(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function decode<T>(value: string): T | null {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

function prune(now = Date.now()) {
  const { used, grants } = store();
  for (const [key, exp] of used) {
    if (exp <= now) used.delete(key);
  }
  for (const [key, exp] of grants) {
    if (exp <= now) grants.delete(key);
  }
}

function buildChallenge() {
  const left = Math.floor(Math.random() * 8) + 2;
  const right = Math.floor(Math.random() * 8) + 1;
  if (Math.random() > 0.35 || left === right) {
    return { prompt: `What is ${left} + ${right}?`, answer: left + right };
  }
  const high = Math.max(left, right);
  const low = Math.min(left, right);
  return { prompt: `What is ${high} - ${low}?`, answer: high - low };
}

export function issueCaptchaChallenge() {
  const challenge = buildChallenge();
  const payload: CaptchaPayload = {
    ans: challenge.answer,
    exp: Math.floor(Date.now() / 1000) + CAPTCHA_TTL_SECONDS,
    jti: randomBytes(16).toString("hex"),
  };
  const body = encode(payload);
  const token = `${body}.${sign(body)}`;
  return { prompt: challenge.prompt, token };
}

function readCaptchaToken(token: string | undefined | null): CaptchaPayload | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = sign(body);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(actualBuffer, expectedBuffer)) return null;
  return decode<CaptchaPayload>(body);
}

function hasCaptchaGrant(email: string) {
  prune();
  const exp = store().grants.get(email.toLowerCase());
  return Boolean(exp && exp > Date.now());
}

function createCaptchaGrant(email: string) {
  prune();
  store().grants.set(email.toLowerCase(), Date.now() + GRANT_TTL_MS);
}

export function verifyCaptchaForEmail(email: string, token: string | undefined, answer: string | undefined) {
  prune();
  if (hasCaptchaGrant(email)) {
    return { ok: true as const };
  }

  const payload = readCaptchaToken(token);
  if (!payload) {
    return { ok: false as const };
  }
  if (payload.exp < Math.floor(Date.now() / 1000)) {
    return { ok: false as const };
  }
  if (store().used.has(payload.jti)) {
    return { ok: false as const };
  }

  const expected = String(payload.ans);
  const provided = String(answer ?? "").trim();
  const left = Buffer.from(expected);
  const right = Buffer.from(provided);
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return { ok: false as const };
  }

  store().used.set(payload.jti, payload.exp * 1000);
  createCaptchaGrant(email);
  return { ok: true as const };
}
