"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GoToPlans() {
  const router = useRouter();
  useEffect(() => { router.replace("/plans/"); }, [router]);
  return <div className="page-head">
    <h1>This lesson is part of Premium</h1>
    <p><Link href="/plans/">See what is free and what Premium includes</Link></p>
  </div>;
}
