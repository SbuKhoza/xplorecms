import React, { useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Typography, Grid, Card, CardMedia, CardContent,
  IconButton, Chip, Modal, Alert
} from '@mui/material';
import { Add, Delete, Edit, UploadFile, Close, LocationOn, MyLocation, Map } from '@mui/icons-material';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc
} from 'firebase/firestore';
import {
  getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL
} from 'firebase/storage';
import { db } from '../firebase/Config';
import Autocomplete from '@mui/material/Autocomplete';

const storage = getStorage();

const availabilityOptions = ['Reservations Required', 'Available', 'Not Available', 'Reserved'];
const typeOptions = ['Fine Dining', 'Pub and Grill', 'Kasi Fast-food', 'Fast Food', 'Traditional'];
const cuisineOptions = ['Fine Dining', 'Pub and Grill', 'Kasi Fast-food', 'Fast Food', 'Traditional', 'Dessert', 'Chisa-Nyama/Grill'];
const tagOptions = ['Fine Dining', 'Pub and Grill', 'Kasi Fast-food', 'Fast Food', 'Traditional', 'Casual', 'African', 'Vegan', 'Halal', 'Buffet', 'Cafe'];

function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', cuisine: '', type: '', description: '', location: '',
    openingHours: '', availability: '', rating: '', reviews: '',
    images: [''], specialDishes: [''], tableOptions: [2, 4, 6, 8],
    coordinates: { latitude: '', longitude: '' },
    tags: []
  });
  const [editId, setEditId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [availabilityOptions, setAvailabilityOptions] = useState(['Reservations Required', 'Available', 'Not Available', 'Reserved']);
  const [typeOptions, setTypeOptions] = useState(['Fine Dining', 'Pub and Grill', 'Kasi Fast-food', 'Fast Food', 'Traditional']);
  const [cuisineOptions, setCuisineOptions] = useState(['Fine Dining', 'Pub and Grill', 'Kasi Fast-food', 'Fast Food', 'Traditional', 'Dessert', 'Chisa-Nyama/Grill']);
  const [tagOptions, setTagOptions] = useState(['Fine Dining', 'Pub and Grill', 'Kasi Fast-food', 'Fast Food', 'Traditional', 'Casual', 'African', 'Vegan', 'Halal', 'Buffet', 'Cafe']);
  const [tempInputValues, setTempInputValues] = useState({
    cuisine: '',
    type: '',
    availability: '',
    tags: ''
  });

  useEffect(() => {
    const fetchRestaurants = async () => {
      const querySnapshot = await getDocs(collection(db, 'restaurants'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRestaurants(data);
    };
    
    const fetchDropdownOptions = async () => {
      try {
        const optionsSnapshot = await getDocs(collection(db, 'dropdownOptions'));
        optionsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          switch (doc.id) {
            case 'cuisineOptions':
              setCuisineOptions(data.options || cuisineOptions);
              break;
            case 'typeOptions':
              setTypeOptions(data.options || typeOptions);
              break;
            case 'availabilityOptions':
              setAvailabilityOptions(data.options || availabilityOptions);
              break;
            case 'tagOptions':
              setTagOptions(data.options || tagOptions);
              break;
            default:
              break;
          }
        });
      } catch (error) {
        console.error('Error fetching dropdown options:', error);
      }
    };
    
    fetchRestaurants();
    fetchDropdownOptions();
  }, []);

  const handleOpen = (restaurant = null) => {
    if (restaurant) {
      setEditId(restaurant.id);
      setFormData({
        ...restaurant,
        coordinates: {
          latitude: restaurant.coordinates?.latitude || '',
          longitude: restaurant.coordinates?.longitude || '',
        },
        images: restaurant.images || [''],
        specialDishes: restaurant.specialDishes || [''],
        tableOptions: restaurant.tableOptions || [2, 4, 6, 8],
        tags: restaurant.tags || []
      });
    } else {
      setEditId(null);
      setFormData({
        name: '', cuisine: '', type: '', description: '', location: '',
        openingHours: '', availability: '', rating: '', reviews: '',
        images: [''], specialDishes: [''], tableOptions: [2, 4, 6, 8],
        coordinates: { latitude: '', longitude: '' },
        tags: []
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

  const handleAddToOptions = async (field, value) => {
    // Use the temp input value if provided, otherwise use the current form value
    const valueToSave = value || tempInputValues[field] || formData[field];
    
    if (!valueToSave || valueToSave.trim() === '') return;
    
    const trimmedValue = valueToSave.trim();
    let newOptions = [];
    let docId = '';
    
    switch (field) {
      case 'cuisine':
        if (!cuisineOptions.includes(trimmedValue)) {
          newOptions = [...cuisineOptions, trimmedValue];
          setCuisineOptions(newOptions);
          docId = 'cuisineOptions';
          // Also update the form data
          setFormData(prev => ({ ...prev, cuisine: trimmedValue }));
        }
        break;
      case 'type':
        if (!typeOptions.includes(trimmedValue)) {
          newOptions = [...typeOptions, trimmedValue];
          setTypeOptions(newOptions);
          docId = 'typeOptions';
          // Also update the form data
          setFormData(prev => ({ ...prev, type: trimmedValue }));
        }
        break;
      case 'availability':
        if (!availabilityOptions.includes(trimmedValue)) {
          newOptions = [...availabilityOptions, trimmedValue];
          setAvailabilityOptions(newOptions);
          docId = 'availabilityOptions';
          // Also update the form data
          setFormData(prev => ({ ...prev, availability: trimmedValue }));
        }
        break;
      case 'tags':
        if (!tagOptions.includes(trimmedValue)) {
          newOptions = [...tagOptions, trimmedValue];
          setTagOptions(newOptions);
          docId = 'tagOptions';
        }
        break;
      default:
        return;
    }
    
    // Save to Firebase
    if (newOptions.length > 0 && docId) {
      try {
        await setDoc(doc(db, 'dropdownOptions', docId), {
          options: newOptions,
          updatedAt: new Date()
        }, { merge: true });
        console.log(`Successfully saved ${field} options to Firebase`);
        
        // Clear the temp input value after saving
        setTempInputValues(prev => ({ ...prev, [field]: '' }));
      } catch (error) {
        console.error(`Error saving ${field} options to Firebase:`, error);
      }
    }
  };

  const handleInputChange = (field, inputValue) => {
    setTempInputValues(prev => ({ ...prev, [field]: inputValue }));
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

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);

    try {
      const urls = await Promise.all(
        files.map(async (file) => {
          const ref = storageRef(storage, `restaurants/${Date.now()}-${file.name}`);
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

  const handleMapClick = (lat, lng) => {
    setFormData(prev => ({
      ...prev,
      coordinates: {
        latitude: lat.toString(),
        longitude: lng.toString()
      }
    }));
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'restaurants', id));
    setRestaurants(prev => prev.filter(r => r.id !== id));
  };

  const handleSubmit = async () => {
    const cleanData = {
      ...formData,
      images: formData.images.filter(img => img.trim() !== ''),
      specialDishes: formData.specialDishes.filter(dish => dish.trim() !== '')
    };

    if (editId) {
      await updateDoc(doc(db, 'restaurants', editId), cleanData);
      setRestaurants(prev => prev.map(r => r.id === editId ? { ...cleanData, id: editId } : r));
    } else {
      const docRef = await addDoc(collection(db, 'restaurants'), {
        ...cleanData,
        createdAt: new Date()
      });
      setRestaurants(prev => [...prev, { ...cleanData, id: docRef.id }]);
    }
    handleClose();
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Restaurants</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>Add</Button>
      </Box>

      <Grid container spacing={2} mt={2}>
        {restaurants.map((restaurant, index) => (
          <Grid item xs={12} sm={6} md={4} key={restaurant.id || index}>
            <Card>
              <CardMedia component="img" height="140" image={restaurant.images?.[0] || ''} alt={restaurant.name} />
              <CardContent>
                <Typography variant="h6">{restaurant.name}</Typography>
                <Typography variant="body2" color="text.secondary">{restaurant.cuisine} • {restaurant.type}</Typography>
                <Typography variant="body2">  ⭐ {restaurant.rating}</Typography>
                {restaurant.coordinates?.latitude && restaurant.coordinates?.longitude && (
                  <Box display="flex" alignItems="center" mt={1}>
                    <LocationOn fontSize="small" color="primary" />
                    <Typography variant="caption" ml={0.5}>
                      {parseFloat(restaurant.coordinates.latitude).toFixed(4)}, {parseFloat(restaurant.coordinates.longitude).toFixed(4)}
                    </Typography>
                  </Box>
                )}
              </CardContent>
              <Box display="flex" justifyContent="flex-end">
                <IconButton onClick={() => handleOpen(restaurant)}><Edit /></IconButton>
                <IconButton onClick={() => handleDelete(restaurant.id)}><Delete /></IconButton>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editId ? 'Edit' : 'Add'} Restaurant</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <Autocomplete
                  freeSolo
                  options={cuisineOptions}
                  value={formData.cuisine}
                  onChange={(e, newValue) => handleChange('cuisine', newValue || '')}
                  onInputChange={(e, inputValue) => handleInputChange('cuisine', inputValue)}
                  renderInput={(params) => <TextField {...params} label="Cuisine" />}
                  sx={{ flexGrow: 1 }}
                />
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => handleAddToOptions('cuisine')}
                  disabled={!formData.cuisine && !tempInputValues.cuisine}
                >
                  Save
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <Autocomplete
                  freeSolo
                  options={availabilityOptions}
                  value={formData.availability}
                  onChange={(e, newValue) => handleChange('availability', newValue || '')}
                  onInputChange={(e, inputValue) => handleInputChange('availability', inputValue)}
                  renderInput={(params) => <TextField {...params} label="Availability" />}
                  sx={{ flexGrow: 1 }}
                />
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => handleAddToOptions('availability')}
                  disabled={!formData.availability && !tempInputValues.availability}
                >
                  Save
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <Autocomplete
                  freeSolo
                  options={typeOptions}
                  value={formData.type}
                  onChange={(e, newValue) => handleChange('type', newValue || '')}
                  onInputChange={(e, inputValue) => handleInputChange('type', inputValue)}
                  renderInput={(params) => <TextField {...params} label="Type" />}
                  sx={{ flexGrow: 1 }}
                />
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => handleAddToOptions('type')}
                  disabled={!formData.type && !tempInputValues.type}
                >
                  Save
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={tagOptions}
                value={formData.tags || []}
                onChange={(e, newValue) => handleChange('tags', newValue)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip key={option} label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => <TextField {...params} label="Tags (e.g. Vegan, Halal, Cafe)" />}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth label="Description" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} />
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth label="Location" value={formData.location} onChange={(e) => handleChange('location', e.target.value)} />
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth label="Opening Hours" value={formData.openingHours} onChange={(e) => handleChange('openingHours', e.target.value)} />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Upload Images</Typography>
              <Button variant="outlined" component="label" startIcon={<UploadFile />} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload Images'}
                <input hidden multiple type="file" accept="image/*" onChange={handleFileUpload} />
              </Button>
              {formData.images.map((url, idx) => (
                <Box key={idx} display="flex" alignItems="center" mt={1} gap={2}>
                  <img src={url} alt={`preview-${idx}`} width={60} height={60} style={{ objectFit: 'cover', borderRadius: 4 }} />
                  <TextField
                    fullWidth
                    label={`Image URL ${idx + 1}`}
                    value={url}
                    onChange={(e) => handleArrayChange('images', idx, e.target.value)}
                  />
                  <IconButton onClick={() => handleDeleteArrayItem('images', idx)}><Close /></IconButton>
                </Box>
              ))}
              <Button onClick={() => handleAddField('images')}>Add Image URL</Button>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Location Coordinates</Typography>
              {locationError && <Alert severity="error" sx={{ mb: 2 }}>{locationError}</Alert>}
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
                <Button variant="outlined" startIcon={<MyLocation />} onClick={getCurrentLocation} disabled={gettingLocation}>
                  {gettingLocation ? 'Getting Location...' : 'Use My Location'}
                </Button>
                <Button variant="outlined" startIcon={<Map />} onClick={() => setMapOpen(true)}>
                  Select on Map
                </Button>
              </Box>

              {formData.coordinates.latitude && formData.coordinates.longitude && (
                <Box mt={2}>
                  <Chip icon={<LocationOn />} label={`${parseFloat(formData.coordinates.latitude).toFixed(4)}, ${parseFloat(formData.coordinates.longitude).toFixed(4)}`} color="primary" variant="outlined" />
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>{editId ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Restaurants;