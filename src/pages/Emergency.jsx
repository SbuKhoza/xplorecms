"use client"

import { useEffect, useState } from "react"
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore"
import { db } from "../firebase/config"
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  IconButton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  MenuItem,
  Checkbox,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Alert,
} from "@mui/material"
import { Delete, Edit, FilterList } from "@mui/icons-material"

function Emergency() {
  const [emergencies, setEmergencies] = useState([])
  const [filteredEmergencies, setFilteredEmergencies] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(initialFormState())
  const [editingId, setEditingId] = useState(null)
  const [selectedItems, setSelectedItems] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    name: "",
    category: "",
    type: "",
    isActive: "all",
  })
  const [categories, setCategories] = useState(["Ambulance", "Security", "Fire and Rescue", "Other"])
  const [newCategory, setNewCategory] = useState("")

  function initialFormState() {
    return {
      name: "",
      number: "",
      address: "",
      description: "",
      additionalInfo: "",
      category: "",
      customCategory: "",
      type: "",
      isActive: true,
    }
  }

  const fetchEmergencies = async () => {
    const snapshot = await getDocs(collection(db, "emergency"))
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    setEmergencies(data)
  }

  useEffect(() => {
    fetchEmergencies()
  }, [])

  // Filter logic
  useEffect(() => {
    const filtered = emergencies.filter((item) => {
      const matchesName = !filters.name || item.name.toLowerCase().includes(filters.name.toLowerCase())
      const matchesCategory = !filters.category || item.category === filters.category
      const matchesType = !filters.type || item.type === filters.type
      const matchesActive =
        filters.isActive === "all" ||
        (filters.isActive === "active" && item.isActive) ||
        (filters.isActive === "inactive" && !item.isActive)

      return matchesName && matchesCategory && matchesType && matchesActive
    })
    setFilteredEmergencies(filtered)
  }, [emergencies, filters])

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  const clearFilters = () => {
    setFilters({
      name: "",
      category: "",
      type: "",
      isActive: "all",
    })
  }

  const handleSelectAll = (checked) => {
    setSelectAll(checked)
    if (checked) {
      setSelectedItems(filteredEmergencies.map((item) => item.id))
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

    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} selected contacts?`)) {
      try {
        await Promise.all(selectedItems.map((id) => deleteDoc(doc(db, "emergency", id))))
        await fetchEmergencies()
        setSelectedItems([])
        setSelectAll(false)
      } catch (error) {
        console.error("Error deleting contacts:", error)
      }
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitch = () => {
    setForm((prev) => ({ ...prev, isActive: !prev.isActive }))
  }

  const handleSubmit = async () => {
    const finalForm = { ...form }
    if (form.category === "Other" && form.customCategory.trim()) {
      finalForm.category = form.customCategory.trim()
    }
    delete finalForm.customCategory
    try {
      if (editingId) {
        const ref = doc(db, "emergency", editingId)
        await updateDoc(ref, { ...finalForm })
      } else {
        await addDoc(collection(db, "emergency"), {
          ...finalForm,
          createdAt: serverTimestamp(),
        })
      }
      setOpen(false)
      setForm(initialFormState())
      setEditingId(null)
      fetchEmergencies()
    } catch (err) {
      console.error("Error saving document", err)
    }
  }

  const handleEdit = (item) => {
    const predefined = ["Ambulance", "Security", "Fire and Rescue", "Police"]
    const isCustom = !predefined.includes(item.category)
    setForm({
      ...item,
      customCategory: isCustom ? item.category : "",
      category: isCustom ? "Other" : item.category,
    })
    setEditingId(item.id)
    setOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      await deleteDoc(doc(db, "emergency", id))
      fetchEmergencies()
    }
  }

  const openNewDialog = () => {
    setForm(initialFormState())
    setEditingId(null)
    setOpen(true)
  }

  const handleAddCategory = () => {
    const trimmed = newCategory.trim()
    const allExisting = ["Ambulance", "Security", "Fire and Rescue", "Police", "Other"]
    if (trimmed && !categories.includes(trimmed) && !allExisting.includes(trimmed)) {
      setCategories((prev) => [...prev.filter((c) => c !== "Other"), trimmed, "Other"])
      setNewCategory("")
    }
  }

  const getAvailableCategories = () => {
    const baseCategories = categories.filter((c) => c !== "Police" && c !== "Other")
    const options = form.type === "Public" ? ["Police", ...baseCategories, "Other"] : [...baseCategories, "Other"]
    return options
  }

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Emergency Contacts
      </Typography>

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
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Search by Name"
                value={filters.name}
                onChange={(e) => handleFilterChange("name", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  onChange={(e) => handleFilterChange("category", e.target.value)}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select value={filters.type} onChange={(e) => handleFilterChange("type", e.target.value)} label="Type">
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="Public">Public</MenuItem>
                  <MenuItem value="Private">Private</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
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
          </Grid>
        )}
      </Paper>

      {/* Bulk Actions */}
      <Box display="flex" gap={2} mb={2} alignItems="center">
        <TextField label="Add New Category" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
        <Button variant="outlined" onClick={handleAddCategory}>
          Add Category
        </Button>
        <Button variant="contained" onClick={openNewDialog}>
          Add New
        </Button>
        {selectedItems.length > 0 && (
          <Button variant="contained" color="error" startIcon={<Delete />} onClick={handleBulkDelete}>
            Delete Selected ({selectedItems.length})
          </Button>
        )}
      </Box>

      {filteredEmergencies.length === 0 && emergencies.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No contacts match the current filters.
        </Alert>
      )}

      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                checked={selectAll}
                indeterminate={selectedItems.length > 0 && selectedItems.length < filteredEmergencies.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            </TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Number</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Active</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredEmergencies.map((item) => (
            <TableRow key={item.id}>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedItems.includes(item.id)}
                  onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                />
              </TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.number}</TableCell>
              <TableCell>{item.type}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>{item.isActive ? "Yes" : "No"}</TableCell>
              <TableCell>
                <IconButton onClick={() => handleEdit(item)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(item.id)}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? "Edit Emergency Contact" : "Add Emergency Contact"}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Name" name="name" fullWidth value={form.name} onChange={handleChange} />
          <TextField
            margin="dense"
            label="Number"
            name="number"
            fullWidth
            value={form.number}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Address"
            name="address"
            fullWidth
            value={form.address}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Description"
            name="description"
            fullWidth
            value={form.description}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Additional Info"
            name="additionalInfo"
            fullWidth
            value={form.additionalInfo}
            onChange={handleChange}
          />
          <TextField select margin="dense" label="Type" name="type" fullWidth value={form.type} onChange={handleChange}>
            <MenuItem value="Public">Public</MenuItem>
            <MenuItem value="Private">Private</MenuItem>
          </TextField>
          <TextField
            select
            margin="dense"
            label="Category"
            name="category"
            fullWidth
            value={form.category}
            onChange={handleChange}
            disabled={!form.type}
          >
            {getAvailableCategories().map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>
          {form.category === "Other" && (
            <TextField
              margin="dense"
              label="Custom Category"
              name="customCategory"
              fullWidth
              value={form.customCategory}
              onChange={handleChange}
            />
          )}
          <Box display="flex" alignItems="center" mt={2}>
            <Typography>Is Active</Typography>
            <Switch checked={form.isActive} onChange={handleSwitch} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingId ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Emergency
