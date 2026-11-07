import styles from "./page.module.scss";

export default function Home() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>까미도로</h1>
      <p className={styles.subtitle}>
        까미랑 함께하는 뽀모도로 타이머, 준비 중이에요.
      </p>
    </main>
  );
}
