import { useState }
  from "react";

import { useNavigate }
  from "react-router-dom";

import ReCAPTCHA
  from "react-google-recaptcha";

import api from
  "../services/api";

import Input from
  "../components/Input";

import Button from
  "../components/Button";

import AuthLayout from
  "../layouts/AuthLayout";

function Register() {

  const navigate =
    useNavigate();

  const [name,
    setName] =
    useState("");

  const [email,
    setEmail] =
    useState("");

  const [password,
    setPassword] =
    useState("");

  const [
    recaptchaToken,
    setRecaptchaToken,
  ] = useState("");

  const handleRegister =
    async () => {

      try {

        const response =
          await api.post(

            "/auth/register",

            {
              name,
              email,
              password,
              recaptchaToken,
            }

          );

        alert(

`${response.data.message}

OTP:
${response.data.otp}`

        );

        localStorage.setItem(

          "verifyEmail",

          email

        );

        navigate(
          "/verify-otp"
        );

      }

      catch (error) {

        alert(

          error.response?.data
            ?.message ||

          "Registration Failed"

        );

      }

    };

  return (

    <AuthLayout
      title="Register"
    >

      <Input

        type="text"

        name="name"

        placeholder=
          "Enter Name"

        value={name}

        onChange={(e) =>
          setName(
            e.target.value
          )
        }

      />

      <br />
      <br />

      <Input

        type="email"

        name="email"

        placeholder=
          "Enter Email"

        value={email}

        onChange={(e) =>
          setEmail(
            e.target.value
          )
        }

      />

      <br />
      <br />

      <Input

        type="password"

        name="password"

        placeholder=
          "Enter Password"

        value={password}

        onChange={(e) =>
          setPassword(
            e.target.value
          )
        }

      />

      <br />
      <br />

      <ReCAPTCHA

        sitekey=
          "6LcjAwotAAAAAHFK2MLadY-qqzgY0JhRDVOs3g0h"

        onChange={(token) =>

          setRecaptchaToken(
            token
          )

        }

      />

      <br />
      <br />

      <Button

        text="Register"

        onClick={
          handleRegister
        }

      />

    </AuthLayout>

  );

}

export default Register;