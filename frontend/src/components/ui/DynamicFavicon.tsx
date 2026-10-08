"use client";

import { useEffect } from "react";

export function DynamicFavicon() {
  useEffect(() => {
    void fetch("/api/public/branding")
      .then((response) => response.json())
      .then((data) => {
        const href = String(data.branding?.favicon ?? "").trim();
        if (!href) return;
        // Never remove favicon nodes created by Next.js. Its head manager owns
        // those elements and removing them manually can make React attempt to
        // remove an already-detached node during navigation/hot reload.
        let link = document.querySelector<HTMLLinkElement>('link[data-upsale-dynamic-favicon="true"]');
        if (!link) {
          link = document.createElement("link");
          link.rel = "icon";
          link.dataset.upsaleDynamicFavicon = "true";
          document.head.appendChild(link);
        }
        if (link.href !== new URL(href, window.location.href).href) link.href = href;
      })
      .catch(() => undefined);
  }, []);
  return null;
}
