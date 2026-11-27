"use client";

import Link, { useLinkStatus } from "next/link";

function NavigationStatus() {
  const { pending } = useLinkStatus();
  return <span className="sr-only" role="status" data-navigation-pending={pending || undefined}>
    {pending ? "Loading page…" : ""}
  </span>;
}

export default function NavigationLink({ children, ...props }) {
  return <Link {...props}>
    {children}
    <NavigationStatus />
  </Link>;
}
