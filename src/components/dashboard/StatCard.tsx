import Badge from "@/components/ui/Badge";

type StatCardProps = {
  tone: "cyan" | "orange" | "red" | "green";
  label: string;
  value: string;
  subValue?: string;
  footerLabel: string;
  badgeText: string;
  badgeTone: "up" | "down" | "warn" | "info";
};

export default function StatCard({
  tone,
  label,
  value,
  subValue,
  footerLabel,
  badgeText,
  badgeTone
}: StatCardProps) {
  return (
    <article className={`nx-stat-card ${tone}`}>
      <p className="nx-stat-label">{label}</p>
      <p className="nx-stat-val">
        {value}
        {subValue ? <span className="nx-stat-denom">{subValue}</span> : null}
      </p>
      <div className="nx-stat-footer">
        <span className="nx-stat-sub">{footerLabel}</span>
        <Badge tone={badgeTone}>{badgeText}</Badge>
      </div>
    </article>
  );
}
