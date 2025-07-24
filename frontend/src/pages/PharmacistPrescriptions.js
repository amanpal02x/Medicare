import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { IconButton, Avatar, Tooltip, Box, Typography, Badge, Button, Divider } from '@mui/material';
import Popover from '@mui/material/Popover';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { 
  getAllPrescriptions, 
  processPrescription, 
  approvePrescription, 
  rejectPrescription 
} from '../services/prescriptions';
import { createOrderFromPrescription } from '../services/orders';

const PharmacistPrescriptions = () => {
  const { user, token, logout } = useAuth();
  const { notifications, clearAllNotifications } = useNotifications();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    medicines: [{ name: '', dosage: '', quantity: 1, instructions: '', price: 0 }],
    pharmacistNote: '',
    totalAmount: 0
  });
  const [profileAnchor, setProfileAnchor] = React.useState(null);
  const [notifAnchor, setNotifAnchor] = React.useState(null);
  const handleProfileOpen = (e) => setProfileAnchor(e.currentTarget);
  const handleProfileClose = () => setProfileAnchor(null);
  const handleNotifOpen = (e) => setNotifAnchor(e.currentTarget);
  const handleNotifClose = () => setNotifAnchor(null);
  const handleLogout = () => { setProfileAnchor(null); logout(); };
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const data = await getAllPrescriptions(token);
      setPrescriptions(data);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setShowProcessModal(true);
  };

  const handleApprovePrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setActionType('approve');
    setShowActionModal(true);
  };

  const handleRejectPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setActionType('reject');
    setShowActionModal(true);
  };

  const addMedicine = () => {
    setFormData({
      ...formData,
      medicines: [...formData.medicines, { name: '', dosage: '', quantity: 1, instructions: '', price: 0 }]
    });
  };

  const removeMedicine = (index) => {
    const newMedicines = formData.medicines.filter((_, i) => i !== index);
    const totalAmount = newMedicines.reduce((sum, med) => sum + (med.price * med.quantity), 0);
    setFormData({
      ...formData,
      medicines: newMedicines,
      totalAmount
    });
  };

  const updateMedicine = (index, field, value) => {
    const newMedicines = [...formData.medicines];
    newMedicines[index][field] = value;
    const totalAmount = newMedicines.reduce((sum, med) => sum + (med.price * med.quantity), 0);
    setFormData({
      ...formData,
      medicines: newMedicines,
      totalAmount
    });
  };

  const submitProcess = async () => {
    if (!formData.medicines[0].name || !formData.medicines[0].dosage) {
      alert('Please add at least one medicine with name and dosage');
      return;
    }

    try {
      setProcessing(true);
      await processPrescription(
        selectedPrescription._id,
        formData.medicines,
        formData.pharmacistNote,
        formData.totalAmount,
        token
      );
      
      setShowProcessModal(false);
      setFormData({
        medicines: [{ name: '', dosage: '', quantity: 1, instructions: '', price: 0 }],
        pharmacistNote: '',
        totalAmount: 0
      });
      await loadPrescriptions();
      alert('Prescription processed successfully!');
    } catch (error) {
      console.error('Error processing prescription:', error);
      alert('Error processing prescription');
    } finally {
      setProcessing(false);
    }
  };

  const submitAction = async () => {
    if (!formData.pharmacistNote.trim()) {
      alert('Please add a note');
      return;
    }

    try {
      setProcessing(true);
      if (actionType === 'approve') {
        await approvePrescription(selectedPrescription._id, formData.pharmacistNote, token);
      } else {
        await rejectPrescription(selectedPrescription._id, formData.pharmacistNote, token);
      }
      
      setShowActionModal(false);
      setFormData({
        medicines: [{ name: '', dosage: '', quantity: 1, instructions: '', price: 0 }],
        pharmacistNote: '',
        totalAmount: 0
      });
      await loadPrescriptions();
      alert(`Prescription ${actionType}d successfully!`);
    } catch (error) {
      console.error(`Error ${actionType}ing prescription:`, error);
      alert(`Error ${actionType}ing prescription`);
    } finally {
      setProcessing(false);
    }
  };

  const handlePlaceOrder = async (prescription) => {
    if (!window.confirm('Place order for this prescription?')) return;
    try {
      setPlacingOrder(true);
      await createOrderFromPrescription(prescription._id, token);
      alert('Order placed successfully!');
      await loadPrescriptions();
    } catch (err) {
      alert(err.response?.data?.message || 'Error placing order');
    } finally {
      setPlacingOrder(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processed': return '#10b981';
      case 'approved': return '#3b82f6';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processed': return '✅';
      case 'approved': return '✅';
      case 'pending': return '⏳';
      case 'rejected': return '❌';
      default: return '📋';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4} mt={2}>
        <div style={{ width: 48 }} />
        <Typography variant="h5" fontWeight={600} color="primary" align="center">
          Hello{user && user.name ? `, ${user.name}` : ''}!
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Tooltip title="Notifications">
            <IconButton color="primary" onClick={handleNotifOpen}>
              <Badge color="error" badgeContent={notifications.filter(n => !n.isRead).length}>
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Menu anchorEl={notifAnchor} open={Boolean(notifAnchor)} onClose={handleNotifClose}>
            {notifications.length === 0 ? (
              <MenuItem disabled>No notifications</MenuItem>
            ) : (
              <>
                <MenuItem disabled>Notifications ({notifications.length})</MenuItem>
                <MenuItem onClick={clearAllNotifications}>Clear All</MenuItem>
                <Divider />
                {notifications.map(n => (
                  <MenuItem key={n._id} onClick={handleNotifClose} style={{ fontWeight: n.isRead ? 400 : 700 }}>
                    {n.message}
                  </MenuItem>
                ))}
              </>
            )}
          </Menu>
          <Tooltip title={user?.name || 'Profile'}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, cursor: 'pointer' }} onClick={handleProfileOpen}>
              {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
            </Avatar>
          </Tooltip>
          <Popover open={Boolean(profileAnchor)} anchorEl={profileAnchor} onClose={handleProfileClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
            <Box display="flex" flexDirection="column" alignItems="center" gap={1} p={2} minWidth={220}>
              <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main', color: '#fff' }}>{user?.name ? user.name.charAt(0).toUpperCase() : <PersonIcon fontSize="large" />}</Avatar>
              <Typography variant="h6" fontWeight={700} color="primary.main">Profile</Typography>
              <Box width="100%" mt={1}>
                <Box display="flex" alignItems="center" gap={1} mb={1}><PersonIcon color="primary" fontSize="small" /><Typography variant="body2"><b>Name:</b> {user?.name}</Typography></Box>
                <Box display="flex" alignItems="center" gap={1} mb={1}><MailOutlineIcon color="primary" fontSize="small" /><Typography variant="body2"><b>Email:</b> {user?.email}</Typography></Box>
                <Box display="flex" alignItems="center" gap={1}><AssignmentIcon color="primary" fontSize="small" /><Typography variant="body2"><b>Role:</b> {user?.role}</Typography></Box>
              </Box>
              <Divider sx={{ my: 1, width: '100%' }} />
              <Button variant="contained" color="primary" fullWidth onClick={handleLogout} startIcon={<LogoutIcon />}>LOGOUT</Button>
            </Box>
          </Popover>
        </Box>
      </Box>
      <div style={{ padding: '20px', background: '#f8f9fa', minHeight: '100vh' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            color: '#2186eb',
            marginBottom: '30px',
            textAlign: 'center'
          }}>
            Prescription Management
          </h1>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '20px' }}>⏳</div>
              <p>Loading prescriptions...</p>
            </div>
          ) : prescriptions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'white',
              borderRadius: '15px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📋</div>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: 600,
                color: '#333',
                marginBottom: '10px'
              }}>
                No prescriptions found
              </h3>
              <p>No prescriptions have been uploaded by users yet.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gap: '20px'
            }}>
              {prescriptions.map((prescription) => (
                <div key={prescription._id} style={{
                  background: 'white',
                  borderRadius: '15px',
                  padding: '25px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 2fr auto',
                    gap: '20px',
                    alignItems: 'center'
                  }}>
                    {/* Prescription Image */}
                    <img
                      src={prescription.imageUrl}
                      alt="Prescription"
                      style={{
                        width: '120px',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '10px',
                        border: '2px solid #e5e7eb'
                      }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/120x120?text=Prescription';
                      }}
                    />

                    {/* Prescription Details */}
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '15px'
                      }}>
                        <h3 style={{
                          fontSize: '1.3rem',
                          fontWeight: 600,
                          color: '#333',
                          margin: 0
                        }}>
                          Prescription #{prescription._id.slice(-6)}
                        </h3>
                        <span style={{
                          background: getStatusColor(prescription.status),
                          color: 'white',
                          padding: '6px 15px',
                          borderRadius: '20px',
                          fontSize: '0.9rem',
                          fontWeight: 500
                        }}>
                          {getStatusIcon(prescription.status)} {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                        </span>
                      </div>
                      
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '15px',
                        marginBottom: '15px'
                      }}>
                        <div>
                          <p style={{
                            color: '#666',
                            marginBottom: '5px',
                            fontSize: '0.95rem'
                          }}>
                            <strong>Patient:</strong> {prescription.user?.name || 'Unknown'}
                          </p>
                          <p style={{
                            color: '#666',
                            marginBottom: '5px',
                            fontSize: '0.95rem'
                          }}>
                            <strong>Email:</strong> {prescription.user?.email || 'Unknown'}
                          </p>
                          <p style={{
                            color: '#666',
                            marginBottom: '5px',
                            fontSize: '0.95rem'
                          }}>
                            <strong>Uploaded:</strong> {formatDate(prescription.createdAt)}
                          </p>
                        </div>
                        <div>
                          {prescription.doctorName && (
                            <p style={{
                              color: '#666',
                              marginBottom: '5px',
                              fontSize: '0.95rem'
                            }}>
                              <strong>Doctor:</strong> {prescription.doctorName}
                            </p>
                          )}
                          {prescription.prescriptionDate && (
                            <p style={{
                              color: '#666',
                              marginBottom: '5px',
                              fontSize: '0.95rem'
                            }}>
                              <strong>Prescription Date:</strong> {formatDate(prescription.prescriptionDate)}
                            </p>
                          )}
                          {prescription.pharmacistNote && (
                            <p style={{
                              color: '#666',
                              marginBottom: '5px',
                              fontSize: '0.95rem'
                            }}>
                              <strong>Note:</strong> {prescription.pharmacistNote}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {prescription.medicines && prescription.medicines.length > 0 && (
                        <div style={{ marginTop: '15px' }}>
                          <strong style={{ color: '#333' }}>Processed Medicines:</strong>
                          <ul style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: '5px 0 0 0'
                          }}>
                            {prescription.medicines.map((medicine, index) => (
                              <li key={index} style={{
                                color: '#666',
                                fontSize: '0.9rem',
                                marginBottom: '3px'
                              }}>
                                • {medicine.name} - {medicine.dosage} (Qty: {medicine.quantity}) - ₹{medicine.price}
                              </li>
                            ))}
                          </ul>
                          {prescription.totalAmount > 0 && (
                            <p style={{
                              color: '#333',
                              fontSize: '1.1rem',
                              fontWeight: 600,
                              marginTop: '10px'
                            }}>
                              Total: ₹{prescription.totalAmount}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      {prescription.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleProcessPrescription(prescription)}
                            style={{
                              background: '#10b981',
                              color: 'white',
                              border: 'none',
                              padding: '10px 20px',
                              borderRadius: '25px',
                              fontSize: '0.9rem',
                              cursor: 'pointer',
                              fontWeight: 500
                            }}
                          >
                            📋 Process
                          </button>
                          <button
                            onClick={() => handleApprovePrescription(prescription)}
                            style={{
                              background: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              padding: '10px 20px',
                              borderRadius: '25px',
                              fontSize: '0.9rem',
                              cursor: 'pointer',
                              fontWeight: 500
                            }}
                          >
                            ✅ Approve
                          </button>
                          <button
                            onClick={() => handleRejectPrescription(prescription)}
                            style={{
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              padding: '10px 20px',
                              borderRadius: '25px',
                              fontSize: '0.9rem',
                              cursor: 'pointer',
                              fontWeight: 500
                            }}
                          >
                            ❌ Reject
                          </button>
                        </>
                      )}
                      {prescription.status === 'processed' && (
                        <span style={{
                          background: '#10b981',
                          color: 'white',
                          padding: '8px 16px',
                          borderRadius: '20px',
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          textAlign: 'center'
                        }}>
                          ✅ Processed
                        </span>
                      )}
                      {prescription.status === 'processed' && !prescription.ordered && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handlePlaceOrder(prescription)}
                          disabled={placingOrder}
                        >
                          Place Order
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Process Prescription Modal */}
        {showProcessModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: '15px',
              padding: '30px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                color: '#333',
                marginBottom: '20px'
              }}>
                Process Prescription
              </h2>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 600,
                  color: '#333'
                }}>
                  Medicines
                </label>
                {formData.medicines.map((medicine, index) => (
                  <div key={index} style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    padding: '15px',
                    marginBottom: '15px'
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '10px',
                      marginBottom: '10px'
                    }}>
                      <input
                        type="text"
                        placeholder="Medicine name"
                        value={medicine.name}
                        onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                        style={{
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '5px'
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Dosage"
                        value={medicine.dosage}
                        onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                        style={{
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '5px'
                        }}
                      />
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: '10px',
                      marginBottom: '10px'
                    }}>
                      <input
                        type="number"
                        placeholder="Quantity"
                        value={medicine.quantity}
                        onChange={(e) => updateMedicine(index, 'quantity', parseInt(e.target.value) || 1)}
                        style={{
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '5px'
                        }}
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={medicine.price}
                        onChange={(e) => updateMedicine(index, 'price', parseFloat(e.target.value) || 0)}
                        style={{
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '5px'
                        }}
                      />
                      <button
                        onClick={() => removeMedicine(index)}
                        style={{
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          padding: '8px',
                          borderRadius: '5px',
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Instructions (optional)"
                      value={medicine.instructions}
                      onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '5px'
                      }}
                    />
                  </div>
                ))}
                <button
                  onClick={addMedicine}
                  style={{
                    background: '#2186eb',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '25px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  + Add Medicine
                </button>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 600,
                  color: '#333'
                }}>
                  Note (Optional)
                </label>
                <textarea
                  value={formData.pharmacistNote}
                  onChange={(e) => setFormData({...formData, pharmacistNote: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  placeholder="Add any notes for the patient..."
                />
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <span style={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: '#333'
                }}>
                  Total Amount: ₹{formData.totalAmount}
                </span>
              </div>

              <div style={{
                display: 'flex',
                gap: '10px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => setShowProcessModal(false)}
                  style={{
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '25px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={submitProcess}
                  disabled={processing}
                  style={{
                    background: processing ? '#ccc' : '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '25px',
                    cursor: processing ? 'not-allowed' : 'pointer'
                  }}
                >
                  {processing ? 'Processing...' : 'Process Prescription'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Modal */}
        {showActionModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: '15px',
              padding: '30px',
              maxWidth: '500px',
              width: '90%'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                color: '#333',
                marginBottom: '20px'
              }}>
                {actionType === 'approve' ? 'Approve' : 'Reject'} Prescription
              </h2>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 600,
                  color: '#333'
                }}>
                  Note (Required)
                </label>
                <textarea
                  value={formData.pharmacistNote}
                  onChange={(e) => setFormData({...formData, pharmacistNote: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                  placeholder={`Add a note for ${actionType === 'approve' ? 'approval' : 'rejection'}...`}
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '10px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => setShowActionModal(false)}
                  style={{
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '25px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={submitAction}
                  disabled={processing}
                  style={{
                    background: processing ? '#ccc' : (actionType === 'approve' ? '#3b82f6' : '#ef4444'),
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '25px',
                    cursor: processing ? 'not-allowed' : 'pointer'
                  }}
                >
                  {processing ? 'Processing...' : (actionType === 'approve' ? 'Approve' : 'Reject')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PharmacistPrescriptions;
