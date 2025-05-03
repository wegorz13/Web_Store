import { Link } from "react-router-dom";
import { useState } from "react";
import "./comp_styles/product.css";
import useAuth from "../hooks/useAuth";

declare global {
  interface Product {
    id: number;
    title: string;
    price: number;
    description: string;
    category: string;
    image: string;
    quantity: number;
  }
}

function ProductFull(props: { product: Product }) {
  const product = props.product;
  const { auth } = useAuth();

  const [quantityToCart, setQuantity] = useState(1);
  const addToCart = () => {
    const stringifiedCarts: string = localStorage.getItem("carts") || "[]";
    const carts: UserCart[] = JSON.parse(stringifiedCarts);

    let cart: UserCart | undefined = carts.find(
      (cart) => cart.userId === auth.id
    );
    if (!cart) {
      cart = {
        userId: auth.id,
        userProducts: [],
      };
      carts.push(cart);
    }

    console.log(cart);
    const existingProduct = cart.userProducts.find(
      (item) => item.productId === product.id
    );

    if (existingProduct) {
      existingProduct.quantity += quantityToCart;
    } else {
      cart.userProducts.push({
        productId: product.id,
        quantity: quantityToCart,
      });
    }
    console.log(carts);
    localStorage.setItem("carts", JSON.stringify(carts));
  };

  return (
    <div className="productFullBox">
      <h3>{product.title}</h3>
      <div className="productImgBox">
        <img
          src={product.image}
          style={{ width: "200px", height: "200px" }}
        ></img>
        <div className="productDescrBox">
          <p style={{ width: "300px" }}>{product.description}</p>
          <p>
            Price: <b>{product.price}$</b> In stock: <b>{product.quantity}</b>
          </p>
          <div className="inputBox">
            <input
              className="quantityInput"
              type="number"
              min="0"
              max={product.quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            ></input>
            <button className="addToCartBtn" onClick={addToCart}>
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductShort(props: { product: Product }) {
  const product = props.product;

  return (
    <div className="productShort">
      <h3>
        <Link className="productShortBox" to={`/product/${product.id}`}>
          <p>{product.title}</p>
          <img
            className="productImage"
            src={product.image}
            style={{ width: "100px", height: "100px" }}
          ></img>
          <p>{product.price.toFixed(2)} $</p>
        </Link>
      </h3>
    </div>
  );
}

function ProductInCart(props: {
  product: Product;
  quantity: number;
  userCart: UserCart;
  setUserCart: React.Dispatch<React.SetStateAction<UserCart>>;
}) {
  const { product, quantity, userCart, setUserCart } = props;

  const removeFromCart = () => {
    const updatedUserCart: UserCart = { ...userCart };

    const productIndex = updatedUserCart.userProducts.findIndex(
      (item) => item.productId === product.id
    );

    if (productIndex >= 0) {
      const productInCart = updatedUserCart.userProducts[productIndex];
      productInCart.quantity -= 1;

      if (productInCart.quantity <= 0) {
        updatedUserCart.userProducts.splice(productIndex, 1);
      }
    }

    const stringifiedCarts: string = localStorage.getItem("carts") || "[]";
    const carts: UserCart[] = JSON.parse(stringifiedCarts);

    const updatedCarts = carts.map((cart) =>
      cart.userId === updatedUserCart.userId ? updatedUserCart : cart
    );

    localStorage.setItem("carts", JSON.stringify(updatedCarts));

    setUserCart(updatedUserCart);
  };

  return (
    <div className="productInCartBox">
      <p className="cartTitle">{product.title}</p>
      <p>
        Price: <b>{product.price}$</b>
      </p>

      <p>
        Quantity: <b>{quantity}</b>
      </p>
      <img src={product.image} alt={product.title} width="70" height={"70"} />
      <button onClick={removeFromCart} style={{ color: "red" }}>
        X
      </button>
    </div>
  );
}

export { ProductFull, ProductShort, ProductInCart };
