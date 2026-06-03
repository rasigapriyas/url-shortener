import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Input from "../components/Input";
import Button from "../components/Button";
import AuthLayout from "../layouts/AuthLayout";

function ForgotPassword() {

  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const handleSubmit =
    async () => {

      try {

        const response =
          await api.post(
            "/auth/forgot-password",
            { email }
          );

        alert(
          `${response.data.message}

OTP:
${response.data.otp}`
        );

        localStorage.setItem(
          "resetEmail",
          email
        );

        navigate(
          "/reset-password"
        );

      } catch (error) {

        alert(
          error.response?.data
            ?.message ||
          "Something went wrong"
        );

      }

    };

  return (

    <AuthLayout
      title="Forgot Password"
    >

      <Input
        type="email"
        placeholder="Enter Email"
        value={email}
        onChange={(e) =>
          setEmail(
            e.target.value
          )
        }
      />

      <br />
      <br />

      <Button
        text="Send OTP"
        onClick={
          handleSubmit
        }
      />

    </AuthLayout>

  );

}

export default ForgotPassword;