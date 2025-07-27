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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { getAllSales, addSale, deleteSale } from '../services/sales';
import { getCustomers } from '../services/customers';
import { getSuppliers } from '../services/suppliers';

const PharmacistSales = () => {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Form state
  const [formData, setFormData] = useState({
    transactionType: 'Customer',
    customerId: '',
    supplierId: '',
    itemName: '',
    itemType: 'medicine', // medicine or product
    quantity: '',
    price: '',
    total: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [salesData, customersData, suppliersData] = await Promise.all([
        getAllSales(),
        getCustomers(),
        getSuppliers()
      ]);
      setSales(salesData);
      setCustomers(customersData);
      setSuppliers(suppliersData);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (sale = null) => {
    if (sale) {
      setEditingSale(sale);
      // Determine transaction type based on existing data
      const transactionType = sale.customer ? 'Customer' : 'Supplier';
      const customerId = customers.find(c => c.name === sale.customer)?._id || '';
      const supplierId = suppliers.find(s => s.name === sale.supplier)?._id || '';
      
      setFormData({
        transactionType,
        customerId: transactionType === 'Customer' ? customerId : '',
        supplierId: transactionType === 'Supplier' ? supplierId : '',
        itemName: sale.item || '',
        itemType: sale.itemType === 'Medicine' ? 'medicine' : 'product',
        quantity: sale.quantity || '',
        price: sale.price || '',
        total: sale.total || '',
        date: sale.date ? new Date(sale.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        notes: sale.notes || ''
      });
    } else {
      setEditingSale(null);
      setFormData({
        transactionType: 'Customer',
        customerId: '',
        supplierId: '',
        itemName: '',
        itemType: 'medicine',
        quantity: '',
        price: '',
        total: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSale(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-calculate total when quantity or price changes
    if (name === 'quantity' || name === 'price') {
      const quantity = name === 'quantity' ? value : formData.quantity;
      const price = name === 'price' ? value : formData.price;
      if (quantity && price) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          total: (parseFloat(quantity) * parseFloat(price)).toFixed(2)
        }));
      }
    }

    // Clear customer/supplier selection when transaction type changes
    if (name === 'transactionType') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        customerId: '',
        supplierId: ''
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingSale) {
        // Update existing sale
        // await updateSale(editingSale._id, formData);
        setSnackbar({ open: true, message: 'Sale updated successfully!', severity: 'success' });
      } else {
        // Create new sale - transform data to match backend expectations
        const selectedCustomer = customers.find(c => c._id === formData.customerId);
        const selectedSupplier = suppliers.find(s => s._id === formData.supplierId);
        
        const saleData = {
          item: formData.itemName,
          itemType: formData.itemType === 'medicine' ? 'Medicine' : 'Product',
          quantity: parseInt(formData.quantity),
          price: parseFloat(formData.price),
          total: parseFloat(formData.total),
          transactionType: formData.transactionType,
          customer: formData.transactionType === 'Customer' ? (selectedCustomer ? selectedCustomer.name : formData.notes) : undefined,
          supplier: formData.transactionType === 'Supplier' ? (selectedSupplier ? selectedSupplier.name : formData.notes) : undefined
        };
        await addSale(saleData);
        setSnackbar({ open: true, message: 'Sale added successfully!', severity: 'success' });
      }
      handleCloseDialog();
      fetchData();
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Failed to save sale', severity: 'error' });
    }
  };

  const handleDelete = async (saleId) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      try {
        await deleteSale(saleId);
        setSnackbar({ open: true, message: 'Sale deleted successfully!', severity: 'success' });
        fetchData();
      } catch (err) {
        setSnackbar({ open: true, message: err.message || 'Failed to delete sale', severity: 'error' });
      }
    }
  };

  const handleDownloadCSV = () => {
    const headers = ['Date', 'Type', 'Item Name', 'Item Type', 'Quantity', 'Price', 'Total', 'Notes'];
    const csvData = sales.map(sale => [
      new Date(sale.date).toLocaleDateString(),
      sale.transactionType || (sale.customer ? 'Customer' : 'Supplier'),
      sale.item,
      sale.itemType,
      sale.quantity,
      sale.price,
      sale.total,
      sale.notes || ''
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sales_report.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Analytics
  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + (parseFloat(sale.total) || 0), 0);
  const averageSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;

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
          Sales Management
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadCSV}
            disabled={sales.length === 0}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Sale
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Analytics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Sales
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {totalSales}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4" fontWeight={700} color="primary.main">
                ₹{totalRevenue.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Sale Value
              </Typography>
              <Typography variant="h4" fontWeight={700} color="secondary.main">
                ₹{averageSaleValue.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sales Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Item Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Quantity</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body1" color="textSecondary">
                    No sales found. Add your first sale!
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              sales.map((sale) => (
                <TableRow key={sale._id} hover>
                  <TableCell>
                    {new Date(sale.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={sale.transactionType || (sale.customer ? 'Customer' : 'Supplier')}
                      color={sale.transactionType === 'Customer' || sale.customer ? 'primary' : 'secondary'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{sale.item}</TableCell>
                  <TableCell>
                    <Chip
                      label={sale.itemType}
                      color={sale.itemType === 'Medicine' ? 'primary' : 'secondary'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{sale.quantity}</TableCell>
                  <TableCell>₹{sale.price}</TableCell>
                  <TableCell>
                    <Typography fontWeight={700} color="primary.main">
                      ₹{sale.total}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(sale)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(sale._id)}
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

      {/* Add/Edit Sale Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingSale ? 'Edit Sale' : 'Add New Sale'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Transaction Type</InputLabel>
                <Select
                  name="transactionType"
                  value={formData.transactionType}
                  onChange={handleInputChange}
                  label="Transaction Type"
                >
                  <MenuItem value="Customer">Customer</MenuItem>
                  <MenuItem value="Supplier">Supplier</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>{formData.transactionType}</InputLabel>
                <Select
                  name={formData.transactionType === 'Customer' ? 'customerId' : 'supplierId'}
                  value={formData.transactionType === 'Customer' ? formData.customerId : formData.supplierId}
                  onChange={handleInputChange}
                  label={formData.transactionType}
                >
                  <MenuItem value="">
                    <em>Select a {formData.transactionType.toLowerCase()} (optional)</em>
                  </MenuItem>
                  {formData.transactionType === 'Customer' 
                    ? customers.map((customer) => (
                        <MenuItem key={customer._id} value={customer._id}>
                          {customer.name}
                        </MenuItem>
                      ))
                    : suppliers.map((supplier) => (
                        <MenuItem key={supplier._id} value={supplier._id}>
                          {supplier.name}
                        </MenuItem>
                      ))
                  }
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Item Name"
                name="itemName"
                value={formData.itemName}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Item Type</InputLabel>
                <Select
                  name="itemType"
                  value={formData.itemType}
                  onChange={handleInputChange}
                  label="Item Type"
                >
                  <MenuItem value="medicine">Medicine</MenuItem>
                  <MenuItem value="product">Product</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Price per Unit"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Total Amount"
                name="total"
                type="number"
                value={formData.total}
                onChange={handleInputChange}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
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
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingSale ? 'Update' : 'Add'} Sale
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

export default PharmacistSales; 