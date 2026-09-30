"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/validations/auth";
import AuthBackground from "./AuthBackground";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { BrandLogo } from "@/components/ui/BrandLogo";
import styles from "./auth.module.css";

type ResetPasswordFormProps = {
  token: string;
};

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onTouched",
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(values: ResetPasswordValues) {
    if (!token) {
      setFormError("That reset link is missing a token.");
      return;
    }

    setSubmitting(true);
    setFormError("");
    setFormSuccess("");
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: values.password,
          confirmPassword: values.confirmPassword,
        }),
      });
      const payload = (await response.json()) as { ok: boolean; message?: string };
      if (!response.ok || !payload.ok) {
        setFormError(payload.message ?? "Could not update the password.");
        return;
      }
      setFormSuccess(payload.message ?? "Password updated. You can sign in now.");
      window.setTimeout(() => {
        router.push("/login");
        router.refresh();
      }, 900);
    } catch {
      setFormError("Could not update the password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <AuthBackground />
      <header className={styles.progress}>
        <div className={styles.progressTop}>
          <div className={styles.progressLead}>
            <Link href="/" className={styles.backHome} aria-label="Back to home">
              <span className={styles.backHomeArrow} aria-hidden="true">
                ←
              </span>
              <span className={styles.backHomeText}>Back to home</span>
            </Link>
            <Link href="/" className={styles.brand} aria-label="UPSale home">
              <BrandLogo variant="auto" size="md" priority />
            </Link>
          </div>
          <div className={styles.themeActions}>
            <ThemeToggle />
            <p className={styles.stepLabel}>Reset password</p>
          </div>
        </div>
      </header>

      <main className={styles.authShell}>
        <section className={styles.card}>
          <p className={styles.eyebrow}>New password</p>
          <h1>Choose a new password</h1>
          <p className={styles.lede}>
            {token
              ? "Use at least 8 characters, with one uppercase letter and one number."
              : "This reset link is missing a token. Request a new one from the login page."}
          </p>

          {token ? (
            <form className={styles.fields} onSubmit={handleSubmit(onSubmit)} noValidate>
              <label className={styles.field}>
                New password
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  {...register("password")}
                />
                {errors.password?.message ? <span className={styles.error}>{errors.password.message}</span> : null}
              </label>

              <label className={styles.field}>
                Confirm new password
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword?.message ? (
                  <span className={styles.error}>{errors.confirmPassword.message}</span>
                ) : null}
              </label>

              {formError ? <p className={styles.error}>{formError}</p> : null}
              {formSuccess ? <p className={styles.success}>{formSuccess}</p> : null}

              <div className={styles.actionsStack}>
                <button type="submit" className={styles.primary} disabled={submitting}>
                  {submitting ? "Updating…" : "Update password"}
                </button>
              </div>
            </form>
          ) : (
            <p className={styles.authFooter}>
              <Link href="/login">Back to Sign In</Link>
            </p>
          )}

          {token ? (
            <p className={styles.authFooter}>
              Remembered it? <Link href="/login">Sign In</Link>
            </p>
          ) : null}
        </section>
      </main>
    </div>
  );
}
