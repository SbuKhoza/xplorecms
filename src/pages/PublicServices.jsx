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
  FormControlLabel,
  Checkbox,
} from "@mui/material"
import { Add, Delete, Edit, UploadFile, Close, LocationOn, MyLocation, Map } from "@mui/icons-material"
import { collection, getDocs, updateDoc, deleteDoc, doc, setDoc } from "firebase/firestore"
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { db } from "../firebase/Config"
import MapComponent from "../components/MapComponent"

const storage = getStorage()

const PublicServices = () => {
  const [publicServices, setPublicServices] = useState([])
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    type: "",
    category: "",
    rating: "",
    reviews: "",
    hours: "",
    status: "Open",
    emergency: false,
    accessibility: "",
    services: [""],
    images: [""],
    phone: "",
    email: "",
    website: "",
    coordinates: { latitude: "", longitude: "" },
  })
  const [editId, setEditId] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [mapOpen, setMapOpen] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState("")

  useEffect(() => {
    const fetchPublicServices = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "publicservice"))
        const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        console.log("Public Services data:", data)
        const ids = data.map((item) => item.id)
        const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index)
        if (duplicateIds.length > 0) {
          console.warn("Duplicate IDs found:", duplicateIds)
        }

        const uniqueData = data.filter((item, index, self) => index === self.findIndex((t) => t.id === item.id))

        setPublicServices(uniqueData)
      } catch (error) {
        console.error("Error fetching public services:", error)
      }
    }
    fetchPublicServices()
  }, [])

  const handleOpen = (item = null) => {
    if (item) {
      setEditId(item.id)
      setFormData({
        ...item,
        coordinates: {
          latitude: item.coordinates?.latitude || "",
          longitude: item.coordinates?.longitude || "",
        },
        services: item.services || [""],
        images: item.images || [""],
        emergency: item.emergency || false,
      })
    } else {
      setEditId(null)
      setFormData({
        name: "",
        description: "",
        location: "",
        type: "",
        category: "",
        rating: "",
        reviews: "",
        hours: "",
        status: "Open",
        emergency: false,
        accessibility: "",
        services: [""],
        images: [""],
        phone: "",
        email: "",
        website: "",
        coordinates: { latitude: "", longitude: "" },
      })
    }
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditId(null)
    setMapOpen(false)
    setLocationError("")
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleArrayChange = (field, index, value) => {
    const updated = [...formData[field]]
    updated[index] = value
    setFormData((prev) => ({ ...prev, [field]: updated }))
  }

  const handleDeleteArrayItem = (field, index) => {
    const updated = [...formData[field]]
    updated.splice(index, 1)
    setFormData((prev) => ({ ...prev, [field]: updated }))
  }

  const handleAddField = (field, defaultValue = "") => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], defaultValue] }))
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

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files)
    setUploading(true)

    try {
      const urls = await Promise.all(
        files.map(async (file) => {
          const ref = storageRef(storage, `publicservice/${Date.now()}-${file.name}`)
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

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "publicservice", id))
      setPublicServices((prev) => prev.filter((r) => r.id !== id))
    } catch (error) {
      console.error("Error deleting public service:", error)
    }
  }

  const createDocumentId = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 50)
  }

  const handleSubmit = async () => {
    const cleanFormData = {
      ...formData,
      services: formData.services.filter((item) => item.trim() !== ""),
      images: formData.images.filter((item) => item.trim() !== ""),
    }

    if (editId) {
      const newDocId = createDocumentId(cleanFormData.name)

      if (editId !== newDocId) {
        await setDoc(doc(db, "publicservice", newDocId), {
          ...cleanFormData,
          createdAt: new Date(),
        })
        await deleteDoc(doc(db, "publicservice", editId))

        setPublicServices((prev) => prev.map((r) => (r.id === editId ? { ...cleanFormData, id: newDocId } : r)))
      } else {
        await updateDoc(doc(db, "publicservice", editId), cleanFormData)
        setPublicServices((prev) => prev.map((r) => (r.id === editId ? { ...cleanFormData, id: editId } : r)))
      }
    } else {
      const docId = createDocumentId(cleanFormData.name)

      await setDoc(doc(db, "publicservice", docId), {
        ...cleanFormData,
        createdAt: new Date(),
      })

      setPublicServices((prev) => [...prev, { ...cleanFormData, id: docId }])
    }
    handleClose()
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Public Services</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Add Public Service
        </Button>
      </Box>
      <Grid container spacing={2} mt={2}>
        {publicServices.map((service, index) => (
          <Grid item xs={12} sm={6} md={4} key={service.id || `service-${index}`}>
            <Card>
              <CardMedia component="img" height="140" image={service.images?.[0] || ""} alt={service.name} />
              <CardContent>
                <Typography variant="h6">{service.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {service.location}
                </Typography>
                <Typography variant="body2">
                  {service.type} • ⭐ {service.rating}
                </Typography>
                <Typography variant="body2" color="primary">
                  {service.hours}
                </Typography>
                {service.emergency && <Chip label="Emergency Service" color="error" size="small" sx={{ mt: 1 }} />}
                {service.accessibility && (
                  <Typography variant="body2" color="success.main">
                    Accessibility: {service.accessibility}
                  </Typography>
                )}

                {service.coordinates &&
                  !isNaN(Number.parseFloat(service.coordinates.latitude)) &&
                  !isNaN(Number.parseFloat(service.coordinates.longitude)) && (
                    <Box display="flex" alignItems="center" mt={1}>
                      <LocationOn fontSize="small" color="primary" />
                      <Typography variant="caption" ml={0.5}>
                        {Number.parseFloat(service.coordinates.latitude).toFixed(4)},{" "}
                        {Number.parseFloat(service.coordinates.longitude).toFixed(4)}
                      </Typography>
                    </Box>
                  )}
              </CardContent>
              <Box display="flex" justifyContent="flex-end">
                <IconButton onClick={() => handleOpen(service)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(service.id)}>
                  <Delete />
                </IconButton>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editId ? "Edit" : "Add"} Public Service</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {[
              "name",
              "description",
              "location",
              "type",
              "category",
              "rating",
              "reviews",
              "hours",
              "status",
              "accessibility",
              "phone",
              "email",
              "website",
            ].map((field) => (
              <Grid item xs={12} sm={6} key={field}>
                <TextField
                  fullWidth
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={formData[field]}
                  onChange={(e) => handleChange(field, e.target.value)}
                />
              </Grid>
            ))}

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.emergency}
                    onChange={(e) => handleChange("emergency", e.target.checked)}
                  />
                }
                label="Emergency Service Available"
              />
            </Grid>

            {/* Location Coordinates Section */}
            <Grid item xs={12}>
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
            </Grid>

            <Grid item xs={12}>
              <Typography>Services Offered:</Typography>
              {formData.services.map((item, idx) => (
                <Box key={`service-${idx}-${Date.now()}`} display="flex" alignItems="center" gap={1}>
                  <TextField
                    fullWidth
                    margin="dense"
                    label={`Service ${idx + 1}`}
                    value={item}
                    onChange={(e) => handleArrayChange("services", idx, e.target.value)}
                  />
                  <IconButton onClick={() => handleDeleteArrayItem("services", idx)}>
                    <Close />
                  </IconButton>
                </Box>
              ))}
              <Button onClick={() => handleAddField("services")}>Add Service</Button>
            </Grid>

            <Grid item xs={12}>
              <Typography>Images:</Typography>
              {formData.images.map((url, idx) => (
                <Box key={`image-${idx}-${url.substring(0, 20)}`} display="flex" alignItems="center" gap={2} mb={1}>
                  <img
                    src={url || "/placeholder.svg"}
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
              <Button onClick={() => handleAddField("images")}>Add Image URL</Button>
              <Button variant="outlined" component="label" startIcon={<UploadFile />} disabled={uploading}>
                {uploading ? "Uploading..." : "Upload Images"}
                <input hidden multiple type="file" accept="image/*" onChange={handleFileUpload} />
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editId ? "Update" : "Create"}
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

export default PublicServices
