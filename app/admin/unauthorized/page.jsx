import Link from "next/link";
import styles from "./unauthorized.module.css";

export default function UnauthorizedPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}>🚫</div>

        <h1 className={styles.title}>Accès refusé</h1>

        <p className={styles.text}>
          Cette zone est réservée aux administrateurs.
          Vous n’avez pas les autorisations nécessaires.
        </p>

        <div className={styles.actions}>
          <Link href="/" className={styles.buttonPrimary}>
            Retour à l’accueil
          </Link>

          <Link href="/login" className={styles.buttonSecondary}>
            Se connecter avec un autre compte
          </Link>
        </div>
      </div>
    </div>
  );
}
