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
    // Image principale
    image: {
      type: String,
      default: "",
    },
    // Galerie d'images
    images: [{
      type: String,
    }],
    // ✅ IDs Cloudinary pour suppression
    imagePublicIds: [{
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
    size: {
      type: String,
      default: "",
    },
    condition: {
      type: String,
      default: "",
    },
    specifications: [{
      label: String,
      value: String,
    }],
    sizes: [{
      type: String,
    }],
    colors: [{
      name: String,
      code: String,
    }],
    weight: {
      type: Number,
      default: 0,
    },
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
// ✅ NOUVEAU — async/await, sans "next"
ProductSchema.pre("save", async function () {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      + "-" + Date.now();
  }
});

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);