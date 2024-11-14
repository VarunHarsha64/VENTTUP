import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  TextField,
} from "@mui/material";
import { useUserContext } from "../context/UserContext";
import { jwtDecode } from "jwt-decode";
import toast, { Toaster } from "react-hot-toast";

const CustomerPayment = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const { userDetails, isLoading } = useUserContext();

  // Fetch orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userId = jwtDecode(userDetails.token).id;
        const response = await axios.get(
          `https://venttup-api.onrender.com/api/orders/fetchDispatchedOrders?userId=${userId}`,
          {
            headers: { Authorization: `Bearer ${userDetails.token}` },
          }
        );
        setOrders(response.data);
      } catch (err) {
        toast.error("Unable to fetch orders");
      }
    };
    fetchOrders();
  }, [userDetails.token, isLoading]);

  // Handle payment submission
  const handlePayment = async () => {
    if (!selectedOrder) {
      toast.error("Please select an order first");
      return;
    }
    if (!paymentAmount || paymentAmount <= 0) {
      toast.error("Please specify a valid amount");
      return;
    }
    if (cardNumber.length !== 16 || isNaN(cardNumber)) {
      toast.error("Please enter a valid 16-digit card number");
      return;
    }
    if (cardCVV.length !== 3 || isNaN(cardCVV)) {
      toast.error("Please enter a valid 3-digit CVV");
      return;
    }
    if (!cardExpiry || !/^((0[1-9])|(1[0-2]))\/(\d{2})$/.test(cardExpiry)) {
      toast.error("Please enter a valid expiry date (MM/YY)");
      return;
    }

    try {
      await axios.post(
        "https://venttup-api.onrender.com/api/orders/doPayment",
        { orderId: selectedOrder._id },
        {
          headers: {
            Authorization: `Bearer ${userDetails.token}`,
          },
        }
      );
      toast.success("Payment processed successfully");

      // Remove the paid order from the list and reset payment details
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order._id !== selectedOrder._id)
      );
      setSelectedOrder(null);
      setPaymentAmount("");
      setCardNumber("");
      setCardCVV("");
      setCardExpiry("");
    } catch (err) {
      console.error("Error in payment:", err);
      toast.error("Payment failed");
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Toaster position="top-right" reverseOrder={false} />
      {/* Left Section: Orders List */}
      <Box
        sx={{
          width: "30%",
          padding: 2,
          borderRight: "1px solid #ccc",
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Placed Orders
        </Typography>
        {orders.length > 0 ? (
          <Grid container spacing={2}>
            {orders.map((order) => (
              <Grid item xs={12} key={order._id}>
                <Card
                  onClick={() => setSelectedOrder(order)}
                  sx={{
                    cursor: "pointer",
                    boxShadow: 2,
                    backgroundColor: "#e3f2fd",
                    "&:hover": { boxShadow: 6 },
                    padding: 1,
                    height: 150,
                  }}
                >
                  <CardContent>
                    <Typography variant="h6">Item: {order.item}</Typography>
                    <Typography variant="body2">
                      Business Name: {order.businessName}
                    </Typography>
                    <Typography variant="body2">
                      Order Placed On: {order.date}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body1" color="textSecondary">
            No pending orders to display.
          </Typography>
        )}
      </Box>

      {/* Right Section: Payment Form */}
      <Box
        sx={{
          width: "70%",
          padding: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Paper elevation={3} sx={{ padding: 2, borderRadius: 2 }}>
          <Typography variant="h4" gutterBottom>
            Payment
          </Typography>
          {selectedOrder ? (
            <>
              <Typography variant="h6">Item: {selectedOrder.item}</Typography>
              <Typography variant="body1">
                Order Date: {selectedOrder.date}
              </Typography>

              {/* Payment Amount Input */}
              <TextField
                label="Amount"
                variant="outlined"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                sx={{ marginTop: 2 }}
                fullWidth
              />

              {/* Card Details Inputs */}
              <TextField
                label="Card Number"
                variant="outlined"
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                sx={{ marginTop: 2 }}
                fullWidth
                inputProps={{ maxLength: 16 }}
              />
              <TextField
                label="Card CVV"
                variant="outlined"
                type="password"
                value={cardCVV}
                onChange={(e) => setCardCVV(e.target.value)}
                sx={{ marginTop: 2 }}
                fullWidth
                inputProps={{ maxLength: 3 }}
              />
              <TextField
                label="Expiry Date (MM/YY)"
                variant="outlined"
                type="text"
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value)}
                sx={{ marginTop: 2 }}
                fullWidth
                placeholder="MM/YY"
              />

              <Button
                variant="contained"
                color="primary"
                onClick={handlePayment}
                sx={{ marginTop: 2 }}
              >
                Pay Now
              </Button>
            </>
          ) : (
            <Typography variant="body1" color="textSecondary">
              Select an order to proceed with payment.
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default CustomerPayment;
