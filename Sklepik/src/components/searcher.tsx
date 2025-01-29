import { useState, useEffect } from "react";
import { ProductShort } from "./product";
import "./comp_styles/searcher.css";

function Searcher() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchValue, setSearch] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div id="searchBox">
      <div id="categoryContainer">
        <button
          className="categoryBtn"
          name="all products"
          onClick={(e) => {
            setCategory("");
          }}
        >
          All products
        </button>
        <button
          className="categoryBtn"
          name="men's clothing"
          onClick={(e) => {
            setCategory((e.target as HTMLButtonElement).name);
          }}
        >
          Men's clothing
        </button>
        <button
          className="categoryBtn"
          name="women's clothing"
          onClick={(e) => {
            setCategory((e.target as HTMLButtonElement).name);
          }}
        >
          Women's clothing
        </button>
        <button
          className="categoryBtn"
          name="electronics"
          onClick={(e) => {
            setCategory((e.target as HTMLButtonElement).name);
          }}
        >
          Electronics
        </button>
        <button
          className="categoryBtn"
          name="jewelery"
          onClick={(e) => {
            setCategory((e.target as HTMLButtonElement).name);
          }}
        >
          Jewelery
        </button>
      </div>
      <div id="realSearcher">
        <h2>Shop all you want!</h2>
        <input
          type="text"
          placeholder="Search your product..."
          id="searchBar"
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        ></input>
        <div id="productContainer">
          {products.map((product) => {
            if (
              product.title.toLowerCase().includes(searchValue.toLowerCase()) &&
              (!category || product.category == category)
            ) {
              return <ProductShort product={product}></ProductShort>;
            }
          })}
        </div>
      </div>
    </div>
  );
}

export { Searcher };
