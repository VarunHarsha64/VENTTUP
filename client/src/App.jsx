import React, { useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import CustomerDashboard from "./pages/CustomerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import VendorDashboard from "./pages/VendorDashboard";
import NotFound from "./pages/NotFound";
import { useUserContext } from "./context/UserContext";
import toast, { Toaster } from "react-hot-toast";
import PlaceOrder from "./components/PlaceOrder";
import TrackOrder from "./components/TrackOrder";
import axios from "axios";
import AddViewItems from "./components/AddViewItems";
import LoadingOverlay from "./components/LoadingOverlay";
import CustomerOrderHistory from "./components/CustomerOrderHistory";
import AdminOrderHistory from "./components/AdminOrderHistory";
import ApproveOrderAndAssignVendors from "./components/ApproveOrderAndAssignVendors";
import Register from "./pages/Register";
import PendingOrderVendor from "./components/PendingOrderVendor";
import UserManagement from "./components/UserManagement";
import VerificationPending from "./pages/VerificationPending";
import VendorOrderHistory from "./components/VendorOrderHistory";
import CustomerPayment from "./components/CustomerPayment";
import ActiveOrderStatusAdmin from "./components/ActiveOrderStatusAdmin";
import ActiveOrderStatusVendor from "./components/VendorActiveOrder";

const App = () => {
  const { userDetails, login, logout,isLoading } = useUserContext();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axios.get("http://localhost:3000/api/users/verify-token", {
            headers: { Authorization:  `Bearer ${token}` }
          });
          // Update context if token is valid
          login(response.data.token, response.data.role);
          toast.success("Token verification success");
        } catch (err) {
          console.log(err)
          toast.error("Token verification failed");
          logout(); // Clear invalid token
        }
      }
    };

    verifyToken();
  }, []);

  const getDashboardComponent = () => {
    switch (userDetails?.role) {
      case "admin":
        return <AdminDashboard />;
      case "customer":
        return <CustomerDashboard />;
      case "vendor":
        return <VendorDashboard />;
      default:
        return <Navigate to="/login" />;
    }
  };

  const router = createBrowserRouter([
    { path: "/", element: <Navigate to="/login" /> },
    {
      path: "/login",
      element: userDetails ? <Navigate to="/dashboard" /> : <Login />,
    },
    {
      path: "/register",
      element: userDetails ? <Navigate to="/dashboard" /> : <Register />,
    },

    {
      path:"/verification-pending",
      element: <VerificationPending/>
    },
    {
      path: "/dashboard/*", 
      element: userDetails ? getDashboardComponent() : <Navigate to="/login" />,
      children: [
        //customer
        { path: "place-order", element: <PlaceOrder /> },
        { path: "track-order", element: <TrackOrder /> },
        { path: "customer-order-history", element: <CustomerOrderHistory/>},
        { path: "customer-payment", element: <CustomerPayment /> },


        //admin
        { path: "view-add-items", element: <AddViewItems/>},
        { path: "approveOrder-assignVendor", element:<ApproveOrderAndAssignVendors/>},
        { path: "user-management", element: <UserManagement/>},
        { path: "admin-order-history", element: <AdminOrderHistory/>},
        { path: "active-order-status", element: <ActiveOrderStatusAdmin/>},


        //vendor
        { path: "vendor-pending-order",element: <PendingOrderVendor/>},
        { path: "vendor-order-history", element: <VendorOrderHistory/>},
        { path: "vendor-active-order", element: <ActiveOrderStatusVendor/>},

        //default
        { path: "*", element: <Navigate to="place-order" /> },


      ],
    },
    { path: "*", element: <NotFound /> },
  ]);

  return (
    <>
      <RouterProvider router={router} />
      <LoadingOverlay isLoading={isLoading} />
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 5000,
          style: { background: "#333", color: "#fff" },
        }}
      />
    </>
  );
};

export default App;