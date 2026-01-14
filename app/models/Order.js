// app/models/Order.js
import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    customer: {
      firstname: String,
      lastname: String,
      email: String,
      phone: String,
      city: String,
      address: String,
    },

    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: Number,
      },
    ],

    total: Number,

    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
