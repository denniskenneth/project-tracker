import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import s from "../styles/auth.module.css";

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      nav("/projects");
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Login failed");
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
            <h2 className={s.title}>Welcome back</h2>
            <p className={s.subtitle}>Login to manage your projects.</p>
          </div>
        </div>

        {err && <div className={s.error}>{err}</div>}

        <form onSubmit={onSubmit} className={s.form}>
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
              placeholder="Your password"
              autoComplete="current-password"
            />
          </label>

          <button className={s.primaryBtn} disabled={loading} type="submit">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className={s.footer}>
          No account?{" "}
          <Link className={s.link} to="/register">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
