import { useState }
  from "react";

import { useNavigate }
  from "react-router-dom";

import api from
  "../services/api";

import Input from
  "../components/Input";

import Button from
  "../components/Button";

import AuthLayout from
  "../layouts/AuthLayout";

function VerifyOtp() {

  const navigate =
    useNavigate();

  const [otp,
    setOtp] =
    useState("");

  const email =
    localStorage.getItem(
      "verifyEmail"
    );

  const handleVerify =
    async () => {

      try {

        const response =
          await api.post(

            "/auth/verify-otp",

            {
              email,
              otp,
            }

          );

        alert(
          response.data.message
        );

        if (

          response.data.message ===
          "OTP verified successfully"

        ) {

          navigate("/");

        }

      }

      catch (error) {

        alert(
          error.response?.data
            ?.message ||
          "Verification Failed"
        );

      }

    };

  return (

    <AuthLayout
      title="Verify OTP"
    >

      <p>

        Email:
        {" "}
        {email}

      </p>

      <Input

        type="text"

        name="otp"

        placeholder=
          "Enter OTP"

        value={otp}

        onChange={(e) =>
          setOtp(
            e.target.value
          )
        }

      />

      <br />
      <br />

      <Button

        text="Verify OTP"

        onClick={
          handleVerify
        }

      />

    </AuthLayout>

  );

}

export default VerifyOtp;