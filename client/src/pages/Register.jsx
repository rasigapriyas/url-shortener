import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import api from "../services/api";
import toast from "../services/toast";
import Button from "../components/Button";
import AuthLayout from "../layouts/AuthLayout";

const RULES = [
  { test: (p) => p.length >= 8, label: "8+ characters" },
  { test: (p) => /[A-Z]/.test(p), label: "Uppercase" },
  { test: (p) => /[a-z]/.test(p), label: "Lowercase" },
  { test: (p) => /\d/.test(p), label: "Number" },
  { test: (p) => /[^A-Za-z0-9]/.test(p), label: "Symbol" },
];

function Register() {
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [loading, setLoading] = useState(false);

  const passed = RULES.filter((r) => r.test(password)).length;

  const handleRegister = async () => {
    if (passed < RULES.length) {
      toast.error("Password does not meet all requirements");
      return;
    }
    try {
      setLoading(true);
      const res = await api.post("/auth/register", { name, email, password, recaptchaToken });
      toast.success(res.data.message || "Account created — check your email for the code");
      localStorage.setItem("verifyEmail", email);
      navigate("/verify-otp");
    } catch (error) {
      setRecaptchaToken("");
      recaptchaRef.current?.reset();
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start shortening links and tracking analytics in minutes."
      footer={<>Already have an account? <Link to="/">Sign in</Link></>}
    >
      <div className="field">
        <label>Full name</label>
        <input className="input" placeholder="Ada Lovelace"
          value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="field">
        <label>Email</label>
        <input className="input" type="email" placeholder="you@company.com"
          value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="field">
        <label>Password</label>
        <input className="input" type="password" placeholder="••••••••"
          value={password} onChange={(e) => setPassword(e.target.value)} />
        {password && (
          <div className="legend">
            {RULES.map((r) => (
              <span className="item" key={r.label} style={{ color: r.test(password) ? "#4ade80" : undefined }}>
                <span className="swatch" style={{ background: r.test(password) ? "#22c55e" : "#475569" }} />
                {r.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {recaptchaSiteKey && (
        <ReCAPTCHA ref={recaptchaRef} sitekey={recaptchaSiteKey}
          onChange={(t) => setRecaptchaToken(t)} />
      )}

      <Button text={loading ? "Creating…" : "Create account"} onClick={handleRegister}
        disabled={loading} variant="primary" block />
    </AuthLayout>
  );
}

export default Register;
