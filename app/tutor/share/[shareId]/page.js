import Link from "next/link";
import { call, session } from "../../../../lib/server";
import { TutorMessagesList } from "../../TutorMessage";
import styles from "../../tutor.module.css";

export async function generateMetadata({ params }) {
  const { shareId } = await params;
  const res = await call(`tutor/share/${encodeURIComponent(shareId)}`);
  const title = res.ok && res.data?.title ? `${res.data.title} - Shared Chat` : "Shared AI Tutor";
  return { title, robots: { index: false, follow: false } };
}

export default async function SharedTutorPage({ params }) {
  const { shareId } = await params;
  const [res, user] = await Promise.all([
    call(`tutor/share/${encodeURIComponent(shareId)}`),
    session(),
  ]);

  const tutorHref = user.authenticated ? "/tutor/" : "/signin/?next=/tutor/";
  const ctaLabel = user.authenticated ? "Open AI Tutor" : "Sign in to start your own chat";

  if (!res.ok || !Array.isArray(res.data?.messages)) {
    return (
      <div className={`tutor-root ${styles.chatPage}`}>
        <div className={styles.emptyStage}>
          <h1 className={styles.headline}>This shared chat is unavailable</h1>
          <p className={styles.shareEmptyCopy}>
            The owner may have stopped sharing this conversation or the link is invalid.
          </p>
          <div className={styles.shareUnavailableActions}>
            <Link href={tutorHref} className={`${styles.shareCtaBtn} ${styles.shareCtaPrimary}`}>
              {ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const chat = res.data;
  return (
    <div className={`tutor-root ${styles.chatPage}`}>
      <div className={styles.topBar}>
        <div className={styles.shareTitleGroup}>
          <h1 className={styles.sharePageTitle}>{chat.title}</h1>
          <span className={styles.readOnlyPill}>Read-only</span>
        </div>
        <Link href={tutorHref} className={`${styles.shareCtaBtn} ${styles.shareCtaPrimary}`}>
          {user.authenticated ? "Open AI Tutor" : "Try AI Tutor"}
        </Link>
      </div>

      <div className={styles.messagesArea}>
        <div className={styles.messagesInner}>
          <TutorMessagesList messages={chat.messages} selectable={false} />
        </div>
      </div>

      <div className={styles.shareFooterBar}>
        <span>Shared from SSC Pitara AI Tutor (view only)</span>
        <Link href={tutorHref}>{ctaLabel}</Link>
      </div>
    </div>
  );
}
