import React, { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardActionArea, Dialog, DialogTitle, DialogContent, IconButton, TextField, Button, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import ChatWindow from '../components/ChatWindow';
import { useAuth } from '../context/AuthContext';
import PharmacistHeader from '../components/PharmacistHeader';
import PharmacistSupportSidebar from '../components/PharmacistSupportSidebar';

const supportOptions = [
  {
    id: 'faq',
    title: 'FAQ',
    icon: <HelpIcon fontSize="large" color="primary" />,
    description: 'Browse frequently asked questions for quick answers.'
  },
  {
    id: 'contact',
    title: 'Contact Admin',
    icon: <ContactMailIcon fontSize="large" color="primary" />,
    description: 'Reach out to the admin for personalized support.'
  },
  {
    id: 'report',
    title: 'Report Issue',
    icon: <ReportProblemIcon fontSize="large" color="primary" />,
    description: 'Report a technical or operational issue.'
  },
  {
    id: 'chat',
    title: 'Live Chat',
    icon: <ChatIcon fontSize="large" color="primary" />,
    description: 'Chat live with an admin for instant help.'
  }
];

const faqList = [
  { q: 'How do I update medicine stock?', a: 'Go to Medicines > Edit and update the stock field.' },
  { q: 'How do I view my sales report?', a: 'Navigate to Sales Report from the sidebar to see detailed analytics.' },
  { q: 'How do I contact admin?', a: 'Use the Contact Admin form or Live Chat for direct support.' },
];

const HelpSupportPharmacist = () => {
  const [open, setOpen] = useState('faq'); // Default to 'faq' for sidebar selection
  const { user } = useAuth();
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [reportForm, setReportForm] = useState({ subject: '', details: '' });

  // Handlers
  const handleOpen = (id) => setOpen(id);
  const handleClose = () => setOpen(null);

  // Contact form submit (placeholder)
  const handleContactSubmit = (e) => {
    e.preventDefault();
    alert('Message sent! (Demo only)');
    setContactForm({ name: '', email: '', message: '' });
    handleClose();
  };
  // Report form submit (placeholder)
  const handleReportSubmit = (e) => {
    e.preventDefault();
    alert('Issue reported! (Demo only)');
    setReportForm({ subject: '', details: '' });
    handleClose();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8faff' }}>
      <PharmacistHeader />
      <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
        <PharmacistSupportSidebar selected={open} onSelect={handleOpen} />
        <Box sx={{ flex: 1, p: { xs: 2, md: 4 }, mb: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h3" fontWeight={800} color="primary" gutterBottom>
              Support
            </Typography>
            <Typography variant="h6" color="text.secondary">
              How can we help you today?
            </Typography>
          </Box>
          <Grid container spacing={4} justifyContent="center">
            {supportOptions.map(opt => (
              <Grid item xs={12} sm={6} md={3} key={opt.id}>
                <Card elevation={3} sx={{ borderRadius: 4 }}>
                  <CardActionArea onClick={() => handleOpen(opt.id)} sx={{ p: 3, minHeight: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    {opt.icon}
                    <Typography variant="h6" fontWeight={700} sx={{ mt: 2 }}>{opt.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>{opt.description}</Typography>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* FAQ Modal */}
          <Dialog open={open === 'faq'} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
              FAQ
              <IconButton onClick={handleClose} sx={{ position: 'absolute', right: 8, top: 8 }}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent>
              <List>
                {faqList.map((faq, idx) => (
                  <ListItem key={idx} alignItems="flex-start">
                    <ListItemIcon><HelpIcon color="primary" /></ListItemIcon>
                    <ListItemText
                      primary={<Typography fontWeight={700}>{faq.q}</Typography>}
                      secondary={faq.a}
                    />
                  </ListItem>
                ))}
              </List>
            </DialogContent>
          </Dialog>

          {/* Contact Admin Modal */}
          <Dialog open={open === 'contact'} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
              Contact Admin
              <IconButton onClick={handleClose} sx={{ position: 'absolute', right: 8, top: 8 }}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent>
              <Box component="form" onSubmit={handleContactSubmit} sx={{ mt: 2 }}>
                <TextField label="Name" fullWidth required sx={{ mb: 2 }} value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))} />
                <TextField label="Email" type="email" fullWidth required sx={{ mb: 2 }} value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} />
                <TextField label="Message" fullWidth required multiline minRows={3} sx={{ mb: 2 }} value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))} />
                <Button type="submit" variant="contained" color="primary" fullWidth>Send</Button>
              </Box>
            </DialogContent>
          </Dialog>

          {/* Report Issue Modal */}
          <Dialog open={open === 'report'} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
              Report Issue
              <IconButton onClick={handleClose} sx={{ position: 'absolute', right: 8, top: 8 }}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent>
              <Box component="form" onSubmit={handleReportSubmit} sx={{ mt: 2 }}>
                <TextField label="Subject" fullWidth required sx={{ mb: 2 }} value={reportForm.subject} onChange={e => setReportForm(f => ({ ...f, subject: e.target.value }))} />
                <TextField label="Details" fullWidth required multiline minRows={3} sx={{ mb: 2 }} value={reportForm.details} onChange={e => setReportForm(f => ({ ...f, details: e.target.value }))} />
                <Button type="submit" variant="contained" color="primary" fullWidth>Report</Button>
              </Box>
            </DialogContent>
          </Dialog>

          {/* Live Chat Modal */}
          <Dialog open={open === 'chat'} onClose={handleClose} maxWidth="xs" fullWidth>
            <DialogTitle>
              Live Chat
              <IconButton onClick={handleClose} sx={{ position: 'absolute', right: 8, top: 8 }}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent>
              <ChatWindow currentUser={user} recipientId="support" recipientRole="admin" />
            </DialogContent>
          </Dialog>
        </Box>
      </Box>
    </div>
  );
};

export default HelpSupportPharmacist;
