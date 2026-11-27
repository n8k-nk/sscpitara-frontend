import { Suspense } from "react";
import RouteSkeleton from "../../components/RouteSkeleton";
import Link from "../../components/NavigationLink";
import { notFound } from "next/navigation";
import { metadata as pageMetadata, readNews } from "../../lib/public";
import styles from "./news.module.css";

export const metadata = pageMetadata("News | Top stories", "Browse the latest top stories and open the original articles.", "/news/");

const newsDates = Object.fromEntries(["en", "hi"].map((lang) => [
  lang, new Intl.DateTimeFormat(`${lang}-IN`, { dateStyle: "medium", timeZone: "Asia/Kolkata" }),
]));

function newsHref(lang, page = 1) {
  const query = new URLSearchParams();
  if (lang === "hi") query.set("lang", lang);
  if (page === 2) query.set("page", "2");
  return query.size ? `/news/?${query}` : "/news/";
}

function PublishedDate({ timestamp, lang }) {
  if (typeof timestamp !== "number" || timestamp <= 0) return null;
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return null;
  return <time dateTime={date.toISOString()}>{newsDates[lang].format(date)}</time>;
}

export default async function News({ searchParams }) {
  const { page, lang: requested } = await searchParams;
  const lang = requested === "hi" ? "hi" : "en";
  if (page !== undefined && page !== "1" && page !== "2") notFound();
  const current = page === "2" ? 2 : 1;
  return <section className={styles.news}>
    <header className={styles.masthead}>
      <h1>SSC Pitara News</h1>
      <div className={styles.edition}>
        <p>Top stories</p>
        <nav className={styles.switcher} aria-label="News language">
          <Link className="button secondary" href={newsHref("en")} aria-current={lang === "en" ? "page" : undefined}>English</Link>
          <Link className="button secondary" href={newsHref("hi")} aria-current={lang === "hi" ? "page" : undefined} lang="hi">हिन्दी</Link>
        </nav>
      </div>
    </header>
    <Suspense key={`${lang}/${current}`} fallback={<RouteSkeleton label="top stories" inline />}>
      <NewsStories lang={lang} current={current} />
    </Suspense>
    <nav className={styles.pagination} aria-label="News pages">
      <Link className="button secondary" href={newsHref(lang)} aria-current={current === 1 ? "page" : undefined}>1</Link>
      <Link className="button secondary" href={newsHref(lang, 2)} aria-current={current === 2 ? "page" : undefined}>2</Link>
    </nav>
  </section>;
}


async function NewsStories({ lang, current }) {
  const data = await readNews(lang).catch(() => null);
  const start = (current - 1) * 10;
  const stories = data?.stories.slice(start, start + 10);

  return <>
    {!data ? <p className="notice">Top stories are temporarily unavailable. Please try again shortly.</p>
      : !stories.length ? <p className="notice">There are no top stories on this page right now.</p>
      : <ol className={styles.stories} role="list" lang={lang} start={start + 1}>{stories.map((story) => <li key={story.source_url}>
        <div>
          <h2>{story.title}</h2>
          {story.headline && story.headline !== story.title && !/^tap to know more[.!…]*$/i.test(story.headline.trim()) && <p className={styles.deck}>{story.headline}</p>}
        </div>
        <div>
          {story.content && <p className={styles.summary}>{story.content}</p>}
          <div className={styles.storyDetails}>
            <PublishedDate timestamp={story.created_at} lang={lang} />
            <a href={story.source_url}>{new URL(story.source_url).hostname.replace(/^www\./, "")} <span aria-hidden="true">↗</span><span className={styles.srOnly}> source article</span></a>
          </div>
        </div>
      </li>)}</ol>}
  </>;
}
