type BadgeTone = "up" | "down" | "warn" | "info";

export default function Badge({
  children,
  tone
}: {
  children: React.ReactNode;
  tone: BadgeTone;
}) {
  return <span className={`nx-stat-badge ${tone}`}>{children}</span>;
}
