"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import "./home.css";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentHeroImage, setCurrentHeroImage] = useState(0);

  // Images du hero (tu peux les changer)
  const heroImages = [
  "/jord1.png",
  "/jord2.png",
  "/jord3.png",
];

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products?limit=8");
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Auto-change hero image toutes les 5 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const promoProducts = products.filter(p => p.promoPrice).slice(0, 4);
  const newProducts = products.slice(0, 4);

  return (
    <main className="home-pro">

      {/* 🎯 HERO MINIMALISTE */}
      <section className="hero-pro">
        <div className="hero-content-pro">
          <div className="hero-text-pro">
            <h1>Découvrez notre nouvelle collection</h1>
            <p>Des produits exceptionnels pour tous vos besoins</p>
            <div className="hero-cta-pro">
              <Link href="/boutique" className="btn-hero-primary">
                Explorer la boutique
              </Link>
              <Link href="#featured" className="btn-hero-outline">
                Voir les nouveautés
              </Link>
            </div>
          </div>
          <div className="hero-image-pro">
            <div className="hero-image-slider">
              {heroImages.map((img, index) => (
                <img 
                  key={index}
                  src={img} 
                  alt={`Hero ${index + 1}`}
                  className={index === currentHeroImage ? "active" : ""}
                />
              ))}
            </div>
            
            {/* Indicateurs */}
            <div className="hero-indicators">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  className={index === currentHeroImage ? "active" : ""}
                  onClick={() => setCurrentHeroImage(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 📦 CATÉGORIES SIMPLES */}
      <section className="categories-pro">
        <div className="container-pro">
          <div className="category-grid-pro">
            <Link href="/boutique?category=electronique" className="category-item-pro">
              <div className="category-icon-pro">📱</div>
              <h3>Électronique</h3>
              <span className="category-arrow">→</span>
            </Link>
            <Link href="/boutique?category=mode" className="category-item-pro">
              <div className="category-icon-pro">👕</div>
              <h3>Mode & Accessoires</h3>
              <span className="category-arrow">→</span>
            </Link>
            <Link href="/boutique?category=maison" className="category-item-pro">
              <div className="category-icon-pro">🏠</div>
              <h3>Maison & Déco</h3>
              <span className="category-arrow">→</span>
            </Link>
            <Link href="/boutique?category=sport" className="category-item-pro">
              <div className="category-icon-pro">⚽</div>
              <h3>Sport & Loisirs</h3>
              <span className="category-arrow">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 🔥 PROMOTIONS */}
      {promoProducts.length > 0 && (
        <section className="promo-banner-pro">
          <div className="container-pro">
            <div className="promo-header-pro">
              <div>
                <span className="promo-label">Offres spéciales</span>
                <h2>Jusqu'à -50% sur une sélection</h2>
              </div>
              <Link href="/boutique?promo=true" className="btn-view-all">
                Tout voir →
              </Link>
            </div>

            <div className="products-grid-pro">
              {promoProducts.map((product) => (
                <Link href={`/products/${product._id}`} key={product._id} className="product-card-pro">
                  {product.promoPrice && (
                    <span className="product-discount">
                      -{Math.round(((product.price - product.promoPrice) / product.price) * 100)}%
                    </span>
                  )}
                  <div className="product-image-pro">
                    <img src={product.image || "/no-image.png"} alt={product.name} />
                  </div>
                  <div className="product-details-pro">
                    <h3>{product.name}</h3>
                    {product.brand && <p className="product-brand">{product.brand}</p>}
                    <div className="product-price-pro">
                      <span className="price-current">{product.promoPrice?.toLocaleString()} Ar</span>
                      <span className="price-original">{product.price.toLocaleString()} Ar</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ⭐ NOUVEAUTÉS */}
      <section className="featured-pro" id="featured">
        <div className="container-pro">
          <div className="section-header-pro">
            <div>
              <span className="section-label">Dernières arrivées</span>
              <h2>Nouveautés</h2>
            </div>
            <Link href="/boutique?sort=newest" className="btn-view-all">
              Tout voir →
            </Link>
          </div>

          {loading ? (
            <div className="loading-grid-pro">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton-card-pro">
                  <div className="skeleton-image"></div>
                  <div className="skeleton-text"></div>
                  <div className="skeleton-text short"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="products-grid-pro">
              {newProducts.map((product) => (
                <Link href={`/products/${product._id}`} key={product._id} className="product-card-pro">
                  <span className="product-badge">Nouveau</span>
                  <div className="product-image-pro">
                    <img src={product.image || "/no-image.png"} alt={product.name} />
                  </div>
                  <div className="product-details-pro">
                    <h3>{product.name}</h3>
                    {product.brand && <p className="product-brand">{product.brand}</p>}
                    <div className="product-price-pro">
                      {product.promoPrice ? (
                        <>
                          <span className="price-current">{product.promoPrice.toLocaleString()} Ar</span>
                          <span className="price-original">{product.price.toLocaleString()} Ar</span>
                        </>
                      ) : (
                        <span className="price-current">{product.price.toLocaleString()} Ar</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 💎 VALEURS */}
      <section className="values-pro">
        <div className="container-pro">
          <div className="values-grid-pro">
            <div className="value-item-pro">
              <div className="value-icon-pro">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <h3>Livraison rapide</h3>
              <p>Livraison en 24-48h partout à Madagascar</p>
            </div>

            <div className="value-item-pro">
              <div className="value-icon-pro">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3>Paiement sécurisé</h3>
              <p>Transactions 100% sécurisées et protégées</p>
            </div>

            <div className="value-item-pro">
              <div className="value-icon-pro">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
              </div>
              <h3>Retours gratuits</h3>
              <p>30 jours pour changer d'avis</p>
            </div>

            <div className="value-item-pro">
              <div className="value-icon-pro">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                </svg>
              </div>
              <h3>Support client</h3>
              <p>Assistance disponible 7j/7</p>
            </div>
          </div>
        </div>
      </section>

      {/* 📰 NEWSLETTER */}
      <section className="newsletter-pro">
        <div className="container-pro">
          <div className="newsletter-content-pro">
            <div className="newsletter-text-pro">
              <h2>Restez informé</h2>
              <p>Inscrivez-vous à notre newsletter pour recevoir nos offres exclusives</p>
            </div>
            <form className="newsletter-form-pro">
              <input 
                type="email" 
                placeholder="Votre adresse email" 
                required 
              />
              <button type="submit" className="btn-newsletter">
                S'inscrire
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 🎁 CTA FINAL */}
      <section className="cta-pro">
        <div className="container-pro">
          <div className="cta-content-pro">
            <h2>Prêt à commencer ?</h2>
            <p>Découvrez tous nos produits et trouvez ce qu'il vous faut</p>
            <Link href="/boutique" className="btn-cta-large">
              Voir toute la boutique
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
