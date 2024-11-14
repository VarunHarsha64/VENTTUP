const Order = require("../models/Order");
const Items = require("../models/Items");
const User = require("../models/User");
// const { v4: uuidv4 } = require("uuid");
const cloudinary = require("../config/cloudinary");
const multer = require("multer");
const { Readable } = require("stream");
const { default: mongoose } = require("mongoose");

exports.fetchItems = async (req, res) => {
  try {
    let response = await Items.find();
    console.log(response);
    res.status(200).json(response);
  } catch (err) {
    res.status(500).send("Unable to fetch items");
  }
};

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
exports.upload = upload;

exports.placeOrder = async (req, res) => {
  // gate 0
  const { businessName, item, userId } = req.body;
  const document = req.file;
  console.log(businessName, item, userId, 'hi');
  try {
    let documentLink = "";

    if (document) {
      // Convert buffer to stream
      const bufferStream = new Readable();
      bufferStream.push(document.buffer);
      bufferStream.push(null); // End the stream

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "raw" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        bufferStream.pipe(uploadStream);
      });
      documentLink = result.secure_url;
    }

    const dateNo = new Date();
    const day = String(dateNo.getDate()).padStart(2, "0"); // Add leading zero if needed
    const month = String(dateNo.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const year = dateNo.getFullYear();

    const id = new mongoose.Types.ObjectId(userId);

    await Order.create({
      userId: id,
      businessName,
      purchaseOrder: "TBD", //default value of purchase order is TBD
      item,
      date: `${day}-${month}-${year}`,
      gate: 0,
      documentVerified: false,
      documentLink,
      status: "Order Placed",
      vendor: null,
    });

    res.status(200).json({ message: "Order placed successfully" });
  } catch (err) {
    console.log(err, "testing");
    res.status(500).json({ message: "Unable to place order" });
  }
};

exports.getUnapprovedOrders = async (req, res) => {
  try {
    // Fetch all orders where status is "Order Placed"
    const placedOrders = await Order.find({
      status: { $nin: ["Receipt Confirmed", "Order Dispatched", "Declined"] },
    });

    if (placedOrders.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders with 'Order Placed' status found." });
    }
    res.status(200).json(placedOrders);
  } catch (err) {
    console.error("Error fetching orders with 'Order Placed' status:", err);
    res
      .status(500)
      .json({ message: "Could not fetch placed orders", error: err.message });
  }
};

exports.enquireVendor = async (req, res) => {
  const { orderId, vendorId } = req.body;

  try {
    const order = await Order.findOne({ _id: orderId });
    const id = new mongoose.Types.ObjectId(vendorId);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    await Order.updateOne(
      { _id: orderId },
      {
        $set: {
          gate: 0.5,
          status: "Vendor Enquired",
          vendor: id, // Set the assigned vendor's ID
        }
      }
    );

    res.status(200).json({ message: "Vendor enquired for order", orderId });
  } catch (err) {
    console.error("Error enquiring vendor:", err);
    res.status(500).json({ message: "Cannot enquire with vendor" });
  }
};

exports.acceptOrderVendor = async (req, res) => {
  const { orderId } = req.body;

  console.log(orderId);
  // Check if orderId is provided
  if (!orderId) {
    return res.status(400).json({ message: "Order ID is required." });
  }

  // Convert orderId to ObjectId if it's passed as a string
  let orderObjectId;
  try {
    orderObjectId = new mongoose.Types.ObjectId(orderId);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Invalid Order ID format." });
  }

  console.log(orderObjectId);

  try {
    // Find the order by its ObjectId
    const order = await Order.findById(orderObjectId);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Check if the order is already approved
    if (order.status === "Vendor Approved") {
      return res.status(400).json({ message: "Order is already approved." });
    }

    // Update the order status and increment the gate number
    const result = await Order.findByIdAndUpdate(
      orderObjectId,
      { $set: { status: "Vendor Approved", gate: 1 } },
      { new: true } // Return the updated document
    );

    // Respond with the updated order
    res.status(200).json({ message: "Approved by vendor", order: result });
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).json({ message: "Error updating order." });
  }
};

exports.declineOrderVendor = async (req, res) => {
  const { orderId } = req.body;

  // Check if orderId is provided
  if (!orderId) {
    return res.status(400).json({ message: "Order ID is required." });
  }

  // Convert orderId to ObjectId if it's passed as a string
  let orderObjectId;
  try {
    orderObjectId = mongoose.Types.ObjectId(orderId);
  } catch (error) {
    return res.status(400).json({ message: "Invalid Order ID format." });
  }

  try {
    // Find the order by its ObjectId
    const order = await Order.findById(orderObjectId);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Check if the order is already declined
    if (order.status === "Declined") {
      return res.status(400).json({ message: "Order is already declined." });
    }

    // Update the order status to "Declined"
    const result = await Order.findByIdAndUpdate(
      orderObjectId,
      { $set: { status: "Declined" } },
      { new: true } // Return the updated document
    );

    // Respond with the updated order
    res
      .status(200)
      .json({ message: "Order declined successfully.", order: result });
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).json({ message: "Error declining order." });
  }
};

// exports.approveOrder = async (req, res) => {
//   // gate 2
//   const { orderId } = req.body;
//   try {
//     await Order.updateOne(
//       { _id: orderId },
//       { $set: { status: "PO Issued" }, $inc: { gate: 1 } }
//     );
//     res.status(200).send("Order approved");
//   } catch (err) {
//     res.status(500).send("Cannot approve order");
//   }
// };

exports.dataSheetVerification = async (req, res) => {
  // gate 3
  const { orderId } = req.body;

  try {
    await Order.updateOne(
      { _id: orderId },
      { $set: { status: "Data Sheet Verified", gate: 2 } }
    );
  } catch (err) {
    res.status(500).send("Error while verifying");
  }
};

exports.inspection = async (req, res) => {
  // gate 5
  const { orderId, value } = req.body; // orderId and value are passed from frontend
  //value can have three values - "to be done", "completed", "not required"

  try {
    await Order.updateOne(
      { _id: orderId },
      {
        $set: { inspection: value, status: "Order Inspection", gate: 5 },
      }
    );
    res.status("Request sent");
  } catch (err) {
    res.status(500).send("Error while processing request");
  }
};

exports.dispatch = async (req, res) => {
  // gate 6
  const { orderId } = req.body;

  try {
    await Order.updateOne(
      { _id: orderId },
      { $set: { status: "Order Dispatched", gate: 6 } }
    );
    res.status(200).send("Dispatched");
  } catch (err) {
    res.status(500).send("Error while dispatching");
  }
};

exports.doPayment = async (req, res) => {
  // gate 7
  const { orderId } = req.body;
  console.log(orderId);
  try {
    await Order.updateOne(
      { _id: orderId },
      { $set: { status: "Receipt Confirmed", gate: 7 }}
    );
    res.status(200).send("Confirm Receipt");
  } catch (err) {
    res.status(200).send("Cannot confirm receipt");
  }
};

exports.trackOrder = async (req, res) => {
  // tracking purposes
  const { orderId } = req.query;

  try {
    let gateNumber = await Order.find({ _id: orderId }, { gate: 1 });
    res.status(200).json(gateNumber);
  } catch (err) {
    res.status(500).send("Unable to fetch gate");
  }
};

exports.fetchOrdersCustomer = async (req, res) => {
  const { userId } = req.query;
  console.log(userId)
  try {
    // Build the query to fetch orders based on businessName and userId
    const id = new mongoose.Types.ObjectId(userId);
    const query = {
      userId: id,
    };

    const orders = await Order.find(query, {
      item: 1,
      gate: 1,
      status: 1,
      businessName: 1,
      date: 1,
      _id: 1,
    });

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).send("Unable to fetch orders");
  }
};

exports.fetchDispatchedOrders = async (req, res) => {
  const { userId } = req.query;

  try {
    // Build the query to fetch orders based on businessName and userId
    const id = new mongoose.Types.ObjectId(userId);
    const query = {
      userId: id,
      gate: 6
    };

    const orders = await Order.find(query, {
      item: 1,
      gate: 1,
      status: 1,
      businessName: 1,
      date: 1,
      _id: 1,
    });

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).send("Unable to fetch orders");
  }
};

exports.getgate4 = async (req, res) => {
  try {
    let response = await Order.find(
      { gate: 4 },
      { businessName: 1, item: 1, date: 1, _id: 1, vendor: 1 }
    );
    res.status(200).json(response);
  } catch (err) {
    res.status(500).send("Unable to fetch");
  }
};

exports.orderHistoryAdmin = async (req, res) => {
  try {
    let response = await Order.find();
    res.status(200).json(response);
  } catch (err) {
    res.status(500).send("Could not fetch data");
  }
};

exports.orderHistoryCustomer = async (req, res) => {
  const { businessName, userId } = req.body; // Get businessName from query parameters

  try {
    // Build the query to fetch orders based on businessName and userId
    const id = new mongoose.Types.ObjectId(userId);
    const query = {
      userId: id,
    };

    // if (businessName) {
    //   query.businessName = businessName; // Add businessName to the query if provided
    // }
    // console.log(query);

    console.log(query);

    const orders = await Order.find(query, {
      item: 1,
      gate: 1,
      status: 1,
      businessName: 1,
      date: 1,
      _id: 1,
    });

    console.log(orders);
    if (orders.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders found for this customer." });
    }

    res.status(200).json(orders);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res
      .status(500)
      .json({ message: "Could not fetch data", error: err.message });
  }
};

exports.orderHistoryVendor = async (req, res) => {
  const { userId } = req.body;

  const id = new mongoose.Types.ObjectId(userId);
  try {
    let response = await Order.find({ vendor: id});
    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch data" });
  }
};

exports.activeOrdersVendor = async (req, res) => {
  const { userId } = req.body;

  const id = new mongoose.Types.ObjectId(userId);
  console.log(id,"rohit");

  try {
    let response = await Order.find(
      {
        vendor: id,
        status: { $nin: ["Receipt Confirmed"] },
      }
    );
    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch data" });
  }
};

exports.getVendorApprovalOrders = async (req, res) => {
  const { vendorId } = req.body;
  console.log(vendorId, 'getVendorApprovalOrders');

  
  try {
    const id = new mongoose.Types.ObjectId(vendorId);
    console.log(id);

    const vendorEnquiredOrders = await Order.find({ vendor: id, status: { $nin: ["Receipt Confirmed", "Order Dispatched", "Declined"] } });

    console.log(vendorEnquiredOrders);
    
    // Check if any orders are found
    if (!vendorEnquiredOrders || vendorEnquiredOrders.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders found with status 'Vendor Enquired'" });
    }

    // Respond with the list of orders if found
    res.status(200).json(vendorEnquiredOrders);
  } catch (error) {
    console.error("Error fetching vendor approval orders:", error);
    res.status(500).json({ message: "Error fetching vendor approval orders" });
  }
};

exports.getOrdersWithPendingDatasheet = async (req, res) => {
  try {
    // Fetch all orders where dataSheetStatus is "Pending"
    const pendingDatasheetOrders = await Order.find(
      { dataSheetStatus: "Pending" } // Specify fields to return
    );

    if (!pendingDatasheetOrders || pendingDatasheetOrders.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders with pending datasheet found." });
    }

    res.status(200).json(pendingDatasheetOrders);
  } catch (err) {
    console.error("Error fetching orders with pending datasheet:", err);
    res
      .status(500)
      .json({ message: "Error fetching pending datasheet orders" });
  }
};

exports.handleDatasheetUpload = async (req, res) => {
  // Gate 0
  const { orderId } = req.body; // Assuming orderId is passed in the body to find the order
  const document = req.file; // Multer handles the file upload

  if (!document) {
    return res.status(400).send("No datasheet file provided.");
  }

  try {
    // Convert buffer to stream for Cloudinary
    const bufferStream = new Readable();
    bufferStream.push(document.buffer);
    bufferStream.push(null); // End the stream

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "raw" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      bufferStream.pipe(uploadStream);
    });

    // Get the Cloudinary URL for the datasheet
    const datasheetLink = result.secure_url;

    // Find the order and update it
    const order = await Order.findOneAndUpdate(
      { _id: orderId }, // Find the order by orderId
      {
        datasheet: datasheetLink, // Store the Cloudinary link in the datasheet field
        dataSheetStatus: "Received", // Update the datasheet status
      },
      { new: true } // Return the updated order
    );

    if (!order) {
      return res.status(404).send("Order not found.");
    }

    // Successfully updated the order
    res.status(200).json({
      message: "Datasheet uploaded and order updated successfully.",
      order, // Return the updated order object
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to upload datasheet." });
  }
};