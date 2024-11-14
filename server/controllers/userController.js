const User = require("../models/User");
const UnverifiedUser = require("../models/UnverifiedUser");
const { default: mongoose } = require("mongoose");

exports.unverifiedList = async (req, res) => {
  try {
    let response = await UnverifiedUser.find();
    res.status(200).json(response);
  } catch (err) {
    res.status(500).send("Unable to fetch data");
  }
};

exports.verifyUser = async (req, res) => {
  const { userId, action } = req.body;
  const _id = new mongoose.Types.ObjectId(userId);
  try {
    let response = await UnverifiedUser.find({ _id });
    if (action == "verify") {
      await User.create({
        businessName: response[0].businessName,
        username: response[0].username,
        password: response[0].password,
        phoneNo: response[0].phoneNo,
        role: response[0].role,
        address: response[0].address,
      });
    }
    await UnverifiedUser.deleteOne({ _id: userId });
  } catch (err) {
    res.status(500).send("Unable to verify");
  }
};

exports.createVendor = async (req, res) => {
  const { username, password, businessName, address, phoneNo } = req.body;

  try {
    await User.create({
      businessName,
      username,
      password,
      phoneNo,
      role: "vendor",
      address,
    });
    res.status(200).send("Created Vendor account");
  } catch (err) {
    res.status(500).send("Unable to create create vendor");
  }
};

exports.fetchVendors = async (req, res) => {
  try {
    let response = await User.find({ role: "vendor" }, { businessName: 1 });
    res.status(200).json(response);
  } catch (err) {
    res.status(500).send("Unable to fetch vendors");
  }
};

exports.chooseVendor = async (req, res) => {
  const { orderId, vendor } = req.body;

  try {
    await Order.updateOne({ _id: orderId }, { $set: { vendor: vendor } });
    res.status(200).send("Vendor selected");
  } catch (err) {
    res.status(500).send("Unable to choose vendor");
  }
};
