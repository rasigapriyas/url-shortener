import { useNavigate }
  from "react-router-dom";
import api from "../services/api";

function LogoutButton() {

  const navigate =
    useNavigate();

  const handleLogout =
    async () => {
      try {
        await api.post("/auth/logout", {
          refreshToken:
            localStorage.getItem(
              "refreshToken"
            ),
        });
      } catch (error) {
        console.log(error.response?.data);
      }

      localStorage.removeItem(
        "token"
      );
      localStorage.removeItem(
        "refreshToken"
      );

      navigate("/");

    };

  return (

    <button
      onClick={
        handleLogout
      }
      className="btn btn-secondary"
    >

      Logout

    </button>

  );

}

export default LogoutButton;
