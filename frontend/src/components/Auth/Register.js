import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PhoneIcon from '@mui/icons-material/Phone';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Grid from '@mui/material/Grid';

// Remove roles, vehicleTypes, genders arrays

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    // In form state, remove role, delivery, and address fields
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Remove handleRoleChange and delivery-specific logic

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    const registrationData = {
      name: form.name,
      email: form.email,
      password: form.password,
      role: 'user'
    };
    const res = await register(registrationData);
    if (res.token) {
      setSuccess('Registration successful!');
      navigate('/');
    } else setError(res.message || 'Registration failed');
    setLoading(false);
  };

  // Only show fields for name, email, password in the form UI

  // Animated background shapes
  const bgShapes = (
    <Box sx={{
      position: 'fixed',
      width: '100vw',
      height: '100vh',
      zIndex: 0,
      top: 0,
      left: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
    }}>
      <Box sx={{
        position: 'absolute',
        width: 340,
        height: 340,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
        filter: 'blur(80px)',
        top: -80,
        left: -120,
        opacity: 0.7,
        animation: 'float1 8s ease-in-out infinite alternate',
      }} />
      <Box sx={{
        position: 'absolute',
        width: 220,
        height: 220,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #9c27b0 0%, #8ec5fc 100%)',
        filter: 'blur(60px)',
        bottom: -60,
        right: -80,
        opacity: 0.6,
        animation: 'float2 10s ease-in-out infinite alternate',
      }} />
      <style>{`
        @keyframes float1 { 0% { transform: translateY(0); } 100% { transform: translateY(30px); } }
        @keyframes float2 { 0% { transform: translateY(0); } 100% { transform: translateY(-30px); } }
      `}</style>
    </Box>
  );

  const commonTextFieldStyle = {
    background: 'rgba(255,255,255,0.7)',
    borderRadius: 3,
    boxShadow: '0 2px 8px 0 rgba(140, 140, 255, 0.08)',
    mb: 2,
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      fontWeight: 500,
      fontSize: 17,
      color: '#222',
      background: 'rgba(255,255,255,0.7)',
      boxShadow: '0 2px 8px 0 rgba(140, 140, 255, 0.08)',
      '& fieldset': { border: 'none !important' },
      '&:hover fieldset': { border: 'none !important' },
      '&.Mui-focused fieldset': { border: 'none !important' },
      '& input': { color: '#222', outline: 'none !important', boxShadow: 'none !important' },
      '&.Mui-focused': { boxShadow: 'none !important', outline: 'none !important' },
    },
    '& .MuiInputAdornment-root': { color: '#1976d2' },
  };

  const commonSelectStyle = {
    background: 'rgba(255,245,255,0.8)',
    borderRadius: 3,
    boxShadow: '0 2px 8px 0 rgba(140, 140, 255, 0.08)',
    fontWeight: 500,
    fontSize: 17,
    color: '#222',
    mb: 2,
    '& .MuiSelect-select': {
      borderRadius: 3,
      padding: '14px',
    },
    '& fieldset': { border: 'none' },
    '&:hover fieldset': { border: '1.5px solid #8ec5fc' },
    '&.Mui-focused fieldset': { border: '2px solid #9c27b0' },
  };

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" sx={{ position: 'relative', zIndex: 1 }}>
      {bgShapes}
      <Fade in timeout={800}>
        <Box
          sx={{
            width: '100%',
            maxWidth: 400,
            p: 4,
            borderRadius: 6,
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
            background: 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(18px)',
            border: '1.5px solid rgba(200,200,255,0.18)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 2,
          }}
        >
          {/* Logo/Illustration */}
          <Box mb={2}>
            <img src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png" alt="MediCare Logo" width={64} height={64} style={{ borderRadius: 16, boxShadow: '0 2px 12px #e0c3fc55' }} />
          </Box>
          <Typography variant="h4" fontWeight={700} textAlign="center" mb={1} color="primary">Create Account</Typography>
          <Typography variant="subtitle1" textAlign="center" color="text.secondary" mb={2}>
            Register for MediCare
          </Typography>
          <form
            className="w-full flex flex-col gap-5"
            onSubmit={handleSubmit}
            autoComplete="on"
            style={{ width: '100%' }}
          >
            {/* Basic Information */}
            <Typography variant="h6" fontWeight={600} color="primary" sx={{ mb: 1 }}>
              Basic Information
            </Typography>
            
            <TextField
              name="name"
              placeholder="Enter your name"
              value={form.name}
              onChange={handleChange}
              required
              fullWidth
              autoComplete="name"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: '#1976d2', fontSize: 22 }} />
                  </InputAdornment>
                ),
              }}
              sx={commonTextFieldStyle}
            />
            
            <TextField
              name="email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
              fullWidth
              autoComplete="email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: '#1976d2', fontSize: 22 }} />
                  </InputAdornment>
                ),
              }}
              sx={commonTextFieldStyle}
            />
            
            <TextField
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
              fullWidth
              autoComplete="new-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#1976d2', fontSize: 22 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(v => !v)} edge="end" tabIndex={-1}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={commonTextFieldStyle}
            />

            {/* Remove roles, vehicleTypes, genders arrays */}
            {/* Remove handleRoleChange and delivery-specific logic */}

            {/* Delivery Boy Specific Fields */}
            {/* isDeliveryBoy && ( */}
            {/*   <Fade in timeout={500}> */}
            {/*     <Box> */}
            {/*       <Typography variant="h6" fontWeight={600} color="primary" sx={{ mb: 1, mt: 2 }}> */}
            {/*         Delivery Information */}
            {/*       </Typography> */}
                  
            {/*       <TextField */}
            {/*         name="phone" */}
            {/*         placeholder="Enter your phone number" */}
            {/*         value={form.phone} */}
            {/*         onChange={handleChange} */}
            {/*         required */}
            {/*         fullWidth */}
            {/*         autoComplete="tel" */}
            {/*         InputProps={{ */}
            {/*           startAdornment: ( */}
            {/*             <InputAdornment position="start"> */}
            {/*               <PhoneIcon sx={{ color: '#1976d2', fontSize: 22 }} /> */}
            {/*             </InputAdornment> */}
            {/*           ), */}
            {/*         }} */}
            {/*         sx={commonTextFieldStyle} */}
            {/*       /> */}

            {/*       <Grid container spacing={2}> */}
            {/*         <Grid item xs={12} sm={6}> */}
            {/*           <FormControl fullWidth> */}
            {/*             <InputLabel>Gender</InputLabel> */}
            {/*             <Select */}
            {/*               name="gender" */}
            {/*               value={form.gender} */}
            {/*               onChange={handleChange} */}
            {/*               required */}
            {/*               label="Gender" */}
            {/*               sx={commonSelectStyle} */}
            {/*             > */}
            {/*               {genders.map(g => ( */}
            {/*                 <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem> */}
            {/*               ))} */}
            {/*             </Select> */}
            {/*           </FormControl> */}
            {/*         </Grid> */}
            {/*         <Grid item xs={12} sm={6}> */}
            {/*           <FormControl fullWidth> */}
            {/*             <InputLabel>Vehicle Type</InputLabel> */}
            {/*             <Select */}
            {/*               name="vehicleType" */}
            {/*               value={form.vehicleType} */}
            {/*               onChange={handleChange} */}
            {/*               required */}
            {/*               label="Vehicle Type" */}
            {/*               sx={commonSelectStyle} */}
            {/*             > */}
            {/*               {vehicleTypes.map(v => ( */}
            {/*                 <MenuItem key={v.value} value={v.value}>{v.label}</MenuItem> */}
            {/*               ))} */}
            {/*             </Select> */}
            {/*           </FormControl> */}
            {/*         </Grid> */}
            {/*       </Grid> */}

            {/*       <TextField */}
            {/*         name="vehicleNumber" */}
            {/*         placeholder="Enter vehicle number" */}
            {/*         value={form.vehicleNumber} */}
            {/*         onChange={handleChange} */}
            {/*         required */}
            {/*         fullWidth */}
            {/*         InputProps={{ */}
            {/*           startAdornment: ( */}
            {/*             <InputAdornment position="start"> */}
            {/*               <DirectionsCarIcon sx={{ color: '#1976d2', fontSize: 22 }} /> */}
            {/*             </InputAdornment> */}
            {/*           ), */}
            {/*         }} */}
            {/*         sx={commonTextFieldStyle} */}
            {/*       /> */}

            {/*       <Typography variant="h6" fontWeight={600} color="primary" sx={{ mb: 1, mt: 2 }}> */}
            {/*         Address Information */}
            {/*       </Typography> */}

            {/*       <TextField */}
            {/*         name="address.street" */}
            {/*         placeholder="Street Address" */}
            {/*         value={form.address.street} */}
            {/*         onChange={handleChange} */}
            {/*         fullWidth */}
            {/*         InputProps={{ */}
            {/*           startAdornment: ( */}
            {/*             <InputAdornment position="start"> */}
            {/*               <LocationOnIcon sx={{ color: '#1976d2', fontSize: 22 }} /> */}
            {/*             </InputAdornment> */}
            {/*           ), */}
            {/*         }} */}
            {/*         sx={commonTextFieldStyle} */}
            {/*       /> */}

            {/*       <Grid container spacing={2}> */}
            {/*         <Grid item xs={12} sm={6}> */}
            {/*           <TextField */}
            {/*             name="address.city" */}
            {/*             placeholder="City" */}
            {/*             value={form.address.city} */}
            {/*             onChange={handleChange} */}
            {/*             fullWidth */}
            {/*             sx={commonTextFieldStyle} */}
            {/*           /> */}
            {/*         </Grid> */}
            {/*         <Grid item xs={12} sm={6}> */}
            {/*           <TextField */}
            {/*             name="address.state" */}
            {/*             placeholder="State" */}
            {/*             value={form.address.state} */}
            {/*             onChange={handleChange} */}
            {/*             fullWidth */}
            {/*             sx={commonTextFieldStyle} */}
            {/*           /> */}
            {/*         </Grid> */}
            {/*       </Grid> */}

            {/*       <Grid container spacing={2}> */}
            {/*         <Grid item xs={12} sm={6}> */}
            {/*           <TextField */}
            {/*             name="address.pincode" */}
            {/*             placeholder="Pincode" */}
            {/*             value={form.address.pincode} */}
            {/*             onChange={handleChange} */}
            {/*             fullWidth */}
            {/*             sx={commonTextFieldStyle} */}
            {/*           /> */}
            {/*         </Grid> */}
            {/*         <Grid item xs={12} sm={6}> */}
            {/*           <TextField */}
            {/*             name="address.country" */}
            {/*             placeholder="Country" */}
            {/*             value={form.address.country} */}
            {/*             onChange={handleChange} */}
            {/*             fullWidth */}
            {/*             sx={commonTextFieldStyle} */}
            {/*           /> */}
            {/*         </Grid> */}
            {/*       </Grid> */}
            {/*     </Box> */}
            {/*   </Fade> */}
            {/* ) */}

            <Button
              type="submit"
              disabled={loading}
              variant="contained"
              size="large"
              sx={{
                background: 'linear-gradient(90deg, #e0c3fc 0%, #8ec5fc 100%)',
                color: '#fff',
                fontWeight: 600,
                boxShadow: '0 4px 16px 0 rgba(156,39,176,0.10)',
                borderRadius: 3,
                letterSpacing: 1,
                fontSize: 18,
                py: 1.5,
                '&:hover': { background: 'linear-gradient(90deg, #8ec5fc 0%, #e0c3fc 100%)' },
              }}
              fullWidth
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>
            
            {/* Divider for social login */}
            <Box display="flex" alignItems="center" gap={2} my={2}>
              <Box flex={1} height={1} bgcolor="#e0c3fc" borderRadius={2} />
              <Typography color="text.secondary" fontWeight={500}>or</Typography>
              <Box flex={1} height={1} bgcolor="#e0c3fc" borderRadius={2} />
            </Box>
            
            <Box display="flex" justifyContent="center" gap={2}>
              <Button variant="outlined" sx={{ borderRadius: 2, borderColor: '#8ec5fc', color: '#1976d2', fontWeight: 600 }} disabled>
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" width={22} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Google
              </Button>
              <Button variant="outlined" sx={{ borderRadius: 2, borderColor: '#8ec5fc', color: '#1976d2', fontWeight: 600 }} disabled>
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg" alt="Facebook" width={22} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Facebook
              </Button>
            </Box>
            
            {error && <Typography color="error" textAlign="center">{error}</Typography>}
            {success && <Typography color="success.main" textAlign="center">{success}</Typography>}
            
            <Typography variant="body2" textAlign="center" mt={2}>
              Already have an account? <Link to="/login" style={{ color: '#1976d2', fontWeight: 500 }}>Login here</Link>
            </Typography>
          </form>
        </Box>
      </Fade>
    </Box>
  );
} 