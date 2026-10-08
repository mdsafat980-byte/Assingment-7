"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export type SocialProvider = "google" | "github";
type ProviderAvailability = Record<SocialProvider, boolean>;

export function useSocialProviders() {
  const [providers, setProviders] = useState<ProviderAvailability | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/providers", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("সামাজিক লগইনের অবস্থা জানা যায়নি");
        const result = (await response.json()) as ProviderAvailability;
        if (typeof result.google !== "boolean" || typeof result.github !== "boolean") {
          throw new Error("সামাজিক লগইনের তথ্য সঠিক নয়");
        }
        if (active) setProviders(result);
      })
      .catch((error: unknown) => {
        if (!active) return;
        toast.error(
          error instanceof Error
            ? error.message
            : "সামাজিক লগইনের অবস্থা জানা যায়নি",
        );
        setProviders({ google: false, github: false });
      });
    return () => {
      active = false;
    };
  }, []);

  return providers;
}
