"use client";
import { useEffect, useState } from "react";

export default function StarRating({ productId }) {
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch(`/api/reviews?productId=${productId}`);
        const reviews = await res.json();
        
        if (reviews.length > 0) {
          const total = reviews.reduce((sum, r) => sum + r.rating, 0);
          setAverage(total / reviews.length);
          setCount(reviews.length);
        }
      } catch (err) {
        console.error("Erreur chargement avis:", err);
      }
    }
    fetchReviews();
  }, [productId]);

  // Générer les étoiles
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(average)) {
        // Étoile pleine
        stars.push(<span key={i} className="star filled">★</span>);
      } else if (i - 0.5 <= average) {
        // Demi-étoile
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        // Étoile vide
        stars.push(<span key={i} className="star empty">☆</span>);
      }
    }
    return stars;
  };

  return (
    <div className="star-rating">
      <span className="stars">{renderStars()}</span>
      <span className="count">({count} avis)</span>
    </div>
  );
}
