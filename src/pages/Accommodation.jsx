import React, { useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Typography, Grid, Card, CardMedia, CardContent, IconButton, Modal,
  Chip, Alert
} from '@mui/material';
import { Add, Delete, Edit, UploadFile, Close, LocationOn, MyLocation, Map } from '@mui/icons-material';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db } from '../firebase/Config';
// import { v4 as uuidv4 } from 'uuid';

const storage = getStorage();

function Accommodation() {
  const [accommodations, setAccommodations] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', description: '', location: '', type: '', price: '', rating: '',
    reviews: '', maxGuests: '', availability: '', amenities: [''], images: [''],
    coordinates: { latitude: '', longitude: '' }
  });
  const [editId, setEditId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    const fetchAccommodations = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'accommodations'));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Debug: Log the data to check for duplicate IDs
        console.log('Accommodations data:', data);
        const ids = data.map(item => item.id);
        const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
        if (duplicateIds.length > 0) {
          console.warn('Duplicate IDs found:', duplicateIds);
        }
        
        // Remove any potential duplicates based on ID
        const uniqueData = data.filter((item, index, self) => 
          index === self.findIndex(t => t.id === item.id)
        );
        
        setAccommodations(uniqueData);
      } catch (error) {
        console.error('Error fetching accommodations:', error);
      }
    };
    fetchAccommodations();
  }, []);

  const handleOpen = (item = null) => {
  if (item) {
    setEditId(item.id);
    setFormData({
      ...item,
      coordinates: {
        latitude: item.coordinates?.latitude || '',
        longitude: item.coordinates?.longitude || '',
      },
      amenities: item.amenities || [''],
      images: item.images || [''],
    });
  } else {
    setEditId(null);
    setFormData({
      name: '', description: '', location: '', type: '', price: '', rating: '',
      reviews: '', maxGuests: '', availability: '', amenities: [''], images: [''],
      coordinates: { latitude: '', longitude: '' }
    });
  }
  setOpen(true);
};


  const handleClose = () => {
    setOpen(false);
    setEditId(null);
    setMapOpen(false);
    setLocationError('');
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field, index, value) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData(prev => ({ ...prev, [field]: updated }));
  };

  const handleDeleteArrayItem = (field, index) => {
    const updated = [...formData[field]];
    updated.splice(index, 1);
    setFormData(prev => ({ ...prev, [field]: updated }));
  };

  const handleAddField = (field, defaultValue = '') => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], defaultValue] }));
  };

  // Get user's current location
  const getCurrentLocation = () => {
    setGettingLocation(true);
    setLocationError('');
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          coordinates: {
            latitude: latitude.toString(),
            longitude: longitude.toString()
          }
        }));
        setGettingLocation(false);
      },
      (error) => {
        let errorMessage = 'Unable to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
          default:
            errorMessage = 'An unknown error occurred';
        }
        setLocationError(errorMessage);
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  // Handle map click to set coordinates
  const handleMapClick = (lat, lng) => {
    setFormData(prev => ({
      ...prev,
      coordinates: {
        latitude: lat.toString(),
        longitude: lng.toString()
      }
    }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);

    try {
      const urls = await Promise.all(
        files.map(async (file) => {
          const ref = storageRef(storage, `accommodations/${Date.now()}-${file.name}`);
          const snapshot = await uploadBytesResumable(ref, file);
          return await getDownloadURL(snapshot.ref);
        })
      );
      setFormData(prev => ({ ...prev, images: [...prev.images, ...urls] }));
    } catch (error) {
      console.error('Image upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'accommodations', id));
      setAccommodations(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting accommodation:', error);
    }
  };

  // Helper function to create a safe document ID from accommodation name
  const createDocumentId = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .substring(0, 50); // Limit length to 50 characters
  };

  const handleSubmit = async () => {
    // Clean the formData to remove empty strings from arrays
    const cleanFormData = {
      ...formData,
      amenities: formData.amenities.filter(item => item.trim() !== ''),
      images: formData.images.filter(item => item.trim() !== '')
    };

    if (editId) {
      // For editing, check if name changed
      const newDocId = createDocumentId(cleanFormData.name);
      
      if (editId !== newDocId) {
        // Name changed, need to create new document and delete old one
        await setDoc(doc(db, 'accommodations', newDocId), {
          ...cleanFormData,
          createdAt: new Date(),
        });
        await deleteDoc(doc(db, 'accommodations', editId));
        
        // Update local state
        setAccommodations(prev => 
          prev.map(r => r.id === editId ? { ...cleanFormData, id: newDocId } : r)
        );
      } else {
        // Name didn't change, just update
        await updateDoc(doc(db, 'accommodations', editId), cleanFormData);
        setAccommodations(prev => 
          prev.map(r => r.id === editId ? { ...cleanFormData, id: editId } : r)
        );
      }
    } else {
      // Creating new accommodation
      const docId = createDocumentId(cleanFormData.name);
      
      await setDoc(doc(db, 'accommodations', docId), {
        ...cleanFormData,
        createdAt: new Date(),
      });
      
      setAccommodations(prev => [...prev, { ...cleanFormData, id: docId }]);
    }
    handleClose();
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Accommodations</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>Add</Button>
      </Box>
      <Grid container spacing={2} mt={2}>
        {accommodations.map((a, index) => (
          <Grid item xs={12} sm={6} md={4} key={a.id || `accommodation-${index}`}>
            <Card>
              <CardMedia component="img" height="140" image={a.images?.[0] || ''} alt={a.name} />
              <CardContent>
                <Typography variant="h6">{a.name}</Typography>
                <Typography variant="body2" color="text.secondary">{a.location}</Typography>
                <Typography variant="body2">R{a.price} • ⭐ {a.rating}</Typography>

               {a.coordinates &&
  !isNaN(parseFloat(a.coordinates.latitude)) &&
  !isNaN(parseFloat(a.coordinates.longitude)) && (
    <Box display="flex" alignItems="center" mt={1}>
      <LocationOn fontSize="small" color="primary" />
      <Typography variant="caption" ml={0.5}>
        {parseFloat(a.coordinates.latitude).toFixed(4)}, {parseFloat(a.coordinates.longitude).toFixed(4)}
      </Typography>
    </Box>
)}


              </CardContent>
              <Box display="flex" justifyContent="flex-end">
                <IconButton onClick={() => handleOpen(a)}><Edit /></IconButton>
                <IconButton onClick={() => handleDelete(a.id)}><Delete /></IconButton>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editId ? 'Edit' : 'Add'} Accommodation</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {['name', 'description', 'location', 'type', 'price', 'rating', 'reviews', 'maxGuests', 'availability'].map(field => (
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
              <Typography variant="h6" gutterBottom>Location Coordinates</Typography>
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
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      coordinates: { ...prev.coordinates, latitude: e.target.value }
                    }))}
                    placeholder="e.g., -26.2041"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Longitude"
                    value={formData.coordinates.longitude}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      coordinates: { ...prev.coordinates, longitude: e.target.value }
                    }))}
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
                  {gettingLocation ? 'Getting Location...' : 'Use My Location'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Map />}
                  onClick={() => setMapOpen(true)}
                >
                  Select on Map
                </Button>
              </Box>
              
              {formData.coordinates.latitude && formData.coordinates.longitude && (
                <Box mt={2}>
                  <Chip
                    icon={<LocationOn />}
                    label={`${parseFloat(formData.coordinates.latitude).toFixed(4)}, ${parseFloat(formData.coordinates.longitude).toFixed(4)}`}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <Typography>Amenities:</Typography>
              {formData.amenities.map((item, idx) => (
                <Box key={`amenity-${idx}-${Date.now()}`} display="flex" alignItems="center" gap={1}>
                  <TextField
                    fullWidth
                    margin="dense"
                    label={`Amenity ${idx + 1}`}
                    value={item}
                    onChange={(e) => handleArrayChange('amenities', idx, e.target.value)}
                  />
                  <IconButton onClick={() => handleDeleteArrayItem('amenities', idx)}><Close /></IconButton>
                </Box>
              ))}
              <Button onClick={() => handleAddField('amenities')}>Add Amenity</Button>
            </Grid>

            <Grid item xs={12}>
              <Typography>Images:</Typography>
              {formData.images.map((url, idx) => (
                <Box key={`image-${idx}-${url.substring(0, 20)}`} display="flex" alignItems="center" gap={2} mb={1}>
                  <img
                    src={url}
                    alt={`thumb-${idx}`}
                    style={{ width: 60, height: 60, objectFit: 'cover', cursor: 'pointer', borderRadius: 4 }}
                    onClick={() => setImagePreview(url)}
                  />
                  <TextField
                    fullWidth
                    margin="dense"
                    label={`Image URL ${idx + 1}`}
                    value={url}
                    onChange={(e) => handleArrayChange('images', idx, e.target.value)}
                  />
                  <IconButton onClick={() => handleDeleteArrayItem('images', idx)}><Close /></IconButton>
                </Box>
              ))}
              <Button onClick={() => handleAddField('images')}>Add Image URL</Button>
              <Button variant="outlined" component="label" startIcon={<UploadFile />} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload Images'}
                <input hidden multiple type="file" accept="image/*" onChange={handleFileUpload} />
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>{editId ? 'Update' : 'Create'}</Button>
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
            style={{ position: 'absolute', top: 16, right: 16, color: '#fff' }}
          >
            <Close />
          </IconButton>
          <img src={imagePreview} alt="Large preview" style={{ maxHeight: '90%', maxWidth: '90%' }} />
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
  );
}

// Map Component using OpenStreetMap
const MapComponent = ({ latitude, longitude, onLocationSelect }) => {
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);

  useEffect(() => {
    // Initialize map
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;

    // Default to Johannesburg if no coordinates
    const defaultLat = latitude ? parseFloat(latitude) : -26.2041;
    const defaultLng = longitude ? parseFloat(longitude) : 28.0473;

    const mapHtml = `
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
            
            // Send coordinates to parent component
            window.parent.postMessage({
              type: 'map-click',
              latitude: e.latlng.lat,
              longitude: e.latlng.lng
            }, '*');
          });
        </script>
      </div>
    `;

    mapContainer.innerHTML = mapHtml;

    // Listen for map click events
    const handleMessage = (event) => {
      if (event.data.type === 'map-click') {
        onLocationSelect(event.data.latitude, event.data.longitude);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [latitude, longitude, onLocationSelect]);

  return (
    <div 
      id="map-container" 
      style={{ 
        height: '100%', 
        width: '100%',
        borderRadius: '8px',
        border: '1px solid #ddd'
      }}
    />
  );
};

export default Accommodation;