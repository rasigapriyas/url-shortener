import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Input from "../components/Input";
import Button from "../components/Button";
import AuthLayout from "../layouts/AuthLayout";

function ResetPassword() {

  const navigate =
    useNavigate();

  const email =
    localStorage.getItem(
      "resetEmail"
    );

  const [otp, setOtp] =
    useState("");

  const [newPassword,
    setNewPassword] =
    useState("");

  const handleReset =
    async () => {

      try {

        const verifyResponse =
          await api.post(

            "/auth/verify-reset-otp",

            {
              email,
              otp,
            }

          );

        if (
          verifyResponse
            .data.message !==
          "OTP verified successfully"
        ) {

          alert(
            verifyResponse
              .data.message
          );

          return;

        }

        const response =
          await api.post(

            "/auth/reset-password",

            {
              email,
              newPassword,
            }

          );

        alert(
          response.data.message
        );

        localStorage.removeItem(
          "resetEmail"
        );

        navigate("/");

      } catch (error) {

        alert(
          error.response?.data
            ?.message ||
          "Reset failed"
        );

      }

    };

  return (

    <AuthLayout
      title="Reset Password"
    >

      <p>
        Email:
        {" "}
        {email}
      </p>

      <Input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) =>
          setOtp(
            e.target.value
          )
        }
      />

      <br />
      <br />

      <Input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) =>
          setNewPassword(
            e.target.value
          )
        }
      />

      <br />
      <br />

      <Button
        text="Reset Password"
        onClick={
          handleReset
        }
      />

    </AuthLayout>

  );

}

export default ResetPassword;