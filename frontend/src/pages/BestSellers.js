import React, { useEffect, useState } from 'react';
import { getAllSales } from '../services/sales';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, CircularProgress, Alert } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

function arrayToCSV(data, columns) {
  const header = columns.map(col => col.label).join(',');
  const rows = data.map(row =>
    columns.map(col => {
      let val = typeof col.value === 'function' ? col.value(row) : row[col.value];
      if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
        val = '"' + val.replace(/"/g, '""') + '"';
      }
      return val;
    }).join(',')
  );
  return [header, ...rows].join('\n');
}

const columns = [
  { label: 'Date', value: row => new Date(row.date).toLocaleDateString() },
  { label: 'Item', value: row => row.item?.name || row.item },
  { label: 'Type', value: row => row.itemType },
  { label: 'Quantity', value: row => row.quantity },
  { label: 'Price', value: row => row.price },
  { label: 'Total', value: row => row.total },
  { label: 'Customer', value: row => row.customer || '' },
];

const PharmacistSales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllSales();
        setSales(data);
      } catch (err) {
        setError(err.message || 'Failed to load sales');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleDownloadCSV = () => {
    const csv = arrayToCSV(sales, columns);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sales.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: { xs: 1, md: 4 } }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight={700} color="primary.main">Sales</Typography>
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownloadCSV} disabled={sales.length === 0}>
          Download CSV
        </Button>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map(col => (
                  <TableCell key={col.label} sx={{ fontWeight: 700 }}>{col.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sales.length === 0 ? (
                <TableRow><TableCell colSpan={columns.length}>No sales found.</TableCell></TableRow>
              ) : (
                sales.map(sale => (
                  <TableRow key={sale._id} hover>
                    <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                    <TableCell>{sale.item?.name || sale.item}</TableCell>
                    <TableCell>{sale.itemType}</TableCell>
                    <TableCell>{sale.quantity}</TableCell>
                    <TableCell>₹{sale.price}</TableCell>
                    <TableCell>₹{sale.total}</TableCell>
                    <TableCell>{sale.customer || ''}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default PharmacistSales;
