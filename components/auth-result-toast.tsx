"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";
import { authClient, SOCIAL_AUTH_PENDING_KEY } from "@/lib/auth-client";

export function AuthResultToast() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const result = url.searchParams.get("auth");
    const error = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");
    let pendingFlow: "signin" | "signup" | null = null;
    try {
      const pending = window.sessionStorage.getItem(SOCIAL_AUTH_PENDING_KEY);
      if (pending) {
        const parsed = JSON.parse(pending) as { flow?: unknown; startedAt?: unknown };
        if (
          (parsed.flow === "signin" || parsed.flow === "signup") &&
          typeof parsed.startedAt === "number" &&
          Date.now() - parsed.startedAt < 5 * 60 * 1000
        ) {
          pendingFlow = parsed.flow;
        }
        window.sessionStorage.removeItem(SOCIAL_AUTH_PENDING_KEY);
      }
    } catch {
      toast.error("সাইন-ইন ফলাফল যাচাই করা যায়নি।");
    }
    if (!result && !error && !pendingFlow) return;

    url.searchParams.delete("error");
    url.searchParams.delete("error_description");
    url.searchParams.delete("auth");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);

    let active = true;
    async function reportResult() {
      if (error) {
        toast.error(errorDescription ?? "Google দিয়ে সাইন ইন সম্পন্ন হয়নি। আবার চেষ্টা করুন।");
        return;
      }

      try {
        const session = await authClient.getSession();
        if (!active) return;
        if (session.error || !session.data) {
          toast.error("Google sign-in সম্পন্ন হয়নি। আবার চেষ্টা করুন।");
        } else if (result === "signin" || pendingFlow === "signin") {
          toast.success("সফলভাবে সাইন ইন হয়েছে।");
        } else if (result === "signup" || pendingFlow === "signup") {
          toast.success("সামাজিক অ্যাকাউন্ট দিয়ে সাইন আপ হয়েছে।");
        }
      } catch {
        if (active) toast.error("Google sign-in-এর অবস্থা যাচাই করা যায়নি।");
      }
    }

    void reportResult();
    return () => {
      active = false;
    };
  }, []);

  return null;
}
