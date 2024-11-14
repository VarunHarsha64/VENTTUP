const express = require("express");
const router = express.Router();
const {
  placeOrder,
  orderHistoryAdmin,
  orderHistoryCustomer,
  orderHistoryVendor,
  fetchItems,
  enquireVendor,
  declineOrderVendor,
  acceptOrderVendor,
  inspection,
  dispatch,
  dataSheetVerification,
  upload,
  trackOrder,
  getUnapprovedOrders,
  fetchOrdersCustomer,
  getVendorApprovalOrders,
  getOrdersWithPendingDatasheet,
  handleDatasheetUpload,
  doPayment,
  fetchDispatchedOrders,
  activeOrdersVendor
} = require("../controllers/orderController");

router.get("/fetchItems", fetchItems);
// router.post("/changeOrderStatus", changeOrderStatus);
router.get("/getUnapprovedOrders", getUnapprovedOrders);
router.post("/placeOrder",upload.single('document') ,placeOrder);
// router.post("/approveOrder", approveOrder);
router.post("/enquireVendor", enquireVendor);
router.post("/fetchVendorApprovalOrders", getVendorApprovalOrders);
router.get("/fetchPendingDatasheetOrders", getOrdersWithPendingDatasheet)
router.post("/acceptOrderVendor", acceptOrderVendor);
router.post("/declineOrderVendor", declineOrderVendor);
router.post("/datasheetUpload", upload.single("document"),handleDatasheetUpload)
router.post("/dataSheetVerification", dataSheetVerification);
router.post("/inspection", inspection);
router.post("/dispatch", dispatch);
router.get("/trackOrder", trackOrder);
router.get("/fetchOrdersCustomer", fetchOrdersCustomer);
router.get("/fetchDispatchedOrders", fetchDispatchedOrders);
router.get("/orderHistoryCustomer", orderHistoryCustomer);
router.post("/activeOrdersVendor", activeOrdersVendor);
router.get("/orderHistoryAdmin", orderHistoryAdmin);
router.post("/orderHistoryCustomer", orderHistoryCustomer);
router.post("/orderHistoryVendor", orderHistoryVendor);
router.post("/orderHistoryAdmin", orderHistoryAdmin);
router.post("/doPayment", doPayment);

module.exports = router;
