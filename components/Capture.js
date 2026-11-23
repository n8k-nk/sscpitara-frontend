"use client";
import { useEffect } from "react";

/** Remember the first-touch campaign source so sign-up can attribute the account. */
export default function Capture() {
  useEffect(() => {
    try {
      const source = new URLSearchParams(location.search).get("utm_source");
      if (source && !sessionStorage.getItem("utm_source")) sessionStorage.setItem("utm_source", source);
    } catch { /* storage may be disabled */ }
  }, []);
  return null;
}
