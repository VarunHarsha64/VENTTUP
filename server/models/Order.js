const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  // orderId: { type: String, required: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, // References the customer placing the order
  businessName: { type: String, required: true }, //business name of customer
  item: { type: String, required: true }, // item name
  date: { type: String, required: true }, // to store date of placing the order
  gate: { type: Number, required: true },
  documentVerified: { type: String, required: true, enum: ["true", "false"] }, // data sheet verification
  purchaseOrder: { type: String, required: true }, //issuePO link
  documentLink: { type: String, required: true }, // cloud link
  status: {
    type: String,
    required: true,
    enum: [
      "Order Placed",
      "Vendor Enquired",
      "Vendor Approved",
      "PO Issued",
      "Data Sheet Verified",
      "Manufacturing",
      "Order Inspection",
      "Order Dispatched",
      "Receipt Confirmed",
      "Declined",
    ],
  },
  inspection: {
    type: String,
    enum: ["not required", "to be done", "completed"],
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  datasheet: { type: String },
  dataSheetStatus: {
    type: String,
    required: true,
    enum: ["Pending", "Not Required", "Recieved"],
    default: "Pending",
  },
});

module.exports = mongoose.model("Order", orderSchema);
