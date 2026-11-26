"use client";

import { useRouter } from "next/navigation";

/** A GET filter form that applies as soon as a choice changes; without JavaScript its submit button does it. */
export default function AutoFilters({ action, children, ...rest }) {
  const router = useRouter();
  return <form action={action} {...rest} onChange={(event) =>
    router.push(`${action}?${new URLSearchParams(new FormData(event.currentTarget))}`, { scroll: false })}>
    {children}
  </form>;
}
