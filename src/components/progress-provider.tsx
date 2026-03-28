"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import nProgress from "nprogress";

nProgress.configure({ showSpinner: false, speed: 400, minimum: 0.2 });

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    nProgress.start();
    const timer = setTimeout(() => {
      nProgress.done();
    }, 100);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return <>{children}</>;
}
