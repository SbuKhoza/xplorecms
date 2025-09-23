"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
} from "@mui/material"
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "../firebase/Config"

function Users({ currentUser }) {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const businessTypes = [
    "restaurant",
    "accommodation",
    "recreation",
    "attraction",
    "transport",
    "business",
    "healthcare",
  ]

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "useradmin"))
      const usersData = []
      querySnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() })
      })
      setUsers(usersData)
    } catch (error) {
      setError("Failed to fetch users")
    }
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setDialogOpen(true)
  }

  const handleUpdateUser = async () => {
    setLoading(true)
    try {
      await updateDoc(doc(db, "useradmin", selectedUser.id), {
        businessType: selectedUser.businessType,
        isActive: selectedUser.isActive,
        permissions: selectedUser.permissions || [selectedUser.businessType],
      })
      await fetchUsers()
      setDialogOpen(false)
      setSelectedUser(null)
    } catch (error) {
      setError("Failed to update user")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteDoc(doc(db, "useradmin", userId))
        await fetchUsers()
      } catch (error) {
        setError("Failed to delete user")
      }
    }
  }

  const getStatusColor = (isActive) => {
    return isActive ? "success" : "warning"
  }

  const getStatusText = (isActive) => {
    return isActive ? "Active" : "Pending"
  }

  if (currentUser.role !== "superadmin") {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Access denied. Super admin privileges required.</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        User Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Business Name</TableCell>
                  <TableCell>Business Type</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.businessName}</TableCell>
                    <TableCell>
                      <Chip label={user.businessType} variant="outlined" size="small" />
                    </TableCell>
                    <TableCell>{user.contactNumber}</TableCell>
                    <TableCell>
                      <Chip label={getStatusText(user.isActive)} color={getStatusColor(user.isActive)} size="small" />
                    </TableCell>
                    <TableCell>
                      <Button variant="outlined" size="small" onClick={() => handleEditUser(user)} sx={{ mr: 1 }}>
                        Edit
                      </Button>
                      <Button variant="outlined" color="error" size="small" onClick={() => handleDeleteUser(user.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User Permissions</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {selectedUser.email} - {selectedUser.businessName}
              </Typography>

              <FormControl fullWidth margin="normal">
                <InputLabel>Business Type</InputLabel>
                <Select
                  value={selectedUser.businessType}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      businessType: e.target.value,
                    })
                  }
                  label="Business Type"
                >
                  {businessTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={selectedUser.isActive || false}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        isActive: e.target.checked,
                      })
                    }
                  />
                }
                label="Active Status"
                sx={{ mt: 2 }}
              />

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                This user will have access to: Profile, {selectedUser.businessType}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateUser} variant="contained" disabled={loading}>
            {loading ? "Updating..." : "Update"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Users
