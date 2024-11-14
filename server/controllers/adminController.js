const Order = require("../models/Order");
const Items = require("../models/Items");
const User = require("../models/User");
const multer = require("multer");
const path = require("path");
const cloudinary = require("../config/cloudinary.js");
const streamifier = require("streamifier");

// Configure multer for file uploads
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Allowed file types
    const filetypes = /jpeg|jpg|png|pdf/;
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error("Only PDF and image files are allowed!"), false); // Reject the file
    }
  },
});

exports.upload = upload;

exports.test = async (req, res) => {
  try {
    res.json({ messsage: "Testing route is successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addItem = async (req, res) => {
  try {
    const { item, description } = req.body;

    // Check if an image file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "Upload image also bro!" });
    }

    // Check if item name and description are provided
    if (!item || !description) {
      return res
        .status(400)
        .json({ message: "Item name and description are compulsory bro." });
    }

    // Create a stream from the buffer and upload to Cloudinary
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "order-items",
        resource_type: "image",
      },
      async (error, uploadResponse) => {
        if (error) {
          return res
            .status(500)
            .json({ message: "Image upload failed", error: error.message });
        }

        // Save new item to the database
        const newItem = new Items({
          item: item,
          description: description,
          image: uploadResponse.secure_url,
        });

        await newItem.save();
        console.log(`Item ${item} saved successfully!`);
        return res.status(201).json(newItem);
      }
    );

    // Pipe the file buffer to the Cloudinary upload stream
    streamifier.createReadStream(req.file.buffer).pipe(stream);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

exports.issuePO = async (req, res) => {
  //gate 2

  try {
    const { orderId } = req.body; // _id is stored in orderId
    // Check if a PDF file was uploaded
    if (!req.file) {
      console.log('error here 1');
      return res.status(400).json({ message: "Please upload a PDF file." });
      
    }

    // Check if the uploaded file is a PDF
    if (req.file.mimetype !== "application/pdf") {
      console.log('error here 2');
      return res.status(400).json({ message: "Only PDF files are allowed." });
    }

    // Check if orderId is provided
    if (!orderId) {
      console.log('error here 3');
      return res.status(400).json({ message: "Order ID is required." });
    }

    // Create a stream from the buffer and upload to Cloudinary
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "purchase-orders",
        resource_type: "raw", // Use "raw" for non-image files
      },
      async (error, uploadResponse) => {
        if (error) {
          return res
            .status(500)
            .json({ message: "PDF upload failed", error: error.message });
        }

        // Update order with the PDF file URL
        await Order.updateOne(
          { _id: orderId },
          {
            $set: { purchaseOrder: uploadResponse.secure_url, status: "PO Issued", gate:3 },

          }
        );

        console.log(`PDF for Order ${orderId} uploaded successfully!`);
        return res.status(201).json({
          message: "PDF uploaded successfully",
          url: uploadResponse.secure_url,
        });
      }
    );

    // Pipe the file buffer to the Cloudinary upload stream
    streamifier.createReadStream(req.file.buffer).pipe(stream);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

exports.manufacturingClearance = async (req, res) => {
  // gate 4
  const { orderId } = req.body;

  try {
    await Order.updateOne(
      { _id: orderId },
      { $set: { status: "Manufacturing" , gate: 4}}
    );
    res.status(200).send("Manufacturing clearance given");
  } catch (err) {
    res.status(500).send("Error while giving manufacturing clearance");
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.body;
    console.log(id);

    const itemToDelete = await Items.findById(id);
    if (!itemToDelete) {
      return res.status(404).json({ message: "Item not found" });
    }

    console.log("test1");
    const publicId = itemToDelete.image.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(publicId);
    console.log("test2");
    await Items.findByIdAndDelete(id);
    console.log("test3");
    return res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    return res
      .status(500)
      .json({ message: "Failed to delete item", error: error.message });
  }
};

exports.fetchAllVendors = async (req,res) => {
  try {
    // Query the database for users with the role of "vendor"
    const vendors = await User.find({ role: "vendor" });

    if (vendors.length === 0) {
      return res.status(404).json({ message: "No vendors available" });
    }
    res.status(200).json(vendors);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    throw error; // Re-throw error for further handling if needed
  }
};
