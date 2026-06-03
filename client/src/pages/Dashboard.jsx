import { useEffect, useState } from "react";
import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";
import UrlForm from "../components/UrlForm";
import UrlTable from "../components/UrlTable";
import StatsCard from "../components/StatsCard";
import { TrendChart, Donut } from "../components/charts";
import {
  IconLink,
  IconActivity,
  IconBolt,
  IconClock,
  IconChart,
} from "../components/icons";

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const user = getUser();

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/url/dashboard");
      setData(res.data);
    } catch (error) {
      console.log(error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Dashboard" subtitle="Loading your workspace…">
        <div className="stats-grid">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 116 }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: 220 }} />
        <div className="skeleton" style={{ height: 320 }} />
      </DashboardLayout>
    );
  }

  const d = data || {};
  const firstName = (user?.name || "there").split(" ")[0];

  return (
    <DashboardLayout
      title={`Welcome back, ${firstName} 👋`}
      subtitle="Create short links, track clicks, and watch your audience grow."
      active="overview"
      search={query}
      onSearch={setQuery}
    >
      {/* Hero / quick create */}
      <section className="hero">
        <h1>Shorten a new link</h1>
        <p>Paste a long URL, add an optional alias or expiry, and share it anywhere.</p>
        <UrlForm onUrlCreated={fetchDashboard} variant="hero" />
      </section>

      {/* Stats */}
      <section className="stats-grid">
        <StatsCard title="Total URLs" value={d.totalUrls ?? 0} tone="blue" icon={<IconLink width={20} height={20} />} />
        <StatsCard title="Total Clicks" value={d.totalClicks ?? 0} tone="violet" icon={<IconActivity width={20} height={20} />} />
        <StatsCard title="Active URLs" value={d.activeUrls ?? 0} tone="green" icon={<IconBolt width={20} height={20} />} />
        <StatsCard title="Expired URLs" value={d.expiredUrls ?? 0} tone="amber" icon={<IconClock width={20} height={20} />} />
        <StatsCard title="Avg / Link" value={d.avgClicks ?? 0} tone="cyan" icon={<IconChart width={20} height={20} />} />
      </section>

      {/* Trends + device split */}
      <section className="grid-2" id="analytics">
        <div className="panel">
          <div className="panel-head">
            <h2>Click trends</h2>
            <span className="muted">Last 14 days</span>
          </div>
          <TrendChart data={d.clickTrend || []} />
        </div>
        <div className="panel">
          <div className="panel-head"><h2>Devices</h2></div>
          <Donut data={d.deviceBreakdown || {}} />
        </div>
      </section>

      <section className="grid-2">
        <div className="panel" id="links">
          <div className="panel-head">
            <h2>Your links</h2>
            <span className="muted">{d.urls?.length || 0} total</span>
          </div>
          <UrlTable urls={d.urls || []} onChange={fetchDashboard} query={query} />
        </div>
        <div className="panel">
          <div className="panel-head"><h2>Browsers</h2></div>
          <Donut data={d.browserBreakdown || {}} />
        </div>
      </section>

      {/* Recent activity */}
      <section className="panel" id="activity">
        <div className="panel-head">
          <h2>Recent activity</h2>
          <span className="muted">Latest visits</span>
        </div>
        <div className="visit-list">
          {d.recentVisits?.length ? (
            d.recentVisits.map((v) => (
              <div className="visit-row" key={v.id}>
                <span className="row">
                  <span className="short-link cell-mono">/{v.url.shortCode}</span>
                </span>
                <span className="muted">
                  {(v.browser || "Unknown")} · {(v.device || "Unknown")}
                </span>
                <span className="muted">{new Date(v.visitedAt).toLocaleString()}</span>
              </div>
            ))
          ) : (
            <p className="muted">No visits recorded yet.</p>
          )}
        </div>
      </section>
    </DashboardLayout>
  );
}

export default Dashboard;
