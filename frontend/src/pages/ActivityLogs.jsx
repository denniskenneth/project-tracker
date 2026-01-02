import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import s from "../styles/logs.module.css";

export default function ActivityLogs() {
  const nav = useNavigate();
  const [logs, setLogs] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return nav("/login");

    // If you want admin-only UI:
    if (user?.role !== "admin") return nav("/projects");

    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await api.get("/api/activity-logs");
        setLogs(res.data);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load logs");
      } finally {
        setLoading(false);
      }
    })();
  }, [nav, user?.role]);

  return (
    <div className={s.page}>
      <div className={s.container}>
        <header className={s.topbar}>
          <div>
            <div className={s.title}>Activity Logs</div>
            <div className={s.subtitle}>Audit trail (latest first)</div>
          </div>

          <div className={s.actions}>
            <button className={s.btnSecondary} onClick={() => nav("/projects")}>
              Back to Projects
            </button>
          </div>
        </header>

        {err && <div className={s.error}>{err}</div>}

        <div className={s.card}>
          {loading ? (
            <div className={s.muted}>Loading...</div>
          ) : logs.length === 0 ? (
            <div className={s.muted}>No logs yet.</div>
          ) : (
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Project</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l) => (
                    <tr key={l.id}>
                      <td>{new Date(l.created_at).toLocaleString()}</td>
                      <td>{l.User?.username || l.user_id}</td>
                      <td className={s.action}>{l.action}</td>
                      <td>{l.Project?.title || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
