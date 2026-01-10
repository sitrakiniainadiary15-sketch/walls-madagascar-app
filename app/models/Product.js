import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  brand: {
    type: String, // Pull & Bear
  },

  price: {
    type: Number,
    required: true,
  },

  promoPrice: {
    type: Number,
  },

  size: {
    type: String, // S, M, L
  },

  condition: {
    type: String, // Neuf, Bon état
  },

  description: {
    type: String,
  },

  image: {
    type: String,
    required: true,
  },

  images: [
    {
      type: String,
    },
  ],

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },

  stock: {
    type: Number,
    default: 0,
  },

  isAvailable: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
