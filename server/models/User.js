const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  phoneNo: { type: String, required: true },
  role: { 
    type: String, 
    required: true,
    enum: ["admin", "vendor", "customer"] // Only allows these three values
  },
  address: { type: String, required: true }
});

module.exports = mongoose.model("User", userSchema);
