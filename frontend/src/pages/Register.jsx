import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [err, setErr] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await api.post("/api/auth/register", form);
      nav("/login");
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Register failed");
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h2>Register</h2>
      {err && <p style={{ color: "crimson" }}>{err}</p>}
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          name="username"
          placeholder="Username"
          value={form.name}
          onChange={onChange}
        />
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={onChange}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={onChange}
        />
        <button type="submit">Create account</button>
      </form>
      <p style={{ marginTop: 10 }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
