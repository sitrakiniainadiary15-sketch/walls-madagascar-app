"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useCart } from "./CartContext";

import "./navbar.css";

export default function Navbar() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  // 🛒 PANIER
  const { cartItems } = useCart();

const cartCount = cartItems.reduce(
  (total, item) => total + (item.quantity || 1),
  0
);

  

  return (
    <header className="navbar">
      <div className="container navbar-inner">

        {/* LOGO */}
        <Link href="/" className="logo">
          MyShop
        </Link>

        {/* NAV */}
        <nav className="nav-links">
          <Link href="/">Accueil</Link>
          <Link href="/boutique">Boutique</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/contact">Contact</Link>

          {/* ADMIN */}
          {isAdmin && (
            <Link href="/admin/dashboard" className="admin-link">
              Dashboard
            </Link>
          )}

          {/* AUTH */}
          {!session ? (
            <>
              <Link href="/auth/login">Connexion</Link>
              <Link href="/auth/register">Inscription</Link>
            </>
          ) : (
            <>
              <span className="user-email">
                {session.user?.email}
              </span>

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="logout"
              >
                Déconnexion
              </button>
            </>
          )}

          {/* CART */}
          <Link href="/cart" className="cart">
            🛒
            <span className="cart-count">
              {cartCount}
            </span>
          </Link>
        </nav>

      </div>
    </header>
  );
}
