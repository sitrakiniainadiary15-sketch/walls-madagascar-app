"use client";

import { useEffect, useState } from "react";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  return (
    <div>
      <h1>Produits</h1>

      {products.length === 0 && <p>Aucun produit</p>}

      <ul>
        {products.map((p: any) => (
          <li key={p._id}>
            {p.name} - {p.price} Ar
          </li>
        ))}
      </ul>
    </div>
  );
}
