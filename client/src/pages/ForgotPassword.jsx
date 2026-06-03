import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import api from "../services/api";
import toast from "../services/toast";
import Button from "../components/Button";
import AuthLayout from "../layouts/AuthLayout";

function ForgotPassword() {
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  const [email, setEmail] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const res = await api.post("/auth/forgot-password", { email, recaptchaToken });
      toast.success(res.data.message || "Reset code sent");
      localStorage.setItem("resetEmail", email);
      navigate("/reset-password");
    } catch (error) {
      setRecaptchaToken("");
      recaptchaRef.current?.reset();
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send a verification code."
      footer={<><Link to="/">Back to sign in</Link></>}
    >
      <div className="field">
        <label>Email</label>
        <input className="input" type="email" placeholder="you@company.com"
          value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      {recaptchaSiteKey && (
        <ReCAPTCHA ref={recaptchaRef} sitekey={recaptchaSiteKey}
          onChange={(t) => setRecaptchaToken(t)} />
      )}

      <Button text={loading ? "Sending…" : "Send reset code"} onClick={handleSubmit}
        disabled={loading} variant="primary" block />
    </AuthLayout>
  );
}

export default ForgotPassword;
