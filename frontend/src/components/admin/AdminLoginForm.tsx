"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginValues } from "@/lib/validations/auth";
import AuthBackground from "@/components/auth/AuthBackground";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { BrandLogo } from "@/components/ui/BrandLogo";
import styles from "@/components/auth/auth.module.css";

export default function AdminLoginForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/admin/health", { credentials: "same-origin" });
        if (!cancelled && res.ok) {
          router.replace("/admin/businesses");
        }
      } catch {
        /* not signed in */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

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
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(values),
      });

      let payload: { ok?: boolean; message?: string; code?: string } = {};
      try {
        payload = (await response.json()) as typeof payload;
      } catch {
        setFormError(
          response.status >= 500
            ? "Server error during login. Is MongoDB reachable? Try again."
            : "Could not sign in. Unexpected server response.",
        );
        return;
      }

      if (!response.ok || !payload.ok) {
        if (payload.code === "NOT_SUPER_ADMIN" || response.status === 403) {
          setFormError(
            payload.message ?? "Access Denied: Super Admin credentials required.",
          );
        } else {
          setFormError(payload.message ?? "Invalid email or password.");
        }
        return;
      }
      // Let the route transition start after Set-Cookie has completed, then
      // refresh the protected server layout on the following browser frame.
      router.replace("/admin/businesses");
      requestAnimationFrame(() => router.refresh());
    } catch {
      setFormError(
        "Could not reach the server. Make sure frontend is running on port 3000.",
      );
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
              <span className={styles.backHomeArrow} aria-hidden="true">←</span>
              <span className={styles.backHomeText}>Back to home</span>
            </Link>
            <Link href="/" className={styles.brand} aria-label="UPSale home">
              <BrandLogo variant="auto" size="md" priority />
            </Link>
          </div>
          <div className={styles.themeActions}>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className={styles.authShell}>
        <section className={styles.card}>
          <p className={styles.eyebrow}>Platform console</p>
          <h1>Super Admin sign in</h1>
          <p className={styles.lede}>
            Only accounts with the <strong>super_admin</strong> role can access this console.
          </p>

          <form className={styles.fields} onSubmit={handleSubmit(onSubmit)} noValidate>
            <label className={styles.field}>
              Admin email
              <input type="email" autoComplete="username" {...register("email")} />
              {errors.email ? (
                <span className={styles.error}>{errors.email.message}</span>
              ) : null}
            </label>
            <label className={styles.field}>
              Password
              <PasswordInput
                registration={register("password")}
                autoComplete="current-password"
              />
              {errors.password ? (
                <span className={styles.error}>{errors.password.message}</span>
              ) : null}
            </label>
            {formError ? <p className={styles.error}>{formError}</p> : null}
            <button type="submit" className={styles.primary} disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className={styles.authFooter}>
            Business owner? <Link href="/login">Sign in to your dashboard</Link>
          </p>
        </section>
      </main>
    </div>
  );
}
