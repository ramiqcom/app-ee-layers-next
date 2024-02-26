import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      Welcome to ee-layers-next. Use /layers endpoint to POST layer request.
    </main>
  );
}
