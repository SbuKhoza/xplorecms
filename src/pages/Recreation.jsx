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
} from "@mui/material"
import { Add, Delete, Edit, UploadFile, Close, LocationOn, MyLocation } from "@mui/icons-material"
import { collection, getDocs, updateDoc, deleteDoc, doc, setDoc } from "firebase/firestore"
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { db } from "../firebase/Config"
import MapComponent from "../components/MapComponent"

const storage = getStorage()

const Recreation = () => {
  const [recreation, setRecreation] = useState([])
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    type: "",
    category: "",
    rating: "",
    reviews: "",
    entryFee: "",
    duration: "",
    ageRestriction: "",
    status: "Open",
    activities: [""],
    images: [""],
    phone: "",
    email: "",
    coordinates: { latitude: "", longitude: "" },
  })
  const [editId, setEditId] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [mapOpen, setMapOpen] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState("")
  const [favorites, setFavorites] = useState(new Set())
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    const fetchRecreation = async () => {
      try {
        setDataLoading(true)
        const querySnapshot = await getDocs(collection(db, "recreation"))
        const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        console.log("Recreation data:", data)
        const ids = data.map((item) => item.id)
        const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index)
        if (duplicateIds.length > 0) {
          console.warn("Duplicate IDs found:", duplicateIds)
        }

        const uniqueData = data.filter((item, index, self) => index === self.findIndex((t) => t.id === item.id))

        setRecreation(uniqueData)
      } catch (error) {
        console.error("Error fetching recreation:", error)
      } finally {
        setDataLoading(false)
      }
    }
    fetchRecreation()
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
        activities: item.activities || [""],
        images: item.images || [""],
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
        entryFee: "",
        duration: "",
        ageRestriction: "",
        status: "Open",
        activities: [""],
        images: [""],
        phone: "",
        email: "",
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
          const ref = storageRef(storage, `recreation/${Date.now()}-${file.name}`)
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
      await deleteDoc(doc(db, "recreation", id))
      setRecreation((prev) => prev.filter((r) => r.id !== id))
    } catch (error) {
      console.error("Error deleting recreation:", error)
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
    console.log("[v0] Starting form submission...")
    console.log("[v0] Form data before cleaning:", formData)

    const cleanFormData = {
      ...formData,
      activities: formData.activities.filter((item) => item.trim() !== ""),
      images: formData.images.filter((item) => item.trim() !== ""),
    }

    console.log("[v0] Cleaned form data:", cleanFormData)

    try {
      if (editId) {
        console.log("[v0] Updating existing recreation with ID:", editId)
        const newDocId = createDocumentId(cleanFormData.name)
        console.log("[v0] New document ID:", newDocId)

        if (editId !== newDocId) {
          await setDoc(doc(db, "recreation", newDocId), {
            ...cleanFormData,
            createdAt: new Date(),
          })
          await deleteDoc(doc(db, "recreation", editId))

          setRecreation((prev) => prev.map((r) => (r.id === editId ? { ...cleanFormData, id: newDocId } : r)))
        } else {
          await updateDoc(doc(db, "recreation", editId), cleanFormData)
          setRecreation((prev) => prev.map((r) => (r.id === editId ? { ...cleanFormData, id: editId } : r)))
        }
        console.log("[v0] Successfully updated recreation")
      } else {
        console.log("[v0] Creating new recreation facility...")
        const docId = createDocumentId(cleanFormData.name)
        console.log("[v0] Generated document ID:", docId)

        if (!cleanFormData.name || !cleanFormData.location) {
          console.error("[v0] Missing required fields - name or location")
          alert("Please fill in the required fields: Name and Location")
          return
        }

        const docData = {
          ...cleanFormData,
          createdAt: new Date(),
        }

        console.log("[v0] Document data to save:", docData)

        await setDoc(doc(db, "recreation", docId), docData)
        console.log("[v0] Successfully saved to Firestore")

        setRecreation((prev) => [...prev, { ...cleanFormData, id: docId }])
        console.log("[v0] Updated local state")
      }

      console.log("[v0] Form submission completed successfully")
      handleClose()
    } catch (error) {
      console.error("[v0] Error in handleSubmit:", error)
      console.error("[v0] Error code:", error.code)
      console.error("[v0] Error message:", error.message)
      alert(`Error saving recreation facility: ${error.message}`)
    }
  }

  const toggleFavorite = (id) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(id)) {
      newFavorites.delete(id)
    } else {
      newFavorites.add(id)
    }
    setFavorites(newFavorites)
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} style={{ color: "#FFD700" }}>
          ★
        </span>,
      )
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" style={{ color: "#FFD700" }}>
          ½★
        </span>,
      )
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} style={{ color: "#FFD700" }}>
          ☆
        </span>,
      )
    }

    return stars
  }

  // Loading state
  if (dataLoading) {
    return (
      <Box p={3} display="flex" justifyContent="center" alignItems="center" flexDirection="column">
        <Typography variant="h6" color="#666">
          Loading recreation facilities...
        </Typography>
      </Box>
    )
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Recreation Facilities</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Add Recreation
        </Button>
      </Box>

      {recreation.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" mt={4}>
          <LocationOn fontSize="large" sx={{ color: "#ccc", fontSize: 60 }} />
          <Typography variant="h6" color="#999" mt={2}>
            No recreation facilities available
          </Typography>
          <Typography variant="body2" color="#999">
            Click "Add Recreation" to get started
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2} mt={2}>
          {recreation.map((r, index) => (
            <Grid item xs={12} sm={6} md={4} key={r.id || `recreation-${index}`}>
              <Card>
                <CardMedia component="img" height="140" image={r.images?.[0] || ""} alt={r.name} />
                <CardContent>
                  <Typography variant="h6">{r.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {r.location}
                  </Typography>
                  <Typography variant="body2">
                    {r.entryFee} • ⭐ {r.rating}
                  </Typography>
                  <Typography variant="body2" color="primary">
                    Duration: {r.duration}
                  </Typography>
                  {r.ageRestriction && (
                    <Typography variant="body2" color="warning.main">
                      Age: {r.ageRestriction}
                    </Typography>
                  )}

                  {r.coordinates &&
                    !isNaN(Number.parseFloat(r.coordinates.latitude)) &&
                    !isNaN(Number.parseFloat(r.coordinates.longitude)) && (
                      <Box display="flex" alignItems="center" mt={1}>
                        <LocationOn fontSize="small" color="primary" />
                        <Typography variant="caption" ml={0.5}>
                          {Number.parseFloat(r.coordinates.latitude).toFixed(4)},{" "}
                          {Number.parseFloat(r.coordinates.longitude).toFixed(4)}
                        </Typography>
                      </Box>
                    )}
                </CardContent>
                <Box display="flex" justifyContent="flex-end">
                  <IconButton onClick={() => handleOpen(r)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(r.id)}>
                    <Delete />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editId ? "Edit" : "Add"} Recreation Facility</DialogTitle>
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
              "entryFee",
              "duration",
              "ageRestriction",
              "status",
              "phone",
              "email",
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
                <Button variant="outlined" startIcon={<LocationOn />} onClick={() => setMapOpen(true)}>
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
              <Typography>Activities & Facilities:</Typography>
              {formData.activities.map((item, idx) => (
                <Box key={`activity-${idx}-${Date.now()}`} display="flex" alignItems="center" gap={1}>
                  <TextField
                    fullWidth
                    margin="dense"
                    label={`Activity ${idx + 1}`}
                    value={item}
                    onChange={(e) => handleArrayChange("activities", idx, e.target.value)}
                  />
                  <IconButton onClick={() => handleDeleteArrayItem("activities", idx)}>
                    <Close />
                  </IconButton>
                </Box>
              ))}
              <Button onClick={() => handleAddField("activities")}>Add Activity</Button>
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

export default Recreation
