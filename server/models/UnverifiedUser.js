const mongoose = require("mongoose");

const unverifiedUsersSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  phoneNo: { type: String, required: true },
  role: { type: String, required: true },
  address: { type: String, required: true },
});

module.exports = mongoose.model("UnverifiedUsers", unverifiedUsersSchema);
