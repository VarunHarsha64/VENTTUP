const mongoose = require('mongoose');

const itemsSchema = new mongoose.Schema({
  item: { 
    type: String, 
    required: true, 
    trim: true // Remove whitespace
  },
  description: { 
    type: String, 
    required: true, 
    trim: true // Remove whitespace
  },
  image: { 
    type: String, 
    required: true,
  },
}, {
  timestamps: true, // Add createdAt and updatedAt fields
});

module.exports = mongoose.model("Items", itemsSchema);
