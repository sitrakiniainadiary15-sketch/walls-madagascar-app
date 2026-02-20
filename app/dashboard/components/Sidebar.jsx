"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function Sidebar({ user }) {
  const pathname = usePathname();

  const menuItems = [
    {
      icon: "🏠",
      label: "Vue d'ensemble",
      path: "/dashboard",
    },
    {
      icon: "📦",
      label: "Mes commandes",
      path: "/dashboard/orders",
    },
    {
      icon: "👤",
      label: "Mon profil",
      path: "/dashboard/profile",
    },
    {
      icon: "📍",
      label: "Mes adresses",
      path: "/dashboard/addresses",
    },
  ];

  return (
    <aside className="sidebar">
      {/* User info */}
      <div className="sidebar-header">
        <div className="user-avatar">
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <div className="user-info">
          <h3>{user.name}</h3>
          <p>{user.email}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`nav-item ${pathname === item.path ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="sidebar-footer">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="logout-btn"
        >
          <span>🚪</span>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
