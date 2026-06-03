import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import api from "../services/api";
import toast from "../services/toast";
import Button from "../components/Button";
import AuthLayout from "../layouts/AuthLayout";

function Login() {
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const res = await api.post("/auth/login", { email, password, recaptchaToken });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      if (res.data.user) localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (error) {
      setRecaptchaToken("");
      recaptchaRef.current?.reset();
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage your links and analytics."
      footer={<>New here? <Link to="/register">Create an account</Link></>}
    >
      <div className="field">
        <label>Email</label>
        <input className="input" type="email" placeholder="you@company.com"
          value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="field">
        <label>Password</label>
        <input className="input" type="password" placeholder="••••••••"
          value={password} onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
        <Link to="/forgot-password" className="field-hint">Forgot password?</Link>
      </div>

      {recaptchaSiteKey && (
        <ReCAPTCHA ref={recaptchaRef} sitekey={recaptchaSiteKey}
          onChange={(t) => setRecaptchaToken(t)} />
      )}

      <Button text={loading ? "Signing in…" : "Sign in"} onClick={handleLogin}
        disabled={loading} variant="primary" block />
    </AuthLayout>
  );
}

export default Login;
