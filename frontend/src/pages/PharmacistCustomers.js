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
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../services/customers';

const PharmacistCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);
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
    customerType: 'regular', // regular, premium, wholesale
    notes: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      setError(err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        pincode: customer.pincode || '',
        customerType: customer.customerType || 'regular',
        notes: customer.notes || ''
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        customerType: 'regular',
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleViewCustomer = (customer) => {
    setViewingCustomer(customer);
    setViewDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCustomer(null);
  };

  const handleCloseViewDialog = () => {
    setViewDialog(false);
    setViewingCustomer(null);
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
      if (editingCustomer) {
        await updateCustomer(editingCustomer._id, formData);
        setSnackbar({ open: true, message: 'Customer updated successfully!', severity: 'success' });
      } else {
        await createCustomer(formData);
        setSnackbar({ open: true, message: 'Customer added successfully!', severity: 'success' });
      }
      handleCloseDialog();
      fetchCustomers();
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Failed to save customer', severity: 'error' });
    }
  };

  const handleDelete = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteCustomer(customerId);
        setSnackbar({ open: true, message: 'Customer deleted successfully!', severity: 'success' });
        fetchCustomers();
      } catch (err) {
        setSnackbar({ open: true, message: err.message || 'Failed to delete customer', severity: 'error' });
      }
    }
  };

  // Analytics
  const totalCustomers = customers.length;
  const regularCustomers = customers.filter(c => c.customerType === 'regular').length;
  const premiumCustomers = customers.filter(c => c.customerType === 'premium').length;
  const wholesaleCustomers = customers.filter(c => c.customerType === 'wholesale').length;

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
          Customer Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Customer
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
                Total Customers
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {totalCustomers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Regular Customers
              </Typography>
              <Typography variant="h4" fontWeight={700} color="primary.main">
                {regularCustomers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Premium Customers
              </Typography>
              <Typography variant="h4" fontWeight={700} color="secondary.main">
                {premiumCustomers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Wholesale Customers
              </Typography>
              <Typography variant="h4" fontWeight={700} color="success.main">
                {wholesaleCustomers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Customers Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body1" color="textSecondary">
                    No customers found. Add your first customer!
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer._id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {customer.name ? customer.name.charAt(0).toUpperCase() : '?'}
                      </Avatar>
                      <Box>
                        <Typography fontWeight={600}>{customer.name}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {customer.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        <PhoneIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                        {customer.phone}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {customer.city}, {customer.state}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {customer.pincode}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={customer.customerType}
                      color={
                        customer.customerType === 'premium' ? 'secondary' :
                        customer.customerType === 'wholesale' ? 'success' : 'primary'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        onClick={() => handleViewCustomer(customer)}
                        color="info"
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(customer)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(customer._id)}
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

      {/* Add/Edit Customer Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
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
              <FormControl fullWidth>
                <InputLabel>Customer Type</InputLabel>
                <Select
                  name="customerType"
                  value={formData.customerType}
                  onChange={handleInputChange}
                  label="Customer Type"
                >
                  <MenuItem value="regular">Regular</MenuItem>
                  <MenuItem value="premium">Premium</MenuItem>
                  <MenuItem value="wholesale">Wholesale</MenuItem>
                </Select>
              </FormControl>
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
                placeholder="Additional notes about the customer..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCustomer ? 'Update' : 'Add'} Customer
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Customer Dialog */}
      <Dialog open={viewDialog} onClose={handleCloseViewDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Customer Details
        </DialogTitle>
        <DialogContent>
          {viewingCustomer && (
            <Box>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
                  {viewingCustomer.name ? viewingCustomer.name.charAt(0).toUpperCase() : '?'}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {viewingCustomer.name}
                  </Typography>
                  <Chip
                    label={viewingCustomer.customerType}
                    color={
                      viewingCustomer.customerType === 'premium' ? 'secondary' :
                      viewingCustomer.customerType === 'wholesale' ? 'success' : 'primary'
                    }
                    size="small"
                  />
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <EmailIcon color="primary" fontSize="small" />
                    <Typography variant="body2">
                      <strong>Email:</strong> {viewingCustomer.email}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <PhoneIcon color="primary" fontSize="small" />
                    <Typography variant="body2">
                      <strong>Phone:</strong> {viewingCustomer.phone}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <LocationIcon color="primary" fontSize="small" />
                    <Typography variant="body2">
                      <strong>Address:</strong> {viewingCustomer.address}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2">
                    <strong>Location:</strong> {viewingCustomer.city}, {viewingCustomer.state} - {viewingCustomer.pincode}
                  </Typography>
                </Grid>
                {viewingCustomer.notes && (
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>Notes:</strong> {viewingCustomer.notes}
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
              handleOpenDialog(viewingCustomer);
            }} 
            variant="contained"
          >
            Edit Customer
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

export default PharmacistCustomers; 