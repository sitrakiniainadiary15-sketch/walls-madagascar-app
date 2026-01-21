// app/models/Customer.js
import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // ✅ suffit pour l’index email
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },

    // Statistiques
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },

    // Statut
    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },

    // Notes admin
    notes: {
      type: String,
      default: "",
    },

    // Dernière commande
    lastOrderAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// ✅ Index texte (OK)
CustomerSchema.index({
  firstname: "text",
  lastname: "text",
  email: "text",
});

export default mongoose.models.Customer ||
  mongoose.model("Customer", CustomerSchema);
