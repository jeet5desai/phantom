"use client";

import { useEffect } from "react";
import { useClerk } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function SSOCallback() {
  const { handleRedirectCallback } = useClerk();

  useEffect(() => {
    handleRedirectCallback({});
  }, [handleRedirectCallback]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background flex-col gap-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-accent-light rounded-full"></div>
        <div className="w-16 h-16 border-4 border-accent-primary border-t-transparent rounded-full animate-spin absolute top-0"></div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <h2 className="text-xl font-display font-bold text-text-primary">Securing your session</h2>
        <p className="text-sm text-text-secondary animate-pulse">Finalizing authentication...</p>
      </div>
    </div>
  );
}
