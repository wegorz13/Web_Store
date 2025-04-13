import { OrderHistory } from "../components/orderHistory";
import { Navbar } from "../components/navbar";
import "./pages_styles/ordhistorypage.css";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function OrdHistoryPage() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  useEffect(() => {
    if (!auth?.accessToken) {
      navigate("/");
    }
  }, [auth, navigate]);

  return (
    <div>
      <Navbar></Navbar>
      <div className="OrderHistoryBox">
        <OrderHistory></OrderHistory>
      </div>
    </div>
  );
}

export { OrdHistoryPage };
