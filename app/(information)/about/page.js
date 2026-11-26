import Link from "next/link";
import { informationMetadata } from "../../../lib/information-pages";

export const metadata = informationMetadata("/about/");

export default function About() {
  return <>
    <h1>About SSC Pitara</h1>
    <p>SSC Pitara is an independent study platform for people preparing for India’s Staff Selection Commission exams. It brings previous-year papers, lessons, practice tests and study progress into one place.</p>
    <h2>How to study with SSC Pitara</h2>
    <p>Start with the <Link href="/pyq/">previous-year question archive</Link> or <Link href="/learn/">SSC lessons</Link>. Use practice and review to identify the topics where you lose marks and work on those topics next. See <Link href="/plans/">study coverage</Link> for free and Premium access.</p>
    <h2>Exam information and corrections</h2>
    <p>SSC Pitara operates independently of the Staff Selection Commission. Use the <a href="https://ssc.gov.in/">official SSC website</a> to confirm dates, eligibility, vacancies and results. If a question or explanation appears incorrect, <Link href="/contact/">send us the page and question number</Link>.</p>
  </>;
}
