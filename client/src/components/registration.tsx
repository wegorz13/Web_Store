import { useState, useEffect } from "react";
import "./comp_styles/registration.css";
import { useNavigate } from "react-router-dom";

function Registration() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    repPassword: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setMessage("");
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { email, password, repPassword } = formData;

    if (email && password && password == repPassword) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setMessage("Invalid email format");
        return;
      }

      try {
        const encodedEmail = encodeURIComponent(email);
        const encodedPassword = encodeURIComponent(password);

        const response = await fetch(
          `/api/users/register?email=${encodedEmail}&password=${encodedPassword}`,
          { method: "POST" }
        );

        const data = await response.json();
        if (response.ok) {
          setMessage(data.message);
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    } else {
      setMessage("Niepoprawne dane do rejestracji");
    }
  };

  return (
    <div className="registerContainer">
      <form className="registerForm">
        <h2>Join us!</h2>
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
        <label htmlFor="repPassword">Repeat password</label>
        <input
          type="password"
          name="repPassword"
          onChange={(e) => handleChange(e)}
        ></input>
        <button type="submit" onClick={handleSubmit}>
          Register
        </button>
        <p>{message}</p>
      </form>
    </div>
  );
}

export { Registration };
