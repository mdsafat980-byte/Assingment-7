"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";

export function AuthResultToast() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const result = url.searchParams.get("auth");
    if (!result) return;

    if (result === "signin") toast.success("সফলভাবে সাইন ইন হয়েছে।");
    if (result === "signup") toast.success("সামাজিক অ্যাকাউন্ট দিয়ে সাইন আপ হয়েছে।");
    url.searchParams.delete("auth");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  return null;
}
