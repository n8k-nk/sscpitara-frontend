import RouteSkeleton from "../../components/RouteSkeleton";
import styles from "./account.module.css";

export default function Loading() {
  return <div className={styles.account}>
    <header className={styles.hero}><h1>My account</h1></header>
    <RouteSkeleton label="profile and account settings" variant="overview" inline />
  </div>;
}
