import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Projects() {
  const nav = useNavigate();
  const [projects, setProjects] = useState([]);
  const [err, setErr] = useState("");

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
    try {
      const res = await api.get("/api/projects");
      setProjects(res.data);
    } catch (e) {
      if (e?.response?.status === 401) logout();
      setErr(e?.response?.data?.message || "Failed to load projects");
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
    try {
      if (editingId) {
        await api.put(`/api/projects/${editingId}`, form);
      } else {
        await api.post("/api/projects", form);
      }
      setForm({ title: "", summary: "", status: "Pending" });
      setEditingId(null);
      await load();
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Save failed");
    }
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({ title: p.title, summary: p.summary, status: p.status });
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
    <div style={{ maxWidth: 900, margin: "30px auto", padding: 10 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
        }}
      >
        <h2>Projects</h2>
        <button onClick={logout}>Logout</button>
      </div>

      {err && <p style={{ color: "crimson" }}>{err}</p>}

      <form
        onSubmit={submit}
        style={{
          display: "grid",
          gap: 10,
          border: "1px solid #ddd",
          padding: 12,
          borderRadius: 8,
        }}
      >
        <h3>{editingId ? "Edit Project" : "Create Project"}</h3>
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={onChange}
        />
        <textarea
          name="summary"
          placeholder="Summary"
          value={form.summary}
          onChange={onChange}
          rows={3}
        />
        <select name="status" value={form.status} onChange={onChange}>
          <option>Pending</option>
          <option>Ongoing</option>
          <option>Completed</option>
        </select>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit">{editingId ? "Update" : "Create"}</button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({ title: "", summary: "", status: "Pending" });
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div style={{ marginTop: 20, display: "grid", gap: 10 }}>
        {projects.map((p) => (
          <div
            key={p.id}
            style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 6px 0" }}>{p.title}</h3>
                <div style={{ fontSize: 14, opacity: 0.8 }}>
                  Status: <b>{p.status}</b> • Created:{" "}
                  {new Date(p.created_at).toLocaleString()}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => startEdit(p)}>Edit</button>
                <button onClick={() => remove(p.id)}>Delete</button>
              </div>
            </div>
            <p style={{ marginTop: 10 }}>{p.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
