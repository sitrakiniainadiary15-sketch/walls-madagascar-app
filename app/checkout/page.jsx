"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/components/CartContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartTotal } = useCart();

  // --------- États formulaire ----------
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  
  // ✅ NOUVEAU : État pour le mode de paiement
  const [payment, setPayment] = useState("cash");
  
  const [loading, setLoading] = useState(false);

  // --------- Soumission ----------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!firstname || !lastname || !email || !city || !address) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      alert("Votre panier est vide");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            firstname,
            lastname,
            email,
            phone,
            city,
            address,
          },
          cartItems,
          total: cartTotal,
          payment,  // ✅ Utilise la valeur sélectionnée
          delivery: "standard",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Erreur lors de la commande");
        return;
      }

      alert("✅ Commande confirmée !");
      localStorage.removeItem("cart");
      router.push("/");
    } catch (error) {
      console.error("CHECKOUT ERROR:", error);
      alert("Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  // --------- Render ----------
  return (
    <div className="checkout-container">
      <h1>📦 Finaliser la commande</h1>

      <form onSubmit={handleSubmit} className="checkout-form">
        <input
          type="text"
          placeholder="Prénom"
          value={firstname}
          onChange={(e) => setFirstname(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Nom"
          value={lastname}
          onChange={(e) => setLastname(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Adresse email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="tel"
          placeholder="Téléphone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          type="text"
          placeholder="Ville"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />

        <textarea
          placeholder="Adresse de livraison"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />

        {/* ✅ NOUVEAU : Sélecteur mode de paiement */}
        <div className="payment-section">
          <label><strong>Mode de paiement :</strong></label>
          <select 
            value={payment} 
            onChange={(e) => setPayment(e.target.value)}
            required
          >
            <option value="cash">💵 Paiement à la livraison</option>
            <option value="mobile_money">📱 Mobile Money (MVola, Orange Money)</option>
            <option value="card">💳 Carte bancaire</option>
            <option value="bank_transfer">🏦 Virement bancaire</option>
          </select>
        </div>

        <p className="total">
          <strong>Total :</strong> {cartTotal} Ar
        </p>

        <button type="submit" disabled={loading}>
          {loading ? "Envoi..." : "Confirmer la commande"}
        </button>
      </form>
    </div>
  );
}

     