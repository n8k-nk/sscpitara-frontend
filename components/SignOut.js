"use client";
import { useRouter } from "next/navigation";
import { send } from "../lib/client";

export default function SignOut() {
  const router = useRouter();
  return <button type="button" onClick={async () => { await send("auth/signout"); router.push("/"); router.refresh(); }}>Sign out</button>;
}
