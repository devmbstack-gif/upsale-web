"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/validations/auth";
import styles from "./auth.module.css";

type ForgotPasswordModalProps = { open: boolean; onClose: () => void };

export default function ForgotPasswordModal({ open, onClose }: ForgotPasswordModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const otpInputs = useRef<Array<HTMLInputElement | null>>([]);
  const [submitting, setSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    if (!open || step !== "otp" || resendCooldown <= 0) return;
    const timer = window.setTimeout(() => setResendCooldown((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [open, step, resendCooldown]);

  if (!open) return null;

  async function sendOtp(targetEmail: string) {
    setSubmitting(true);
    setFormError("");
    setFormSuccess("");
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
      });
      const payload = (await response.json()) as { ok: boolean; message?: string; waitSeconds?: number };
      if (!response.ok || !payload.ok) {
        if (response.status === 429 && payload.waitSeconds) {
          setResendCooldown(payload.waitSeconds);
        }
        setFormError(payload.message ?? "Could not send the OTP.");
        return false;
      }
      setEmail(targetEmail.trim().toLowerCase());
      setStep("otp");
      setDigits(["", "", "", "", "", ""]);
      setResendCooldown(60);
      setFormSuccess("OTP is sent to your email.");
      return true;
    } catch {
      setFormError("Could not send the OTP.");
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function requestOtp(values: ForgotPasswordValues) {
    await sendOtp(values.email);
  }

  async function verifyOtp() {
    const code = digits.join("");
    setFormError("");
    setFormSuccess("");
    if (!/^\d{6}$/.test(code)) return setFormError("Enter the six-digit OTP.");
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/verify-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const payload = (await response.json()) as { ok: boolean; message?: string; token?: string };
      if (!response.ok || !payload.ok) {
        setFormError(payload.message ?? "Could not verify the OTP.");
        return;
      }
      if (!payload.token) {
        setFormError("Could not start the password reset.");
        return;
      }
      onClose();
      router.push(`/reset-password?token=${encodeURIComponent(payload.token)}`);
    } catch {
      setFormError("Could not verify the OTP.");
    } finally {
      setSubmitting(false);
    }
  }

  function changeDigit(index: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < 5) otpInputs.current[index + 1]?.focus();
  }

  function handleOtpKey(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  }

  function pasteOtp(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    event.preventDefault();
    const next = ["", "", "", "", "", ""];
    pasted.split("").forEach((digit, index) => { next[index] = digit; });
    setDigits(next);
    otpInputs.current[Math.min(pasted.length, 5)]?.focus();
  }

  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="forgot-title" onClick={(event) => event.stopPropagation()}>
        <p className={styles.eyebrow}>Password reset</p>
        <h2 id="forgot-title">{step === "email" ? "Forgot your password?" : "Enter your reset OTP"}</h2>
        <p className={styles.lede}>
          {step === "email"
            ? "Enter the business email for your account. We will send a six-digit OTP."
            : `We sent a six-digit OTP to ${email}. It expires in 5 minutes.`}
        </p>

        {step === "email" ? (
          <form className={styles.fields} onSubmit={handleSubmit(requestOtp)} noValidate>
            <label className={styles.field}>
              Business email
              <input type="email" autoComplete="email" placeholder="you@business.com" {...register("email")} />
              {errors.email?.message ? <span className={styles.error}>{errors.email.message}</span> : null}
            </label>
            {formError ? <p className={styles.error}>{formError}</p> : null}
            <div className={styles.actions}>
              <button type="button" className={styles.ghost} onClick={onClose} disabled={submitting}>Close</button>
              <button type="submit" className={styles.primary} disabled={submitting}>{submitting ? "Sending…" : "Send OTP"}</button>
            </div>
          </form>
        ) : (
          <div className={styles.fields}>
            <div className={styles.field}>
              Six-digit OTP
              <div className={styles.otpRow}>
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(node) => { otpInputs.current[index] = node; }}
                    className={styles.otpInput}
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    value={digit}
                    aria-label={`OTP digit ${index + 1}`}
                    onChange={(event) => changeDigit(index, event.target.value)}
                    onKeyDown={(event) => handleOtpKey(index, event)}
                    onPaste={pasteOtp}
                  />
                ))}
              </div>
            </div>
            {formError ? <p className={styles.error}>{formError}</p> : null}
            {formSuccess ? <p className={styles.success}>{formSuccess}</p> : null}
            <p className={styles.note}>
              {resendCooldown > 0 ? (
                <>Resend OTP in {resendCooldown}s</>
              ) : (
                <button
                  type="button"
                  className={styles.textButton}
                  disabled={submitting}
                  onClick={() => void sendOtp(email)}
                >
                  {submitting ? "Sending…" : "Resend OTP"}
                </button>
              )}
            </p>
            <div className={styles.actions}>
              <button type="button" className={styles.ghost} onClick={() => { setStep("email"); setDigits(["", "", "", "", "", ""]); setFormError(""); setFormSuccess(""); }} disabled={submitting}>Back</button>
              <button type="button" className={styles.primary} onClick={() => void verifyOtp()} disabled={submitting || digits.some((digit) => !digit)}>{submitting ? "Verifying…" : "Verify OTP"}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
