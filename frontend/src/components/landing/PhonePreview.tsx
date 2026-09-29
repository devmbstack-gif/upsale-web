"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import styles from "./landing.module.css";

type PreviewStep = 0 | 1 | 2 | 3;

const PREVIEW_LABELS = [
  "QR scan",
  "Discount form",
  "Coupon code",
  "WhatsApp approval",
] as const;

const QR_ROWS = [
  "11111110101111111",
  "10000010001000001",
  "10111010111011101",
  "10111010000011101",
  "10111010111011101",
  "10000010101000001",
  "11111110101111111",
  "00000000111000000",
  "11010111110101110",
  "00101000101101001",
  "11101011100010111",
  "01010100011101010",
  "11111110110110101",
  "10000010001011100",
  "10111010111010111",
  "10111010000101001",
  "11111110101111101",
];

export function QrMark({ compact = false }: { compact?: boolean }) {
  const rows = compact ? QR_ROWS.slice(0, 5).map((row) => row.slice(0, 5)) : QR_ROWS;
  return (
    <div className={compact ? styles.miniQrGrid : styles.qr} aria-hidden="true">
      {rows.map((row, y) =>
        row.split("").map((cell, x) => (
          <span key={`${x}-${y}`} className={cell === "1" ? styles.qrOn : styles.qrOff} />
        )),
      )}
    </div>
  );
}

export default function PhonePreview({ compact = false }: { compact?: boolean }) {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState<PreviewStep>(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setStep((current) => ((current + 1) % 4) as PreviewStep);
    }, 3400);
    return () => window.clearInterval(id);
  }, [reduceMotion, step]);

  return (
    <div className={`${styles.heroStage} ${compact ? styles.heroStageCompact : ""}`}>
      <div className={`${styles.phone} ${compact ? styles.phoneCompact : ""}`}>
        <div className={styles.notch} aria-hidden="true" />
        <div className={styles.screen} aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              className={styles.pane}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.35 }}
            >
              {step === 0 && (
                <>
                  <p className={styles.paneKicker}>Step 1</p>
                  <h3 className={styles.paneTitle}>Scan the counter code</h3>
                  <div className={styles.qrWrap}>
                    <QrMark />
                    <span className={styles.scan} />
                  </div>
                </>
              )}
              {step === 1 && (
                <>
                  <p className={styles.paneKicker}>Step 2</p>
                  <h3 className={styles.paneTitle}>Claim 15% off</h3>
                  <div className={styles.fakeField}>
                    <span>Name</span>
                    <strong>Ayesha Khan</strong>
                  </div>
                  <div className={styles.fakeField}>
                    <span>WhatsApp</span>
                    <strong>+92 300 555 0142</strong>
                  </div>
                  <span className={styles.offerChip}>First visit · today only</span>
                  <div className={styles.claim}>Get my code</div>
                </>
              )}
              {step === 2 && (
                <>
                  <p className={styles.paneKicker}>Step 3</p>
                  <h3 className={styles.paneTitle}>Your coupon is ready</h3>
                  <div className={styles.coupon}>
                    <span>Walk-in reward</span>
                    <strong>15% off</strong>
                    <code>AYE-15-4K</code>
                    <span>Single use · show at the counter</span>
                  </div>
                </>
              )}
              {step === 3 && (
                <>
                  <p className={styles.paneKicker}>Step 4</p>
                  <h3 className={styles.paneTitle}>Approved on WhatsApp</h3>
                  <div className={styles.waCard}>
                    <div className={styles.waTop}>
                      <span className={styles.waAvatar}>B</span>
                      <div>
                        <strong>Brew & Co</strong>
                        <span>now</span>
                      </div>
                    </div>
                    <p>
                      Your 15% code AYE-15-4K is approved. Show this message at the counter. Reply YES
                      for the next offer.
                    </p>
                    <span className={styles.approved}>Approved</span>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className={styles.dots}>
          {PREVIEW_LABELS.map((label, index) => {
            const value = index as PreviewStep;
            return (
              <button
                key={label}
                type="button"
                className={`${styles.dot} ${step === value ? styles.dotOn : ""}`}
                aria-label={`Show ${label}`}
                aria-pressed={step === value}
                onClick={() => setStep(value)}
              />
            );
          })}
        </div>
      </div>
      <p className={styles.stepLabel}>Live preview · {PREVIEW_LABELS[step]}</p>
    </div>
  );
}
