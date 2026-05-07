export default function Card({
  title,
  subtitle,
  action,
  children
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="nx-card">
      <header className="nx-card-hd">
        <div>
          <h2 className="nx-card-title">{title}</h2>
          {subtitle ? <p className="nx-card-sub">{subtitle}</p> : null}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}
