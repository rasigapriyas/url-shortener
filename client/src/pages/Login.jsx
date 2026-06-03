// // react state
// import { useState }
//   from "react";

// import { useNavigate }
//   from "react-router-dom";

// // reusable input
// import Input from
//   "../components/Input";

// // reusable button
// import Button from
//   "../components/Button";

// // auth layout
// import AuthLayout from
//   "../layouts/AuthLayout";

// // api service
// import api from
//   "../services/api";

// // login page
// function Login() {

//   // email state
//   const [email,
//     setEmail] =
//     useState("");

//   // password state
//   const [password,
//     setPassword] =
//     useState("");
//     // page navigation
// const navigate =
//   useNavigate();

//   // login handler
//   const handleLogin =
//     async () => {

//       try {

//         // call backend
//         const response =
//           await api.post(

//             "/auth/login",

//             {
//               email,
//               password,
//             }

//           );

//         // get token
// const token =
//   response.data.token;

// // store token
// localStorage.setItem(
//   "token",
//   token
// );

// // go dashboard
// navigate(
//   "/dashboard"
// );

//       }

//       catch (error) {

//         // print error
//         console.log(
//           error.response?.data
//         );

//       }

//     };

//   return (

//     <AuthLayout
//       title="Login"
//     >

//       <Input

//         type="email"

//         name="email"

//         placeholder=
//           "Enter Email"

//         value={email}

//         onChange={(e) =>
//           setEmail(
//             e.target.value
//           )
//         }

//       />

//       <br />
//       <br />

//       <Input

//         type="password"

//         name="password"

//         placeholder=
//           "Enter Password"

//         value={password}

//         onChange={(e) =>
//           setPassword(
//             e.target.value
//           )
//         }

//       />

//       <br />
//       <br />

//       <Button

//         text="Login"

//         onClick={
//           handleLogin
//         }

//       />

//     </AuthLayout>

//   );

// }

// // export page
// export default Login;
// react state
import { useState }
  from "react";

import {
  useNavigate,
} from "react-router-dom";

// reusable input
import Input from
  "../components/Input";

// reusable button
import Button from
  "../components/Button";

// auth layout
import AuthLayout from
  "../layouts/AuthLayout";

// api service
import api from
  "../services/api";

// login page
function Login() {

  const navigate =
    useNavigate();

  // email state
  const [email,
    setEmail] =
    useState("");

  // password state
  const [password,
    setPassword] =
    useState("");

  // login handler
  const handleLogin =
    async () => {

      try {

        const response =
          await api.post(

            "/auth/login",

            {
              email,
              password,
            }

          );

        const token =
          response.data.token;

        localStorage.setItem(
          "token",
          token
        );

        navigate(
          "/dashboard"
        );

      }

      catch (error) {

        alert(

          error.response?.data
            ?.message ||

          "Login Failed"

        );

      }

    };

  return (

    <AuthLayout
      title="Login"
    >

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

        text="Login"

        onClick={
          handleLogin
        }

      />

      <br />
      <br />

      <p>

        Don't have an account?

      </p>

      <Button

        text="Register"

        onClick={() =>

          navigate(
            "/register"
          )

        }

      />
      <Button
  text="Forgot Password"
  onClick={() =>
    navigate(
      "/forgot-password"
    )
  }
/>

    </AuthLayout>

  );

}

// export page
export default Login;