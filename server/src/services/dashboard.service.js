// database connection
const prisma = require("../config/prisma");

const DAY_MS = 24 * 60 * 60 * 1000;

// Build a continuous N-day series (zero-filled) from raw visit timestamps.
const buildTrend = (visits, days) => {
  const buckets = {};
  for (let i = days - 1; i >= 0; i -= 1) {
    const key = new Date(Date.now() - i * DAY_MS).toISOString().slice(0, 10);
    buckets[key] = 0;
  }
  visits.forEach((v) => {
    const key = v.visitedAt.toISOString().slice(0, 10);
    if (key in buckets) buckets[key] += 1;
  });
  return Object.entries(buckets).map(([date, clicks]) => ({ date, clicks }));
};

const tally = (rows, field) =>
  rows.reduce((acc, r) => {
    const key = r[field] || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

// get dashboard data
const getDashboardData = async (userId) => {
  const now = new Date();

  // lazily flip expired links
  await prisma.url.updateMany({
    where: {
      userId,
      deletedAt: null,
      status: "ACTIVE",
      expiresAt: { lte: now },
    },
    data: { status: "EXPIRED" },
  });

  const urls = await prisma.url.findMany({
    where: { userId, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  const totalUrls = urls.length;
  const activeUrls = urls.filter((u) => u.status === "ACTIVE").length;
  const expiredUrls = urls.filter((u) => u.status === "EXPIRED").length;
  const totalClicks = urls.reduce((sum, u) => sum + u.totalClicks, 0);
  const avgClicks = totalUrls ? Math.round((totalClicks / totalUrls) * 10) / 10 : 0;

  const recentVisits = await prisma.visit.findMany({
    where: { url: { userId, deletedAt: null } },
    include: { url: { select: { shortCode: true, originalUrl: true } } },
    orderBy: { visitedAt: "desc" },
    take: 8,
  });

  // visits within the last 30 days for trend + distributions
  const recentWindow = await prisma.visit.findMany({
    where: {
      url: { userId, deletedAt: null },
      visitedAt: { gte: new Date(Date.now() - 30 * DAY_MS) },
    },
    select: { visitedAt: true, device: true, browser: true },
  });

  const topUrls = [...urls]
    .sort((a, b) => b.totalClicks - a.totalClicks)
    .slice(0, 5)
    .map((u) => ({
      shortCode: u.shortCode,
      originalUrl: u.originalUrl,
      totalClicks: u.totalClicks,
    }));

  return {
    totalUrls,
    activeUrls,
    expiredUrls,
    totalClicks,
    avgClicks,
    recentVisits,
    urls,
    clickTrend: buildTrend(recentWindow, 14),
    deviceBreakdown: tally(recentWindow, "device"),
    browserBreakdown: tally(recentWindow, "browser"),
    topUrls,
  };
};

module.exports = {
  getDashboardData,
};
