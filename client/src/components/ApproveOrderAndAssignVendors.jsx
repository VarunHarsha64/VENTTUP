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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import toast from "react-hot-toast";
import { useUserContext } from "../context/UserContext";
import axios from "axios";

const ApproveOrderAndAssignVendors = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { userDetails,setIsLoading, isLoading } = useUserContext();
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [documentFile, setDocumentFile] = useState(null);
  const [inspectionStatus, setInspectionStatus] = useState(""); // Added state for inspection

  useEffect(() => {
    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const response = await axios.get(
          "http://localhost:3000/api/orders/getUnapprovedOrders",
          {
            headers: {
              Authorization: `Bearer ${userDetails.token}`,
            },
          }
        );
        setOrders(response.data);
      } catch (error) {
        toast.error("Unable to fetch orders.");
      } finally {
        setLoadingOrders(false);
      }
    };

    const fetchVendors = async () => {
      setLoadingVendors(true);
      try {
        const response = await axios.get(
          "http://localhost:3000/api/admin/fetchAllVendors",
          {
            headers: {
              Authorization: `Bearer ${userDetails.token}`,
            },
          }
        );
        setVendors(response.data);
      } catch (error) {
        toast.error("Unable to fetch vendors.");
      } finally {
        setLoadingVendors(false);
      }
    };

    fetchOrders();
    fetchVendors();

    if(selectedOrder?.gate >= 0.5){
      setSelectedVendor(selectedOrder.vendor);
    }
  }, [userDetails.token, isLoading, selectedOrder]);

  const handleVendorChange = (event) => {
    setSelectedVendor(event.target.value);
  };

  const handleEnquireVendor = async () => {
    setIsLoading(true);
    if (!selectedVendor || !selectedOrder) {
      toast.error("Please select a vendor and an order.");
      return;
    }
    try {
      await axios.post(
        "http://localhost:3000/api/orders/enquireVendor",
        { orderId: selectedOrder._id, vendorId: selectedVendor },
        {
          headers: {
            Authorization: `Bearer ${userDetails.token}`,
          },
        }
      );
      toast.success("Vendor enquired successfully.");
    } catch (error) {
      toast.error("Unable to enquire with vendor.");
    } finally {
      setIsLoading(false);
    }
  };

  const datasheetVerify = async () => {
    setIsLoading(true);
    if (!selectedOrder) {
      toast.error("Please select an order to approve.");
      return;
    }
    try {
      await axios.post(
        "http://localhost:3000/api/orders/dataSheetVerification",
        { orderId: selectedOrder._id },
        {
          headers: {
            Authorization: `Bearer ${userDetails.token}`,
          },
        }
      );
      toast.success("Purchase Order issued successfully.");
    } catch (error) {
      toast.error("Unable to issue Purchase Order.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveOrder = async () => {
    setIsLoading(true);
    if (!selectedOrder) {
      toast.error("Please select an order to approve.");
      return;
    }
    if (!documentFile) {
      toast.error("Please upload a document.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("orderId", selectedOrder._id);
      formData.append("file", documentFile);

      await axios.post("http://localhost:3000/api/admin/issuePO", formData, {
        headers: {
          Authorization: `Bearer ${userDetails.token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Purchase Order issued successfully.");
    } catch (error) {
      toast.error("Unable to issue Purchase Order.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManufacturingClearance = async () => {
    setIsLoading(true);
    try {
      await axios.post(
        "http://localhost:3000/api/admin/manufacturingClearance",
        { orderId: selectedOrder._id },
        {
          headers: {
            Authorization: `Bearer ${userDetails.token}`,
          },
        }
      );
      toast.success("Manufacturing clearance granted.");
    } catch (error) {
      toast.error("Unable to give manufacturing clearance.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInspectionStatusChange = (event) => {
    setInspectionStatus(event.target.value);
  };

  const handleInspectionSubmit = async () => {
    setIsLoading(true);
    if (!inspectionStatus || !selectedOrder) {
      toast.error("Please select an inspection status.");
      return;
    }
    try {
      await axios.post(
        "http://localhost:3000/api/orders/inspection",
        { orderId: selectedOrder._id, value: inspectionStatus },
        {
          headers: {
            Authorization: `Bearer ${userDetails.token}`,
          },
        }
      );
      toast.success("Inspection status updated.");
    } catch (error) {
      toast.error("Unable to update inspection status.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadDataSheet = () => {
    if (selectedOrder?.datasheet) {
      window.open(selectedOrder.datasheet, "_blank");
    } else {
      toast.error("Datasheet not available.");
    }
  };

  const handleFileChange = (event) => {
    setDocumentFile(event.target.files[0]);
  };

  const filteredOrders = orders.filter((order) =>
    order.item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Box
        sx={{
          width: "40%",
          padding: 2,
          borderRight: "1px solid #ccc",
          overflowY: "auto",
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
          Pending Orders
        </Typography>
        {loadingOrders ? (
          <Typography>Loading orders...</Typography>
        ) : filteredOrders.length === 0 ? (
          <Typography>No orders found.</Typography>
        ) : (
          <Grid container spacing={2}>
            {filteredOrders.map((order) => (
              <Grid item xs={12} key={order._id}>
                <Card
                  onClick={() => setSelectedOrder(order)}
                  sx={{
                    cursor: "pointer",
                    "&:hover": { boxShadow: 3 },
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
        )}
      </Box>

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
              Manage Order: {selectedOrder.item}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {selectedOrder.businessName}
            </Typography>
            <FormControl fullWidth sx={{ mb: 3 }} disabled={selectedOrder.gate >=0.5}>
              <InputLabel>Select Vendor</InputLabel>
              <Select value={selectedVendor} onChange={handleVendorChange}>
                {loadingVendors ? (
                  <MenuItem value="">Loading vendors...</MenuItem>
                ) : vendors.length === 0 ? (
                  <MenuItem value="">No vendors available</MenuItem>
                ) : (
                  vendors.map((vendor) => (
                    <MenuItem key={vendor._id} value={vendor._id}>
                      {vendor.businessName}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            {selectedOrder.gate === 0 && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleEnquireVendor}
                fullWidth
              >
                Enquire Vendor
              </Button>
            )}

            {selectedOrder.gate === 0.5 && (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mb: 2, width: "100%" }}
                  disabled
                >
                  Vendor Enquired!
                </Button>
              </>
            )}

            {selectedOrder.gate === 1 && (
              <>
                {selectedOrder.dataSheetStatus === "Pending" ? (
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    Datasheet is pending.
                  </Typography>
                ) : (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleDownloadDataSheet}
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    View Datasheet
                  </Button>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={datasheetVerify}
                  fullWidth
                >
                  Verify Datasheet
                </Button>
              </>
            )}

            {selectedOrder.gate === 2 && (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleApproveOrder}
                  fullWidth
                >
                  Issue PO
                </Button>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1">Upload Document</Typography>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    style={{ marginTop: "8px", width: "100%" }}
                  />
                </Box>
              </>
            )}

            {selectedOrder.gate === 3 && (
              <Button
                variant="contained"
                color="secondary"
                onClick={handleManufacturingClearance}
                fullWidth
              >
                Grant Manufacturing Clearance
              </Button>
            )}

            {selectedOrder.gate === 4 && (
              <>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Inspection Status</InputLabel>
                  <Select
                    value={inspectionStatus}
                    onChange={handleInspectionStatusChange}
                  >
                    <MenuItem value="To be done">To be done</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Not required">Not required</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleInspectionSubmit}
                  fullWidth
                >
                  Update Inspection Status
                </Button>
              </>
            )}
          </Paper>
        ) : (
          <Typography>Select an order to manage</Typography>
        )}
      </Box>
    </Box>
  );
};

export default ApproveOrderAndAssignVendors;
