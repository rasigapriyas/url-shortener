import { useMemo, useState } from "react";
import UrlRow from "./UrlRow";
import { IconSearch, IconLink } from "./icons";

const PAGE_SIZE = 6;
const FILTERS = [
  { key: "all", label: "All" },
  { key: "ACTIVE", label: "Active" },
  { key: "EXPIRED", label: "Expired" },
  { key: "INACTIVE", label: "Inactive" },
];

function UrlTable({ urls = [], onChange, query = "" }) {
  const [localQuery, setLocalQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState({ key: "createdAt", dir: "desc" });
  const [page, setPage] = useState(1);

  const search = (query || localQuery).toLowerCase();

  const filtered = useMemo(() => {
    let rows = urls.filter((u) => {
      const matchesStatus = status === "all" || u.status === status;
      const matchesSearch =
        !search ||
        u.originalUrl.toLowerCase().includes(search) ||
        u.shortCode.toLowerCase().includes(search);
      return matchesStatus && matchesSearch;
    });

    rows = [...rows].sort((a, b) => {
      let av = a[sort.key];
      let bv = b[sort.key];
      if (sort.key === "createdAt") {
        av = new Date(av).getTime();
        bv = new Date(bv).getTime();
      }
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
    return rows;
  }, [urls, status, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const toggleSort = (key) =>
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "desc" }
    );

  const arrow = (key) => (sort.key === key ? (sort.dir === "asc" ? " ↑" : " ↓") : "");

  if (!urls.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon"><IconLink width={24} height={24} /></div>
        <h3>No links yet</h3>
        <p>Create your first short URL above to start collecting analytics.</p>
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="table-toolbar">
        {!query && (
          <div className="search-mini">
            <IconSearch />
            <input
              className="input"
              placeholder="Search links…"
              value={localQuery}
              onChange={(e) => {
                setLocalQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
        )}
        <div className="seg">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={status === f.key ? "active" : ""}
              onClick={() => {
                setStatus(f.key);
                setPage(1);
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Short URL</th>
              <th>Original URL</th>
              <th className="sortable" onClick={() => toggleSort("totalClicks")}>
                Clicks{arrow("totalClicks")}
              </th>
              <th>Status</th>
              <th className="sortable" onClick={() => toggleSort("createdAt")}>
                Created{arrow("createdAt")}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length ? (
              pageRows.map((url) => (
                <UrlRow key={url.id} url={url} onChange={onChange} />
              ))
            ) : (
              <tr>
                <td colSpan={6}>
                  <p className="muted" style={{ padding: "12px 0" }}>
                    No links match your filters.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > PAGE_SIZE && (
        <div className="pagination">
          <span className="muted">
            Showing {(safePage - 1) * PAGE_SIZE + 1}–
            {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="pages">
            <button
              className="icon-btn"
              disabled={safePage === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </button>
            <span className="muted">
              Page {safePage} / {totalPages}
            </span>
            <button
              className="icon-btn"
              disabled={safePage === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UrlTable;
