import Link from "next/link";

export default function Resume({ active }) {
  return active.map((a) => <div className="resume" key={a.id}><p>{a.title} is in progress</p>
    <Link className="button" href={`/study/attempt/${a.id}/`}>Resume {a.title}</Link></div>);
}
