import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import s from "../styles/projects.module.css";

export default function Projects() {
  const nav = useNavigate();
  const [projects, setProjects] = useState([]);
  const [err, setErr] = useState("");
  const [loadingList, setLoadingList] = useState(false);
  const [saving, setSaving] = useState(false);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const [form, setForm] = useState({
    title: "",
    summary: "",
    status: "Pending",
  });
  const [editingId, setEditingId] = useState(null);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    nav("/login");
  };

  const load = async () => {
    setErr("");
    setLoadingList(true);
    try {
      const res = await api.get("/api/projects");
      setProjects(res.data);
    } catch (e) {
      if (e?.response?.status === 401) logout();
      setErr(e?.response?.data?.message || "Failed to load projects");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) nav("/login");
    else load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.title.trim() || !form.summary.trim()) {
      setErr("Title and summary are required.");
      return;
    }

    setSaving(true);
    try {
      if (editingId) await api.put(`/api/projects/${editingId}`, form);
      else await api.post("/api/projects", form);

      setForm({ title: "", summary: "", status: "Pending" });
      setEditingId(null);
      await load();
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({ title: p.title, summary: p.summary, status: p.status });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ title: "", summary: "", status: "Pending" });
  };

  const remove = async (id) => {
    if (!confirm("Delete this project?")) return;
    setErr("");
    try {
      await api.delete(`/api/projects/${id}`);
      await load();
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className={s.page}>
      <div className={s.container}>
        <header className={s.topbar}>
          <div className={s.left}>
            <div className={s.appTitle}>Project Tracker</div>
            <div className={s.userLine}>
              Signed in as <b>{user?.username || "Unknown User"}</b>
              {user?.role ? (
                <span className={s.role}>({user.role})</span>
              ) : null}
            </div>
          </div>

          <div className={s.actions}>
            <button
              className={s.btnSecondary}
              onClick={load}
              disabled={loadingList}
            >
              {loadingList ? "Refreshing..." : "Refresh"}
            </button>
            <button className={s.btnPrimary} onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        {err && <div className={s.error}>{err}</div>}

        <div className={s.layout}>
          <section className={s.formCard}>
            <div className={s.sectionTitle}>
              {editingId ? "Edit Project" : "Create Project"}
            </div>

            <form onSubmit={submit} className={s.form}>
              <div className={s.row2}>
                <label className={s.field}>
                  <span className={s.label}>Title</span>
                  <input
                    className={s.input}
                    name="title"
                    value={form.title}
                    onChange={onChange}
                    placeholder="Project title"
                  />
                </label>

                <label className={s.field}>
                  <span className={s.label}>Status</span>
                  <select
                    className={s.input}
                    name="status"
                    value={form.status}
                    onChange={onChange}
                  >
                    <option>Pending</option>
                    <option>Ongoing</option>
                    <option>Completed</option>
                  </select>
                </label>
              </div>

              <label className={s.field}>
                <span className={s.label}>Summary</span>
                <textarea
                  className={s.textarea}
                  name="summary"
                  value={form.summary}
                  onChange={onChange}
                  placeholder="Short project summary..."
                  rows={5}
                />
              </label>

              <div className={s.formActions}>
                <button
                  className={s.btnPrimary}
                  disabled={saving}
                  type="submit"
                >
                  {saving
                    ? editingId
                      ? "Updating..."
                      : "Creating..."
                    : editingId
                    ? "Update Project"
                    : "Create Project"}
                </button>

                {editingId && (
                  <button
                    className={s.btnSecondary}
                    type="button"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className={s.list}>
            {projects.length === 0 && !loadingList ? (
              <div className={s.emptyCard}>
                <b>No projects yet.</b>
                <div className={s.muted}>Create one using the form.</div>
              </div>
            ) : null}

            {projects.map((p) => (
              <article key={p.id} className={s.projectCard}>
                <div className={s.projectTop}>
                  <div>
                    <div className={s.projectTitleRow}>
                      <h3 className={s.projectTitle}>{p.title}</h3>
                      <span
                        className={`${s.statusTag} ${s["status" + p.status]}`}
                      >
                        {p.status}
                      </span>
                    </div>
                    <div className={s.muted}>
                      Created: {new Date(p.created_at).toLocaleString()}
                      {p.updated_at
                        ? ` • Updated: ${new Date(
                            p.updated_at
                          ).toLocaleString()}`
                        : ""}
                    </div>
                  </div>

                  <div className={s.projectActions}>
                    <button
                      className={s.btnSecondary}
                      onClick={() => startEdit(p)}
                    >
                      Edit
                    </button>
                    <button
                      className={s.btnDanger}
                      onClick={() => remove(p.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <p className={s.summary}>{p.summary}</p>
              </article>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
