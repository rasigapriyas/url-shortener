import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import StatsCard from "../components/StatsCard";
import { TrendChart, Donut } from "../components/charts";
import { IconActivity, IconClock, IconBolt, IconChart } from "../components/icons";

function Analytics() {
  const { shortCode } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/url/analytics/${shortCode}`);
        setData(res.data);
      } catch (error) {
        console.log(error.response?.data);
      } finally {
        setLoading(false);
      }
    })();
  }, [shortCode]);

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="skeleton" style={{ height: 120 }} />
        <div className="skeleton" style={{ height: 280 }} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="center-screen">
        <p className="muted">Analytics not found for this link.</p>
        <button className="btn btn-secondary" onClick={() => navigate("/dashboard")}>
          Back to dashboard
        </button>
      </div>
    );
  }

  const trend = Object.entries(data.dailyTrend || {})
    .map(([date, clicks]) => ({ date, clicks }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="analytics-page">
      <div className="page-head">
        <div>
          <button className="btn btn-ghost" onClick={() => navigate("/dashboard")} style={{ marginBottom: 12 }}>
            ← Back
          </button>
          <h1 className="cell-mono">/{data.shortCode}</h1>
          <p className="muted cell-truncate" style={{ maxWidth: 560 }}>
            {data.originalUrl}
          </p>
        </div>
        <a className="btn btn-secondary" href={data.shortUrl} target="_blank" rel="noreferrer">
          Open link
        </a>
      </div>

      <section className="stats-grid">
        <StatsCard title="Total Clicks" value={data.totalClicks} tone="violet" icon={<IconActivity width={20} height={20} />} />
        <StatsCard title="Status" value={data.status} tone="green" icon={<IconBolt width={20} height={20} />} />
        <StatsCard
          title="Last Visit"
          value={data.lastVisitedAt ? new Date(data.lastVisitedAt).toLocaleDateString() : "Never"}
          tone="blue"
          icon={<IconClock width={20} height={20} />}
        />
        <StatsCard
          title="Created"
          value={new Date(data.createdAt).toLocaleDateString()}
          tone="amber"
          icon={<IconChart width={20} height={20} />}
        />
        <StatsCard
          title="Expires"
          value={data.expiresAt ? new Date(data.expiresAt).toLocaleDateString() : "Never"}
          tone="cyan"
          icon={<IconClock width={20} height={20} />}
        />
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Click trend</h2>
          <span className="muted">Daily</span>
        </div>
        <TrendChart data={trend} />
      </section>

      <section className="chart-grid">
        <div className="panel">
          <div className="panel-head"><h2>Devices</h2></div>
          <Donut data={data.deviceDistribution} height={200} />
        </div>
        <div className="panel">
          <div className="panel-head"><h2>Browsers</h2></div>
          <Donut data={data.browserDistribution} height={200} />
        </div>
        <div className="panel">
          <div className="panel-head"><h2>OS</h2></div>
          <Donut data={data.osDistribution} height={200} />
        </div>
      </section>

      <section className="panel">
        <div className="panel-head"><h2>Recent visits</h2></div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Visited</th>
                <th>Browser</th>
                <th>Device</th>
                <th>OS</th>
                <th>Country</th>
              </tr>
            </thead>
            <tbody>
              {data.recentVisits?.length ? (
                data.recentVisits.map((v) => (
                  <tr key={v.id}>
                    <td>{new Date(v.visitedAt).toLocaleString()}</td>
                    <td>{v.browser || "Unknown"}</td>
                    <td>{v.device || "Unknown"}</td>
                    <td>{v.os || "Unknown"}</td>
                    <td>{v.country || "Unknown"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}><p className="muted" style={{ padding: "12px 0" }}>No visits yet.</p></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Analytics;
