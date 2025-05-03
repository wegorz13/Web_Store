import { Login } from "../components/login";
import { Navbar } from "../components/navbar";
import "./pages_styles/loginpage.css";

function LoginPage() {
  return (
    <div className="bodyf">
      <Navbar></Navbar>
      <Login></Login>
    </div>
  );
}

export { LoginPage };
