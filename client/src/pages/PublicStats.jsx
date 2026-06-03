import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import StatsCard from "../components/StatsCard";
import { IconActivity, IconBolt, IconClock, IconChart } from "../components/icons";

function PublicStats() {
  const { shortCode } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/url/public/${shortCode}`);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Stats unavailable");
      }
    })();
  }, [shortCode]);

  if (error) {
    return (
      <main className="center-screen">
        <h2>{error}</h2>
        <a className="btn btn-secondary" href="/">Go home</a>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="center-screen">
        <div className="spinner" /> Loading stats…
      </main>
    );
  }

  return (
    <main className="public-page">
      <div className="auth-brand">
        <span className="auth-logo">S</span> ShortLink
      </div>
      <div className="page-head">
        <div>
          <h1 className="cell-mono">/{data.shortCode}</h1>
          <p className="muted cell-truncate" style={{ maxWidth: 560 }}>{data.originalUrl}</p>
        </div>
        <a className="btn btn-secondary" href={data.shortUrl} target="_blank" rel="noreferrer">
          Open link
        </a>
      </div>

      <section className="stats-grid">
        <StatsCard title="Total Clicks" value={data.totalClicks} tone="violet" icon={<IconActivity width={20} height={20} />} />
        <StatsCard title="Status" value={data.status} tone="green" icon={<IconBolt width={20} height={20} />} />
        <StatsCard title="Created" value={new Date(data.createdAt).toLocaleDateString()} tone="blue" icon={<IconChart width={20} height={20} />} />
        <StatsCard
          title="Last Visit"
          value={data.lastVisitedAt ? new Date(data.lastVisitedAt).toLocaleDateString() : "Never"}
          tone="amber"
          icon={<IconClock width={20} height={20} />}
        />
        <StatsCard
          title="Expires"
          value={data.expiresAt ? new Date(data.expiresAt).toLocaleDateString() : "Never"}
          tone="cyan"
          icon={<IconClock width={20} height={20} />}
        />
      </section>
    </main>
  );
}

export default PublicStats;
