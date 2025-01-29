import { useState, useEffect } from "react";
import { Order } from "../components/order";
import { Navbar } from "../components/navbar";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function OrderPage() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  useEffect(() => {
    if (!auth?.accessToken) {
      navigate("/"); // Redirect to login if no accessToken
    }
  }, [auth, navigate]);
  return (
    <div className="orderPage">
      <Navbar></Navbar>
      <Order></Order>
    </div>
  );
}

export { OrderPage };
