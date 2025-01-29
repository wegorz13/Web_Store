import { useState, useEffect } from "react";
import { ProductInCart } from "./product";
import { Link } from "react-router-dom";
import "./comp_styles/cart.css";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

declare global {
  interface CartElement {
    productId: number;
    quantity: number;
  }

  interface UserCart {
    userId: number;
    userProducts: CartElement[];
  }
}

function Cart() {
  const { auth } = useAuth();
  const accessToken = auth?.accessToken;
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [userCart, setUserCart] = useState<UserCart>({
    userId: auth.id,
    userProducts: [],
  });

  const [carts, setCarts] = useState<UserCart[]>([]);

  useEffect(() => {
    const stringifiedCarts: string = localStorage.getItem("carts") || "[]";
    setCarts(JSON.parse(stringifiedCarts));
  }, []);

  useEffect(() => {
    const cart: UserCart = carts.find((cart) => cart.userId === auth.id) || {
      userId: 0,
      userProducts: [],
    };
    // Initialize userCart state from props on component mount
    setUserCart(cart);
  }, [carts, auth.id]);

  useEffect(() => {
    async function fetchCartProducts() {
      if (!userCart || userCart.userProducts.length === 0) {
        setProducts([]); // Clear products if the cart is empty
        return;
      }

      try {
        // Extract product IDs from userCart
        const productIds = userCart.userProducts.map((item) => item.productId);

        // Fetch products from the server using a query parameter

        const response = await fetch(
          `/api/products/cart?ids=${productIds.join(",")}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const data = await response.json();
        if (response.ok) {
          setProducts(data);
        } else {
          console.error("Failed to fetch cart products:", data.message);
        }
      } catch (error) {
        console.error("Error fetching cart products:", error);
        navigate("/login");
      }
    }

    fetchCartProducts();
  }, [userCart, accessToken, navigate]);

  return (
    <div className="cartContainer">
      <h2>Your cart</h2>

      {products.length > 0 ? (
        <div className="wholeCart">
          <div className="cartProductBox">
            {products.map((product) => {
              const cartElement = userCart.userProducts.find(
                (item) => item.productId === product.id
              );
              if (cartElement?.quantity && cartElement.quantity > 0) {
                return (
                  <ProductInCart
                    key={product.id}
                    product={product}
                    quantity={cartElement.quantity}
                    userCart={userCart}
                    setUserCart={setUserCart} // Pass the state updater
                  />
                );
              }
              return null;
            })}
          </div>
          <Link to={"/order"}>
            <button>Proceed</button>
          </Link>
        </div>
      ) : (
        <p>Your cart is either empty or still loading...</p>
      )}
    </div>
  );
}

export { Cart };
