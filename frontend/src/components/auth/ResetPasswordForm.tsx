"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/validations/auth";
import AuthBackground from "./AuthBackground";
import { PasswordInput } from "./PasswordInput";
import styles from "./auth.module.css";

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(token ? "" : "Verify a password-reset OTP before opening this page.");
  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function submit(values: ResetPasswordValues) {
    setSubmitting(true);
    setError("");
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, ...values }),
    }).catch(() => null);
    const payload = response ? await response.json() as { ok: boolean; message?: string } : null;
    if (!response?.ok || !payload?.ok) {
      setError(payload?.message ?? "Could not update the password.");
      setSubmitting(false);
      return;
    }
    setMessage("Password updated. You can sign in now.");
    window.setTimeout(() => { router.push("/login"); router.refresh(); }, 900);
  }

  return (
    <div className={styles.page}>
      <AuthBackground />
      <main className={styles.authShell}>
        <section className={styles.card}>
          <p className={styles.eyebrow}>New password</p>
          <h1>Choose a new password</h1>
          <p className={styles.lede}>Use at least 8 characters with one uppercase letter and one number.</p>
          {token ? (
            <form className={styles.fields} onSubmit={handleSubmit(submit)}>
              <label className={styles.field}>New password<PasswordInput registration={register("password")} autoComplete="new-password" />{errors.password?.message ? <span className={styles.error}>{errors.password.message}</span> : null}</label>
              <label className={styles.field}>Confirm new password<PasswordInput registration={register("confirmPassword")} autoComplete="new-password" />{errors.confirmPassword?.message ? <span className={styles.error}>{errors.confirmPassword.message}</span> : null}</label>
              {error ? <p className={styles.error}>{error}</p> : null}
              {message ? <p className={styles.success}>{message}</p> : null}
              <button type="submit" className={styles.primary} disabled={submitting}>{submitting ? "Updating…" : "Update password"}</button>
            </form>
          ) : (
            <p className={styles.authFooter}><Link href="/login?forgot=1">Request a new OTP</Link></p>
          )}
        </section>
      </main>
    </div>
  );
}
