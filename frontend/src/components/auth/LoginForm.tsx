"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
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

function GoogleIcon() {
  return (
    <svg className={styles.googleIcon} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [googleError, setGoogleError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("forgot") === "1") setForgotOpen(true);
    if (searchParams.get("googleError") === "no-account") {
      setGoogleError("No UPSale account found for that Google email. Please sign up first.");
    }
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
              <BrandLogo variant="auto" size="md" priority />
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
              <button type="submit" className={styles.primary} disabled={submitting || googleLoading}>
                {submitting ? "Signing in…" : "Sign In"}
              </button>
            </div>
          </form>

          <div className={styles.orDivider} role="separator" aria-label="or">
            <span>or</span>
          </div>

          <button
            type="button"
            className={styles.googleButton}
            disabled={submitting || googleLoading}
            onClick={() => {
              setGoogleError("");
              setGoogleLoading(true);
              void signIn("google", { callbackUrl: "/api/auth/google-complete" });
            }}
          >
            <GoogleIcon />
            {googleLoading ? "Redirecting…" : "Continue with Google"}
          </button>

          {googleError ? <p className={`${styles.error} ${styles.formMessage}`}>{googleError}</p> : null}

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
