import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Snackbar,
  Avatar,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../services/suppliers';

const PharmacistSuppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [viewingSupplier, setViewingSupplier] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    supplierType: 'medicine', // medicine, product, both
    companyName: '',
    gstNumber: '',
    contactPerson: '',
    notes: ''
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (err) {
      setError(err.message || 'Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (supplier = null) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        city: supplier.city || '',
        state: supplier.state || '',
        pincode: supplier.pincode || '',
        supplierType: supplier.supplierType || 'medicine',
        companyName: supplier.companyName || '',
        gstNumber: supplier.gstNumber || '',
        contactPerson: supplier.contactPerson || '',
        notes: supplier.notes || ''
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        supplierType: 'medicine',
        companyName: '',
        gstNumber: '',
        contactPerson: '',
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleViewSupplier = (supplier) => {
    setViewingSupplier(supplier);
    setViewDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSupplier(null);
  };

  const handleCloseViewDialog = () => {
    setViewDialog(false);
    setViewingSupplier(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier._id, formData);
        setSnackbar({ open: true, message: 'Supplier updated successfully!', severity: 'success' });
      } else {
        await createSupplier(formData);
        setSnackbar({ open: true, message: 'Supplier added successfully!', severity: 'success' });
      }
      handleCloseDialog();
      fetchSuppliers();
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Failed to save supplier', severity: 'error' });
    }
  };

  const handleDelete = async (supplierId) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await deleteSupplier(supplierId);
        setSnackbar({ open: true, message: 'Supplier deleted successfully!', severity: 'success' });
        fetchSuppliers();
      } catch (err) {
        setSnackbar({ open: true, message: err.message || 'Failed to delete supplier', severity: 'error' });
      }
    }
  };

  // Analytics
  const totalSuppliers = suppliers.length;
  const medicineSuppliers = suppliers.filter(s => s.supplierType === 'medicine').length;
  const productSuppliers = suppliers.filter(s => s.supplierType === 'product').length;
  const bothSuppliers = suppliers.filter(s => s.supplierType === 'both').length;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight={700} color="primary.main">
          Supplier Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Supplier
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Analytics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Suppliers
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {totalSuppliers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Medicine Suppliers
              </Typography>
              <Typography variant="h4" fontWeight={700} color="primary.main">
                {medicineSuppliers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Product Suppliers
              </Typography>
              <Typography variant="h4" fontWeight={700} color="secondary.main">
                {productSuppliers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Both (Medicine & Product)
              </Typography>
              <Typography variant="h4" fontWeight={700} color="success.main">
                {bothSuppliers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Suppliers Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Supplier</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Company</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body1" color="textSecondary">
                    No suppliers found. Add your first supplier!
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              suppliers.map((supplier) => (
                <TableRow key={supplier._id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {supplier.name ? supplier.name.charAt(0).toUpperCase() : '?'}
                      </Avatar>
                      <Box>
                        <Typography fontWeight={600}>{supplier.name}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {supplier.contactPerson}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {supplier.companyName || 'Company name not specified'}
                      </Typography>
                      {supplier.gstNumber && (
                        <Typography variant="body2" color="textSecondary">
                          GST: {supplier.gstNumber}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        <EmailIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                        {supplier.email}
                      </Typography>
                      <Typography variant="body2">
                        <PhoneIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                        {supplier.phone}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {supplier.city && supplier.state ? `${supplier.city}, ${supplier.state}` : 
                       supplier.city || supplier.state || 'Location not specified'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {supplier.pincode || ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={supplier.supplierType}
                      color={
                        supplier.supplierType === 'medicine' ? 'primary' :
                        supplier.supplierType === 'product' ? 'secondary' : 'success'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        onClick={() => handleViewSupplier(supplier)}
                        color="info"
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(supplier)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(supplier._id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Supplier Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Person Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company Name"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Person"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
                placeholder="Primary contact person"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Supplier Type</InputLabel>
                <Select
                  name="supplierType"
                  value={formData.supplierType}
                  onChange={handleInputChange}
                  label="Supplier Type"
                >
                  <MenuItem value="medicine">Medicine</MenuItem>
                  <MenuItem value="product">Product</MenuItem>
                  <MenuItem value="both">Both (Medicine & Product)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="GST Number"
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleInputChange}
                placeholder="GST Number (optional)"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                multiline
                rows={3}
                placeholder="Additional notes about the supplier..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingSupplier ? 'Update' : 'Add'} Supplier
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Supplier Dialog */}
      <Dialog open={viewDialog} onClose={handleCloseViewDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Supplier Details
        </DialogTitle>
        <DialogContent>
          {viewingSupplier && (
            <Box>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
                  {viewingSupplier.name ? viewingSupplier.name.charAt(0).toUpperCase() : '?'}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {viewingSupplier.name}
                  </Typography>
                  <Chip
                    label={viewingSupplier.supplierType}
                    color={
                      viewingSupplier.supplierType === 'medicine' ? 'primary' :
                      viewingSupplier.supplierType === 'product' ? 'secondary' : 'success'
                    }
                    size="small"
                  />
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <BusinessIcon color="primary" fontSize="small" />
                    <Typography variant="body2">
                      <strong>Company:</strong> {viewingSupplier.companyName}
                    </Typography>
                  </Box>
                </Grid>
                {viewingSupplier.contactPerson && (
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>Contact Person:</strong> {viewingSupplier.contactPerson}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <EmailIcon color="primary" fontSize="small" />
                    <Typography variant="body2">
                      <strong>Email:</strong> {viewingSupplier.email}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <PhoneIcon color="primary" fontSize="small" />
                    <Typography variant="body2">
                      <strong>Phone:</strong> {viewingSupplier.phone}
                    </Typography>
                  </Box>
                </Grid>
                {viewingSupplier.gstNumber && (
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>GST Number:</strong> {viewingSupplier.gstNumber}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <LocationIcon color="primary" fontSize="small" />
                    <Typography variant="body2">
                      <strong>Address:</strong> {viewingSupplier.address}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2">
                    <strong>Location:</strong> {viewingSupplier.city}, {viewingSupplier.state} - {viewingSupplier.pincode}
                  </Typography>
                </Grid>
                {viewingSupplier.notes && (
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>Notes:</strong> {viewingSupplier.notes}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
          <Button 
            onClick={() => {
              handleCloseViewDialog();
              handleOpenDialog(viewingSupplier);
            }} 
            variant="contained"
          >
            Edit Supplier
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PharmacistSuppliers; 