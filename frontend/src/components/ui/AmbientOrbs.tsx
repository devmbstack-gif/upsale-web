"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import { useEffect, useRef } from "react";

/** Premium constellation / plexus background */

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  accent: boolean;
  pulse: number;
  soft: boolean;
  depth: number;
};

type Star = {
  x: number;
  y: number;
  len: number;
  speed: number;
  life: number;
  maxLife: number;
  angle: number;
};

const COUNT = 110;
const LINK_DIST = 155;
const MOUSE_DIST = 190;

export function AmbientOrbs() {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let reduced = false;
    let spawnTimer = 0;

    const palette =
      theme === "light"
        ? {
            node: "109, 40, 217",
            nodeSoft: "139, 92, 246",
            accent: "245, 158, 11",
            link: "124, 58, 237",
            glow: "139, 92, 246",
            streak: "167, 139, 250",
            linkAlpha: 0.18,
            nodeAlpha: 0.65,
          }
        : {
            node: "250, 245, 255",
            nodeSoft: "196, 181, 253",
            accent: "251, 191, 36",
            link: "148, 163, 184",
            glow: "251, 146, 60",
            streak: "196, 181, 253",
            linkAlpha: 0.32,
            nodeAlpha: 0.88,
          };

    function resize() {
      const parent = canvas!.parentElement;
      w = parent?.clientWidth ?? window.innerWidth;
      h = parent?.clientHeight ?? window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      const next: Particle[] = [];
      for (let i = 0; i < COUNT; i++) {
        const cluster = Math.random();
        let x: number;
        let y: number;
        if (cluster < 0.5) {
          x = Math.random() * w * 0.62;
          y = Math.random() * h;
        } else if (cluster < 0.78) {
          x = w * 0.45 + Math.random() * w * 0.55;
          y = h * 0.45 + Math.random() * h * 0.55;
        } else {
          x = Math.random() * w;
          y = Math.random() * h;
        }
        const depth = 0.45 + Math.random() * 0.55;
        next.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 0.38 * depth,
          vy: (Math.random() - 0.5) * 0.38 * depth,
          r: (1 + Math.random() * 2.2) * depth,
          accent: Math.random() < 0.09,
          pulse: Math.random() * Math.PI * 2,
          soft: i % 3 === 0,
          depth,
        });
      }
      particlesRef.current = next;
      starsRef.current = [];
    }

    function spawnStar() {
      starsRef.current.push({
        x: Math.random() * w,
        y: Math.random() * h * 0.7,
        len: 40 + Math.random() * 70,
        speed: 3.5 + Math.random() * 4.5,
        life: 0,
        maxLife: 45 + Math.random() * 35,
        angle: -0.35 - Math.random() * 0.25,
      });
      if (starsRef.current.length > 4) starsRef.current.shift();
    }

    function loop() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      if (!reduced) {
        spawnTimer++;
        if (spawnTimer > 90 + Math.random() * 80) {
          spawnTimer = 0;
          if (Math.random() > 0.35) spawnStar();
        }

        for (const p of particles) {
          p.x += p.vx;
          p.y += p.vy;
          p.pulse += 0.025 + p.depth * 0.01;

          if (mouse.active) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const d = Math.hypot(dx, dy);
            if (d < MOUSE_DIST && d > 0.1) {
              const force = ((MOUSE_DIST - d) / MOUSE_DIST) * 0.05 * p.depth;
              p.vx += (dx / d) * force;
              p.vy += (dy / d) * force;
            }
          }

          p.vx *= 0.993;
          p.vy *= 0.993;
          // Soft wrap instead of hard bounce (no edge "box" feel)
          if (p.x < -20) p.x = w + 20;
          if (p.x > w + 20) p.x = -20;
          if (p.y < -20) p.y = h + 20;
          if (p.y > h + 20) p.y = -20;
        }

        for (const s of starsRef.current) {
          s.life++;
          s.x += Math.cos(s.angle) * s.speed;
          s.y += Math.sin(s.angle) * s.speed;
        }
        starsRef.current = starsRef.current.filter((s) => s.life < s.maxLife);
      }

      // Connection mesh
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          const maxD = LINK_DIST * ((a.depth + b.depth) / 2);
          if (dist < maxD) {
            const alpha = (1 - dist / maxD) * palette.linkAlpha * a.depth;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${palette.link}, ${alpha})`;
            ctx.lineWidth = 0.7 * a.depth;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        if (mouse.active) {
          const p = particles[i];
          const dist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
          if (dist < MOUSE_DIST) {
            const alpha = (1 - dist / MOUSE_DIST) * 0.45;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${palette.glow}, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      // Shooting streaks
      for (const s of starsRef.current) {
        const fade = 1 - s.life / s.maxLife;
        const tx = s.x - Math.cos(s.angle) * s.len;
        const ty = s.y - Math.sin(s.angle) * s.len;
        const grad = ctx.createLinearGradient(tx, ty, s.x, s.y);
        grad.addColorStop(0, `rgba(${palette.streak}, 0)`);
        grad.addColorStop(1, `rgba(${palette.accent}, ${0.75 * fade})`);
        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.moveTo(tx, ty);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = `rgba(${palette.accent}, ${fade})`;
        ctx.arc(s.x, s.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Nodes
      for (const p of particles) {
        const radius = p.r * (0.88 + Math.sin(p.pulse) * 0.14);
        const rgb = p.accent
          ? palette.accent
          : p.soft
            ? palette.nodeSoft
            : palette.node;

        if (p.accent) {
          const glowR = radius * 8;
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
          grad.addColorStop(0, `rgba(${palette.accent}, 0.5)`);
          grad.addColorStop(1, `rgba(${palette.accent}, 0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.depth > 0.75) {
          const glowR = radius * 4;
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
          grad.addColorStop(0, `rgba(${palette.nodeSoft}, 0.25)`);
          grad.addColorStop(1, `rgba(${palette.nodeSoft}, 0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.fillStyle = `rgba(${rgb}, ${p.accent ? 0.95 : palette.nodeAlpha * p.depth})`;
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Soft cursor aura
      if (mouse.active) {
        const aura = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          90,
        );
        aura.addColorStop(0, `rgba(${palette.glow}, 0.12)`);
        aura.addColorStop(1, `rgba(${palette.glow}, 0)`);
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 90, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(loop);
    }

    const onResize = () => {
      resize();
      seed();
    };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const onLeave = () => {
      mouseRef.current.active = false;
    };

    reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resize();
    seed();
    raf = requestAnimationFrame(loop);

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMove);
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [theme]);

  return (
    <div className="ambient-layer" aria-hidden>
      <div className="ambient-soft-glow ambient-soft-glow--a" />
      <div className="ambient-soft-glow ambient-soft-glow--b" />
      <div className="ambient-soft-glow ambient-soft-glow--c" />
      <canvas ref={canvasRef} className="ambient-particles-canvas" />
    </div>
  );
}
