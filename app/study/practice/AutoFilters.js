"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

/** A GET filter form that applies as soon as a choice changes; without JavaScript its submit button does it. */
export default function AutoFilters({ action, children, ...rest }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <form action={action} {...rest} onChange={(event) => {
    const href = `${action}?${new URLSearchParams(new FormData(event.currentTarget))}`;
    startTransition(() => router.push(href, { scroll: false }));
  }}>
    {children}
    <span className="sr-only" role="status" data-navigation-pending={pending || undefined}>
      {pending ? "Applying filters…" : ""}
    </span>
  </form>;
}
