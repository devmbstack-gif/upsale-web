"use client";

import { QrPlaceholder } from "@/components/ui/QrPlaceholder";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import styles from "./landing.module.css";

type PreviewStep = 0 | 1 | 2;

const PREVIEW_STEPS = [
  {
    label: "Scan QR Code at Counter",
    kicker: "Step 1 of 3",
    title: "Scan QR Code at Counter",
  },
  {
    label: "Enter WhatsApp Number",
    kicker: "Step 2 of 3",
    title: "Enter WhatsApp Number",
  },
  {
    label: "Offer Claimed",
    kicker: "Step 3 of 3",
    title: "Congratulations!",
  },
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

const slideTransition = {
  duration: 0.4,
  ease: [0.22, 1, 0.36, 1] as const,
};

function StatusBar() {
  return (
    <div className={styles.statusBar} aria-hidden="true">
      <span className={styles.statusTime}>9:41</span>
      <div className={styles.statusIcons}>
        <svg className={styles.statusSignal} viewBox="0 0 18 12" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="0.6" opacity="0.35" />
          <rect x="4.5" y="5.5" width="3" height="6.5" rx="0.6" opacity="0.55" />
          <rect x="9" y="3" width="3" height="9" rx="0.6" opacity="0.75" />
          <rect x="13.5" y="0.5" width="3" height="11.5" rx="0.6" />
        </svg>
        <svg className={styles.statusWifi} viewBox="0 0 16 12" fill="none">
          <path
            d="M8 10.6a1.15 1.15 0 1 0 0-2.3 1.15 1.15 0 0 0 0 2.3Z"
            fill="currentColor"
          />
          <path
            d="M3.2 6.2a7.2 7.2 0 0 1 9.6 0"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M1 3.4a10.4 10.4 0 0 1 14 0"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.55"
          />
        </svg>
        <span className={styles.statusBattery}>
          <span className={styles.statusBatteryLevel} />
          <span className={styles.statusBatteryCap} />
        </span>
      </div>
    </div>
  );
}

export default function PhonePreview({ compact = false }: { compact?: boolean }) {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState<PreviewStep>(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setStep((current) => ((current + 1) % PREVIEW_STEPS.length) as PreviewStep);
    }, 3800);
    return () => window.clearInterval(id);
  }, [reduceMotion, step]);

  function goToStep(value: PreviewStep) {
    setStep(value);
  }

  return (
    <div className={`${styles.heroStage} ${compact ? styles.heroStageCompact : ""}`}>
      <div className={`${styles.phoneShell} ${compact ? styles.phoneShellCompact : ""}`}>
        <span className={`${styles.sideBtn} ${styles.sideBtnSilent}`} aria-hidden="true" />
        <span className={`${styles.sideBtn} ${styles.sideBtnVolUp}`} aria-hidden="true" />
        <span className={`${styles.sideBtn} ${styles.sideBtnVolDown}`} aria-hidden="true" />
        <span className={`${styles.sideBtn} ${styles.sideBtnPower}`} aria-hidden="true" />

        <div className={`${styles.phone} ${compact ? styles.phoneCompact : ""}`}>
          <div className={styles.phoneInner}>
            <div className={styles.screen} aria-live="polite">
              <StatusBar />

              <div className={styles.dynamicIsland} aria-hidden="true">
                <span className={styles.islandCamera} />
                <span className={styles.islandSpeaker} />
              </div>

              <div className={styles.previewProgress} aria-hidden="true">
                {PREVIEW_STEPS.map((item, index) => (
                  <span
                    key={item.label}
                    className={`${styles.previewProgressSeg} ${
                      index <= step ? styles.previewProgressSegOn : ""
                    }`}
                  />
                ))}
              </div>

              <div className={styles.screenContent}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    className={styles.pane}
                    initial={
                      reduceMotion ? false : { opacity: 0, y: 22, filter: "blur(4px)" }
                    }
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={
                      reduceMotion
                        ? undefined
                        : { opacity: 0, y: -18, filter: "blur(4px)" }
                    }
                    transition={slideTransition}
                  >
                    {step === 0 && (
                      <div className={styles.paneScan}>
                        <div className={styles.paneScanCopy}>
                          <p className={styles.paneKicker}>{PREVIEW_STEPS[0].kicker}</p>
                          <h3 className={styles.paneTitle}>{PREVIEW_STEPS[0].title}</h3>
                          <p className={styles.paneHint}>
                            Point the camera at the counter QR.
                          </p>
                        </div>
                        <div className={styles.qrWrap}>
                          <QrPlaceholder
                            compact
                            size={compact ? 124 : 152}
                            value="https://upsale.app/o/demo-offer"
                            title=""
                          />
                          <span className={styles.scan} />
                        </div>
                      </div>
                    )}

                    {step === 1 && (
                      <>
                        <p className={styles.paneKicker}>{PREVIEW_STEPS[1].kicker}</p>
                        <h3 className={styles.paneTitle}>{PREVIEW_STEPS[1].title}</h3>
                        <p className={styles.paneHint}>
                          Customer details for the discount claim.
                        </p>
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
                      <div className={styles.paneNotify}>
                        <p className={styles.paneKicker}>{PREVIEW_STEPS[2].kicker}</p>
                        <h3 className={styles.paneTitle}>{PREVIEW_STEPS[2].title}</h3>
                        <div className={styles.celebrationCard}>
                          <div className={styles.confetti} aria-hidden="true">
                            {Array.from({ length: 10 }, (_, index) => <i key={index} />)}
                          </div>
                          <motion.div
                            className={styles.celebrationIcon}
                            initial={reduceMotion ? false : { scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 260, damping: 14 }}
                            aria-hidden="true"
                          >
                            ✓
                          </motion.div>
                          <strong>You won a discount!</strong>
                          <p>Enjoy your reward and make today a little brighter.</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className={styles.homeIndicator} aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.dots} role="tablist" aria-label="Preview steps">
        {PREVIEW_STEPS.map((item, index) => {
          const value = index as PreviewStep;
          return (
            <button
              key={item.label}
              type="button"
              role="tab"
              className={`${styles.dot} ${step === value ? styles.dotOn : ""}`}
              aria-label={item.label}
              aria-selected={step === value}
              title={item.label}
              onClick={() => goToStep(value)}
            />
          );
        })}
      </div>

      <p className={styles.stepLabel}>Live preview · {PREVIEW_STEPS[step].label}</p>
    </div>
  );
}
