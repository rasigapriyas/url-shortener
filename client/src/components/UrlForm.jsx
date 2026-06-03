import { useState } from "react";
import api from "../services/api";
import toast from "../services/toast";
import Button from "./Button";

function UrlForm({ onUrlCreated, variant }) {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [bulkUrls, setBulkUrls] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const [loading, setLoading] = useState(false);

  const minDate = new Date().toISOString().slice(0, 16);

  const handleCreate = async () => {
    if (!originalUrl.trim()) {
      toast.error("Enter a URL to shorten");
      return;
    }
    try {
      setLoading(true);
      const res = await api.post("/url/create", {
        originalUrl: originalUrl.trim(),
        customAlias: customAlias || undefined,
        expiresAt: expiresAt || undefined,
      });
      toast.success(res.data.message || "Short link created");
      setOriginalUrl("");
      setCustomAlias("");
      setExpiresAt("");
      onUrlCreated();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to create URL");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCreate = async () => {
    const urls = bulkUrls
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (!urls.length) {
      toast.error("Paste at least one URL");
      return;
    }
    try {
      setLoading(true);
      const res = await api.post("/url/bulk", { urls });
      toast.success(res.data.message || "Bulk links created");
      setBulkUrls("");
      setShowBulk(false);
      onUrlCreated();
    } catch (error) {
      toast.error(error.response?.data?.message || "Bulk creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={variant === "hero" ? "" : "panel"}>
      <div className="url-form">
        <input
          className="input"
          placeholder="https://example.com/very/long/link"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
        <input
          className="input"
          placeholder="custom-alias (optional)"
          value={customAlias}
          onChange={(e) => setCustomAlias(e.target.value)}
        />
        <input
          className="input"
          type="datetime-local"
          value={expiresAt}
          min={minDate}
          onChange={(e) => setExpiresAt(e.target.value)}
        />
        <Button
          text={loading ? "Working…" : "Shorten"}
          onClick={handleCreate}
          disabled={loading}
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <button
          type="button"
          className="icon-btn"
          onClick={() => setShowBulk((s) => !s)}
        >
          {showBulk ? "Hide bulk import" : "Bulk import (one URL per line)"}
        </button>
      </div>

      {showBulk && (
        <div className="bulk-panel" style={{ marginTop: 12 }}>
          <textarea
            className="input"
            rows={4}
            placeholder={"https://a.com\nhttps://b.com\nhttps://c.com"}
            value={bulkUrls}
            onChange={(e) => setBulkUrls(e.target.value)}
          />
          <Button
            text="Create all"
            onClick={handleBulkCreate}
            disabled={loading}
            variant="secondary"
          />
        </div>
      )}
    </div>
  );
}

export default UrlForm;
