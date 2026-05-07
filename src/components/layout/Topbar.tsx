export default function Topbar() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <header className="nx-topbar">
      <div>
        <h1 className="nx-page-title">COMMAND CENTER</h1>
        <p className="nx-page-sub">{today}</p>
      </div>
      <div className="nx-topbar-right">
        <button className="nx-topbar-btn" type="button" aria-label="Search">
          ⌕
        </button>
        <button className="nx-topbar-btn" type="button" aria-label="Notifications">
          🔔
        </button>
        <button className="nx-topbar-btn" type="button" aria-label="Settings">
          ⚙
        </button>
      </div>
    </header>
  );
}
