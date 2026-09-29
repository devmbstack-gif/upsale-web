"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginValues } from "@/lib/validations/auth";
import ForgotPasswordModal from "./ForgotPasswordModal";
import AuthBackground from "./AuthBackground";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { PasswordInput } from "./PasswordInput";
import styles from "./auth.module.css";

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("forgot") === "1") setForgotOpen(true);
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setSubmitting(true);
    setFormError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(values),
      });
      const payload = (await response.json()) as { ok: boolean; message?: string };
      if (!response.ok || !payload.ok) {
        setFormError(payload.message ?? "Invalid email or password.");
        return;
      }
      router.push("/app");
      router.refresh();
    } catch {
      setFormError("Could not sign in. Try again.");
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
            <Link href="/" className={styles.brand} aria-label="UPSale home">
              <BrandLogo variant="auto" size="sm" />
            </Link>
          </div>
          <div className={styles.themeActions}>
            <ThemeToggle />
            <Link href="/" className={styles.backHome} aria-label="Back to home">
              <span className={styles.backHomeArrow} aria-hidden="true">
                ←
              </span>
              <span className={styles.backHomeText}>Back to home</span>
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.authShell}>
        <section className={styles.card}>
          <p className={styles.eyebrow}>Welcome back</p>
          <h1>Sign in to your business</h1>
          <p className={styles.lede}>Use the email and password from your UPSale account.</p>

          <form className={styles.fields} onSubmit={handleSubmit(onSubmit)} noValidate>
            <label className={styles.field}>
              Business email
              <input type="email" autoComplete="email" placeholder="you@business.com" {...register("email")} />
              {errors.email?.message ? <span className={styles.error}>{errors.email.message}</span> : null}
            </label>

            <div className={styles.field}>
              <span className={styles.fieldTop}>
                <label htmlFor="login-password">Password</label>
                <button type="button" className={styles.textButton} onClick={() => setForgotOpen(true)}>
                  Forgot Password?
                </button>
              </span>
              <PasswordInput
                id="login-password"
                registration={register("password")}
                autoComplete="current-password"
                placeholder="Your password"
              />
              {errors.password?.message ? <span className={styles.error}>{errors.password.message}</span> : null}
            </div>

            {formError ? <p className={`${styles.error} ${styles.formMessage}`}>{formError}</p> : null}

            <div className={styles.actionsStack}>
              <button type="submit" className={styles.primary} disabled={submitting}>
                {submitting ? "Signing in…" : "Sign In"}
              </button>
            </div>
          </form>

          <p className={styles.authFooter}>
            Don&apos;t have an account? <Link href="/signup">Sign Up</Link>
          </p>
        </section>
      </main>

      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </div>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={<div className={styles.page} />}>
      <LoginFormInner />
    </Suspense>
  );
}
