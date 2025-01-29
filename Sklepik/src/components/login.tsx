import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import "./comp_styles/login.css";

function Login() {
  const { setAuth } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setAuth({ id: -1, email: "", password: "", accessToken: "" });
  }, []);

  useEffect(() => {
    setMessage("");
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { email, password } = formData;

    if (formData.email && formData.password) {
      try {
        const encodedEmail = encodeURIComponent(email);
        const encodedPassword = encodeURIComponent(password);

        const response = await fetch(
          `/api/users/login?email=${encodedEmail}&password=${encodedPassword}`
        );

        const data = await response.json();
        if (response.ok) {
          setMessage("Użytkownik zalogowany pomyślnie");
          const accessToken = data?.accessToken;

          const id = data?.id;
          setAuth({ id, email, password, accessToken });
          console.log({ id, email, password, accessToken });
          console.log(data.accessToken);
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    } else {
      setMessage("Niepoprawne dane logowania");
      console.log(message);
    }
    setFormData({ email: "", password: "" });
  };

  return (
    <div className="loginContainer">
      <form className="loginForm">
        <h2>Log in!</h2>
        <label htmlFor="email">Email</label>
        <input
          type="text"
          name="email"
          onChange={(e) => handleChange(e)}
        ></input>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          name="password"
          onChange={(e) => handleChange(e)}
        ></input>
        <button type="submit" onClick={handleSubmit}>
          Next
        </button>
        <Link to={"/registration"}>No account yet?</Link>
        <p>{message}</p>
      </form>
    </div>
  );
}

export { Login };
