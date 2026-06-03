// database connection
const prisma = require("../config/prisma");
const { ok, fail } = require("../utils/http");
const {
  isValidUrl,
  normalizeUrl,
  isValidAlias,
  randomCode,
  parseClient,
  isExpired,
} = require("../utils/urlHelpers");

const makeShortCode = async (customAlias) => {
  if (customAlias) {
    const existing = await prisma.url.findUnique({
      where: {
        shortCode: customAlias,
      },
    });

    if (existing) {
      return {
        error: "Custom alias already exists",
      };
    }

    return {
      shortCode: customAlias,
    };
  }

  for (let i = 0; i < 8; i += 1) {
    const shortCode = randomCode();
    const existing = await prisma.url.findUnique({
      where: {
        shortCode,
      },
    });

    if (!existing) {
      return {
        shortCode,
      };
    }
  }

  return {
    error: "Unable to generate a unique short code",
  };
};

const activeUrlWhere = (extra = {}) => ({
  deletedAt: null,
  ...extra,
});

// create short url
const createShortUrl = async (
  userId,
  urlData
) => {

  const {
    originalUrl,
    customAlias,
    expiresAt,
  } = urlData;

  if (!isValidUrl(originalUrl)) {
    return fail("Please enter a valid URL", 422);
  }

  if (!isValidAlias(customAlias)) {
    return fail(
      "Alias must be 3-32 characters using letters, numbers, dashes, or underscores",
      422
    );
  }

  const expiry = expiresAt ? new Date(expiresAt) : null;

  if (expiry && Number.isNaN(expiry.getTime())) {
    return fail("Expiry date is invalid", 422);
  }

  const codeResult = await makeShortCode(customAlias);

  if (codeResult.error) {
    return fail(codeResult.error, 409);
  }

  // save url in database
  const url = await prisma.url.create({
    data: {
      userId,
      originalUrl: normalizeUrl(originalUrl),
      shortCode: codeResult.shortCode,
      customAlias: customAlias || null,
      expiresAt: expiry,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId,
      action: "CREATE_URL",
      metadata: {
        urlId: url.id,
        shortCode: url.shortCode,
      },
    },
  });

  return ok({
    message: "URL created successfully",
    id: url.id,
    shortCode: url.shortCode,
    originalUrl: url.originalUrl,
    shortUrl: `${process.env.BASE_URL || "http://localhost:5000"}/${url.shortCode}`,
  }, 201);

};

// redirect using shortcode
const redirectUrl = async (
  shortCode,
  visitData
) => {

  const url =
    await prisma.url.findUnique({
      where: {
        shortCode,
      },
    });

  if (!url || url.deletedAt || url.status === "DELETED") {
    return null;
  }

  if (url.status !== "ACTIVE" || isExpired(url)) {
    if (isExpired(url) && url.status !== "EXPIRED") {
      await prisma.url.update({
        where: {
          id: url.id,
        },
        data: {
          status: "EXPIRED",
        },
      });
    }

    return "EXPIRED";
  }

  const client = parseClient(visitData.userAgent);

  await prisma.url.update({
    where: {
      id: url.id,
    },
    data: {
      totalClicks: {
        increment: 1,
      },
      lastVisitedAt: new Date(),
    },
  });

  await prisma.visit.create({
    data: {
      urlId: url.id,
      ipAddress:
        visitData.ipAddress,
      browser:
        client.browser,
      device:
        client.device,
      os:
        client.os,
      country:
        visitData.country,
      referrer:
        visitData.referrer,
      userAgent:
        visitData.userAgent,
    },
  });

  // return original url
  return url.originalUrl;

};

// get url analytics
const getUrlAnalytics = async (userId, shortCode) => {

  const url =
    await prisma.url.findFirst({
      where: {
        shortCode,
        userId,
        deletedAt: null,
      },
      include: {
        visits: {
          orderBy: {
            visitedAt: "desc",
          },
          take: 10,
        },
      },
    });

  // url not found
  if (!url) {
    return fail("URL not found", 404);
  }

  const visits = await prisma.visit.findMany({
    where: {
      urlId: url.id,
    },
    orderBy: {
      visitedAt: "asc",
    },
  });

  const countBy = (field) =>
    visits.reduce((acc, visit) => {
      const key = visit[field] || "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

  const dailyTrend = visits.reduce((acc, visit) => {
    const day = visit.visitedAt.toISOString().slice(0, 10);
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});

  return ok({
    originalUrl: url.originalUrl,
    shortCode: url.shortCode,
    shortUrl: `${process.env.BASE_URL || "http://localhost:5000"}/${url.shortCode}`,
    totalClicks: url.totalClicks,
    lastVisitedAt: url.lastVisitedAt,
    status: url.status,
    expiresAt: url.expiresAt,
    createdAt: url.createdAt,
    recentVisits: url.visits,
    dailyTrend,
    deviceDistribution: countBy("device"),
    browserDistribution: countBy("browser"),
    osDistribution: countBy("os"),
  });

};

const getPublicStats = async (shortCode) => {
  const url = await prisma.url.findFirst({
    where: activeUrlWhere({
      shortCode,
    }),
    select: {
      originalUrl: true,
      shortCode: true,
      totalClicks: true,
      lastVisitedAt: true,
      createdAt: true,
      status: true,
      expiresAt: true,
    },
  });

  if (!url) {
    return fail("URL not found", 404);
  }

  return ok({
    ...url,
    shortUrl: `${process.env.BASE_URL || "http://localhost:5000"}/${url.shortCode}`,
  });
};

const updateUrl = async (userId, urlId, data) => {
  const url = await prisma.url.findFirst({
    where: activeUrlWhere({
      id: Number(urlId),
      userId,
    }),
  });

  if (!url) {
    return fail("URL not found", 404);
  }

  const updates = {};

  if (data.originalUrl !== undefined) {
    if (!isValidUrl(data.originalUrl)) {
      return fail("Please enter a valid URL", 422);
    }

    updates.originalUrl = normalizeUrl(data.originalUrl);
  }

  if (data.expiresAt !== undefined) {
    updates.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;

    if (updates.expiresAt && Number.isNaN(updates.expiresAt.getTime())) {
      return fail("Expiry date is invalid", 422);
    }
  }

  if (data.status !== undefined) {
    if (!["ACTIVE", "INACTIVE", "EXPIRED"].includes(data.status)) {
      return fail("URL status is invalid", 422);
    }

    updates.status = data.status;
  }

  const updatedUrl = await prisma.url.update({
    where: {
      id: url.id,
    },
    data: updates,
  });

  await prisma.auditLog.create({
    data: {
      userId,
      action: "UPDATE_URL",
      metadata: {
        urlId: url.id,
      },
    },
  });

  return ok({
    message: "URL updated successfully",
    url: updatedUrl,
  });
};

const bulkCreateShortUrls = async (userId, urls = []) => {
  if (!Array.isArray(urls) || urls.length === 0) {
    return fail("Provide at least one URL", 422);
  }

  if (urls.length > 25) {
    return fail("Bulk upload supports up to 25 URLs at a time", 422);
  }

  const results = [];

  for (const item of urls) {
    const result = await createShortUrl(userId, {
      originalUrl: typeof item === "string" ? item : item.originalUrl,
      customAlias: typeof item === "string" ? undefined : item.customAlias,
      expiresAt: typeof item === "string" ? undefined : item.expiresAt,
    });

    results.push({
      input: item,
      success: result.ok,
      message: result.message,
      shortCode: result.shortCode,
      shortUrl: result.shortUrl,
    });
  }

  return ok({
    message: "Bulk URL creation completed",
    results,
  }, 207);
};
// delete url
const deleteUrl = async (
  userId,
  urlId
) => {

  // find url
  const url =
    await prisma.url.findFirst({
      where: activeUrlWhere({
        id: Number(urlId),
        userId,
      }),
    });

  // url not found
  if (!url) {
    return fail("URL not found", 404);
  }

  await prisma.url.update({
    where: {
      id: url.id,
    },
    data: {
      status: "DELETED",
      deletedAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      userId,
      action: "DELETE_URL",
      metadata: {
        urlId: url.id,
      },
    },
  });

  return ok({
    message: "URL deleted successfully",
  });

};

// export service functions
module.exports = {
  createShortUrl,
  redirectUrl,
  getUrlAnalytics,
  getPublicStats,
  updateUrl,
  bulkCreateShortUrls,
  deleteUrl,
};
