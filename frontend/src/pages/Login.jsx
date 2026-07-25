import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginRequest } from "../api/authApi";
import { useAuth } from "../AuthContext";
import { Input } from "../components/Input";
import Button from "../components/Button";
import "./Login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await loginRequest(username, password);
      login(result.access_token);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <span className="eyebrow">Brand Owner Access</span>
        <h1 className="page-title" style={{ fontSize: "40px", marginTop: "8px", marginBottom: "40px" }}>
          Sign <em>in</em>
        </h1>
        <form onSubmit={handleSubmit} className="login-form">
          <Input
            id="username"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          {error && <p className="login-form__error">{error}</p>}
          <Button type="submit" disabled={submitting} style={{ marginTop: "8px" }}>
            {submitting ? "Signing In…" : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
