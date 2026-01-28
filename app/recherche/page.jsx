"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import "./recherche.css";


export default function RecherchePage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/search?q=${query}`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [query]);

  return (
    <div className="container" style={{ padding: "40px 0" }}>
      <h1>Résultats pour : "{query}"</h1>

      {loading && <p>Chargement...</p>}

      {!loading && products.length === 0 && (
        <p>Aucun produit trouvé</p>
      )}

      <div className="products-grid">
        {products.map((product) => (
          <Link
            key={product._id}
            href={`/product/${product._id}`}
            className="product-card"
          >
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>{product.price} Ar</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
