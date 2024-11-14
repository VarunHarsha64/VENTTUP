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
} from "@mui/material";
import toast from "react-hot-toast";
import { useUserContext } from "../context/UserContext";
import axios from "axios";

const PlaceOrder = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { userDetails,setIsLoading, isLoading } = useUserContext();
  const [items, setItems] = useState(null);
  const [businessName, setBusinessName] = useState("");
  const [pdfFile, setPdfFile] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/orders/fetchItems", {
          headers: {
            Authorization: `Bearer ${userDetails.token}`,
          },
        });
        setItems(response.data);
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    };
    fetchItems();
  }, [userDetails.token, isLoading]);

  const handleFileChange = (event) => {
    setPdfFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    setIsLoading(true);
    event.preventDefault();
    if (!selectedOrder || !businessName || !pdfFile) {
      toast.error("Please fill in all fields and select an order.");
      return;
    }

    const formData = new FormData();
    formData.append("businessName", businessName);
    formData.append("item", selectedOrder.item); // Assuming the item name is taken from the selected order
    formData.append("document", pdfFile);
    formData.append("userId",userDetails.userId);

    try {
      const response = await axios.post("http://localhost:3000/api/orders/placeOrder", formData, {
        headers: {
          Authorization: `Bearer ${userDetails.token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success(response.data.message);
      // Reset form fields after successful submission
      setBusinessName("");
      setPdfFile(null);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return !items ? (
    <div>Loading...</div>
  ) : (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Left Section - Orders List */}
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
          Available Orders
        </Typography>
        <Grid container spacing={2}>
          {items.map((order) => (
            <Grid item xs={12} key={order.item}>
              <Card
                onClick={() => setSelectedOrder(order)}
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent sx={{ display: "flex", alignItems: "center" }}>
                  <img
                    src={order.image}
                    alt={order.item}
                    style={{
                      width: 300,
                      height: 300,
                      objectFit: "cover",
                      marginRight: 16,
                    }}
                  />
                  <div>
                    <Typography variant="h6">{order.item}</Typography>
                    <Typography variant="body2">{order.description}</Typography>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Right Section - Order Form */}
      <Box sx={{ width: "60%", padding: 2, display: "flex", flexDirection: "column" }}>
        {selectedOrder ? (
          <Paper elevation={3} sx={{ padding: 2, borderRadius: 2 }}>
            <Typography variant="h4" gutterBottom>
              Place Order for {selectedOrder.item}
            </Typography>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
              <TextField
                label="Business Name"
                variant="outlined"
                fullWidth
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                sx={{ mb: 2 }}
                required
              />
              <Typography variant="body1" gutterBottom>
                {selectedOrder.description}
              </Typography>
              <img
                src={selectedOrder.image}
                alt={selectedOrder.item}
                style={{
                  width: 300,
                  height: 300,
                  objectFit: "cover",
                  marginBottom: 16,
                }}
              />
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                required
                style={{ marginBottom: 16 }}
              />
              <Button variant="contained" color="primary" type="submit">
                Place Order
              </Button>
            </form>
          </Paper>
        ) : (
          <Typography variant="h6">Select an order to see details</Typography>
        )}
      </Box>
    </Box>
  );
};

export default PlaceOrder;
