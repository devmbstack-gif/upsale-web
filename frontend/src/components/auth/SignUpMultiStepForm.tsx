"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type ReactNode } from "react";
import { useForm, type Resolver } from "react-hook-form";
import {
  accountFields,
  accountSchema,
  businessCategories,
  businessFields,
  businessSchema,
  confirmFields,
  confirmSchema,
  countryDefaults,
  resolveBusinessCategory,
  signUpSchema,
  type SignUpValues,
} from "@/lib/validations/auth";
import {
  currencyOptions,
  findCountry,
  formatCurrencyLabel,
  getPhoneExample,
  timezoneOptions,
} from "@/lib/data/countries";
import CaptchaWidget, { type CaptchaProof } from "./CaptchaWidget";
import CountrySelect from "./CountrySelect";
import OtpModal from "./OtpModal";
import AuthBackground from "./AuthBackground";
import { PasswordInput } from "./PasswordInput";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import styles from "./auth.module.css";

type SignUpFormValues = {
  businessName: string;
  email: string;
  password: string;
  confirmPassword: string;
  supportEmail: string;
  category: SignUpValues["category"] | "";
  categoryOther: string;
  country: SignUpValues["country"] | "";
  currency: SignUpValues["currency"] | "";
  timezone: SignUpValues["timezone"] | "";
  city: string;
  logoPreview: string;
  dialCode: string;
  whatsappNumber: string;
  acceptTerms: boolean;
  acceptConsent: boolean;
};

const steps = [
  { id: 1, label: "Account" },
  { id: 2, label: "Business" },
  { id: 3, label: "WhatsApp" },
] as const;

const slide = {
  enter: (direction: number) => ({ x: direction > 0 ? 36 : -36, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -36 : 36, opacity: 0 }),
};

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className={styles.field}>
      {label}
      {children}
      {error ? <span className={styles.error}>{error}</span> : null}
    </label>
  );
}

export default function SignUpMultiStepForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [captchaSolved, setCaptchaSolved] = useState(false);
  const [captchaProof, setCaptchaProof] = useState<CaptchaProof | null>(null);
  const [logoError, setLogoError] = useState("");
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [otpSendCount, setOtpSendCount] = useState(0);

  const {
    register,
    setValue,
    getValues,
    trigger,
    watch,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema) as Resolver<SignUpFormValues>,
    mode: "onTouched",
    defaultValues: {
      businessName: "",
      email: "",
      password: "",
      confirmPassword: "",
      supportEmail: "",
      category: "",
      categoryOther: "",
      country: "",
      currency: "",
      timezone: "",
      city: "",
      logoPreview: "",
      dialCode: "+92",
      whatsappNumber: "",
      acceptTerms: false,
      acceptConsent: false,
    },
  });

  const values = watch();
  const logoPreview = values.logoPreview;
  const accountReady = accountSchema.safeParse(values).success && captchaSolved;
  const businessReady = businessSchema.safeParse(values).success;
  const confirmReady = confirmSchema.safeParse(values).success;

  function onCategoryChange(event: ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value;
    if (next !== "Other") {
      setValue("categoryOther", "", { shouldValidate: true, shouldDirty: true });
    }
  }

  function move(next: number) {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  }

  async function goToBusiness() {
    const valid = await trigger([...accountFields]);
    if (!valid || !captchaSolved) return;
    move(2);
  }

  async function goToWhatsApp() {
    const valid = await trigger([...businessFields]);
    if (!valid) return;
    move(3);
  }

  function onCountrySelect(selected: string) {
    setValue("country", selected, { shouldValidate: true, shouldTouch: true, shouldDirty: true });
    const defaults = countryDefaults[selected];
    if (!defaults) return;
    setValue("currency", defaults.currency, { shouldValidate: true, shouldTouch: true });
    setValue("timezone", defaults.timezone, { shouldValidate: true, shouldTouch: true });
    setValue("dialCode", defaults.dialCode, { shouldValidate: true, shouldTouch: true });
    setValue("whatsappNumber", "", { shouldDirty: true });
  }

  function onLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setLogoError("Upload an image file.");
      return;
    }
    if (file.size > 1_500_000) {
      setLogoError("Logo must be under 1.5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setValue("logoPreview", String(reader.result ?? ""));
      setLogoError("");
    };
    reader.readAsDataURL(file);
  }

  function applyOtpSendResult(payload: {
    previewCode?: string;
    message?: string;
    delivery?: string;
    resendAfterSeconds?: number;
  }) {
    setOtpSendCount((n) => n + 1);
    setResendCooldown(payload.resendAfterSeconds ?? 60);
    if (payload.previewCode) {
      setOtpError(`Dev code: ${payload.previewCode}`);
    } else {
      setOtpError("");
    }
  }

  async function sendCode() {
    const response = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        email: getValues("email"),
        captchaToken: captchaProof?.token,
        captchaAnswer: captchaProof?.answer,
      }),
    });
    const payload = (await response.json()) as {
      ok: boolean;
      message?: string;
      previewCode?: string;
      delivery?: string;
      resendAfterSeconds?: number;
      waitSeconds?: number;
    };
    if (!response.ok || !payload.ok) {
      if (response.status === 429 && payload.waitSeconds) {
        setResendCooldown(payload.waitSeconds);
      }
      throw new Error(payload.message ?? "Could not send the code.");
    }
    applyOtpSendResult(payload);
    return payload;
  }

  async function createAccount() {
    const valid = await trigger([...confirmFields]);
    if (!valid) return;
    setSubmitting(true);
    setOtpError("");
    try {
      await sendCode();
      setOtpOpen(true);
    } catch (error) {
      setOtpError(error instanceof Error ? error.message : "Could not send the code.");
      setOtpOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  async function verifyCode(code: string) {
    const current = getValues();
    setSubmitting(true);
    setOtpError("");
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          email: current.email,
          code,
          password: current.password,
          businessName: current.businessName,
          supportEmail: current.supportEmail,
          category: resolveBusinessCategory(current.category, current.categoryOther),
          country: current.country,
          currency: current.currency,
          timezone: current.timezone,
          city: current.city,
          whatsapp: `${current.dialCode}${current.whatsappNumber}`,
          termsAccepted: true,
          marketingConsent: true,
          logoPreview: current.logoPreview,
        }),
      });
      const payload = (await response.json()) as { ok: boolean; message?: string };
      if (!response.ok || !payload.ok) {
        setOtpError(payload.message ?? "That code does not match.");
        return;
      }
      router.push("/app");
      router.refresh();
    } catch {
      setOtpError("Could not verify the code.");
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
            <p className={styles.stepLabel}>Step {step} of 3</p>
          </div>
        </div>
        <ol className={styles.track} aria-label="Sign up progress">
          {steps.map((item) => {
            const done = step > item.id;
            const active = step === item.id;
            return (
              <li key={item.id} className={styles.trackItem} aria-current={active ? "step" : undefined}>
                <span
                  className={`${styles.dot} ${active ? styles.dotActive : ""} ${done ? styles.dotDone : ""}`}
                >
                  {done ? "✓" : item.id}
                </span>
                <span className={styles.trackName}>{item.label}</span>
              </li>
            );
          })}
        </ol>
        <div className={styles.bar} aria-hidden="true">
          <motion.div
            className={styles.barFill}
            initial={false}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.35 }}
          />
        </div>
      </header>

      <main className={`${styles.shell} ${step < 3 ? styles.shellCompact : ""}`}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28 }}
          >
            {step === 1 ? (
              <section className={`${styles.card} ${styles.cardCompact}`}>
                <p className={styles.eyebrow}>Account setup</p>
                <h1>Create the login for your business</h1>
                <p className={styles.lede}>This email is how you will sign back in.</p>
                <div className={`${styles.fields} ${styles.fieldsCompact}`}>
                  <Field label="Business name" error={errors.businessName?.message}>
                    <input autoComplete="organization" {...register("businessName")} />
                  </Field>
                  <Field label="Business email" error={errors.email?.message}>
                    <input type="email" autoComplete="email" {...register("email")} />
                  </Field>
                  <div className={styles.row}>
                    <Field label="Password" error={errors.password?.message}>
                      <PasswordInput registration={register("password")} autoComplete="new-password" />
                    </Field>
                    <Field label="Confirm password" error={errors.confirmPassword?.message}>
                      <PasswordInput registration={register("confirmPassword")} autoComplete="new-password" />
                    </Field>
                  </div>
                  <p className={styles.hint}>At least 8 characters, with one uppercase letter and one number.</p>
                  <CaptchaWidget
                    solved={captchaSolved}
                    onSolvedChange={(solved, proof) => {
                      setCaptchaSolved(solved);
                      setCaptchaProof(solved && proof ? proof : null);
                    }}
                  />
                </div>
                <div className={styles.actions}>
                  <button type="button" className={styles.primary} disabled={!accountReady} onClick={goToBusiness}>
                    Next: Business Details
                  </button>
                </div>
              </section>
            ) : null}

            {step === 2 ? (
              <section className={`${styles.card} ${styles.cardCompact}`}>
                <p className={styles.eyebrow}>Business details</p>
                <h1>Where should this account live?</h1>
                <p className={styles.lede}>Currency and timezone follow the country. You can change the timezone.</p>
                <div className={`${styles.fields} ${styles.fieldsCompact}`}>
                  <Field label="Business support email" error={errors.supportEmail?.message}>
                    <input type="email" autoComplete="email" {...register("supportEmail")} />
                  </Field>
                  <div className={styles.row}>
                    <Field label="Business category" error={errors.category?.message}>
                      <select
                        {...register("category", {
                          onChange: onCategoryChange,
                        })}
                      >
                        <option value="">Select</option>
                        {businessCategories.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <div className={styles.field}>
                      Country
                      <CountrySelect
                        value={values.country}
                        onChange={onCountrySelect}
                        error={errors.country?.message}
                      />
                    </div>
                  </div>
                  {values.category === "Other" ? (
                    <Field
                      label="Specify your business type"
                      error={errors.categoryOther?.message}
                    >
                      <input
                        autoComplete="organization-title"
                        placeholder="Specify your business type..."
                        {...register("categoryOther")}
                      />
                    </Field>
                  ) : null}
                  <div className={styles.row}>
                    <Field label="Currency" error={errors.currency?.message}>
                      <select
                        {...register("currency")}
                        disabled={values.country !== "Other" && values.country !== ""}
                      >
                        <option value="">Select a country</option>
                        {currencyOptions.map((item) => (
                          <option key={item.code} value={item.code}>
                            {formatCurrencyLabel(item.code, item.symbol)}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Timezone" error={errors.timezone?.message}>
                      <select {...register("timezone")}>
                        <option value="">Select</option>
                        {timezoneOptions.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <Field label="City / address" error={errors.city?.message}>
                    <input autoComplete="street-address" {...register("city")} />
                  </Field>
                  <div className={styles.field}>
                    Logo
                    <span className={styles.hint}>Optional. Skip if you want to add it later.</span>
                    <div className={`${styles.logoBox} ${styles.logoBoxCompact}`}>
                      {logoPreview ? <img className={styles.preview} src={logoPreview} alt="Logo preview" /> : null}
                      <input type="file" accept="image/*" onChange={onLogo} />
                    </div>
                    {logoError ? <span className={styles.error}>{logoError}</span> : null}
                    {logoPreview ? (
                      <button
                        type="button"
                        className={styles.textButton}
                        onClick={() => setValue("logoPreview", "")}
                      >
                        Skip for now
                      </button>
                    ) : null}
                  </div>
                </div>
                <div className={styles.actions}>
                  <button type="button" className={styles.ghost} onClick={() => move(1)}>
                    Back
                  </button>
                  <button type="button" className={styles.primary} disabled={!businessReady} onClick={goToWhatsApp}>
                    Next: WhatsApp & Confirm
                  </button>
                </div>
              </section>
            ) : null}

            {step === 3 ? (
              <section className={styles.card}>
                <p className={styles.eyebrow}>WhatsApp and confirmation</p>
                <h1>How should customers hear from you?</h1>
                <p className={styles.lede}>
                  WhatsApp is saved for later customer messages. To create your account we email a
                  6-digit code to <strong>{values.email || "your business email"}</strong> — not to
                  WhatsApp.
                </p>
                <div className={styles.fields}>
                  <div className={styles.field}>
                    WhatsApp Business number
                    <div className={styles.phoneRow}>
                      {values.country === "Other" ? (
                        <select aria-label="Country code" {...register("dialCode")}>
                          {["+1", "+44", "+91", "+92", "+971", "+966", "+61", "+49", "+33", "+81"].map(
                            (code) => (
                              <option key={code} value={code}>
                                {code}
                              </option>
                            ),
                          )}
                        </select>
                      ) : (
                        <span className={styles.dialCodeBadge} aria-label="Country code">
                          {values.dialCode || findCountry(values.country)?.dialCode || "+"}
                        </span>
                      )}
                      <input
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        placeholder={getPhoneExample(values.country || "Pakistan")}
                        aria-label="WhatsApp number"
                        {...register("whatsappNumber")}
                      />
                    </div>
                    <span className={styles.hint}>
                      Format for {values.country || "your country"}:{" "}
                      <strong>
                        {values.dialCode || "+…"}{" "}
                        {getPhoneExample(values.country || "Pakistan")}
                      </strong>
                    </span>
                    {errors.dialCode?.message ? <span className={styles.error}>{errors.dialCode.message}</span> : null}
                    {errors.whatsappNumber?.message ? (
                      <span className={styles.error}>{errors.whatsappNumber.message}</span>
                    ) : null}
                  </div>
                  <label className={styles.check}>
                    <input type="checkbox" {...register("acceptTerms")} />
                    <span>
                      I agree to the{" "}
                      <Link
                        href="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.checkLink}
                        onClick={(event) => event.stopPropagation()}
                        onMouseDown={(event) => event.stopPropagation()}
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.checkLink}
                        onClick={(event) => event.stopPropagation()}
                        onMouseDown={(event) => event.stopPropagation()}
                      >
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  </label>
                  {errors.acceptTerms?.message ? <span className={styles.error}>{errors.acceptTerms.message}</span> : null}
                  <label className={styles.check}>
                    <input type="checkbox" {...register("acceptConsent")} />
                    <span>I agree to only message customers who have provided explicit consent.</span>
                  </label>
                  {errors.acceptConsent?.message ? (
                    <span className={styles.error}>{errors.acceptConsent.message}</span>
                  ) : null}
                  {otpError && !otpOpen ? <p className={styles.error}>{otpError}</p> : null}
                </div>
                <div className={styles.actions}>
                  <button type="button" className={styles.ghost} onClick={() => move(2)} disabled={submitting}>
                    Back
                  </button>
                  <button
                    type="button"
                    className={styles.primary}
                    disabled={!confirmReady || submitting}
                    onClick={createAccount}
                  >
                    {submitting ? "Sending code…" : "Create Account"}
                  </button>
                </div>
              </section>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </main>

      <p
        className={styles.authFooter}
        style={{ marginTop: 0, marginBottom: step < 3 ? 16 : 40 }}
      >
        Already have an account? <Link href="/login">Sign In</Link>
      </p>

      <OtpModal
        key={otpSendCount}
        open={otpOpen}
        email={values.email}
        error={otpError}
        submitting={submitting}
        resendCooldownSeconds={resendCooldown}
        onResendCooldownChange={setResendCooldown}
        onClose={() => setOtpOpen(false)}
        onResend={async () => {
          setSubmitting(true);
          try {
            await sendCode();
          } catch (error) {
            setOtpError(error instanceof Error ? error.message : "Could not resend the code.");
          } finally {
            setSubmitting(false);
          }
        }}
        onSubmitCode={(code) => {
          void verifyCode(code);
        }}
      />
    </div>
  );
}
