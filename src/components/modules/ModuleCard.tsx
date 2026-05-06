import styles from "./modules.module.css";

type ModuleCardProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export default function ModuleCard({ title, subtitle, children }: ModuleCardProps) {
  return (
    <article className={styles.card}>
      <header className={styles.cardHeader}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.subtitle}>{subtitle}</p>
      </header>
      {children}
    </article>
  );
}

