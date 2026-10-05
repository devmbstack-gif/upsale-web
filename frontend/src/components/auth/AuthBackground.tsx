import styles from "./auth.module.css";

/** Decorative silk-wave accents for auth pages only (not dashboard/modals). */
export default function AuthBackground() {
  return (
    <div className={styles.authBg} aria-hidden="true">
      <svg
        className={`${styles.authWave} ${styles.authWaveTop}`}
        viewBox="0 0 720 640"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMaxYMin meet"
      >
        <defs>
          <linearGradient id="authSilkTop" x1="720" y1="0" x2="80" y2="560" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7c3aed" stopOpacity="0.55" />
            <stop offset="0.45" stopColor="#7c3aed" stopOpacity="0.22" />
            <stop offset="1" stopColor="#7c3aed" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="authSilkTopSoft" x1="700" y1="40" x2="200" y2="520" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a78bfa" stopOpacity="0.35" />
            <stop offset="1" stopColor="#7c3aed" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M760-40
             C620 30 560 120 575 220
             C595 360 720 400 740 520
             C765 680 620 730 460 780
             C320 830 180 850 20 920
             L780 920 L780-40 Z"
          fill="url(#authSilkTop)"
        />
        <path
          d="M760 20
             C640 90 595 180 610 290
             C630 430 740 470 755 590"
          stroke="url(#authSilkTopSoft)"
          strokeWidth="72"
          strokeLinecap="round"
          opacity="0.85"
        />
        <path
          d="M760 120
             C660 180 630 260 642 360
             C658 490 740 530 752 640"
          stroke="url(#authSilkTopSoft)"
          strokeWidth="36"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>

      <svg
        className={`${styles.authWave} ${styles.authWaveBottom}`}
        viewBox="0 0 720 640"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMinYMax meet"
      >
        <defs>
          <linearGradient id="authSilkBottom" x1="0" y1="640" x2="640" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a855f7" stopOpacity="0.5" />
            <stop offset="0.45" stopColor="#a855f7" stopOpacity="0.2" />
            <stop offset="1" stopColor="#a855f7" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="authSilkBottomSoft" x1="40" y1="600" x2="520" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#c4b5fd" stopOpacity="0.32" />
            <stop offset="1" stopColor="#a855f7" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M-40 680
             C100 600 170 510 155 400
             C135 260 10 220-10 100
             C-35-60 120-120 280-170
             C440-220 580-240 740-300
             L-60-300 L-60 680 Z"
          fill="url(#authSilkBottom)"
        />
        <path
          d="M-40 620
             C100 550 155 460 140 350
             C120 210 10 170-5 50"
          stroke="url(#authSilkBottomSoft)"
          strokeWidth="72"
          strokeLinecap="round"
          opacity="0.85"
        />
        <path
          d="M-40 520
             C80 460 120 380 108 280
             C92 150 20 110 5 0"
          stroke="url(#authSilkBottomSoft)"
          strokeWidth="36"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>
    </div>
  );
}
