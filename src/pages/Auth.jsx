"use client"

import { useState } from "react"
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from "@mui/material"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "../firebase/config"

function TabPanel({ children, value, index }) {
  return <div hidden={value !== index}>{value === index && <Box sx={{ p: 3 }}>{children}</Box>}</div>
}

function Auth({ onLogin }) {
  const [tabValue, setTabValue] = useState(0)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    businessName: "",
    businessType: "",
    contactNumber: "",
  })
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

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user

      // Check if user is super admin
      const adminDoc = await getDoc(doc(db, "admin", user.uid))
      if (adminDoc.exists()) {
        onLogin({ ...user, role: "superadmin", data: adminDoc.data() })
        return
      }

      // Check if user is regular admin
      const userDoc = await getDoc(doc(db, "useradmin", user.uid))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        if (userData.isActive) {
          onLogin({ ...user, role: "admin", data: userData })
        } else {
          setError("Account pending approval. Please contact administrator.")
        }
        return
      }

      setError("User not found in system. Please contact administrator.")
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user

      // Save user to useradmin collection
      await setDoc(doc(db, "useradmin", user.uid), {
        email: formData.email,
        businessName: formData.businessName,
        businessType: formData.businessType,
        contactNumber: formData.contactNumber,
        createdAt: new Date(),
        isActive: false, // Super admin needs to activate
      })

      setError("Registration successful! Please wait for admin approval.")
      setFormData({
        email: "",
        password: "",
        businessName: "",
        businessType: "",
        contactNumber: "",
      })
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Card sx={{ maxWidth: 500, width: "100%", mx: 2 }}>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Business Portal
          </Typography>

          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} centered>
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>

          {error && (
            <Alert severity={error.includes("successful") ? "success" : "error"} sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <TabPanel value={tabValue} index={0}>
            <Box component="form" onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box component="form" onSubmit={handleRegister}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Business Name"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Business Type</InputLabel>
                <Select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleInputChange}
                  label="Business Type"
                >
                  {businessTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Contact Number"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </Button>
            </Box>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Auth
