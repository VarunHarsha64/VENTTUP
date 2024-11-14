import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Paper,
  FormControl,
} from "@mui/material";
import { useUserContext } from "../context/UserContext";
import axios from "axios";
import toast from "react-hot-toast";
import { Document, Page, pdfjs } from "react-pdf"; // PDF viewer components
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

// Set the workerSrc to load pdf.worker from an appropriate path
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const PendingOrderVendor = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { userDetails, isLoading } = useUserContext();
  const [orders, setOrders] = useState([]);
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);

  useEffect(() => {
    const fetchVendorOrders = async () => {
      try {
        const response = await axios.post(
          "https://venttup-api.onrender.com/api/orders/fetchVendorApprovalOrders",
          {
            vendorId: userDetails.userId,
          },
          {
            headers: {
              Authorization: `Bearer ${userDetails.token}`,
            },
          }
        );
        setOrders(
          response.data.filter((order) =>
            [
              "Order Placed",
              "Vendor Enquired",
              "Vendor Approved",
              "PO Issued",
              "Data Sheet Verified",
              "Manufacturing",
              "Order Inspection",
            ].includes(order.status)
          )
        );
      } catch (error) {
        console.log(error);
        toast.error("Unable to fetch orders.");
      }
    };

    fetchVendorOrders();
  }, [userDetails.token, isLoading]);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleAcceptOrder = async () => {
    if (!selectedOrder) {
      toast.error("Please select an order to accept.");
      return;
    }

    try {
      await axios.post(
        "https://venttup-api.onrender.com/api/orders/acceptOrderVendor",
        {
          orderId: selectedOrder._id,
        },
        {
          headers: {
            Authorization: `Bearer ${userDetails.token}`,
          },
        }
      );

      toast.success("Order approved successfully.");
      setOrders(
        orders.map((order) =>
          order._id === selectedOrder._id
            ? { ...order, status: "Vendor Approved" }
            : order
        )
      );
      setSelectedOrder({ ...selectedOrder, status: "Vendor Approved" });
    } catch (error) {
      console.error(error);
      toast.error("Unable to approve order.");
    }
  };

  const handleDeclineOrder = async () => {
    if (!selectedOrder) {
      toast.error("Please select an order to decline.");
      return;
    }

    try {
      await axios.post(
        "https://venttup-api.onrender.com/api/orders/declineOrderVendor",
        { orderId: selectedOrder._id },
        {
          headers: {
            Authorization: `Bearer ${userDetails.token}`,
          },
        }
      );
      toast.success("Order declined successfully.");
      setOrders(orders.filter((order) => order._id !== selectedOrder._id));
      setSelectedOrder(null);
    } catch (error) {
      console.error(error);
      toast.error("Unable to decline order.");
    }
  };

  const handleUploadDocument = async () => {
    if (!file) {
      toast.error("Please select a document to upload.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("orderId", selectedOrder._id);
      formData.append("document", file);

      await axios.post(
        "https://venttup-api.onrender.com/api/orders/datasheetUpload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${userDetails.token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Document uploaded successfully.");
      setFile(null);
      setSelectedOrder({ ...selectedOrder, datasheet: true });
    } catch (error) {
      console.error(error);
      toast.error("Unable to upload document.");
    }
  };

  // Empty dispatch handler
  const handleDispatch = async() => {
    if (!selectedOrder) {
      toast.error("Error!");
      return;
    }
    try {
      await axios.post(
        "https://venttup-api.onrender.com/api/orders/dispatch",
        { orderId: selectedOrder._id},
        {
          headers: {
            Authorization: `Bearer ${userDetails.token}`,
          },
        }
      );
      toast.success("Dispatch functionality is under construction.");
    } catch (error) {
      toast.error("Unable to Dispatch!");
    }
    
  };

  return !orders.length ? (
    <Typography variant="h4" gutterBottom>
      No Orders Pending Approval!
    </Typography>
  ) : (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Left Section - Orders List */}
      <Box
        sx={{
          width: "40%",
          padding: 2,
          borderRight: "1px solid #ccc",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TextField
          variant="outlined"
          fullWidth
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Typography variant="h6" gutterBottom>
          Orders Pending Approval
        </Typography>
        <Grid container spacing={2}>
          {orders
            .filter((order) =>
              order.item.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((order) => (
              <Grid item xs={12} key={order._id}>
                <Card
                  onClick={() => setSelectedOrder(order)}
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      boxShadow: 3,
                    },
                  }}
                >
                  <CardContent>
                    <Typography variant="h6">{order.item}</Typography>
                    <Typography variant="body2">
                      {order.businessName}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>
      </Box>

      {/* Right Section - Order Details and Actions */}
      <Box
        sx={{
          width: "60%",
          padding: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {selectedOrder ? (
          <Paper
            elevation={3}
            sx={{ padding: 3, borderRadius: 2, width: "80%" }}
          >
            <Typography variant="h5" gutterBottom>
              Order Details: {selectedOrder.item}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {selectedOrder.businessName}
            </Typography>

            {/* PDF Viewer and Download Button */}
            {selectedOrder.documentLink && (
              <Box
                sx={{ width: "100%", height: "300px", overflow: "auto", mb: 2 }}
              >
                <Document
                  file={selectedOrder.documentLink}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                >
                  {Array.from(new Array(numPages), (el, index) => (
                    <Page
                      key={`page_${index + 1}`}
                      pageNumber={index + 1}
                      width={400}
                    />
                  ))}
                </Document>
              </Box>
            )}

            <Button
              variant="contained"
              color="secondary"
              sx={{ mt: 2, width: "100%" }}
              onClick={() => window.open(selectedOrder.documentLink, "_blank")}
            >
              Download Document
            </Button>

            {/* File Upload Section */}
            <FormControl fullWidth sx={{ mt: 3, mb: 2 }}>
              <input type="file" onChange={handleFileChange} />
            </FormControl>

            {/* Upload Document Button */}
            <Button
              variant="contained"
              color="secondary"
              onClick={handleUploadDocument}
              disabled={selectedOrder.dataSheetStatus != "Pending"}
              sx={{ mb: 2, width: "100%" }}
            >
              {selectedOrder.datasheet
                ? "Document Already Uploaded"
                : "Upload Document"}
            </Button>

            {/* Accept and Decline Buttons */}
            <Button
              variant="contained"
              color="primary"
              onClick={handleAcceptOrder}
              disabled={
                selectedOrder.status != "Order Placed" && selectedOrder.status !=
      "Vendor Enquired"
              }
              sx={{ mt: 2, mb: 2, width: "100%" }}
            >
              {selectedOrder.status === "Vendor Approved"
                ? "Already Approved"
                : selectedOrder.status === "Declined"
                  ? "Declined Order"
                  : "Accept Order"}
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeclineOrder}
              sx={{ mb: 2, width: "100%" }}
              disabled={
                selectedOrder.status != "Order Placed" && selectedOrder.status !=
      "Vendor Enquired"
              }
            >
              {selectedOrder.status === "Vendor Approved"
                ? "Already Approved"
                : selectedOrder.status === "Declined"
                  ? "Declined Order"
                  : "Decline Order"}
            </Button>

            {/* Dispatch Button */}
            {selectedOrder.gate === 5 && (
              <Button
                variant="contained"
                color="success"
                onClick={handleDispatch}
                sx={{ mt: 2, width: "100%" }}
              >
                Dispatch
              </Button>
            )}
          </Paper>
        ) : (
          <Typography variant="h6" sx={{ mt: 4 }}>
            Select an order to see details
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default PendingOrderVendor;
