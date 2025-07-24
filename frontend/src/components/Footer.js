import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton, Divider } from '@mui/material';
import { Facebook, Twitter, Instagram, LinkedIn, YouTube, Email, Phone, LocationOn, Category } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const quickLinks = [
  { label: 'Home', path: '/' },
  { label: 'Best Sellers', path: '/best-sellers' },
  { label: 'Brands', path: '/brands' },
  { label: 'About Us', path: '/about' },
  { label: 'Contact', path: '/help-support' },
];

const categoryLinks = [
  { label: 'Personal Care', path: '/categories/personal-care', icon: <Category fontSize="small" /> },
  { label: 'Health and Wellness Supplements', path: '/categories/health-supplements', icon: <Category fontSize="small" /> },
  { label: 'Baby Care Products', path: '/categories/baby-care', icon: <Category fontSize="small" /> },
  { label: 'Medical Devices & Equipment', path: '/categories/medical-devices', icon: <Category fontSize="small" /> },
];

const socialLinks = [
  { icon: <Facebook fontSize="small" />, url: 'https://facebook.com', label: 'Facebook' },
  { icon: <Twitter fontSize="small" />, url: 'https://twitter.com', label: 'Twitter' },
  { icon: <Instagram fontSize="small" />, url: 'https://instagram.com', label: 'Instagram' },
  { icon: <LinkedIn fontSize="small" />, url: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: <YouTube fontSize="small" />, url: 'https://youtube.com', label: 'YouTube' },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.dark',
        color: 'white',
        py: 3,
        mt: 'auto',
        fontSize: '0.95rem',
        boxShadow: '0 -2px 16px 0 rgba(0,0,0,0.08)',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3} alignItems="flex-start" justifyContent="space-between">
          {/* Quick Links */}
          <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1, letterSpacing: 1, color: 'secondary.light' }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: { xs: 'center', md: 'flex-start' }, mb: 2 }}>
              {quickLinks.map((link, idx) => (
                <Link
                  key={idx}
                  component={RouterLink}
                  to={link.path}
                  sx={{
                    color: 'rgba(255,255,255,0.85)',
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    transition: 'background 0.2s',
                    '&:hover': { color: 'white', background: 'rgba(255,255,255,0.08)' },
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
            <Divider sx={{ bgcolor: 'rgba(255,255,255,0.12)', my: 1, borderRadius: 1 }} />
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: 'secondary.light', mt: 2 }}>
              Categories
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {categoryLinks.map((cat, idx) => (
                <Link
                  key={idx}
                  component={RouterLink}
                  to={cat.path}
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    textDecoration: 'none',
                    fontSize: '0.92rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.7,
                    py: 0.3,
                    borderRadius: 1,
                    transition: 'background 0.2s',
                    '&:hover': { color: 'white', background: 'rgba(255,255,255,0.08)' },
                  }}
                >
                  {cat.icon} {cat.label}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Social Icons */}
          <Grid item xs={12} md={4} sx={{ textAlign: 'center', my: { xs: 2, md: 0 } }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1, letterSpacing: 1, color: 'secondary.light' }}>
              Connect with Us
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mb: 2 }}>
              {socialLinks.map((social, idx) => (
                <IconButton
                  key={idx}
                  component="a"
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: 'white', bgcolor: 'primary.main', p: 1, boxShadow: 1, '&:hover': { bgcolor: 'secondary.main', color: 'white' } }}
                  aria-label={social.label}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.7, fontSize: '0.9rem' }}>
              © {currentYear} MediCare. All rights reserved.
            </Typography>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'center', md: 'right' } }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1, letterSpacing: 1, color: 'secondary.light' }}>
              Contact Info
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', md: 'flex-end' }, gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email sx={{ fontSize: 18, opacity: 0.8 }} />
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.95rem' }}>
                  info@medicare.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone sx={{ fontSize: 18, opacity: 0.8 }} />
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.95rem' }}>
                  +1 (555) 123-4567
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ fontSize: 18, opacity: 0.8 }} />
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.95rem' }}>
                  123 Health St, Medical City
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer; 