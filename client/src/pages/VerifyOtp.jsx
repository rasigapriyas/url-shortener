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

        if (

          response.data.message ===
          "OTP verified successfully"

        ) {

          alert(
            response.data.message
          );

          localStorage.removeItem(
            "verifyEmail"
          );

          navigate("/");

        }

        else {

          alert(
            response.data.message
          );

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

  const handleResend =
    async () => {

      try {

        const response =
          await api.post(

            "/auth/resend-otp",

            {
              email,
            }

          );

        alert(

          `${response.data.message}

OTP:
${response.data.otp}`

        );

      }

      catch (error) {

        alert(
          "Unable to resend OTP"
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

      <br />
      <br />

      <Button

        text="Resend OTP"

        onClick={
          handleResend
        }

      />

    </AuthLayout>

  );

}

export default VerifyOtp;