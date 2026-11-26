import { redirect } from "next/navigation";

export const metadata = { title: "Premium", robots: { index: false } };

export default function Billing() {
  redirect("/plans/");
}
