"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [key, setKey] = useState(pathname);

  useEffect(() => {
    setKey(pathname);
  }, [pathname]);

  return (
    <div key={key} className="page-enter min-w-0 w-full">
      {children}
    </div>
  );
}
