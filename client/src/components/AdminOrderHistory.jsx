import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
} from "@mui/material";
import toast from "react-hot-toast";
import { useUserContext } from "../context/UserContext";
import axios from "axios";

const AdminOrderHistory = () => {
  const { userDetails, setIsLoading, isLoading } = useUserContext();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      setIsLoading(true);
      try {
        console.log(userDetails);
        const response = await axios.post(
            "https://venttup-api.onrender.com/api/orders/orderHistoryAdmin",
            {
              userId: userDetails.userId, // Include userId directly in the data object
            },
            {
              headers: {
                Authorization: `Bearer ${userDetails.token}`,
              },
            }
          );
          
        setOrders(response.data);
        toast.success("Successful retrival of orders!");
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrderHistory();
  }, [userDetails.token, isLoading]);

  return (
    <Box sx={{ padding: 2, height: "100vh", overflowY: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Order History
      </Typography>
      {console.log(orders.length)}
      {orders.length === 0 ? (
        <Typography variant="h6">No orders found.</Typography>
      ) : (
        <Grid container spacing={2}>
          {orders.map((order) => (
            <Grid item xs={12} sm={6} md={4} key={order._id}>
              <Card sx={{ cursor: "pointer", "&:hover": { boxShadow: 3 } }}>
                <CardContent>
                  <Typography variant="h6">{order.item}</Typography>
                  <Typography variant="body2">Business: {order.businessName}</Typography>
                  <Typography variant="body2">Status: {order.status}</Typography>
                  <Typography variant="body2">Gate: {order.gate}</Typography>
                  <Typography variant="body2">Order ID: {order._id}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default AdminOrderHistory;
