import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "../services/toast";
import Button from "../components/Button";
import AuthLayout from "../layouts/AuthLayout";

function VerifyOtp() {
  const navigate = useNavigate();
  const email = localStorage.getItem("verifyEmail");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleVerify = async () => {
    try {
      setLoading(true);
      const res = await api.post("/auth/verify-otp", { email, otp });
      toast.success(res.data.message || "Verified");
      localStorage.removeItem("verifyEmail");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await api.post("/auth/resend-otp", { email });
      toast.success("A new code has been sent");
      setCooldown(60);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to resend");
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={`We sent a 6-digit code to ${email || "your email"}. It expires in 5 minutes.`}
      footer={<>Wrong email? <span style={{ color: "var(--primary)", cursor: "pointer" }} onClick={() => navigate("/register")}>Start over</span></>}
    >
      <div className="field">
        <label>Verification code</label>
        <input
          className="input"
          inputMode="numeric"
          maxLength={6}
          placeholder="------"
          style={{ letterSpacing: "0.5em", textAlign: "center", fontSize: 22, fontWeight: 700 }}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && handleVerify()}
        />
      </div>

      <Button text={loading ? "Verifying…" : "Verify"} onClick={handleVerify}
        disabled={loading || otp.length < 6} variant="primary" block />

      <Button
        text={cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        onClick={handleResend}
        disabled={cooldown > 0}
        variant="ghost"
        block
      />
    </AuthLayout>
  );
}

export default VerifyOtp;
