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

import Dashboard from
  "../pages/Dashboard";
  import ProtectedRoute from
  "../components/ProtectedRoute";

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
  path="/dashboard"
  element={

    <ProtectedRoute>

      <Dashboard />

    </ProtectedRoute>

  }
/>
      </Routes>

    </BrowserRouter>

  );

}

// export routes
export default AppRoutes;