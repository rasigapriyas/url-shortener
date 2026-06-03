import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  IconGauge,
  IconLink,
  IconChart,
  IconQr,
  IconActivity,
  IconSearch,
  IconBell,
  IconSun,
  IconMoon,
  IconLogout,
} from "../components/icons";

const NAV = [
  { key: "overview", label: "Overview", href: "#overview", Icon: IconGauge },
  { key: "links", label: "My Links", href: "#links", Icon: IconLink },
  { key: "analytics", label: "Analytics", href: "#analytics", Icon: IconChart },
  { key: "qr", label: "QR Codes", href: "#links", Icon: IconQr },
  { key: "activity", label: "Activity", href: "#activity", Icon: IconActivity },
];

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function DashboardLayout({
  children,
  title,
  subtitle,
  active = "overview",
  search,
  onSearch,
}) {
  const navigate = useNavigate();
  const user = getUser();
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const initials = (user?.name || user?.email || "U")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const logout = async () => {
    try {
      await api.post("/auth/logout", {
        refreshToken: localStorage.getItem("refreshToken"),
      });
    } catch {
      /* ignore */
    }
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="auth-logo">S</span>
          ShortLink
        </div>

        <div className="nav-label">Workspace</div>
        {NAV.map(({ key, label, href, Icon }) => (
          <a
            key={key}
            href={href}
            className={`nav-link ${active === key ? "active" : ""}`}
          >
            <Icon />
            <span>{label}</span>
          </a>
        ))}

        <div className="sidebar-foot">
          <div className="user-chip">
            <div className="avatar">{initials}</div>
            <div className="meta">
              <b>{user?.name || "Account"}</b>
              <span>{user?.email || ""}</span>
            </div>
          </div>
          <button className="btn btn-ghost btn-block" onClick={logout}>
            <IconLogout width={16} height={16} /> Sign out
          </button>
        </div>
      </aside>

      <div className="main-panel">
        <header className="topbar">
          <div className="search">
            <IconSearch />
            <input
              placeholder="Search links…"
              value={search ?? ""}
              onChange={(e) => onSearch?.(e.target.value)}
              disabled={!onSearch}
            />
          </div>
          <div className="topbar-spacer" />
          <div className="topbar-actions">
            <button
              className="top-icon"
              title="Toggle theme"
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            >
              {theme === "dark" ? (
                <IconSun width={18} height={18} />
              ) : (
                <IconMoon width={18} height={18} />
              )}
            </button>
            <button className="top-icon" title="Notifications">
              <IconBell width={18} height={18} />
              <span className="dot" />
            </button>
            <div className="avatar" title={user?.email}>
              {initials}
            </div>
          </div>
        </header>

        <div className="page-body">
          {(title || subtitle) && (
            <div className="page-head" id="overview">
              <div>
                {title && <h1>{title}</h1>}
                {subtitle && <p>{subtitle}</p>}
              </div>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
