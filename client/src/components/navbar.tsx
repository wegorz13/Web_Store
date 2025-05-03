import { Link } from "react-router-dom";
import "./comp_styles/navbar.css";
import useAuth from "../hooks/useAuth";

function Navbar() {
  const { auth, setAuth } = useAuth();

  return (
    <div>
      <div id="nbContainer">
        <Link to={"/"} id="sklepik" className="navbarBtn">
          Sklepik
        </Link>
        {auth.accessToken ? (
          <div id="rightNb">
            <Link to={"/cart"} className="navbarBtn">
              Cart{" "}
            </Link>
            <Link to={"/order/history"} className="navbarBtn">
              Order history{" "}
            </Link>
            <button
              className="logoutBtn navbarBtn"
              onClick={() =>
                setAuth({
                  id: -1,
                  email: "",
                  password: "",
                  accessToken: "",
                })
              }
            >
              Log out
            </button>
          </div>
        ) : (
          <div id="rightNb">
            <Link to={"/login"} className="navbarBtn">
              Log in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export { Navbar };
