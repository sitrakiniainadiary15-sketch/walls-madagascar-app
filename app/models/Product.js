// app/models/Product.js

import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
    // ✅ Image principale
    image: {
      type: String,
      default: "",
    },
    // ✅ NOUVEAU : Galerie d'images
    images: [{
      type: String,
    }],
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    promoPrice: {
      type: Number,
      default: null,
    },
    stock: {
      type: Number,
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    brand: {
      type: String,
      default: "",
    },
    // ✅ NOUVEAU : Caractéristiques
    specifications: [{
      label: String,
      value: String,
    }],
    // ✅ NOUVEAU : Tailles disponibles
    sizes: [{
      type: String,
    }],
    // ✅ NOUVEAU : Couleurs disponibles
    colors: [{
      name: String,
      code: String, // code hex
    }],
    // ✅ NOUVEAU : Poids pour livraison
    weight: {
      type: Number,
      default: 0,
    },
    // ✅ NOUVEAU : Note moyenne
    rating: {
      type: Number,
      default: 0,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Générer le slug automatiquement
ProductSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);