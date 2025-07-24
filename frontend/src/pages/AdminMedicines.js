import React, { useEffect, useState } from 'react';
import { getAllPharmacies } from '../services/adminPharmacies';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Alert, Button, TextField, Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AdminMedicines = () => {
  const [pharmacists, setPharmacists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPharmacists() {
      setLoading(true);
      setError('');
      try {
        const data = await getAllPharmacies();
        setPharmacists(data.pharmacists || data);
      } catch (e) {
        setError(e.message || 'Failed to load pharmacists');
      }
      setLoading(false);
    }
    fetchPharmacists();
  }, []);

  useEffect(() => {
    if (!search) {
      setFiltered(pharmacists);
    } else {
      const s = search.toLowerCase();
      setFiltered(pharmacists.filter(pharm =>
        (pharm.pharmacyName && pharm.pharmacyName.toLowerCase().includes(s)) ||
        (pharm.user?.name && pharm.user.name.toLowerCase().includes(s)) ||
        (pharm.user?.email && pharm.user.email.toLowerCase().includes(s))
      ));
    }
  }, [search, pharmacists]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Pharmacists
      </Typography>
      <Box mb={3}>
        <TextField
          label="Search Pharmacists"
          variant="outlined"
          value={search}
          onChange={e => setSearch(e.target.value)}
          fullWidth
        />
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Pharmacy Name</strong></TableCell>
                <TableCell><strong>Owner</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Phone</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(pharmacist => (
                <TableRow key={pharmacist._id}>
                  <TableCell>{pharmacist.pharmacyName || 'N/A'}</TableCell>
                  <TableCell>{pharmacist.user?.name || 'N/A'}</TableCell>
                  <TableCell>{pharmacist.user?.email || 'N/A'}</TableCell>
                  <TableCell>{pharmacist.user?.phone || 'N/A'}</TableCell>
                  <TableCell>{pharmacist.status || 'N/A'}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => navigate(`/admin/pharmacists/${pharmacist._id}/medicines`)}
                      >
                        View Medicines
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AdminMedicines;
