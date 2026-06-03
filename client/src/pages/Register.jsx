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

        console.log(
          error.response?.data
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