"use client";
import { useRouter } from "next/navigation";
import { send } from "../lib/client";

export default function SignOut({ children = "Sign out", ...props }) {
  const router = useRouter();
  return <button {...props} type="button" onClick={async () => { await send("auth/signout"); router.push("/"); router.refresh(); }}>{children}</button>;
}
