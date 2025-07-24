import React, { useEffect, useState } from 'react';
import { getInvoices } from '../services/invoices';
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
  { label: 'Invoice #', value: row => row.invoiceNumber },
  { label: 'Customer', value: row => row.customerName },
  { label: 'Date', value: row => new Date(row.date).toLocaleDateString() },
  { label: 'Total', value: row => row.totalAmount },
  { label: 'Discount', value: row => row.totalDiscount },
  { label: 'Net', value: row => row.netTotal },
  { label: 'Status', value: row => row.status },
];

const PharmacistInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const data = await getInvoices();
        setInvoices(data);
      } catch (err) {
        setError(err.message || 'Failed to load invoices');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleDownloadCSV = () => {
    const csv = arrayToCSV(invoices, columns);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoices.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: { xs: 1, md: 4 } }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight={700} color="primary.main">Invoices</Typography>
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownloadCSV} disabled={invoices.length === 0}>
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
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow><TableCell colSpan={columns.length + 1}>No invoices found.</TableCell></TableRow>
              ) : (
                invoices.map(inv => (
                  <TableRow key={inv._id} hover>
                    <TableCell>{inv.invoiceNumber}</TableCell>
                    <TableCell>{inv.customerName}</TableCell>
                    <TableCell>{new Date(inv.date).toLocaleDateString()}</TableCell>
                    <TableCell>₹{inv.totalAmount}</TableCell>
                    <TableCell>₹{inv.totalDiscount}</TableCell>
                    <TableCell>₹{inv.netTotal}</TableCell>
                    <TableCell>
                      <Chip label={inv.status} color={inv.status === 'Paid' ? 'success' : inv.status === 'Pending' ? 'warning' : inv.status === 'Cancel' ? 'error' : 'default'} />
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined">View</Button>
                    </TableCell>
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

export default PharmacistInvoices;
