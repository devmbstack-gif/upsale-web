"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import styles from "./auth.module.css";

type OtpModalProps = {
  open: boolean;
  email: string;
  error?: string;
  submitting: boolean;
  onSubmitCode: (code: string) => void;
  onResend: () => void;
  onClose: () => void;
};

export default function OtpModal({
  open,
  email,
  error,
  submitting,
  onSubmitCode,
  onResend,
  onClose,
}: OtpModalProps) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [seconds, setSeconds] = useState(60);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!open) return;
    setDigits(["", "", "", "", "", ""]);
    setSeconds(60);
    inputs.current[0]?.focus();
  }, [open]);

  useEffect(() => {
    if (!open || seconds <= 0) return;
    const timer = window.setTimeout(() => setSeconds((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [open, seconds]);

  if (!open) return null;

  function writeDigits(next: string[]) {
    setDigits(next);
  }

  function handleChange(index: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    writeDigits(next);
    if (digit && index < 5) inputs.current[index + 1]?.focus();
  }

  function handleKey(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    event.preventDefault();
    const next = ["", "", "", "", "", ""];
    pasted.split("").forEach((digit, index) => {
      next[index] = digit;
    });
    writeDigits(next);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  }

  const code = digits.join("");

  return (
    <div className={styles.overlay} role="presentation">
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="otp-title">
        <p className={styles.eyebrow}>Email verification</p>
        <h2 id="otp-title">Enter the 6-digit code</h2>
        <p className={styles.lede}>We sent a code to {email}. It expires in 5 minutes.</p>
        <div className={styles.otpRow}>
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(node) => {
                inputs.current[index] = node;
              }}
              className={styles.otpInput}
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              maxLength={1}
              value={digit}
              aria-label={`Digit ${index + 1}`}
              onChange={(event) => handleChange(index, event.target.value)}
              onKeyDown={(event) => handleKey(index, event)}
              onPaste={handlePaste}
            />
          ))}
        </div>
        {error ? <p className={styles.error}>{error}</p> : null}
        <div className={styles.actions}>
          <button type="button" className={styles.ghost} onClick={onClose} disabled={submitting}>
            Back
          </button>
          <button
            type="button"
            className={styles.primary}
            disabled={code.length !== 6 || submitting}
            onClick={() => onSubmitCode(code)}
          >
            {submitting ? "Checking…" : "Verify email"}
          </button>
        </div>
        <p className={styles.note}>
          {seconds > 0 ? (
            <>Resend OTP in {seconds}s</>
          ) : (
            <button type="button" className={styles.textButton} onClick={onResend} disabled={submitting}>
              Resend OTP
            </button>
          )}
        </p>
      </div>
    </div>
  );
}
