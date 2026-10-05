"use client";

import { useState, type InputHTMLAttributes } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import styles from "./auth.module.css";

type PasswordInputProps = {
  registration: UseFormRegisterReturn;
  autoComplete?: string;
  id?: string;
  placeholder?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "autoComplete" | "id" | "placeholder">;

export function PasswordInput({
  registration,
  autoComplete = "current-password",
  id,
  placeholder,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={styles.passwordWrap}>
      <input
        {...registration}
        {...props}
        id={id}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={styles.passwordInput}
      />
      <button
        type="button"
        className={styles.passwordToggle}
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setVisible((v) => !v);
        }}
        aria-label={visible ? "Hide password" : "Show password"}
        title={visible ? "Hide password" : "Show password"}
      >
        {visible ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M3 3l18 18M10.6 10.6A2 2 0 0012 14a2 2 0 001.4-.6M9.9 5.1A10.5 10.5 0 0121 12c-.6 1-1.3 1.9-2.1 2.7M6.1 6.1C4.7 7.4 3.6 9.1 3 12c1.5 4.5 5.5 7.5 9 7.5 1.3 0 2.6-.3 3.8-.9"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        )}
      </button>
    </div>
  );
}
