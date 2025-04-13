import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ProductFull } from "../components/product";
import { Navbar } from "../components/navbar";
import "./pages_styles/productpage.css";
import { OpinionForm } from "../components/opinionForm";

function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product>();

  useEffect(() => {
    const productId = id;
    fetch(`/api/products/${productId}`)
      .then((response) => response.json())
      .then((data) => {
        setProduct(data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [id]);

  if (!product) {
    return <p>Product not found!</p>;
  }

  return (
    <div className="body">
      <Navbar></Navbar>
      <div className="productFull">
        <ProductFull product={product}></ProductFull>
      </div>
      <OpinionForm id={Number(id)}></OpinionForm>
    </div>
  );
}

export { ProductPage };
