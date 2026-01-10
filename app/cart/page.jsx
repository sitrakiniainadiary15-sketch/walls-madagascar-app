"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../components/CartContext";
import "./cart.css";

export default function CartPage() {
  const {
    cartItems,
    increaseQty,
    decreaseQty,
    removeFromCart,
    cartTotal,
  } = useCart();

  const router = useRouter();

  return (
    <div className="cart-container">
      <h1>🛒 Mon panier</h1>

      {cartItems.length === 0 ? (
        <>
          <p>Votre panier est vide.</p>
          <Link href="/boutique">Retour à la boutique</Link>
        </>
      ) : (
        <>
          <ul className="cart-list">
            {cartItems.map((item) => (
              <li key={item._id} className="cart-item">
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.promoPrice ?? item.price} Ar</p>
                </div>

                <div className="qty-controls">
                  <button onClick={() => decreaseQty(item._id)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => increaseQty(item._id)}>+</button>
                </div>

                <button
                  className="remove"
                  onClick={() => removeFromCart(item._id)}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>

          <div className="cart-total">
            <h3>Total : {cartTotal} Ar</h3>
          </div>

          <button
            className="order-btn"
            onClick={() => router.push("/checkout")}
          >
            ✅ Commander
          </button>
        </>
      )}
    </div>
  );
}
