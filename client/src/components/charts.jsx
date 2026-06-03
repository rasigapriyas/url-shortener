import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

export const CHART_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
];

const axisStyle = { fill: "#94a3b8", fontSize: 12 };

// Area chart for time-series click trends.
export function TrendChart({ data = [], dataKey = "clicks", xKey = "date", height = 260 }) {
  if (!data.length) return <EmptyChart label="No click data yet" />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="clickGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#243449" vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={axisStyle}
          tickLine={false}
          axisLine={false}
          tickFormatter={(d) => String(d).slice(5)}
          minTickGap={20}
        />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} allowDecimals={false} width={36} />
        <Tooltip cursor={{ stroke: "#334155" }} />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke="#6366f1"
          strokeWidth={2.5}
          fill="url(#clickGrad)"
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Donut chart from a { label: count } map.
export function Donut({ data = {}, height = 220 }) {
  const rows = Object.entries(data)
    .map(([name, value]) => ({ name, value }))
    .filter((r) => r.value > 0);

  if (!rows.length) return <EmptyChart label="No data yet" />;

  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={rows}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
            stroke="none"
          >
            {rows.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="legend">
        {rows.map((r, i) => (
          <span className="item" key={r.name}>
            <span
              className="swatch"
              style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
            />
            {r.name} · {r.value}
          </span>
        ))}
      </div>
    </div>
  );
}

// Horizontal-ish bar chart for "top performers".
export function TopBars({ data = [], height = 240 }) {
  if (!data.length) return <EmptyChart label="No links yet" />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid stroke="#243449" horizontal={false} />
        <XAxis type="number" tick={axisStyle} tickLine={false} axisLine={false} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="shortCode"
          tick={axisStyle}
          tickLine={false}
          axisLine={false}
          width={90}
        />
        <Tooltip cursor={{ fill: "rgba(99,102,241,0.08)" }} />
        <Bar dataKey="totalClicks" radius={[0, 6, 6, 0]} fill="#6366f1" barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function EmptyChart({ label }) {
  return (
    <div className="center-screen" style={{ minHeight: 200 }}>
      <span className="muted">{label}</span>
    </div>
  );
}
