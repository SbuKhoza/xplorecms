"use client"
import { useState, useEffect } from "react"
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Box,
  Alert,
  CircularProgress,
  Fab,
  Checkbox,
  FormControlLabel,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material"
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  FilterList,
} from "@mui/icons-material"
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore"
import { db } from "../firebase/Config"

function XploreMenu() {
  const [menuItems, setMenuItems] = useState([])
  const [filteredMenuItems, setFilteredMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [selectedItems, setSelectedItems] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    title: "",
    isActive: "all",
    color: "",
  })
  const [formData, setFormData] = useState({
    title: "",
    color: "",
    order: 1,
    icon: "",
    isActive: true,
  })

  // Fetch menu items from Firebase
  const fetchMenuItems = async () => {
    try {
      setLoading(true)
      const querySnapshot = await getDocs(collection(db, "xplore-menu"))
      const items = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        items.push({
          id: doc.id,
          title: data.title || "",
          color: data.color || "",
          order: data.order || 0,
          icon: data.icon || "",
          isActive: data.isActive !== false,
          createdAt: data.createdAt || null,
          updatedAt: data.updatedAt || null,
          ...data,
        })
      })
      // Sort by order
      items.sort((a, b) => a.order - b.order)
      setMenuItems(items)
      setError("")
    } catch (err) {
      setError("Failed to fetch menu items: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchMenuItems()
  }, [])

  // Filter logic
  useEffect(() => {
    const filtered = menuItems.filter((item) => {
      const matchesTitle = !filters.title || item.title.toLowerCase().includes(filters.title.toLowerCase())
      const matchesActive =
        filters.isActive === "all" ||
        (filters.isActive === "active" && item.isActive) ||
        (filters.isActive === "inactive" && !item.isActive)
      const matchesColor = !filters.color || item.color.toLowerCase().includes(filters.color.toLowerCase())

      return matchesTitle && matchesActive && matchesColor
    })
    setFilteredMenuItems(filtered)
  }, [menuItems, filters])

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  const clearFilters = () => {
    setFilters({
      title: "",
      isActive: "all",
      color: "",
    })
  }

  const handleSelectAll = (checked) => {
    setSelectAll(checked)
    if (checked) {
      setSelectedItems(filteredMenuItems.map((item) => item.id))
    } else {
      setSelectedItems([])
    }
  }

  const handleSelectItem = (id, checked) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, id])
    } else {
      setSelectedItems((prev) => prev.filter((itemId) => itemId !== id))
      setSelectAll(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return

    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} selected items?`)) {
      try {
        await Promise.all(selectedItems.map((id) => deleteDoc(doc(db, "xplore-menu", id))))
        await fetchMenuItems()
        setSelectedItems([])
        setSelectAll(false)
      } catch (error) {
        setError("Failed to delete items: " + error.message)
      }
    }
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    }))
  }

  // Open dialog for adding new item
  const handleAddNew = () => {
    setEditingItem(null)
    // Get next order number
    const maxOrder = menuItems.length > 0 ? Math.max(...menuItems.map((item) => item.order)) : 0
    setFormData({
      title: "",
      color: "",
      order: maxOrder + 1,
      icon: "",
      isActive: true,
    })
    setOpenDialog(true)
  }

  // Open dialog for editing existing item
  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      title: item.title || "",
      color: item.color || "",
      order: item.order || 1,
      icon: item.icon || "",
      isActive: item.isActive !== false,
    })
    setOpenDialog(true)
  }

  // Save item (create or update)
  const handleSave = async () => {
    try {
      const itemData = {
        title: formData.title,
        color: formData.color,
        order: Number(formData.order),
        icon: formData.icon,
        isActive: formData.isActive,
        updatedAt: serverTimestamp(),
      }
      if (editingItem) {
        // Update existing item
        await updateDoc(doc(db, "xplore-menu", editingItem.id), itemData)
      } else {
        // Create new item
        await addDoc(collection(db, "xplore-menu"), {
          ...itemData,
          createdAt: serverTimestamp(),
        })
      }
      setOpenDialog(false)
      fetchMenuItems()
      setError("")
    } catch (err) {
      setError("Failed to save item: " + err.message)
    }
  }

  // Delete item
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteDoc(doc(db, "xplore-menu", id))
        fetchMenuItems()
        setError("")
      } catch (err) {
        setError("Failed to delete item: " + err.message)
      }
    }
  }

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingItem(null)
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Explore Menu Management
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddNew} size="large">
          Add New Item
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Filter Section */}
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Button startIcon={<FilterList />} onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
          <Button onClick={clearFilters} size="small">
            Clear Filters
          </Button>
        </Box>

        {showFilters && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Search by Title"
                value={filters.title}
                onChange={(e) => handleFilterChange("title", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.isActive}
                  onChange={(e) => handleFilterChange("isActive", e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Search by Color"
                value={filters.color}
                onChange={(e) => handleFilterChange("color", e.target.value)}
              />
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <Box mb={2}>
          <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={handleBulkDelete}>
            Delete Selected ({selectedItems.length})
          </Button>
        </Box>
      )}

      {filteredMenuItems.length === 0 && menuItems.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No menu items match the current filters.
        </Alert>
      )}

      {/* Select All Checkbox */}
      {filteredMenuItems.length > 0 && (
        <Box mb={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectAll}
                indeterminate={selectedItems.length > 0 && selectedItems.length < filteredMenuItems.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            }
            label="Select All"
          />
        </Box>
      )}

      <Grid container spacing={3}>
        {filteredMenuItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                  />
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {item.title || "N/A"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography variant="body1">
                    <strong>Color:</strong>
                    <Box
                      component="span"
                      sx={{
                        ml: 1,
                        display: "inline-block",
                        width: 20,
                        height: 20,
                        backgroundColor: item.color || "#ccc",
                        border: "1px solid #ddd",
                        borderRadius: 1,
                        verticalAlign: "middle",
                      }}
                    />
                    <span style={{ marginLeft: 8 }}>{item.color || "N/A"}</span>
                  </Typography>
                  <Typography variant="body1">
                    <strong>Order:</strong> {item.order}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Icon:</strong> {item.icon || "N/A"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>IsActive:</strong> {item.isActive ? "✓ True" : "✗ False"}
                  </Typography>
                </Box>
                {/* Show timestamps if available */}
                {(item.createdAt || item.updatedAt) && (
                  <Box sx={{ mt: 2, pt: 1, borderTop: 1, borderColor: "divider" }}>
                    {item.createdAt && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        Created: {item.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                      </Typography>
                    )}
                    {item.updatedAt && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        Updated: {item.updatedAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
              <CardActions>
                <IconButton onClick={() => handleEdit(item)} color="primary" aria-label="edit">
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(item.id)} color="error" aria-label="delete">
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {menuItems.length === 0 && !loading && (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No menu items found. Add your first item to get started!
          </Typography>
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField name="title" label="Title" value={formData.title} onChange={handleInputChange} fullWidth />
            <TextField
              name="color"
              label="Color"
              type="color"
              value={formData.color}
              onChange={handleInputChange}
              fullWidth
              InputProps={{
                style: { height: 56 },
              }}
            />
            <TextField
              name="order"
              label="Order"
              type="number"
              value={formData.order}
              onChange={handleInputChange}
              fullWidth
              inputProps={{ min: 1, step: 1 }}
            />
            <TextField name="icon" label="Icon" value={formData.icon} onChange={handleInputChange} fullWidth />
            <FormControlLabel
              control={<Checkbox name="isActive" checked={formData.isActive} onChange={handleInputChange} />}
              label="IsActive"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingItem ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for mobile */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          display: { xs: "flex", sm: "none" },
        }}
        onClick={handleAddNew}
      >
        <AddIcon />
      </Fab>
    </Container>
  )
}

export default XploreMenu
