// app/models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Le nom est obligatoire"],
      trim: true,
      minlength: [2, "Le nom doit contenir au moins 2 caractères"],
      maxlength: [50, "Le nom ne peut pas dépasser 50 caractères"],
    },
    
    email: {
      type: String,
      required: [true, "L'email est obligatoire"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Email invalide"],
    },
    
    password: {
      type: String,
      required: [true, "Le mot de passe est obligatoire"],
      minlength: [6, "Le mot de passe doit contenir au moins 6 caractères"],
    },
    
    role: {
      type: String,
      enum: ["customer", "admin", "user"],
      default: "customer",
    },

    // 🆕 CHAMPS DE VÉRIFICATION EMAIL
    emailVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: {
      type: String,
      default: null,
    },

    verificationTokenExpiry: {
      type: Date,
      default: null,
    },

    // 🆕 CHAMPS DE RESET PASSWORD
    resetToken: {
      type: String,
      default: null,
    },

    resetTokenExpiry: {
      type: Date,
      default: null,
    },

    // 🆕 SÉCURITÉ & LOGS
    lastLoginIP: {
      type: String,
      default: null,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    accountLockedUntil: {
      type: Date,
      default: null,
    },

    // 🆕 HISTORIQUE PASSWORDS
    passwordHistory: [{
      type: String,
    }],

    // Infos supplémentaires
    phone: {
      type: String,
      default: null,
    },

    address: {
      street: String,
      city: String,
      postalCode: String,
      country: String,
    },

    // Préférences
    newsletter: {
      type: Boolean,
      default: false,
    },

    language: {
      type: String,
      default: "fr",
    },

    // ✅ AVATAR CLOUDINARY (bien placé DANS le schéma)
    avatar: {
      type: String,
      default: null,
    },

    avatarPublicId: {
      type: String,
      default: null,
    },

  }, // ✅ Fermeture correcte de l'objet
  { 
    timestamps: true
  }
  // ✅ Fermeture correcte du Schema
);

// 🔍 Index pour améliorer les performances
UserSchema.index({ email: 1 });
UserSchema.index({ verificationToken: 1 });
UserSchema.index({ resetToken: 1 });

export default mongoose.models.User || mongoose.model("User", UserSchema);