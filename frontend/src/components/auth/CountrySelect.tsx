"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { WORLD_COUNTRIES } from "@/lib/data/countries";
import styles from "./auth.module.css";

type CountrySelectProps = {
  value: string;
  onChange: (countryName: string) => void;
  error?: string;
  id?: string;
};

export default function CountrySelect({ value, onChange, error, id }: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return WORLD_COUNTRIES;
    return WORLD_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.currency.toLowerCase().includes(q) ||
        c.dialCode.includes(q),
    );
  }, [query]);

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  return (
    <div className={styles.countrySelect} ref={rootRef}>
      <button
        type="button"
        id={id}
        className={`${styles.countryTrigger} ${open ? styles.countryTriggerOpen : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className={value ? undefined : styles.countryPlaceholder}>
          {value || "Search country…"}
        </span>
        <span className={styles.countryChevron} aria-hidden="true">
          ▾
        </span>
      </button>

      {open ? (
        <div className={styles.countryPanel} role="listbox" aria-label="Countries">
          <input
            ref={inputRef}
            type="search"
            className={styles.countrySearch}
            placeholder="Type to search…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
          />
          <ul className={styles.countryList}>
            {filtered.length === 0 ? (
              <li className={styles.countryEmpty}>No countries match “{query}”.</li>
            ) : (
              filtered.map((country) => (
                <li key={country.name}>
                  <button
                    type="button"
                    className={`${styles.countryOption} ${
                      country.name === value ? styles.countryOptionActive : ""
                    }`}
                    role="option"
                    aria-selected={country.name === value}
                    onClick={() => {
                      onChange(country.name);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <span>{country.name}</span>
                    <span className={styles.countryMeta}>
                      {country.dialCode} · {country.currency}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}

      {error ? <span className={styles.error}>{error}</span> : null}
    </div>
  );
}
