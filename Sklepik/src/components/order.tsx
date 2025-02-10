import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import "./comp_styles/order.css";

interface Address {
  street: string;
  city: string;
  postalCode: string;
}

function Order() {
  const { auth } = useAuth();
  const [totalPrice, setTotalPrice] = useState(0);
  const [address, setAddress] = useState<Address>({
    street: "",
    city: "",
    postalCode: "",
  });
  const [userCart, setCart] = useState<UserCart>({
    userId: -1,
    userProducts: [],
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const stringifiedCarts: string = localStorage.getItem("carts") || "[]";
    const carts = JSON.parse(stringifiedCarts);
    const cart: UserCart = carts.find(
      (cart: UserCart) => cart.userId === auth.id
    ) || {
      userId: auth.id,
      userProducts: [],
    };
    setCart(cart);
    async function fetchPrices() {
      if (!cart || cart.userProducts.length === 0) {
        return;
      }
      try {
        const productIds = cart.userProducts.map((item) => item.productId);

        const response = await fetch(
          `/api/orders/prices?ids=${productIds.join(",")}`
        );
        const data = await response.json();
        if (response.ok) {
          const priceList = data.map((obj) => obj.price);
          setTotalPrice(
            priceList.reduce((acc: number, price: number) => acc + price, 0)
          );
        } else {
          console.error("Failed to fetch cart products:", data.message);
        }
      } catch (error) {
        console.error("Error fetching cart products:", error);
      }
    }

    fetchPrices();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress({ ...address, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    const clearCart = () => {
      const stringifiedCarts: string = localStorage.getItem("carts") || "[]";
      const carts: UserCart[] = JSON.parse(stringifiedCarts);
      let updatedCarts = carts.filter((cart) => cart.userId !== auth.id);
      const emptyCart: UserCart = { userId: auth.id, userProducts: [] };
      updatedCarts.push(emptyCart);
      localStorage.setItem("carts", JSON.stringify(updatedCarts));
    };

    e.preventDefault();

    const { street, city, postalCode } = address;

    if (street && city && postalCode) {
      // Regex for street: e.g., "Main St 123"
      const streetRegex = /^[A-Za-z\s]+\s\d+$/;

      // Regex for city: only letters
      const cityRegex = /^[A-Za-z\s]+$/;

      // Regex for postal code: format "xx-xxx"
      const postalCodeRegex = /^\d{2}-\d{3}$/;

      if (!streetRegex.test(street)) {
        setMessage("Invalid street format. Use: 'StreetName 123'");
        return;
      }

      if (!cityRegex.test(city)) {
        setMessage("City name can only contain letters");
        return;
      }

      if (!postalCodeRegex.test(postalCode)) {
        setMessage("Invalid postal code format. Use: 'xx-xxx'");
        return;
      }
      const fullAddress = street + " " + city + " " + postalCode;

      const productIds = userCart.userProducts.map((item) => item.productId);
      const productQuantities = userCart.userProducts.map(
        (item) => item.quantity
      );
      try {
        const response = await fetch(`/api/orders/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
          },
          body: JSON.stringify({
            userid: auth.id,
            ids: productIds,
            quantities: productQuantities,
            totalValue: totalPrice,
            address: fullAddress,
          }),
        });
        if (response.ok) {
          clearCart();
          navigate("/order/history");
        }
      } catch {
        navigate("/");
      }
    } else {
      setMessage("Niepełne dane adresowe");
    }
  };

  return (
    <div className="orderSend">
      Total order value: <b>{totalPrice.toFixed(2)}$</b>
      <br></br>
      <form className="orderForm">
        <label htmlFor="street">Street and house number</label>
        <input
          type="text"
          name="street"
          id="street"
          onChange={(e) => {
            handleChange(e);
          }}
        ></input>
        <label htmlFor="city">City</label>
        <input
          type="text"
          name="city"
          id="city"
          onChange={(e) => {
            handleChange(e);
          }}
        ></input>
        <label htmlFor="postalCode">Postal code</label>
        <input
          type="text"
          name="postalCode"
          id="postalCode"
          onChange={(e) => {
            handleChange(e);
          }}
        ></input>
        <Link to="/order/history">
          <button type="submit" onClick={handleSubmit}>
            Order
          </button>
        </Link>
      </form>
      <p>{message}</p>
    </div>
  );
}

export { Order };
