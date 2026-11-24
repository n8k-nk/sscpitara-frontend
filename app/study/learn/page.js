import { redirect } from "next/navigation";

export const metadata = { title: "Learn", robots: { index: false } };

export default function StudyLearn() {
  redirect("/learn/");
}
