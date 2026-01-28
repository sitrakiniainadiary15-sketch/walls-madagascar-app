"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/app/components/CartContext";
import "./product-detail.css";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();

  // États
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Galerie
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Options
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  
  // UI
  const [activeTab, setActiveTab] = useState("description");
  const [addedToCart, setAddedToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Produits similaires
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Avis clients
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState({});

  // Calcul de la note moyenne
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  // Distribution des notes
  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => distribution[r.rating]++);
    return distribution;
  };

  // Toggle "Voir plus" pour un avis
  const toggleExpandReview = (reviewId) => {
    setExpandedReviews(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  // Fetch produit
  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();

        if (data.success && data.product) {
          setProduct(data.product);
          
          if (data.product.category) {
            fetchRelatedProducts(
              data.product.category._id || data.product.category,
              data.product._id
            );
          }
        } else {
          throw new Error(data.message || "Produit introuvable");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchProduct();
  }, [id]);

  // Fetch produits similaires
  const fetchRelatedProducts = async (categoryId, currentProductId) => {
    try {
      const res = await fetch(`/api/products?category=${categoryId}&limit=4`);
      const data = await res.json();
      if (data.products) {
        setRelatedProducts(data.products.filter(p => p._id !== currentProductId));
      }
    } catch (err) {
      console.error("Erreur produits similaires:", err);
    }
  };

  // Fetch avis
  useEffect(() => {
    if (!id) return;

    fetch(`/api/reviews?productId=${id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setReviews(data);
        }
      })
      .catch(err => console.error(err));
  }, [id]);

  // Ajouter un avis
  const submitReview = async () => {
    if (!reviewName || !reviewComment) return;

    await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: id,
        name: reviewName,
        rating: reviewRating,
        comment: reviewComment,
      }),
    });

    setReviewName("");
    setReviewComment("");
    setReviewRating(5);
    setShowReviewForm(false);
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3000);

    const res = await fetch(`/api/reviews?productId=${id}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      setReviews(data);
    }
  };

  // Toutes les images
  const getAllImages = () => {
    if (!product) return ["/no-image.png"];
    const allImages = [];
    if (product.image) allImages.push(product.image);
    if (product.images?.length) allImages.push(...product.images);
    return allImages.length > 0 ? allImages : ["/no-image.png"];
  };

  // Quantité
  const increaseQty = () => {
    if (quantity < (product?.stock || 10)) setQuantity(q => q + 1);
  };
  
  const decreaseQty = () => {
    if (quantity > 1) setQuantity(q => q - 1);
  };

  // Ajouter au panier
  const handleAddToCart = () => {
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.promoPrice ?? product.price,
      image: product.image,
      quantity,
      size: selectedSize,
      color: selectedColor,
      stock: product.stock,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // Calcul réduction
  const getDiscount = () => {
    if (!product?.promoPrice || !product?.price) return 0;
    return Math.round((1 - product.promoPrice / product.price) * 100);
  };

  // Fonction pour afficher les étoiles
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(<span key={i} className="star filled">★</span>);
      } else if (i - 0.5 <= rating) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star empty">☆</span>);
      }
    }
    return stars;
  };

  // États de chargement
  if (loading) {
    return (
      <div className="product-loading">
        <div className="spinner"></div>
        <p>Chargement du produit...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-error">
        <h2>😕 {error}</h2>
        <Link href="/boutique" className="back-link">← Retour à la boutique</Link>
      </div>
    );
  }

  if (!product) return null;

  const images = getAllImages();

  return (
    <div className="product-detail-page">
      {/* Fil d'Ariane */}
      <nav className="breadcrumb">
        <Link href="/">Accueil</Link>
        <span>/</span>
        <Link href="/boutique">Boutique</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link href={`/categorie/${product.category.slug || product.category._id}`}>
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="current">{product.name}</span>
      </nav>

      <div className="product-main">
        {/* Galerie d'images */}
        <div className="product-gallery">
          <div className="main-image">
            <Image
              src={images[selectedImage]}
              alt={product.name}
              width={600}
              height={600}
              priority
              className="zoom-image"
            />

            {product.promoPrice && (
              <span className="promo-badge">-{getDiscount()}%</span>
            )}

            <button 
              className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
              onClick={() => setIsWishlisted(!isWishlisted)}
            >
              {isWishlisted ? '❤️' : '🤍'}
            </button>

            {images.length > 1 && (
              <>
                <button 
                  className="nav-arrow prev"
                  onClick={() => setSelectedImage(i => i > 0 ? i - 1 : images.length - 1)}
                >
                  ‹
                </button>
                <button 
                  className="nav-arrow next"
                  onClick={() => setSelectedImage(i => i < images.length - 1 ? i + 1 : 0)}
                >
                  ›
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="thumbnails">
              {images.map((img, index) => (
                <button
                  key={index}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <Image src={img} alt={`Vue ${index + 1}`} width={80} height={80} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Informations produit */}
        <div className="product-info">
          <div className="product-meta">
            {product.category && (
              <Link href={`/categorie/${product.category.slug || product.category._id}`} className="category-link">
                {product.category.name}
              </Link>
            )}
            {product.brand && <span className="brand">par {product.brand}</span>}
          </div>

          <h1 className="product-name">{product.name}</h1>

          {/* Étoiles dynamiques */}
          <div className="product-rating">
            <div className="stars">
              {renderStars(averageRating)}
            </div>
            <span className="reviews-count">({reviews.length} avis)</span>
          </div>

          <div className="product-price">
            {product.promoPrice ? (
              <>
                <span className="current-price">{Number(product.promoPrice).toLocaleString()} Ar</span>
                <span className="old-price">{Number(product.price).toLocaleString()} Ar</span>
                <span className="discount-badge">-{getDiscount()}%</span>
              </>
            ) : (
              <span className="current-price">{Number(product.price).toLocaleString()} Ar</span>
            )}
          </div>

          <div className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
            <span className="dot"></span>
            {product.stock > 0 ? <>En stock <span className="stock-qty">({product.stock} disponibles)</span></> : 'Rupture de stock'}
          </div>

          {product.description && (
            <p className="short-description">
              {product.description.substring(0, 150)}
              {product.description.length > 150 ? '...' : ''}
            </p>
          )}

          {product.sizes?.length > 0 && (
            <div className="option-group">
              <label>Taille :</label>
              <div className="size-options">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.colors?.length > 0 && (
            <div className="option-group">
              <label>Couleur : {selectedColor}</label>
              <div className="color-options">
                {product.colors.map(color => (
                  <button
                    key={color.code}
                    className={`color-btn ${selectedColor === color.name ? 'active' : ''}`}
                    style={{ backgroundColor: color.code }}
                    onClick={() => setSelectedColor(color.name)}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          )}

          {product.stock > 0 && (
            <div className="product-actions">
              <div className="quantity-selector">
                <button onClick={decreaseQty} disabled={quantity <= 1}>−</button>
                <span>{quantity}</span>
                <button onClick={increaseQty} disabled={quantity >= product.stock}>+</button>
              </div>

              <button
                className={`add-to-cart-btn ${addedToCart ? 'added' : ''}`}
                onClick={handleAddToCart}
              >
                {addedToCart ? '✓ Ajouté au panier !' : '🛒 Ajouter au panier'}
              </button>
            </div>
          )}

          {product.stock > 0 && (
            <Link href="/checkout" className="buy-now-btn">
              ⚡ Acheter maintenant
            </Link>
          )}

          {/* Boutons de partage */}
          <div className="share-buttons">
            <span>Partager :</span>
            <a 
              href={`https://www.facebook.com/sharer/sharer.php?u=${typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''}`}
              target="_blank"
              rel="noopener noreferrer"
              className="share-btn facebook"
            >
              📘 Facebook
            </a>
            <a 
              href={`https://wa.me/?text=${typeof window !== 'undefined' ? encodeURIComponent(product.name + ' - ' + window.location.href) : ''}`}
              target="_blank"
              rel="noopener noreferrer"
              className="share-btn whatsapp"
            >
              💬 WhatsApp
            </a>
          </div>

          <div className="delivery-info">
            <div className="info-item">
              <span className="icon">🚚</span>
              <div>
                <strong>Livraison gratuite</strong>
                <p>Pour les commandes de plus de 100 000 Ar</p>
              </div>
            </div>
            <div className="info-item">
              <span className="icon">↩️</span>
              <div>
                <strong>Retours gratuits</strong>
                <p>Sous 14 jours</p>
              </div>
            </div>
            <div className="info-item">
              <span className="icon">🔒</span>
              <div>
                <strong>Paiement sécurisé</strong>
                <p>Mobile Money, Carte, Espèces</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="product-tabs">
        <div className="tabs-header">
          <button
            className={activeTab === 'description' ? 'active' : ''}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
          <button
            className={activeTab === 'specifications' ? 'active' : ''}
            onClick={() => setActiveTab('specifications')}
          >
            Caractéristiques
          </button>
          <button
            className={activeTab === 'reviews' ? 'active' : ''}
            onClick={() => setActiveTab('reviews')}
          >
            Avis ({reviews.length})
          </button>
        </div>

        <div className="tabs-content">
          {activeTab === 'description' && (
            <div className="tab-pane">
              <p>{product.description || "Aucune description disponible."}</p>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="tab-pane">
              {product.specifications?.length > 0 ? (
                <table className="specs-table">
                  <tbody>
                    {product.specifications.map((spec, i) => (
                      <tr key={i}>
                        <td>{spec.label}</td>
                        <td>{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Aucune caractéristique disponible.</p>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="tab-pane">
              
              {/* Résumé des notes */}
              {reviews.length > 0 && (
                <div className="rating-summary">
                  <div className="average-score">
                    <span className="big-number">{averageRating.toFixed(1)}</span>
                    <div className="stars">{renderStars(averageRating)}</div>
                    <span className="total-reviews">{reviews.length} avis</span>
                  </div>
                  <div className="rating-bars">
                    {[5, 4, 3, 2, 1].map(star => {
                      const count = getRatingDistribution()[star];
                      const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                      return (
                        <div key={star} className="rating-bar">
                          <span className="star-label">{star}★</span>
                          <div className="bar-bg">
                            <div className="bar-fill" style={{ width: `${percent}%` }}></div>
                          </div>
                          <span className="bar-count">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Message de succès */}
              {reviewSuccess && (
                <div className="review-success">
                  ✅ Merci pour votre avis !
                </div>
              )}

              {/* Liste des avis */}
              {reviews.length === 0 && <p>Aucun avis pour le moment. Soyez le premier !</p>}
              
              <div className="reviews-list-compact">
                {reviews.map(review => {
                  const isExpanded = expandedReviews[review._id];
                  const isLongComment = review.comment.length > 150;
                  
                  return (
                    <div key={review._id} className="review-card">
                      {/* Étoiles + Nom + Date sur une ligne */}
                      <div className="review-meta">
                        <span className="review-stars-inline">
                          {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                        </span>
                        <span className="review-author">{review.name}</span>
                        <span className="review-separator">-</span>
                        <span className="review-date-inline">
                          {new Date(review.date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      
                      {/* Commentaire - UNE SEULE FOIS */}
                      <p className="review-text">
                        {isLongComment && !isExpanded
                          ? review.comment.substring(0, 150) + '...'
                          : review.comment}
                      </p>
                      
                      {/* Bouton Voir plus/moins */}
                      {isLongComment && (
                        <button 
                          className="see-more-btn"
                          onClick={() => toggleExpandReview(review._id)}
                        >
                          {isExpanded ? 'Voir moins' : 'Voir plus'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <button className="write-review-btn" onClick={() => setShowReviewForm(!showReviewForm)}>
                ✍️ Écrire un avis
              </button>

              {showReviewForm && (
                <div className="review-form">
                  <input
                    type="text"
                    placeholder="Votre nom"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                  />
                  <textarea
                    placeholder="Votre avis"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                  
                  {/* Étoiles cliquables */}
                  <div className="star-selector">
                    <span>Votre note :</span>
                    {[1, 2, 3, 4, 5].map(star => (
                      <span
                        key={star}
                        className={`clickable-star ${star <= reviewRating ? 'selected' : ''}`}
                        onClick={() => setReviewRating(star)}
                      >
                        {star <= reviewRating ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                  
                  <button onClick={submitReview} className="submit-review-btn">
                    Envoyer mon avis
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Produits similaires */}
      {relatedProducts.length > 0 && (
        <div className="related-products">
          <h2>Produits similaires</h2>
          <div className="related-grid">
            {relatedProducts.map(item => (
              <Link key={item._id} href={`/products/${item._id}`} className="related-card">
                <div className="related-image">
                  <Image
                    src={item.image || "/no-image.png"}
                    alt={item.name}
                    width={200}
                    height={200}
                  />
                </div>
                <h3>{item.name}</h3>
                <p className="related-price">{Number(item.promoPrice || item.price).toLocaleString()} Ar</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}