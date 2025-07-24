import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Alert, Button, ToggleButton, ToggleButtonGroup, Stack, TextField } from '@mui/material';
import { getPharmacistById } from '../services/adminPharmacies';
import { getAllMedicines } from '../services/adminMedicines';

const AdminPharmacistMedicines = () => {
  const { pharmacistId } = useParams();
  const [pharmacist, setPharmacist] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        const pharm = await getPharmacistById(pharmacistId);
        setPharmacist(pharm);
        // Fetch all medicines and filter by pharmacist
        const medsData = await getAllMedicines();
        const allMeds = medsData.medicines || medsData;
        const allProds = medsData.products || [];
        setMedicines(allMeds.filter(m => {
          if (!m.pharmacist) return false;
          if (typeof m.pharmacist === 'string') return m.pharmacist === pharmacistId;
          return m.pharmacist._id === pharmacistId;
        }));
        setProducts(allProds.filter(p => {
          if (!p.pharmacist) return false;
          if (typeof p.pharmacist === 'string') return p.pharmacist === pharmacistId;
          return p.pharmacist._id === pharmacistId;
        }));
      } catch (e) {
        setError(e.message || 'Failed to load data');
      }
      setLoading(false);
    }
    fetchData();
  }, [pharmacistId]);

  let rows = [];
  if (filter === 'all') rows = [...medicines, ...products];
  else if (filter === 'medicines') rows = medicines;
  else if (filter === 'products') rows = products;

  // Apply search filter
  const searchLower = search.toLowerCase();
  const filteredRows = rows.filter(item =>
    (!searchLower ||
      (item.name && item.name.toLowerCase().includes(searchLower)) ||
      (item.brandName && item.brandName.toLowerCase().includes(searchLower)) ||
      (item.brand && item.brand.toLowerCase().includes(searchLower)) ||
      (item.categoryName && item.categoryName.toLowerCase().includes(searchLower)) ||
      (item.category && typeof item.category === 'string' && item.category.toLowerCase().includes(searchLower)) ||
      (item.category && item.category.name && item.category.name.toLowerCase().includes(searchLower))
    )
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {pharmacist ? `${pharmacist.pharmacyName || 'Pharmacy'}: Medicines & Products` : 'Medicines & Products'}
      </Typography>
      <Stack direction="row" spacing={2} mb={1} alignItems="center">
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, val) => val && setFilter(val)}
          aria-label="Filter"
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="medicines">Medicines</ToggleButton>
          <ToggleButton value="products">Products</ToggleButton>
        </ToggleButtonGroup>
      </Stack>
      <Box mb={2}>
        <Paper elevation={2} sx={{ p: 1, borderRadius: 2, display: 'inline-block', minWidth: 0, boxShadow: '0 1px 6px rgba(60,60,60,0.07)' }}>
          <TextField
            label="Search by name, brand, or category"
            variant="outlined"
            value={search}
            onChange={e => setSearch(e.target.value)}
            size="small"
            sx={{ minWidth: 220, background: '#fafaff', borderRadius: 1 }}
            InputProps={{ style: { fontSize: 14, padding: 2 } }}
            InputLabelProps={{ style: { fontSize: 13 } }}
          />
        </Paper>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      ) : filteredRows.length === 0 ? (
        <Alert severity="info">No items found for this pharmacist.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Brand</strong></TableCell>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell><strong>Price</strong></TableCell>
                <TableCell><strong>Stock</strong></TableCell>
                <TableCell><strong>Expiry Date</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows.map(item => (
                <TableRow key={item._id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.type || (medicines.includes(item) ? 'Medicine' : 'Product')}</TableCell>
                  <TableCell>{item.brandName || item.brand || 'N/A'}</TableCell>
                  <TableCell>{item.categoryName || (item.category && (item.category.name || item.category)) || 'N/A'}</TableCell>
                  <TableCell>{item.price}</TableCell>
                  <TableCell>{item.stock}</TableCell>
                  <TableCell>{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AdminPharmacistMedicines; 