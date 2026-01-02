import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import s from "../styles/auth.module.css";

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await api.post("/api/auth/register", form);
      nav("/login");
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.brand}>
          <div className={s.logo}>PT</div>
          <div>
            <h2 className={s.title}>Create your account</h2>
            <p className={s.subtitle}>
              Register to start tracking your projects.
            </p>
          </div>
        </div>

        {err && <div className={s.error}>{err}</div>}

        <form onSubmit={onSubmit} className={s.form}>
          <label className={s.field}>
            <span className={s.label}>UserName</span>
            <input
              className={s.input}
              name="username"
              value={form.username}
              onChange={onChange}
              placeholder="e.g. jon123"
              autoComplete="name"
            />
          </label>

          <label className={s.field}>
            <span className={s.label}>Email</span>
            <input
              className={s.input}
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="e.g. john@email.com"
              autoComplete="email"
            />
          </label>

          <label className={s.field}>
            <span className={s.label}>Password</span>
            <input
              className={s.input}
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              placeholder="Minimum 6 characters"
              autoComplete="new-password"
            />
          </label>

          <button className={s.primaryBtn} disabled={loading} type="submit">
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className={s.footer}>
          Already have an account?{" "}
          <Link className={s.link} to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
