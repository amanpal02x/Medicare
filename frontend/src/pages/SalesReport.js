import React, { useEffect, useState } from 'react';
import { getAllSales } from '../services/sales';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, CircularProgress, Alert, Grid } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend } from 'recharts';

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
  { label: 'Transaction Type', value: row => row.transactionType || (row.customer ? 'Customer' : 'Supplier') },
  { label: 'Item Type', value: row => row.itemType },
  { label: 'Quantity', value: row => row.quantity },
  { label: 'Price', value: row => row.price },
  { label: 'Total', value: row => row.total },
];

const COLORS = ['#1976d2', '#f59e42', '#ef4444', '#22c55e', '#a21caf', '#fbbf24'];

const SalesReport = () => {
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

  // Analytics
  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, s) => sum + (s.total || 0), 0);
  // Best-selling items
  const itemMap = {};
  sales.forEach(s => {
    const name = s.item?.name || s.item;
    if (!itemMap[name]) itemMap[name] = 0;
    itemMap[name] += s.quantity;
  });
  const bestSellers = Object.entries(itemMap).map(([name, qty]) => ({ name, qty })).sort((a, b) => b.qty - a.qty).slice(0, 5);
  // Sales by date
  const dateMap = {};
  sales.forEach(s => {
    const date = new Date(s.date).toLocaleDateString();
    if (!dateMap[date]) dateMap[date] = 0;
    dateMap[date] += s.total;
  });
  const salesByDate = Object.entries(dateMap).map(([date, total]) => ({ date, total }));

  const handleDownloadCSV = () => {
    const csv = arrayToCSV(sales, columns);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sales_report.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: { xs: 1, md: 4 } }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight={700} color="primary.main">Sales Report</Typography>
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
        <>
          <Grid container spacing={4} mb={4}>
            <Grid item xs={12} md={4}>
              <Box p={2} bgcolor="#f8fafc" borderRadius={3} boxShadow={1}>
                <Typography fontWeight={700}>Total Sales</Typography>
                <Typography variant="h5">{totalSales}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box p={2} bgcolor="#f8fafc" borderRadius={3} boxShadow={1}>
                <Typography fontWeight={700}>Total Revenue</Typography>
                <Typography variant="h5">₹{totalRevenue.toFixed(2)}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box p={2} bgcolor="#f8fafc" borderRadius={3} boxShadow={1}>
                <Typography fontWeight={700}>Best Sellers</Typography>
                {bestSellers.length === 0 ? <Typography>No sales yet.</Typography> : bestSellers.map((item, i) => (
                  <Box key={item.name} display="flex" alignItems="center" gap={1}>
                    <Chip label={item.name} color="primary" />
                    <Typography>x{item.qty}</Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
          <Box mb={4}>
            <Typography fontWeight={700} mb={2}>Sales by Date</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={salesByDate}>
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="total" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
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
                      <TableCell>
                        <Chip
                          label={sale.transactionType || (sale.customer ? 'Customer' : 'Supplier')}
                          color={sale.transactionType === 'Customer' || sale.customer ? 'primary' : 'secondary'}
                          size="small"
                        />
                      </TableCell>
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
                      <TableCell>₹{sale.total}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
};

export default SalesReport;
