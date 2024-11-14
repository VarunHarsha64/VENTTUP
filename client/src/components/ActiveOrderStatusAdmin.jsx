import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Paper,
} from "@mui/material";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useUserContext } from "../context/UserContext";

const ActiveOrderStatusAdmin = () => {
  const [activeStep, setActiveStep] = useState(1); // Gate 6 as the current step (index 5)
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState("");
  const { userDetails, isloading } = useUserContext();

  useEffect(() => {
    async function fetchOrders() {
      try {
        const userId = jwtDecode(userDetails.token).id;
        const response = await axios.get(
          "http://localhost:3000/api/orders/orderHistoryAdmin",
          {
            headers: {
              Authorization: `Bearer ${userDetails.token}`,
            },
          }
        );
        console.log(response.data);
        setOrders(response.data);
      } catch (err) {
        console.log("Unable to fetch orders");
      }
    }
    fetchOrders();
  }, [userDetails.token, isloading]);

  async function getGate(orderId) {
    let response = await axios.get(
      `http://localhost:3000/api/orders/trackOrder?orderId=${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${userDetails.token}`,
        },
      }
    );
    setActiveStep(response.data[0].gate);
  }

  // 8 gates with titles
  const steps = [
    { title: "Gate 0: Order Placed" },
    { title: "Gate 1: Vendor Selection" },
    { title: "Gate 2: Data Sheet Verification" },
    { title: "Gate 3: PO Issuance" },
    { title: "Gate 4: Manufacturing Clearance" },
    { title: "Gate 5: Optional Inspection" },
    { title: "Gate 6: Dispatched" },
    { title: "Gate 7: Receipt Confirmation" },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
      }}
    >
      {/* Left Section - Orders List with Scrollbar */}
      <Box
        sx={{
          width: "30%", // Reduced width for the left section
          padding: 2,
          borderRight: "1px solid #ccc",
          height: "100vh", // Ensure it fills the full height
          overflowY: "auto", // Enable scroll if content overflows
        }}
      >
        <Typography variant="h6" gutterBottom>
          Placed Orders
        </Typography>
        {orders.length === 0 && (
          <Typography>No active orders yet.</Typography>
        )}
        <Grid container spacing={2}>
          {orders.map((order) => (
            <Grid item xs={12} key={order._id}>
              <Card
                onClick={() => {
                  setSelected(order.item);
                  getGate(order._id);
                }}
                sx={{
                  cursor: "pointer",
                  boxShadow: 2,
                  backgroundColor: "#e3f2fd", // Light blue background color
                  "&:hover": {
                    boxShadow: 6,
                  },
                  padding: 1, // Reduced padding for smaller card size
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: 150, // Reduced height for smaller card size
                }}
              >
                <CardContent>
                  <Typography variant="h6">Item : {order.item}</Typography>
                  <Typography variant="body2">
                    Business Name : {order.businessName}
                  </Typography>
                  <Typography variant="body2">
                    Order Placed on : {order.date}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Right Section - Order Tracking Flowchart */}
      {selected !== "" && (
        <Box
          sx={{
            width: "70%", // Increased width for the right section
            padding: 2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Paper elevation={3} sx={{ padding: 2, borderRadius: 2 }}>
            <Typography variant="h4" gutterBottom>
              Order Tracking
            </Typography>
            <Stepper
              activeStep={activeStep}
              orientation="vertical"
              connector={null}
            >
              {steps.map((step, index) => (
                <React.Fragment key={index}>
                  <Step completed={activeStep >= index}>
                    <StepLabel
                      sx={{
                        "& .MuiStepLabel-label": {
                          color: activeStep > index ? "blue" : "black", // Blue for completed steps, black for uncompleted steps
                          fontWeight: activeStep === index ? "bold" : "normal", // Bold for the current step
                        },
                        textAlign: "center",
                      }}
                    >
                      {step.title}
                    </StepLabel>
                  </Step>
                  {index !== steps.length - 1 && (
                    <Grid item>
                      <Box
                        sx={{
                          width: "2px",
                          height: "30px", // Adjust height for spacing between steps
                          backgroundColor: activeStep > index ? "blue" : "gray", // Blue for completed connectors, gray otherwise
                          margin: "0 auto", // Center the connector
                        }}
                      />
                    </Grid>
                  )}
                </React.Fragment>
              ))}
            </Stepper>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default ActiveOrderStatusAdmin;
