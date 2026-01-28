"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useCart } from "./CartContext";
import "./navbar.css";

export default function Navbar() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  // 🛒 PANIER
  const { cartItems } = useCart();
  const cartCount =
    cartItems?.reduce(
      (total, item) => total + (item.quantity || 1),
      0
    ) || 0;

  // 🔍 RECHERCHE
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) return;

    router.push(`/recherche?q=${encodeURIComponent(searchQuery)}`);

    setSearchQuery("");
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">

        {/* LOGO */}
        <Link href="/" className="logo">
          MyShop
        </Link>

        {/* RECHERCHE */}
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">🔍</button>
        </form>

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

          {/* PANIER */}
          <Link href="/cart" className="cart">
            🛒
            {cartCount > 0 && (
              <span className="cart-count">{cartCount}</span>
            )}
          </Link>
        </nav>

      </div>
    </header>
  );
}
