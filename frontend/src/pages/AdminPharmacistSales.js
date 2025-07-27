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
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { getAllSales } from '../services/sales';

const AdminPharmacistSales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pharmacistFilter, setPharmacistFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [itemTypeFilter, setItemTypeFilter] = useState('');
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const data = await getAllSales();
      setSales(data);
    } catch (err) {
      setError(err.message || 'Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSale = (sale) => {
    setSelectedSale(sale);
    setViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialog(false);
    setSelectedSale(null);
  };

  const handleDownloadCSV = () => {
    const headers = ['Date', 'Pharmacist', 'Transaction Type', 'Item Name', 'Item Type', 'Quantity', 'Price', 'Total', 'Notes'];
    const csvData = sales.map(sale => [
      new Date(sale.date).toLocaleDateString(),
      sale.pharmacist?.pharmacyName || 'N/A',
      sale.transactionType || (sale.customer ? 'Customer' : 'Supplier'),
      sale.itemName,
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
    a.download = 'pharmacist_sales_report.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filter sales based on selected filters
  const filteredSales = sales.filter(sale => {
    const matchesPharmacist = !pharmacistFilter || 
      sale.pharmacist?.pharmacyName?.toLowerCase().includes(pharmacistFilter.toLowerCase());
    const matchesDate = !dateFilter || 
      new Date(sale.date).toLocaleDateString().includes(dateFilter);
    const matchesItemType = !itemTypeFilter || sale.itemType === itemTypeFilter;
    
    return matchesPharmacist && matchesDate && matchesItemType;
  });

  // Analytics
  const totalSales = filteredSales.length;
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + (parseFloat(sale.total) || 0), 0);
  const averageSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;
  
  // Get unique pharmacists
  const pharmacists = [...new Set(sales.map(sale => sale.pharmacist?.pharmacyName).filter(Boolean))];

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
          Pharmacist Sales Overview
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchSales}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadCSV}
            disabled={sales.length === 0}
          >
            Export CSV
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
        <Grid item xs={12} md={3}>
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
        <Grid item xs={12} md={3}>
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
        <Grid item xs={12} md={3}>
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
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Pharmacists
              </Typography>
              <Typography variant="h4" fontWeight={700} color="success.main">
                {pharmacists.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Search Pharmacist"
              value={pharmacistFilter}
              onChange={(e) => setPharmacistFilter(e.target.value)}
              placeholder="Enter pharmacist name..."
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Search Date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              placeholder="MM/DD/YYYY"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Item Type</InputLabel>
              <Select
                value={itemTypeFilter}
                onChange={(e) => setItemTypeFilter(e.target.value)}
                label="Item Type"
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="medicine">Medicine</MenuItem>
                <MenuItem value="product">Product</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              variant="outlined"
              onClick={() => {
                setPharmacistFilter('');
                setDateFilter('');
                setItemTypeFilter('');
              }}
              fullWidth
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Sales Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Pharmacist</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Transaction Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Item Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Quantity</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography variant="body1" color="textSecondary">
                    No sales found matching the filters.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredSales.map((sale) => (
                <TableRow key={sale._id} hover>
                  <TableCell>
                    {new Date(sale.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>
                      {sale.pharmacist?.pharmacyName || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={sale.transactionType || (sale.customer ? 'Customer' : 'Supplier')}
                      color={sale.transactionType === 'Customer' || sale.customer ? 'primary' : 'secondary'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{sale.itemName}</TableCell>
                  <TableCell>
                    <Chip
                      label={sale.itemType}
                      color={sale.itemType === 'medicine' ? 'primary' : 'secondary'}
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
                    <IconButton
                      size="small"
                      onClick={() => handleViewSale(sale)}
                      color="info"
                    >
                      <ViewIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View Sale Details Dialog */}
      <Dialog open={viewDialog} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Sale Details
        </DialogTitle>
        <DialogContent>
          {selectedSale && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Date</Typography>
                <Typography variant="body1" mb={2}>
                  {new Date(selectedSale.date).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Pharmacist</Typography>
                <Typography variant="body1" mb={2}>
                  {selectedSale.pharmacist?.pharmacyName || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Transaction Type</Typography>
                <Chip
                  label={selectedSale.transactionType || (selectedSale.customer ? 'Customer' : 'Supplier')}
                  color={selectedSale.transactionType === 'Customer' || selectedSale.customer ? 'primary' : 'secondary'}
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  {selectedSale.transactionType === 'Customer' || selectedSale.customer ? 'Customer' : 'Supplier'}
                </Typography>
                <Typography variant="body1" mb={2}>
                  {selectedSale.transactionType === 'Customer' || selectedSale.customer 
                    ? (selectedSale.customer?.name || selectedSale.customer || 'N/A')
                    : (selectedSale.supplier?.name || selectedSale.supplier || 'N/A')
                  }
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Item Name</Typography>
                <Typography variant="body1" mb={2}>
                  {selectedSale.itemName}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Item Type</Typography>
                <Chip
                  label={selectedSale.itemType}
                  color={selectedSale.itemType === 'medicine' ? 'primary' : 'secondary'}
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="textSecondary">Quantity</Typography>
                <Typography variant="body1" mb={2}>
                  {selectedSale.quantity}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="textSecondary">Price per Unit</Typography>
                <Typography variant="body1" mb={2}>
                  ₹{selectedSale.price}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="textSecondary">Total Amount</Typography>
                <Typography variant="body1" fontWeight={700} color="primary.main" mb={2}>
                  ₹{selectedSale.total}
                </Typography>
              </Grid>
              {selectedSale.notes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Notes</Typography>
                  <Typography variant="body1">
                    {selectedSale.notes}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPharmacistSales; 