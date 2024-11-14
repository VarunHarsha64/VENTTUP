import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import toast from "react-hot-toast";
import { useUserContext } from "../context/UserContext";
import axios from "axios";

const AddViewItems = ({isLoading}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { userDetails,setIsLoading } = useUserContext();
  const [items, setItems] = useState(null);
  const [newItem, setNewItem] = useState({
    item: "",
    description: "",
    image: null,
  });

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:3000/api/orders/fetchItems",
        {
          headers: {
            Authorization: `Bearer ${userDetails.token}`,
          },
        }
      );
      setItems(response.data);
      console.log(response.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch items.");
    } finally {
        setIsLoading(false);
    }
    
  };

  useEffect(() => {
    fetchItems();
  }, [isLoading]);

  const handleDelete = async (itemId) => {
    setIsLoading(true);
    try {
      console.log(itemId);
      await axios.delete(`http://localhost:3000/api/admin/deleteItem`, {
        data: {
          id: itemId,
        },
        headers: {
          Authorization: `Bearer ${userDetails.token}`,
        },
      });
      console.log('testingg')
      setItems(items.filter((item) => item._id !== itemId));
      toast.success("Item deleted successfully");
      fetchItems();
    } catch (error) {
      toast.error("Failed to delete item");
    } finally {
        setIsLoading(false);

    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData();
    formData.append("item", newItem.item);
    formData.append("description", newItem.description);
    formData.append("image", newItem.image);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/admin/addItem",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${userDetails.token}`,
          },
        }
      );
      console.log([...items, response.data]);
      setItems([...items, response.data]); // Update items list with new item
      setNewItem({ item: "", description: "", image: null }); // Reset form
      toast.success("Item added successfully");
      fetchItems();
    } catch (error) {
      toast.error("Failed to add item");
    } finally {
        setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setNewItem((prev) => ({ ...prev, image: e.target.files[0] }));
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
          Existing Orders
        </Typography>
        <Grid container spacing={2}>
          {console.log("thdytdy", items)}
          {items.map((order) => (
            <Grid item xs={12} key={order._id}>
              <Card
                sx={{
                  position: "relative",
                  cursor: "pointer",
                  "&:hover": {
                    boxShadow: 3,
                  },
                }}
              >
                <IconButton
                  onClick={() => handleDelete(order._id)}
                  sx={{ position: "absolute", top: 8, right: 8 }}
                >
                  <DeleteIcon />
                </IconButton>
                <CardContent sx={{ display: "flex", alignItems: "center" }}>
                  <img
                    src={order.image}
                    alt={order.item}
                    style={{
                      width: 100,
                      height: 100,
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

      {/* Right Section - Add Item Form */}
      <Box sx={{ width: "60%", padding: 2 }}>
        <Typography variant="h5" gutterBottom>
          Add New Item
        </Typography>
        <form onSubmit={handleAddItem} encType="multipart/form-data">
          <TextField
            label="Item Name"
            variant="outlined"
            fullWidth
            name="item"
            value={newItem.item}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            variant="outlined"
            fullWidth
            name="description"
            value={newItem.description}
            onChange={handleInputChange}
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ marginBottom: "16px" }}
          />
          <Button type="submit" variant="contained" color="primary">
            Add Item
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default AddViewItems;
