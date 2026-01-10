import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    customer: {
      firstname: { type: String, required: true },
      lastname: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
      city: { type: String, required: true },
      address: { type: String, required: true },
    },

    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],

    total: { type: Number, required: true },

    payment: {
      type: String,
      default: "cash",
    },

    delivery: {
      type: String,
      default: "standard",
    },

    status: {
      type: String,
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order ||
  mongoose.model("Order", OrderSchema);
