const express = require("express");
const { test, addItem, upload, deleteItem, manufacturingClearance, issuePO, fetchAllVendors } = require("../controllers/adminController");
const router = express.Router();

router.get("/test", test);

router.post("/addItem", upload.single("image"), addItem);
router.post("/manufacturingClearance", manufacturingClearance);
router.post("/issuePO", upload.single("file"), issuePO);
router.delete("/deleteItem",deleteItem);
router.get("/fetchAllVendors", fetchAllVendors);



module.exports = router;
