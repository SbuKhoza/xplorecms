import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  collection,
  deleteDoc,
  getDocs,
  doc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage } from '../firebase/Config';

function HomeManager() {
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [townships, setTownships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTownshipId, setEditingTownshipId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [uploading, setUploading] = useState(false);

  const homescreenRef = collection(db, 'homescreen');

  useEffect(() => {
    fetchTownships();
    fetchFeaturedImage();
  }, []);

  const fetchTownships = async () => {
    try {
      const snapshot = await getDocs(homescreenRef);
      const towns = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.type === 'township') {
          towns.push({ id: docSnap.id, ...data });
        }
      });
      setTownships(towns);
    } catch (error) {
      console.error('Failed to fetch townships:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedImage = async () => {
    try {
      const imageRef = ref(storage, `homescreen/featured.jpg`);
      const url = await getDownloadURL(imageRef);
      setFeaturedImageUrl(url);
    } catch (err) {
      console.warn('No featured image found.');
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      const imageRef = ref(storage, `homescreen/featured.jpg`);
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);
      setFeaturedImageUrl(url);

      // Save metadata to Firestore
      const featuredDocRef = doc(db, 'homescreen', 'featured');
      await setDoc(featuredDocRef, {
        type: 'featuredImage',
        imageUrl: url,
        title: 'The Ultimate Guide to Soweto',
        updatedAt: new Date(),
      }, { merge: true });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleImageDelete = async () => {
    try {
      const imageRef = ref(storage, `homescreen/featured.jpg`);
      await deleteObject(imageRef);
      setFeaturedImageUrl('');
    } catch (error) {
      console.error('Image deletion failed:', error.message);
    }
  };

  const openTownshipDialog = (township = null) => {
    if (township) {
      setForm({ name: township.name, description: township.description });
      setEditingTownshipId(township.id);
    } else {
      setForm({ name: '', description: '' });
      setEditingTownshipId(null);
    }
    setOpenDialog(true);
  };

  const handleTownshipSubmit = async () => {
    if (!form.name.trim()) {
      alert('Township name is required');
      return;
    }

    try {
      const townshipRef = doc(db, 'homescreen', form.name); // Use name as doc ID

      if (editingTownshipId) {
        await updateDoc(townshipRef, {
          name: form.name,
          description: form.description,
          updatedAt: new Date(),
        });
      } else {
        await setDoc(townshipRef, {
          type: 'township',
          name: form.name,
          description: form.description,
          createdAt: new Date(),
        });
      }

      await fetchTownships();
    } catch (err) {
      console.error('Error saving township:', err.message);
    }

    setOpenDialog(false);
    setForm({ name: '', description: '' });
    setEditingTownshipId(null);
  };

  const handleTownshipDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'homescreen', id));
      await fetchTownships();
    } catch (error) {
      console.error('Failed to delete township:', error.message);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box>
      <Typography variant="h5" mb={2}>Home Screen Manager</Typography>

      {/* Featured Image Section */}
      <Box mb={4}>
        <Typography variant="h6">Featured Image</Typography>
        {featuredImageUrl ? (
          <Card sx={{ mt: 2, width: 300 }}>
            <CardMedia
              component="img"
              height="180"
              image={featuredImageUrl}
              alt="Featured"
            />
            <CardActions>
              <Button onClick={handleImageDelete} color="error">Delete</Button>
            </CardActions>
          </Card>
        ) : (
          <Typography>No featured image uploaded.</Typography>
        )}
        <Box mt={2}>
          <Button variant="contained" component="label" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Image'}
            <input hidden type="file" onChange={handleImageChange} />
          </Button>
        </Box>
      </Box>

      {/* Soweto Townships Section */}
      <Box>
        <Typography variant="h6" mb={1}>Soweto Townships</Typography>
        <Button variant="outlined" onClick={() => openTownshipDialog()}>Add Township</Button>

        <Grid container spacing={2} mt={1}>
          {townships.map((t) => (
            <Grid item xs={12} md={6} key={t.id}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold">{t.name}</Typography>
                  <Typography variant="body2">{t.description}</Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => openTownshipDialog(t)}>Edit</Button>
                  <Button size="small" color="error" onClick={() => handleTownshipDelete(t.id)}>Delete</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Township Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{editingTownshipId ? 'Edit Township' : 'Add Township'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Township Name"
            name="name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            fullWidth
          />
          <TextField
            label="Description"
            name="description"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            fullWidth
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleTownshipSubmit} variant="contained">
            {editingTownshipId ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default HomeManager;
