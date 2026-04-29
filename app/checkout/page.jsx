"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/components/CartContext";
import "./checkout.css";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartTotal } = useCart();

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Madagascar");
  const [shipping, setShipping] = useState("colissimo");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);

  const TVA_RATE = 0.20;
  const tva = Math.round(cartTotal * TVA_RATE);
  const livraison = 25;
  const total = cartTotal + tva + livraison;
  const totalQty = cartItems.reduce((acc, i) => acc + i.quantity, 0);

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
          customer: { firstname, lastname, email, company, city, address, postalCode, country },
          cartItems,
          total: cartTotal,
          payment: "card",
          delivery: shipping,
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

  return (
    <div className="checkout-page">

      {/* BOUTON RETOUR */}
      <button className="checkout-back" onClick={() => router.back()}>
        ← Retour
      </button>

      <div className="checkout-wrapper">

        {/* COLONNE GAUCHE — Formulaire */}
        <div className="checkout-left">

          {/* CONTACT */}
          <div className="checkout-section">
            <h3 className="checkout-section-title">Contact</h3>
            <input
              type="email"
              placeholder="Tom.exemple@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="checkout-input"
              required
            />
          </div>

          {/* LIVRAISON */}
          <div className="checkout-section">
            <h3 className="checkout-section-title">Livraison</h3>
            <input
              type="text"
              placeholder="Pays / région"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="checkout-input"
            />
            <div className="checkout-row">
              <input
                type="text"
                placeholder="Prénom (optionnel)"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                className="checkout-input"
              />
              <input
                type="text"
                placeholder="Nom"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                className="checkout-input"
                required
              />
            </div>
            <input
              type="text"
              placeholder="Entreprise"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="checkout-input"
            />
            <input
              type="text"
              placeholder="Adresse"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="checkout-input"
              required
            />
            <div className="checkout-row">
              <input
                type="text"
                placeholder="Code postal"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="checkout-input"
              />
              <input
                type="text"
                placeholder="Ville"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="checkout-input"
                required
              />
            </div>
          </div>

          {/* MODE D'EXPÉDITION */}
          <div className="checkout-section">
            <h3 className="checkout-section-title">Mode d'expédition</h3>
            <label className="checkout-radio">
              <input
                type="radio"
                name="shipping"
                value="colissimo"
                checked={shipping === "colissimo"}
                onChange={() => setShipping("colissimo")}
              />
              <span>Colissimo - Signature - International Livraison contre signature entre 2 et 8 jours</span>
            </label>
            <label className="checkout-radio">
              <input
                type="radio"
                name="shipping"
                value="relais"
                checked={shipping === "relais"}
                onChange={() => setShipping("relais")}
              />
              <span>Livraison en point relais colissimo en 2 à 4 jours</span>
            </label>
          </div>

          {/* PAIEMENT */}
          <div className="checkout-section">
            <h3 className="checkout-section-title">Paiement</h3>
            <div className="checkout-card-row">
              <input
                type="text"
                placeholder="1234 1234 1234 1234"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="checkout-input checkout-input-card"
              />
              <div className="card-icons">
                <span>VISA</span>
                <span>MC</span>
                <span>AMEX</span>
              </div>
            </div>
            <div className="checkout-row">
              <input
                type="text"
                placeholder="MM / YY"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="checkout-input"
              />
              <input
                type="text"
                placeholder="CVC"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                className="checkout-input"
              />
            </div>
            <input
              type="text"
              placeholder="Full name on card"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              className="checkout-input"
            />
            <select
              className="checkout-input checkout-select"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              <option>Madagascar</option>
              <option>France</option>
              <option>United States</option>
              <option>Réunion</option>
            </select>
            <input
              type="text"
              placeholder="ZIP"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              className="checkout-input"
            />
          </div>

          {/* BOUTON */}
          <button
            className="checkout-submit"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Envoi..." : "Vérifier la commande"}
          </button>

        </div>

        {/* COLONNE DROITE — Résumé */}
        <div className="checkout-right">

          {/* LISTE PRODUITS */}
          <div className="checkout-items">
            {cartItems.map((item) => (
              <div key={item._id} className="checkout-item">
                <div className="checkout-item-image">
                  {item.image && <img src={item.image} alt={item.name} />}
                </div>
                <div className="checkout-item-info">
                  <strong>{item.name}</strong>
                  <p>{item.description}</p>
                </div>
                <span className="checkout-item-price">
                  {item.promoPrice ?? item.price} Ar
                </span>
              </div>
            ))}
          </div>

          {/* RÉSUMÉ */}
          <div className="checkout-summary">
            <h3 className="checkout-summary-title">Résumé de la commande</h3>
            <div className="checkout-summary-row">
              <span>Sous-total ({totalQty})</span>
              <span>{cartTotal} Ar</span>
            </div>
            <div className="checkout-summary-row">
              <span>TVA (20%)</span>
              <span>{tva} Ar</span>
            </div>
            <div className="checkout-summary-row">
              <span>Livraison</span>
              <span>{livraison} Ar</span>
            </div>
            <div className="checkout-summary-divider" />
            <div className="checkout-summary-row checkout-summary-total">
              <span>Total</span>
              <span>{total} Ar</span>
            </div>
            <button
              className="checkout-pay-btn"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Envoi..." : "Procéder au paiement"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}