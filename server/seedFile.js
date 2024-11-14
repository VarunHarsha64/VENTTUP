// Required packages
const axios = require('axios');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Import models
const Users = require('./models/User');
const Items = require('./models/Items.js');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

// Clear MongoDB database
const clearDatabase = async () => {
  try {
    await mongoose.connection.dropDatabase();
    console.log("Database cleared");
  } catch (error) {
    console.error("Error clearing database:", error);
  }
};

// Clear Cloudinary folder
const clearCloudinaryFolder = async (folderName) => {
  try {
    const { resources } = await cloudinary.search
      .expression(`folder:${folderName}`)
      .execute();
    
    for (const file of resources) {
      await cloudinary.uploader.destroy(file.public_id);
      console.log(`Deleted ${file.public_id} from Cloudinary`);
    }
    console.log(`Cloudinary folder "${folderName}" cleared`);
  } catch (error) {
    console.error("Error clearing Cloudinary folder:", error);
  }
};

// Seed Users function
const seedUsers = async () => {
  try {
    const adminPassword = await bcrypt.hash("adminpassword", 10);
    const vendorPassword = await bcrypt.hash("vendorpassword", 10);
    const customerPassword = await bcrypt.hash("customerpassword", 10);

    const users = [
      {
        businessName: "Admin Business",
        username: "adminuser",
        password: adminPassword,
        phoneNo: "1234567890",
        role: "admin",
        address: "Admin Address",
      },
      {
        businessName: "Vendor Business",
        username: "vendoruser",
        password: vendorPassword,
        phoneNo: "0987654321",
        role: "vendor",
        address: "Vendor Address",
      },
      {
        businessName: "Customer Business",
        username: "customeruser",
        password: customerPassword,
        phoneNo: "1122334455",
        role: "customer",
        address: "Customer Address",
      },
    ];

    await Users.insertMany(users);
    console.log("Users seeded successfully");
  } catch (error) {
    console.error("Error seeding users:", error);
  }
};

// Mock orders data
const mockOrders = [
    { id: 1, name: "Conductors", description: "Description of Conductors", image: "venttup_images/image_4.png" },
    { id: 2, name: "Insulators", description: "Description of Insulators", image: "venttup_images/image_5.png" },
    { id: 3, name: "LV/MV/HV Cables", description: "Description of LV/MV/HV Cables", image: "venttup_images/image_6.png" },
    { id: 4, name: "LT/HT Panels", description: "Description of LT/HT Panels", image: "venttup_images/image_7.png" },
    { id: 5, name: "LT Transformers", description: "Description of LT Transformers", image: "venttup_images/image_8.png" },
    { id: 6, name: "Structural Items", description: "Description of Structural Items", image: "venttup_images/image_9.png" },
    { id: 7, name: "Battery & Chargers", description: "Description of Battery & Chargers", image: "venttup_images/image_10.png" },
    { id: 8, name: "All other Items (Energy Sector)", description: "Description of Other Items in Energy Sector", image: "venttup_images/image_11.png" },
    { id: 9, name: "Cement", description: "Description of Cement", image: "venttup_images/image_12.png" },
    { id: 10, name: "TMT Bars", description: "Description of TMT Bars", image: "venttup_images/image_13.png" },
    { id: 11, name: "Coarse Aggregates", description: "Description of Coarse Aggregates", image: "venttup_images/image_14.png" },
    { id: 12, name: "Bricks", description: "Description of Bricks", image: "venttup_images/image_15.png" },
    { id: 13, name: "Paving Blocks", description: "Description of Paving Blocks", image: "venttup_images/image_16.png" },
    { id: 14, name: "Plumbing & Wiring", description: "Description of Plumbing & Wiring", image: "venttup_images/image_17.png" },
    { id: 15, name: "Sanitary Fitting", description: "Description of Sanitary Fitting", image: "venttup_images/image_18.png" },
    { id: 16, name: "Other Items (Construction Materials)", description: "Description of Other Construction Materials", image: "venttup_images/image_19.png" },
    { id: 17, name: "Square & Round Bars", description: "Description of Square & Round Bars", image: "venttup_images/image_20.png" },
    { id: 18, name: "Machined & Turned Parts", description: "Description of Machined & Turned Parts", image: "venttup_images/image_21.png" },
    { id: 19, name: "Aluminium & Copper Busbars", description: "Description of Aluminium & Copper Busbars", image: "venttup_images/image_22.png" },
    { id: 20, name: "Other Mechanical Components", description: "Description of Other Mechanical Components", image: "venttup_images/image_23.png" },
    { id: 21, name: "Office Stationeries", description: "Description of Office Stationeries", image: "venttup_images/image_24.png" },
    { id: 22, name: "Furniture", description: "Description of Furniture", image: "venttup_images/image_25.png" },
    { id: 23, name: "Safety Materials", description: "Description of Safety Materials", image: "venttup_images/image_26.png" },
    { id: 24, name: "Other Indirect Materials", description: "Description of Other Indirect Materials", image: "venttup_images/image_27.png" },
  ];

// Seed Items function
const seedItems = async () => {
  for (const order of mockOrders) {
    try {
      const imagePath = path.join(__dirname, order.image);
      
      // Upload image to Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(imagePath, {
        folder: 'order-items',
      });
      
      // Save order to the database
      const newItem = new Items({
        item: order.name,
        description: order.description,
        image: uploadResponse.secure_url,
      });
      
      await newItem.save();
      console.log(`Item ${order.name} saved successfully!`);
      
    } catch (error) {
      console.error(`Error saving item ${order.name}:`, error);
    }
  }
};

// Seed database function
const seedDatabase = async () => {
  await connectDB();
  await clearDatabase();
  await clearCloudinaryFolder('order-items'); // Replace with your Cloudinary folder name
  await seedUsers();
  await seedItems();
  mongoose.connection.close();
};

seedDatabase();
