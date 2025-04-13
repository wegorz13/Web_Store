import { useEffect, useState } from "react";
import "./comp_styles/orderHistory.css";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

declare global {
  interface Order {
    id: number;
    totalValue: number;
    date: Date;
    products: CartElement[];
    address: string;
  }
}

function PastOrder(props: { order: Order }) {
  const order = props.order;

  return (
    <div className="pastOrderBox">
      <h2>Order no. #{order.id}</h2>
      <p>Total value: {order.totalValue.toFixed(2)} $</p>
      <p>Date: {order.date.toDateString()}</p>
      <p>Delivery address: {order.address}</p>
    </div>
  );
}

function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { auth } = useAuth();
  const accessToken = auth?.accessToken;
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchOrders() {
      const userId = auth.id;

      if (!userId) {
        return;
      }

      try {
        const response = await fetch(`/api/orders/history?userid=${userId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const rawData = await response.json();

        if (response.ok) {
          const orderMap: Record<number, Order> = {};

          rawData.forEach((row: any) => {
            const {
              orderId,
              totalValue,
              orderDate,
              orderAddress,
              productId,
              quantity,
            } = row;

            if (!orderMap[orderId]) {
              orderMap[orderId] = {
                id: orderId,
                totalValue,
                date: new Date(orderDate),
                address: orderAddress,
                products: [],
              };
            }

            orderMap[orderId].products.push({
              productId,
              quantity,
            });
          });

          setOrders(Object.values(orderMap));
        } else {
          console.error("Failed to fetch order history:", rawData.message);
        }
      } catch (error) {
        console.error("Error fetching order history:", error);
        navigate("/login");
      }
    }
    fetchOrders();
  }, [auth, navigate]);

  return (
    <div className="historyBox">
      <h2>Your past orders</h2>
      {orders.map((order) => (
        <PastOrder order={order}></PastOrder>
      ))}
    </div>
  );
}

export { OrderHistory };
