"use client";

import { useEffect, useState } from "react";
import styles from "./auth.module.css";

export type CaptchaProof = {
  token: string;
  answer: string;
};

type CaptchaWidgetProps = {
  solved: boolean;
  onSolvedChange: (solved: boolean, proof?: CaptchaProof) => void;
};

type Challenge = {
  prompt: string;
  token: string;
};

function readAnswerFromToken(token: string): number | null {
  try {
    const body = token.split(".")[0];
    if (!body) return null;
    const padded = body.replace(/-/g, "+").replace(/_/g, "/");
    const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
    const json = JSON.parse(atob(padded + pad)) as { ans?: number };
    return typeof json.ans === "number" ? json.ans : null;
  } catch {
    return null;
  }
}

export default function CaptchaWidget({ solved, onSolvedChange }: CaptchaWidgetProps) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);
  const [loadError, setLoadError] = useState("");

  async function loadChallenge() {
    setLoadError("");
    setChallenge(null);
    setValue("");
    setTouched(false);
    onSolvedChange(false);
    try {
      const response = await fetch("/api/auth/captcha", { method: "GET", cache: "no-store" });
      const payload = (await response.json()) as { ok?: boolean; prompt?: string; token?: string };
      if (!response.ok || !payload.prompt || !payload.token) {
        setLoadError("Could not load the security question.");
        return;
      }
      setChallenge({ prompt: payload.prompt, token: payload.token });
    } catch {
      setLoadError("Could not load the security question.");
    }
  }

  useEffect(() => {
    void loadChallenge();
    // Intentionally run once on mount; refresh reloads via button.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const expectedAnswer = challenge ? readAnswerFromToken(challenge.token) : null;
  const matches =
    challenge !== null &&
    expectedAnswer !== null &&
    value.trim() !== "" &&
    Number(value) === expectedAnswer;

  return (
    <div className={styles.captcha}>
      <span>Confirm you are a person</span>
      <div className={styles.captchaRow}>
        <div className={styles.puzzle}>{challenge?.prompt ?? (loadError || "Loading question...")}</div>
        <button
          type="button"
          className={styles.ghost}
          onClick={() => {
            void loadChallenge();
          }}
          aria-label="Refresh question"
        >
          Refresh
        </button>
      </div>
      <label className={styles.field}>
        Answer
        <input
          inputMode="numeric"
          autoComplete="off"
          value={value}
          disabled={!challenge}
          aria-invalid={touched && !matches}
          onChange={(event) => {
            const next = event.target.value.replace(/[^\d]/g, "");
            setValue(next);
            if (!challenge || expectedAnswer === null) {
              onSolvedChange(false);
              return;
            }
            const ok = next !== "" && Number(next) === expectedAnswer;
            onSolvedChange(ok, ok ? { token: challenge.token, answer: next } : undefined);
          }}
          onBlur={() => setTouched(true)}
        />
      </label>
      {loadError ? <span className={styles.error}>{loadError}</span> : null}
      {touched && challenge && !matches ? <span className={styles.error}>That answer is not correct.</span> : null}
      {solved ? <span className={styles.hint}>Check passed.</span> : null}
    </div>
  );
}
