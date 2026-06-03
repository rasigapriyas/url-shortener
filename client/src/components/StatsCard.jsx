// Modern stat card: label, big value, tinted icon, optional delta line.
function StatsCard({ title, value, icon = null, tone = "blue", delta, deltaUp }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <h3>{title}</h3>
        {icon && <div className={`stat-icon ${tone}`}>{icon}</div>}
      </div>
      <h2>{value}</h2>
      {delta && <span className={`delta ${deltaUp ? "up" : ""}`}>{delta}</span>}
    </div>
  );
}

export default StatsCard;
