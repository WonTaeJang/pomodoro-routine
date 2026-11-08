import { ExternalLinkIcon } from "@/components/icons";
import pkg from "../../../package.json";
import styles from "./AppFooter.module.scss";

/** 저장소 주소는 package.json 한곳에 둠 (README와 함께 씀) */
const REPOSITORY_URL = pkg.repository.url;

/**
 * 모든 페이지 맨 아래 오른쪽에 작게: 지금 버전과 GitHub 저장소 링크.
 * 서버에서만 그려서 package.json의 다른 내용은 브라우저로 가지 않습니다.
 * 휴대폰 타이머 화면은 한 화면에 맞춰 두었으므로, 내려야 보입니다.
 */
export function AppFooter() {
  return (
    <footer className={styles.footer}>
      <span>v{pkg.version}</span>
      <span aria-hidden="true">·</span>
      <a
        className={styles.link}
        href={REPOSITORY_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        GitHub
        <ExternalLinkIcon size={14} />
        <span className={styles.srOnly}>(새 탭에서 열림)</span>
      </a>
    </footer>
  );
}
