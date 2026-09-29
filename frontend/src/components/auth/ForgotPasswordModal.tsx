"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/validations/auth";
import styles from "./auth.module.css";

type ForgotPasswordModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function ForgotPasswordModal({ open, onClose }: ForgotPasswordModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  if (!open) return null;

  async function onSubmit(values: ForgotPasswordValues) {
    setSubmitting(true);
    setFormError("");
    setFormSuccess("");
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = (await response.json()) as { ok: boolean; message?: string };
      if (!response.ok || !payload.ok) {
        setFormError(payload.message ?? "Could not send the reset link.");
        return;
      }
      setFormSuccess(payload.message ?? "If that email is registered, a reset link is on its way.");
      reset({ email: "" });
    } catch {
      setFormError("Could not send the reset link.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="forgot-title"
        onClick={(event) => event.stopPropagation()}
      >
        <p className={styles.eyebrow}>Password reset</p>
        <h2 id="forgot-title">Forgot your password?</h2>
        <p className={styles.lede}>Enter the business email for your account. We will send a reset link.</p>

        <form className={styles.fields} onSubmit={handleSubmit(onSubmit)} noValidate>
          <label className={styles.field}>
            Business email
            <input type="email" autoComplete="email" placeholder="you@business.com" {...register("email")} />
            {errors.email?.message ? <span className={styles.error}>{errors.email.message}</span> : null}
          </label>

          {formError ? <p className={styles.error}>{formError}</p> : null}
          {formSuccess ? <p className={styles.success}>{formSuccess}</p> : null}

          <div className={styles.actions}>
            <button type="button" className={styles.ghost} onClick={onClose} disabled={submitting}>
              Close
            </button>
            <button type="submit" className={styles.primary} disabled={submitting}>
              {submitting ? "Sending…" : "Send reset link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
