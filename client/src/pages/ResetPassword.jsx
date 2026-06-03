import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "../services/toast";
import Button from "../components/Button";
import AuthLayout from "../layouts/AuthLayout";

const STRONG = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

function ResetPassword() {
  const navigate = useNavigate();
  const email = localStorage.getItem("resetEmail");

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!STRONG.test(newPassword)) {
      toast.error("Password needs upper, lower, number, symbol, and 8+ chars");
      return;
    }
    try {
      setLoading(true);
      // Step 1: verify the OTP, receive a short-lived reset ticket.
      const verify = await api.post("/auth/verify-reset-otp", { email, otp });
      const resetTicket = verify.data.resetTicket;

      // Step 2: set the new password using that ticket.
      const res = await api.post("/auth/reset-password", {
        email,
        newPassword,
        resetTicket,
      });

      toast.success(res.data.message || "Password updated");
      localStorage.removeItem("resetEmail");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Set a new password"
      subtitle={`Enter the code sent to ${email || "your email"} and choose a new password.`}
      footer={<><Link to="/forgot-password">Resend code</Link></>}
    >
      <div className="field">
        <label>Verification code</label>
        <input className="input" inputMode="numeric" maxLength={6} placeholder="6-digit code"
          value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} />
      </div>
      <div className="field">
        <label>New password</label>
        <input className="input" type="password" placeholder="••••••••"
          value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <span className="field-hint">8+ chars with uppercase, lowercase, number, and symbol.</span>
      </div>

      <Button text={loading ? "Updating…" : "Reset password"} onClick={handleReset}
        disabled={loading} variant="primary" block />
    </AuthLayout>
  );
}

export default ResetPassword;
