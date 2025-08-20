"use client"

import { useEffect, useState } from "react"
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Modal,
  Chip,
  Alert,
  Tabs,
  Tab,
  Avatar,
  Paper,
  Divider,
  FormControlLabel,
  Switch,
} from "@mui/material"
import {
  Add,
  Delete,
  Edit,
  UploadFile,
  Close,
  LocationOn,
  MyLocation,
  Map,
  Business as BusinessIcon,
  Info,
  Build,
  ContactPhone,
  Restaurant,
  LocalHospital,
  School,
  FitnessCenter,
  Face, // replaced Beauty with Face which is a valid MUI icon
  Computer,
  DirectionsCar,
  Home,
  Phone,
  Email,
  Schedule,
  PhotoLibrary, // Added PhotoLibrary icon for Gallery tab
  VideoLibrary, // Added VideoLibrary icon for video content
  Image, // Added Image icon for image content
} from "@mui/icons-material"
import { collection, getDocs, updateDoc, deleteDoc, doc, setDoc } from "firebase/firestore"
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { db } from "../firebase/Config"

const storage = getStorage()

const serviceIcons = {
  restaurant: Restaurant,
  food: Restaurant,
  hospital: LocalHospital,
  medical: LocalHospital,
  health: LocalHospital,
  school: School,
  education: School,
  fitness: FitnessCenter,
  gym: FitnessCenter,
  beauty: Face, // updated to use Face instead of Beauty
  salon: Face, // updated to use Face instead of Beauty
  tech: Computer,
  computer: Computer,
  automotive: DirectionsCar,
  car: DirectionsCar,
  home: Home,
  "real estate": Home,
  default: Build,
}

const getServiceIcon = (service) => {
  const serviceLower = service.toLowerCase()
  for (const [key, IconComponent] of Object.entries(serviceIcons)) {
    if (serviceLower.includes(key)) {
      return IconComponent
    }
  }
  return serviceIcons.default
}

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`business-tabpanel-${index}`}
      aria-labelledby={`business-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

function Business() {
  const [businesses, setBusinesses] = useState([])
  const [open, setOpen] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  const [formData, setFormData] = useState({
    // Home section
    name: "",
    images: [""],
    logo: "",
    useTextLogo: false,

    // About Us section
    description: "",
    category: "",
    type: "",
    rating: "",
    reviews: "",

    // Services section
    services: [{ name: "", icon: "default" }],

    // Contact section
    phone: "",
    email: "",
    location: "",
    hours: "",
    status: "Open",
    coordinates: { latitude: "", longitude: "" },

    gallery: {
      images: [""],
      catalogues: [""],
      videos: [""],
    },
  })
  const [editId, setEditId] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [mapOpen, setMapOpen] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState("")

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "business"))
        const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        console.log("Business data:", data)
        const ids = data.map((item) => item.id)
        const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index)
        if (duplicateIds.length > 0) {
          console.warn("Duplicate IDs found:", duplicateIds)
        }

        const uniqueData = data.filter((item, index, self) => index === self.findIndex((t) => t.id === item.id))

        setBusinesses(uniqueData)
      } catch (error) {
        console.error("Error fetching businesses:", error)
      }
    }
    fetchBusinesses()
  }, [])

  const handleOpen = (item = null) => {
    if (item) {
      setEditId(item.id)
      setFormData({
        // Home section
        name: item.name || "",
        images: item.images || [""],
        logo: item.logo || "",
        useTextLogo: item.useTextLogo || false,

        // About Us section
        description: item.description || "",
        category: item.category || "",
        type: item.type || "",
        rating: item.rating || "",
        reviews: item.reviews || "",

        // Services section
        services: item.services?.map((s) => (typeof s === "string" ? { name: s, icon: "default" } : s)) || [
          { name: "", icon: "default" },
        ],

        // Contact section
        phone: item.phone || "",
        email: item.email || "",
        location: item.location || "",
        hours: item.hours || "",
        status: item.status || "Open",
        coordinates: {
          latitude: item.coordinates?.latitude || "",
          longitude: item.coordinates?.longitude || "",
        },

        gallery: {
          images: item.gallery?.images || [""],
          catalogues: item.gallery?.catalogues || [""],
          videos: item.gallery?.videos || [""],
        },
      })
    } else {
      setEditId(null)
      setFormData({
        name: "",
        images: [""],
        logo: "",
        useTextLogo: false,
        description: "",
        category: "",
        type: "",
        rating: "",
        reviews: "",
        services: [{ name: "", icon: "default" }],
        phone: "",
        email: "",
        location: "",
        hours: "",
        status: "Open",
        coordinates: { latitude: "", longitude: "" },
        gallery: {
          images: [""],
          catalogues: [""],
          videos: [""],
        },
      })
    }
    setOpen(true)
    setTabValue(0)
  }

  const handleClose = () => {
    setOpen(false)
    setEditId(null)
    setMapOpen(false)
    setLocationError("")
    setTabValue(0)
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleArrayChange = (field, index, value) => {
    const updated = [...formData[field]]
    updated[index] = value
    setFormData((prev) => ({ ...prev, [field]: updated }))
  }

  const handleServiceChange = (index, field, value) => {
    const updated = [...formData.services]
    updated[index] = { ...updated[index], [field]: value }
    setFormData((prev) => ({ ...prev, services: updated }))
  }

  const handleDeleteArrayItem = (field, index) => {
    const updated = [...formData[field]]
    updated.splice(index, 1)
    setFormData((prev) => ({ ...prev, [field]: updated }))
  }

  const handleAddField = (field, defaultValue = "") => {
    if (field === "services") {
      setFormData((prev) => ({ ...prev, [field]: [...prev[field], { name: "", icon: "default" }] }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: [...prev[field], defaultValue] }))
    }
  }

  const handleGalleryArrayChange = (type, index, value) => {
    const updated = [...formData.gallery[type]]
    updated[index] = value
    setFormData((prev) => ({
      ...prev,
      gallery: { ...prev.gallery, [type]: updated },
    }))
  }

  const handleDeleteGalleryItem = (type, index) => {
    const updated = [...formData.gallery[type]]
    updated.splice(index, 1)
    setFormData((prev) => ({
      ...prev,
      gallery: { ...prev.gallery, [type]: updated },
    }))
  }

  const handleAddGalleryField = (type) => {
    setFormData((prev) => ({
      ...prev,
      gallery: { ...prev.gallery, [type]: [...prev.gallery[type], ""] },
    }))
  }

  const getCurrentLocation = () => {
    setGettingLocation(true)
    setLocationError("")

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser")
      setGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setFormData((prev) => ({
          ...prev,
          coordinates: {
            latitude: latitude.toString(),
            longitude: longitude.toString(),
          },
        }))
        setGettingLocation(false)
      },
      (error) => {
        let errorMessage = "Unable to get location"
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user"
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable"
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out"
            break
          default:
            errorMessage = "An unknown error occurred"
        }
        setLocationError(errorMessage)
        setGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      },
    )
  }

  const handleMapClick = (lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      coordinates: {
        latitude: lat.toString(),
        longitude: lng.toString(),
      },
    }))
  }

  const handleGalleryFileUpload = async (e, type) => {
    const files = Array.from(e.target.files)
    setUploading(true)

    try {
      const urls = await Promise.all(
        files.map(async (file) => {
          const ref = storageRef(storage, `business/gallery/${type}/${Date.now()}-${file.name}`)
          const snapshot = await uploadBytesResumable(ref, file)
          return await getDownloadURL(snapshot.ref)
        }),
      )
      setFormData((prev) => ({
        ...prev,
        gallery: {
          ...prev.gallery,
          [type]: [...prev.gallery[type], ...urls],
        },
      }))
    } catch (error) {
      console.error("Gallery upload error:", error)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    const cleanFormData = {
      ...formData,
      services: formData.services.filter((item) => item.name && item.name.trim() !== ""),
      images: formData.images.filter((item) => item.trim() !== ""),
      gallery: {
        images: formData.gallery.images.filter((item) => item.trim() !== ""),
        catalogues: formData.gallery.catalogues.filter((item) => item.trim() !== ""),
        videos: formData.gallery.videos.filter((item) => item.trim() !== ""),
      },
    }

    if (editId) {
      const newDocId = createDocumentId(cleanFormData.name)

      if (editId !== newDocId) {
        await setDoc(doc(db, "business", newDocId), {
          ...cleanFormData,
          createdAt: new Date(),
        })
        await deleteDoc(doc(db, "business", editId))

        setBusinesses((prev) => prev.map((r) => (r.id === editId ? { ...cleanFormData, id: newDocId } : r)))
      } else {
        await updateDoc(doc(db, "business", editId), cleanFormData)
        setBusinesses((prev) => prev.map((r) => (r.id === editId ? { ...cleanFormData, id: editId } : r)))
      }
    } else {
      const docId = createDocumentId(cleanFormData.name)

      await setDoc(doc(db, "business", docId), {
        ...cleanFormData,
        createdAt: new Date(),
      })

      setBusinesses((prev) => [...prev, { ...cleanFormData, id: docId }])
    }
    handleClose()
  }

  const createDocumentId = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 50)
  }

  const handleDelete = (id) => {
    const deleteBusiness = async () => {
      try {
        await deleteDoc(doc(db, "business", id))
        setBusinesses((prev) => prev.filter((b) => b.id !== id))
      } catch (error) {
        console.error("Error deleting business:", error)
      }
    }
    deleteBusiness()
  }

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files)
    setUploading(true)

    try {
      const urls = await Promise.all(
        files.map(async (file) => {
          const ref = storageRef(storage, `business/images/${Date.now()}-${file.name}`)
          const snapshot = await uploadBytesResumable(ref, file)
          return await getDownloadURL(snapshot.ref)
        }),
      )
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...urls] }))
    } catch (error) {
      console.error("Image upload error:", error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Business Directory</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Add Business
        </Button>
      </Box>

      <Grid container spacing={2} mt={2}>
        {businesses.map((b, index) => (
          <Grid item xs={12} sm={6} md={4} key={b.id || `business-${index}`}>
            <Card>
              <CardMedia component="img" height="140" image={b.images?.[0] || ""} alt={b.name} />
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  {b.useTextLogo ? (
                    <Typography variant="h6" color="primary">
                      {b.logo || b.name}
                    </Typography>
                  ) : b.logo ? (
                    <Avatar src={b.logo} alt={b.name} sx={{ width: 32, height: 32 }} />
                  ) : (
                    <Avatar sx={{ width: 32, height: 32 }}>
                      <BusinessIcon />
                    </Avatar>
                  )}
                  <Typography variant="h6">{b.name}</Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {b.description}
                </Typography>

                <Typography variant="body2">
                  {b.type} • ⭐ {b.rating}
                </Typography>

                <Typography variant="body2" color="primary">
                  {b.hours}
                </Typography>

                {b.services && b.services.length > 0 && (
                  <Box mt={1}>
                    <Typography variant="caption" color="text.secondary">
                      Services:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                      {b.services.slice(0, 3).map((service, idx) => {
                        const serviceName = typeof service === "string" ? service : service.name
                        const IconComponent =
                          typeof service === "object" ? getServiceIcon(service.icon) : getServiceIcon(serviceName)
                        return (
                          <Chip
                            key={idx}
                            icon={<IconComponent />}
                            label={serviceName}
                            size="small"
                            variant="outlined"
                          />
                        )
                      })}
                      {b.services.length > 3 && (
                        <Chip label={`+${b.services.length - 3} more`} size="small" variant="outlined" />
                      )}
                    </Box>
                  </Box>
                )}

                {b.coordinates &&
                  !isNaN(Number.parseFloat(b.coordinates.latitude)) &&
                  !isNaN(Number.parseFloat(b.coordinates.longitude)) && (
                    <Box display="flex" alignItems="center" mt={1}>
                      <LocationOn fontSize="small" color="primary" />
                      <Typography variant="caption" ml={0.5}>
                        {Number.parseFloat(b.coordinates.latitude).toFixed(4)},{" "}
                        {Number.parseFloat(b.coordinates.longitude).toFixed(4)}
                      </Typography>
                    </Box>
                  )}
              </CardContent>
              <Box display="flex" justifyContent="flex-end">
                <IconButton onClick={() => handleOpen(b)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(b.id)}>
                  <Delete />
                </IconButton>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editId ? "Edit" : "Add"} Business</DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab icon={<BusinessIcon />} label="Home" />
              <Tab icon={<Info />} label="About Us" />
              <Tab icon={<Build />} label="Services" />
              <Tab icon={<ContactPhone />} label="Contact" />
              <Tab icon={<PhotoLibrary />} label="Gallery" />
            </Tabs>
          </Box>

          {/* Home Section */}
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom>
              Business Information
            </Typography>

            <TextField
              fullWidth
              label="Business Name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              margin="normal"
              required
            />

            <Box mt={3}>
              <Typography variant="h6" gutterBottom>
                Logo
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.useTextLogo}
                    onChange={(e) => handleChange("useTextLogo", e.target.checked)}
                  />
                }
                label="Use text logo instead of image"
              />

              {formData.useTextLogo ? (
                <TextField
                  fullWidth
                  label="Logo Text"
                  value={formData.logo}
                  onChange={(e) => handleChange("logo", e.target.value)}
                  margin="normal"
                  placeholder="Enter your business name or slogan"
                />
              ) : (
                <TextField
                  fullWidth
                  label="Logo Image URL"
                  value={formData.logo}
                  onChange={(e) => handleChange("logo", e.target.value)}
                  margin="normal"
                  placeholder="https://example.com/logo.png"
                />
              )}
            </Box>

            <Box mt={3}>
              <Typography variant="h6" gutterBottom>
                Business Images
              </Typography>
              {formData.images.map((url, idx) => (
                <Box key={`image-${idx}-${url.substring(0, 20)}`} display="flex" alignItems="center" gap={2} mb={1}>
                  <img
                    src={url || "/placeholder.svg?height=60&width=60&query=business"}
                    alt={`thumb-${idx}`}
                    style={{ width: 60, height: 60, objectFit: "cover", cursor: "pointer", borderRadius: 4 }}
                    onClick={() => setImagePreview(url)}
                  />
                  <TextField
                    fullWidth
                    margin="dense"
                    label={`Image URL ${idx + 1}`}
                    value={url}
                    onChange={(e) => handleArrayChange("images", idx, e.target.value)}
                  />
                  <IconButton onClick={() => handleDeleteArrayItem("images", idx)}>
                    <Close />
                  </IconButton>
                </Box>
              ))}
              <Box display="flex" gap={1} mt={2}>
                <Button onClick={() => handleAddField("images")}>Add Image URL</Button>
                <Button variant="outlined" component="label" startIcon={<UploadFile />} disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload Images"}
                  <input hidden multiple type="file" accept="image/*" onChange={handleFileUpload} />
                </Button>
              </Box>
            </Box>
          </TabPanel>

          {/* About Us Section */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              About Your Business
            </Typography>

            <TextField
              fullWidth
              label="Business Description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              margin="normal"
              multiline
              rows={4}
              placeholder="Tell customers about your business, what makes you unique..."
            />

            <Grid container spacing={2} mt={1}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Business Type"
                  value={formData.type}
                  onChange={(e) => handleChange("type", e.target.value)}
                  placeholder="e.g., Restaurant, Retail, Service"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Category"
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  placeholder="e.g., Fast Food, Clothing, Consulting"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Rating"
                  value={formData.rating}
                  onChange={(e) => handleChange("rating", e.target.value)}
                  placeholder="e.g., 4.5"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Number of Reviews"
                  value={formData.reviews}
                  onChange={(e) => handleChange("reviews", e.target.value)}
                  placeholder="e.g., 150"
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Services Section */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              Services Offered
            </Typography>

            {formData.services.map((service, idx) => (
              <Paper key={`service-${idx}`} elevation={1} sx={{ p: 2, mb: 2 }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <TextField
                    fullWidth
                    label={`Service ${idx + 1}`}
                    value={service.name}
                    onChange={(e) => handleServiceChange(idx, "name", e.target.value)}
                    placeholder="e.g., Web Development, Hair Cutting, Car Repair"
                  />
                  <TextField
                    select
                    label="Icon"
                    value={service.icon}
                    onChange={(e) => handleServiceChange(idx, "icon", e.target.value)}
                    SelectProps={{ native: true }}
                    sx={{ minWidth: 120 }}
                  >
                    <option value="default">Default</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="medical">Medical</option>
                    <option value="education">Education</option>
                    <option value="fitness">Fitness</option>
                    <option value="beauty">Beauty</option>
                    <option value="tech">Technology</option>
                    <option value="automotive">Automotive</option>
                    <option value="home">Home/Real Estate</option>
                  </TextField>
                  <IconButton onClick={() => handleDeleteArrayItem("services", idx)}>
                    <Close />
                  </IconButton>
                </Box>
              </Paper>
            ))}

            <Button startIcon={<Add />} onClick={() => handleAddField("services")}>
              Add Service
            </Button>
          </TabPanel>

          {/* Contact Section */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: "text.secondary" }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: "text.secondary" }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Business Address"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  InputProps={{
                    startAdornment: <LocationOn sx={{ mr: 1, color: "text.secondary" }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Operating Hours"
                  value={formData.hours}
                  onChange={(e) => handleChange("hours", e.target.value)}
                  placeholder="e.g., Mon-Fri 9AM-6PM"
                  InputProps={{
                    startAdornment: <Schedule sx={{ mr: 1, color: "text.secondary" }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Current Status"
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  SelectProps={{ native: true }}
                >
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                  <option value="Temporarily Closed">Temporarily Closed</option>
                </TextField>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Location Coordinates
            </Typography>
            {locationError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {locationError}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Latitude"
                  value={formData.coordinates.latitude}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      coordinates: { ...prev.coordinates, latitude: e.target.value },
                    }))
                  }
                  placeholder="e.g., -26.2041"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Longitude"
                  value={formData.coordinates.longitude}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      coordinates: { ...prev.coordinates, longitude: e.target.value },
                    }))
                  }
                  placeholder="e.g., 28.0473"
                />
              </Grid>
            </Grid>

            <Box display="flex" gap={1} mt={2}>
              <Button
                variant="outlined"
                startIcon={<MyLocation />}
                onClick={getCurrentLocation}
                disabled={gettingLocation}
              >
                {gettingLocation ? "Getting Location..." : "Use My Location"}
              </Button>
              <Button variant="outlined" startIcon={<Map />} onClick={() => setMapOpen(true)}>
                Select on Map
              </Button>
            </Box>

            {formData.coordinates.latitude && formData.coordinates.longitude && (
              <Box mt={2}>
                <Chip
                  icon={<LocationOn />}
                  label={`${Number.parseFloat(formData.coordinates.latitude).toFixed(4)}, ${Number.parseFloat(formData.coordinates.longitude).toFixed(4)}`}
                  color="primary"
                  variant="outlined"
                />
              </Box>
            )}
          </TabPanel>

          {/* Gallery Section */}
          <TabPanel value={tabValue} index={4}>
            <Typography variant="h6" gutterBottom>
              Gallery & Media
            </Typography>

            {/* Gallery Images Section */}
            <Box mt={3}>
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Image /> Gallery Images
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Upload high-quality images showcasing your business, products, or services
              </Typography>

              {formData.gallery.images.map((url, idx) => (
                <Box key={`gallery-image-${idx}`} display="flex" alignItems="center" gap={2} mb={1}>
                  <img
                    src={url || "/placeholder.svg?height=60&width=60&query=gallery"}
                    alt={`gallery-${idx}`}
                    style={{ width: 60, height: 60, objectFit: "cover", cursor: "pointer", borderRadius: 4 }}
                    onClick={() => setImagePreview(url)}
                  />
                  <TextField
                    fullWidth
                    margin="dense"
                    label={`Gallery Image ${idx + 1}`}
                    value={url}
                    onChange={(e) => handleGalleryArrayChange("images", idx, e.target.value)}
                    placeholder="https://example.com/gallery-image.jpg"
                  />
                  <IconButton onClick={() => handleDeleteGalleryItem("images", idx)}>
                    <Close />
                  </IconButton>
                </Box>
              ))}
              <Box display="flex" gap={1} mt={2}>
                <Button onClick={() => handleAddGalleryField("images")}>Add Image URL</Button>
                <Button variant="outlined" component="label" startIcon={<UploadFile />} disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload Images"}
                  <input
                    hidden
                    multiple
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleGalleryFileUpload(e, "images")}
                  />
                </Button>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Catalogues Section */}
            <Box mt={3}>
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Image /> Catalogues & Brochures
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Upload product catalogues, brochures, or promotional materials
              </Typography>

              {formData.gallery.catalogues.map((url, idx) => (
                <Box key={`catalogue-${idx}`} display="flex" alignItems="center" gap={2} mb={1}>
                  <img
                    src={url || "/placeholder.svg?height=60&width=60&query=catalogue"}
                    alt={`catalogue-${idx}`}
                    style={{ width: 60, height: 60, objectFit: "cover", cursor: "pointer", borderRadius: 4 }}
                    onClick={() => setImagePreview(url)}
                  />
                  <TextField
                    fullWidth
                    margin="dense"
                    label={`Catalogue ${idx + 1}`}
                    value={url}
                    onChange={(e) => handleGalleryArrayChange("catalogues", idx, e.target.value)}
                    placeholder="https://example.com/catalogue.pdf or image URL"
                  />
                  <IconButton onClick={() => handleDeleteGalleryItem("catalogues", idx)}>
                    <Close />
                  </IconButton>
                </Box>
              ))}
              <Box display="flex" gap={1} mt={2}>
                <Button onClick={() => handleAddGalleryField("catalogues")}>Add Catalogue URL</Button>
                <Button variant="outlined" component="label" startIcon={<UploadFile />} disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload Catalogues"}
                  <input
                    hidden
                    multiple
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleGalleryFileUpload(e, "catalogues")}
                  />
                </Button>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Videos Section */}
            <Box mt={3}>
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <VideoLibrary /> Videos
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Add video URLs from YouTube, Vimeo, or other platforms to showcase your business
              </Typography>

              {formData.gallery.videos.map((url, idx) => (
                <Box key={`video-${idx}`} display="flex" alignItems="center" gap={2} mb={1}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      backgroundColor: "grey.200",
                      borderRadius: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <VideoLibrary color="action" />
                  </Box>
                  <TextField
                    fullWidth
                    margin="dense"
                    label={`Video URL ${idx + 1}`}
                    value={url}
                    onChange={(e) => handleGalleryArrayChange("videos", idx, e.target.value)}
                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                  />
                  <IconButton onClick={() => handleDeleteGalleryItem("videos", idx)}>
                    <Close />
                  </IconButton>
                </Box>
              ))}
              <Button startIcon={<Add />} onClick={() => handleAddGalleryField("videos")}>
                Add Video URL
              </Button>
            </Box>
          </TabPanel>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editId ? "Update" : "Create"} Business
          </Button>
        </DialogActions>
      </Dialog>

      <Modal open={!!imagePreview} onClose={() => setImagePreview(null)}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100vh"
          bgcolor="rgba(0,0,0,0.85)"
          position="relative"
        >
          <IconButton
            onClick={() => setImagePreview(null)}
            style={{ position: "absolute", top: 16, right: 16, color: "#fff" }}
          >
            <Close />
          </IconButton>
          <img
            src={imagePreview || "/placeholder.svg"}
            alt="Large preview"
            style={{ maxHeight: "90%", maxWidth: "90%" }}
          />
        </Box>
      </Modal>

      {/* Map Selection Modal */}
      <Modal open={mapOpen} onClose={() => setMapOpen(false)}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          width="90%"
          maxWidth={800}
          height="80%"
          bgcolor="background.paper"
          borderRadius={2}
          boxShadow={24}
          p={3}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Select Location on Map</Typography>
            <IconButton onClick={() => setMapOpen(false)}>
              <Close />
            </IconButton>
          </Box>

          <Box height="calc(100% - 80px)" position="relative">
            <MapComponent
              latitude={formData.coordinates.latitude}
              longitude={formData.coordinates.longitude}
              onLocationSelect={handleMapClick}
            />
          </Box>

          <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
            <Button onClick={() => setMapOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => setMapOpen(false)}>
              Confirm Location
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  )
}

// Map Component using OpenStreetMap
const MapComponent = ({ latitude, longitude, onLocationSelect }) => {
  const [map, setMap] = useState(null)
  const [marker, setMarker] = useState(null)

  useEffect(() => {
    const mapContainer = document.getElementById("map-container")
    if (!mapContainer) return

    const defaultLat = latitude ? Number.parseFloat(latitude) : -26.2041
    const defaultLng = longitude ? Number.parseFloat(longitude) : 28.0473

    const mapHtml = ``
    // Added Leaflet map initialization code
    mapContainer.innerHTML = `
      <div style="height: 100%; width: 100%; position: relative; border-radius: 8px; overflow: hidden;">
        <div id="leaflet-map" style="height: 100%; width: 100%;"></div>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.js"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.css" />
        <script>
          const map = L.map('leaflet-map').setView([${defaultLat}, ${defaultLng}], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);
          
          let marker;
          
          if (${latitude} && ${longitude}) {
            marker = L.marker([${defaultLat}, ${defaultLng}]).addTo(map);
          }
          
          map.on('click', function(e) {
            if (marker) {
              map.removeLayer(marker);
            }
            marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
            
            window.parent.postMessage({
              type: 'map-click',
              latitude: e.latlng.lat,
              longitude: e.latlng.lng
            }, '*');
          });
        </script>
      </div>
    `

    const handleMessage = (event) => {
      if (event.data.type === "map-click") {
        onLocationSelect(event.data.latitude, event.data.longitude)
      }
    }

    window.addEventListener("message", handleMessage)

    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [latitude, longitude, onLocationSelect])

  return (
    <div
      id="map-container"
      style={{
        height: "100%",
        width: "100%",
        borderRadius: "8px",
        border: "1px solid #ddd",
      }}
    />
  )
}

export default Business
