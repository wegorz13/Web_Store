import { useState, useEffect } from "react";
import { Cart } from "../components/cart";
import { Navbar } from "../components/navbar";
import "./pages_styles/cartpage.css";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

function CartPage() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  useEffect(() => {
    if (!auth?.accessToken) {
      navigate("/"); // Redirect to login if no accessToken
    }
  }, [auth, navigate]);
  return (
    <div>
      <Navbar></Navbar>
      <Cart></Cart>;
    </div>
  );
}

export { CartPage };
