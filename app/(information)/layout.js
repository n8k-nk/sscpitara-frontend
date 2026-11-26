import HomeHeader from "../_home/HomeHeader";
import SiteFooter from "../../components/SiteFooter";
import { session } from "../../lib/server";
import styles from "./information.module.css";

export default async function InformationLayout({ children }) {
  const user = await session();
  const authenticated = Boolean(user.authenticated);
  return (
    <div className={styles.shell}>
      <HomeHeader authenticated={authenticated} />
      <main id="main" className={styles.main}>
        <article className={styles.article}>{children}</article>
      </main>
      <SiteFooter authenticated={authenticated} />
    </div>
  );
}
