import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "../services/toast";
import { IconCopy, IconEdit, IconTrash, IconQr, IconChart, IconExternal } from "./icons";

const PUBLIC_BASE =
  import.meta.env.VITE_PUBLIC_BASE_URL || "http://localhost:5000";

function UrlRow({ url, onChange }) {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [originalUrl, setOriginalUrl] = useState(url.originalUrl);
  const [expiresAt, setExpiresAt] = useState(
    url.expiresAt ? new Date(url.expiresAt).toISOString().slice(0, 16) : ""
  );

  const shortUrl = `${PUBLIC_BASE}/${url.shortCode}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      toast.success("Short URL copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const save = async () => {
    try {
      await api.patch(`/url/${url.id}`, {
        originalUrl,
        expiresAt: expiresAt || null,
      });
      toast.success("Link updated");
      setEditing(false);
      onChange?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const remove = async () => {
    if (!window.confirm("Delete this short link? Analytics are preserved.")) return;
    try {
      await api.delete(`/url/${url.id}`);
      toast.success("Link deleted");
      onChange?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  const openQr = () =>
    window.open(
      `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(shortUrl)}`,
      "_blank",
      "noreferrer"
    );

  return (
    <tr>
      <td>
        <a className="short-link cell-mono" href={shortUrl} target="_blank" rel="noreferrer">
          /{url.shortCode}
        </a>
      </td>
      <td className="cell-truncate">
        {editing ? (
          <input
            className="input table-input"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
          />
        ) : (
          <span title={url.originalUrl} className="muted">{url.originalUrl}</span>
        )}
      </td>
      <td><strong>{url.totalClicks}</strong></td>
      <td>
        <span className={`status status-${url.status.toLowerCase()}`}>{url.status}</span>
      </td>
      <td>
        {new Date(url.createdAt).toLocaleDateString()}
        {editing && (
          <input
            className="input table-input"
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        )}
      </td>
      <td>
        <div className="row-actions">
          <button className="icon-btn" title="Copy" onClick={copy}><IconCopy width={15} height={15} /></button>
          <button className="icon-btn" title="Analytics" onClick={() => navigate(`/analytics/${url.shortCode}`)}><IconChart width={15} height={15} /></button>
          <button className="icon-btn" title="QR code" onClick={openQr}><IconQr width={15} height={15} /></button>
          <button className="icon-btn" title="Public stats" onClick={() => window.open(`/stats/${url.shortCode}`, "_blank", "noreferrer")}><IconExternal width={15} height={15} /></button>
          {editing ? (
            <button className="icon-btn" title="Save" onClick={save}>Save</button>
          ) : (
            <button className="icon-btn" title="Edit" onClick={() => setEditing(true)}><IconEdit width={15} height={15} /></button>
          )}
          <button className="icon-btn danger" title="Delete" onClick={remove}><IconTrash width={15} height={15} /></button>
        </div>
      </td>
    </tr>
  );
}

export default UrlRow;
