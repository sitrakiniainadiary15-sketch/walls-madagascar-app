"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import "./navbar.css";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="navbar">
      <div className="container navbar-inner">

        <Link href="/" className="logo">
          MyShop
        </Link>

        <nav className="nav-links">
          <Link href="/">Accueil</Link>
          <Link href="/boutique">Boutique</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/contact">Contact</Link>

          {!session ? (
            <>
              <Link href="/auth/login">Connexion</Link>
              <Link href="/auth/register">Inscription</Link>
            </>
          ) : (
            <>
              <span className="user-email">{session.user?.email}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="logout"
              >
                Déconnexion
              </button>
            </>
          )}
        </nav>

      </div>
    </header>
  );
}
