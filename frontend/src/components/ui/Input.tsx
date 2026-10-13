"use client";

import { cn } from "@/lib/utils";
import {
  useState,
  type FormEvent,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: ReactNode;
};

function stripNumericLeadingZeros(value: string) {
  if (!value || value === "-") return value;
  const sign = value.startsWith("-") ? "-" : "";
  const unsigned = sign ? value.slice(1) : value;
  const [integer, ...fraction] = unsigned.split(".");
  const normalizedInteger = integer.replace(/^0+(?=\d)/, "");
  return `${sign}${normalizedInteger}${fraction.length ? `.${fraction.join(".")}` : ""}`;
}

export function Input({ label, hint, className, id, type, onChange, onInput, ...props }: InputProps) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  function normalizeNumberInput(event: FormEvent<HTMLInputElement>) {
    if (type !== "number") return;
    const input = event.currentTarget;
    const normalized = stripNumericLeadingZeros(input.value);
    if (normalized !== input.value) input.value = normalized;
  }

  return (
    <div className="space-y-1.5">
      {label ? (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-foreground/90"
        >
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        type={type}
        className={cn("input-field", className)}
        onInput={(event) => {
          normalizeNumberInput(event);
          onInput?.(event);
        }}
        onChange={(event) => {
          normalizeNumberInput(event);
          onChange?.(event);
        }}
        {...props}
      />
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

type PasswordFieldProps = Omit<InputProps, "type"> & {
  wrapperClassName?: string;
};

export function PasswordField({
  label,
  hint,
  className,
  wrapperClassName,
  id,
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className={cn("space-y-1.5", wrapperClassName)}>
      {label ? (
        <label htmlFor={inputId} className="block text-sm font-medium text-foreground/90">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          className={cn("input-field pr-11", className)}
          {...props}
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted transition hover:bg-[var(--hover-surface)] hover:text-foreground"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setVisible((v) => !v)}
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
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export function TextArea({ label, className, id, ...props }: TextAreaProps) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="space-y-1.5">
      {label ? (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-foreground/90"
        >
          {label}
        </label>
      ) : null}
      <textarea
        id={inputId}
        className={cn("input-field min-h-[100px] resize-y", className)}
        {...props}
      />
    </div>
  );
}

export function FieldsetLegend({
  children,
  ...props
}: LabelHTMLAttributes<HTMLSpanElement>) {
  return (
    <span className="text-sm font-medium text-foreground/90" {...props}>
      {children}
    </span>
  );
}
