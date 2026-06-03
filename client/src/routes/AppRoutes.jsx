// router package
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

// pages
import Login from
  "../pages/Login";

import Register from
  "../pages/Register";
  import VerifyOtp from
  "../pages/VerifyOtp";

import Dashboard from
  "../pages/Dashboard";
  import ProtectedRoute from
  "../components/ProtectedRoute";
  import Analytics from
  "../pages/Analytics";
  import ForgotPassword
  from "../pages/ForgotPassword";

import ResetPassword
  from "../pages/ResetPassword";
  

// route configuration
function AppRoutes() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />
        <Route
  path="/verify-otp"
  element={<VerifyOtp />}
/>
<Route
  path="/forgot-password"
  element={
    <ForgotPassword />
  }
/>

<Route
  path="/reset-password"
  element={
    <ResetPassword />
  }
/>

        <Route
  path="/dashboard"
  element={

    <ProtectedRoute>

      <Dashboard />

    </ProtectedRoute>

  }
/>
<Route

  path=
    "/analytics/:shortCode"

  element={

    <ProtectedRoute>

      <Analytics />

    </ProtectedRoute>

  }

/>
      </Routes>

    </BrowserRouter>

  );

}

// export routes
export default AppRoutes;