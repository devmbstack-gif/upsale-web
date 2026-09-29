import { cn } from "@/lib/utils";
import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: ReactNode;
};

export function Input({ label, hint, className, id, ...props }: InputProps) {
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
      <input id={inputId} className={cn("input-field", className)} {...props} />
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
