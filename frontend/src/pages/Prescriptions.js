import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { 
  getPrescriptions, 
  getProcessedPrescriptions, 
  uploadPrescription, 
  deletePrescription 
} from '../services/prescriptions';

const Prescriptions = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [processedPrescriptions, setProcessedPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    doctorName: '',
    prescriptionDate: ''
  });

  useEffect(() => {
    loadPrescriptions();
    loadProcessedPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const data = await getPrescriptions(token);
      setPrescriptions(data);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProcessedPrescriptions = async () => {
    try {
      const data = await getProcessedPrescriptions(token);
      setProcessedPrescriptions(data);
    } catch (error) {
      console.error('Error loading processed prescriptions:', error);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: URL.createObjectURL(file),
      status: 'pending'
    }));
    setUploadedFiles([...uploadedFiles, ...newFiles]);
  };

  const removeFile = (fileId) => {
    setUploadedFiles(uploadedFiles.filter(file => file.id !== fileId));
  };

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0) {
      alert('Please upload at least one prescription');
      return;
    }
    
    try {
      setUploading(true);
      
      for (const fileData of uploadedFiles) {
        await uploadPrescription(
          fileData.file, 
          formData.doctorName, 
          formData.prescriptionDate, 
          token
        );
      }

      // Clear form and files
      setUploadedFiles([]);
      setFormData({ doctorName: '', prescriptionDate: '' });
      
      // Reload prescriptions
      await loadPrescriptions();
      
      alert('Prescriptions submitted successfully! Pharmacists will review and process them.');
    } catch (error) {
      console.error('Error submitting prescriptions:', error);
      alert('Error submitting prescriptions. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePrescription = async (prescriptionId) => {
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      try {
        await deletePrescription(prescriptionId, token);
        await loadPrescriptions();
        alert('Prescription deleted successfully');
      } catch (error) {
        console.error('Error deleting prescription:', error);
        alert('Error deleting prescription');
      }
    }
  };

  const handleReorder = (prescription) => {
    // Navigate to cart with medicines from processed prescription
    const medicines = prescription.medicines.map(med => ({
      name: med.name,
      dosage: med.dosage,
      quantity: med.quantity,
      instructions: med.instructions,
      price: med.price
    }));
    
    // Store in localStorage for cart processing
    localStorage.setItem('reorderMedicines', JSON.stringify(medicines));
    localStorage.setItem('reorderPrescriptionId', prescription._id);
    
    // Navigate to cart
    window.location.href = '/cart';
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
      day: 'numeric'
    });
  };

  return (
    <>
      <Header />
      <div style={{ minHeight: '100vh' }}>
        {/* Tab Navigation and Main Content */}
        <div style={{
          maxWidth: 1200,
          margin: '40px auto',
          padding: '0 20px'
        }}>
          {/* Tab Navigation */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '40px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setActiveTab('upload')}
              style={{
                background: activeTab === 'upload' ? '#2186eb' : 'rgba(255,255,255,0.9)',
                color: activeTab === 'upload' ? 'white' : '#333',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '25px',
                fontSize: '1.1rem',
                fontWeight: 500,
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(31, 38, 135, 0.1)',
                transition: 'all 0.3s ease'
              }}
            >
              📤 Upload Prescription
            </button>
            <button
              onClick={() => setActiveTab('history')}
              style={{
                background: activeTab === 'history' ? '#2186eb' : 'rgba(255,255,255,0.9)',
                color: activeTab === 'history' ? 'white' : '#333',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '25px',
                fontSize: '1.1rem',
                fontWeight: 500,
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(31, 38, 135, 0.1)',
                transition: 'all 0.3s ease'
              }}
            >
              📋 Prescription History
            </button>
            <button
              onClick={() => setActiveTab('reorder')}
              style={{
                background: activeTab === 'reorder' ? '#2186eb' : 'rgba(255,255,255,0.9)',
                color: activeTab === 'reorder' ? 'white' : '#333',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '25px',
                fontSize: '1.1rem',
                fontWeight: 500,
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(31, 38, 135, 0.1)',
                transition: 'all 0.3s ease'
              }}
            >
              🔄 Reorder Medicines
            </button>
          </div>

          {/* Upload Prescription Tab */}
          {activeTab === 'upload' && (
            <div style={{
              background: 'rgba(255,255,255,0.9)',
              borderRadius: '20px',
              padding: '40px',
              boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1)'
            }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: '#2186eb',
                marginBottom: '30px',
                textAlign: 'center'
              }}>
                Upload Your Prescription
              </h2>

              {/* Form Fields */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '30px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 600,
                    color: '#333'
                  }}>
                    Doctor's Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.doctorName}
                    onChange={(e) => setFormData({...formData, doctorName: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                    placeholder="Enter doctor's name"
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 600,
                    color: '#333'
                  }}>
                    Prescription Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.prescriptionDate}
                    onChange={(e) => setFormData({...formData, prescriptionDate: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>

              {/* Upload Instructions */}
              <div style={{
                background: '#f8f9ff',
                padding: '30px',
                borderRadius: '15px',
                marginBottom: '30px'
              }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: 600,
                  color: '#333',
                  marginBottom: '20px'
                }}>
                  📋 Upload Guidelines
                </h3>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  color: '#555',
                  lineHeight: 1.8
                }}>
                  <li style={{ marginBottom: '10px' }}>✅ Ensure the prescription is clearly visible and readable</li>
                  <li style={{ marginBottom: '10px' }}>✅ Include doctor's signature and stamp</li>
                  <li style={{ marginBottom: '10px' }}>✅ Make sure all medicine names and dosages are visible</li>
                  <li style={{ marginBottom: '10px' }}>✅ Upload in JPG, PNG, or PDF format</li>
                  <li style={{ marginBottom: '10px' }}>✅ Maximum file size: 5MB per prescription</li>
                </ul>
              </div>

              {/* File Upload Area */}
              <div style={{
                border: '2px dashed #2186eb',
                borderRadius: '15px',
                padding: '40px',
                textAlign: 'center',
                marginBottom: '30px',
                background: '#f8f9ff'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>
                  📄
                </div>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: 600,
                  color: '#333',
                  marginBottom: '15px'
                }}>
                  Drop your prescription here or click to browse
                </h3>
                <p style={{
                  color: '#666',
                  marginBottom: '25px'
                }}>
                  Supported formats: JPG, PNG, PDF (Max 5MB)
                </p>
                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  id="prescription-upload"
                />
                <label
                  htmlFor="prescription-upload"
                  style={{
                    background: '#2186eb',
                    color: 'white',
                    padding: '12px 25px',
                    borderRadius: '25px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 500,
                    display: 'inline-block',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Choose Files
                </label>
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div style={{ marginBottom: '30px' }}>
                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: 600,
                    color: '#333',
                    marginBottom: '20px'
                  }}>
                    Uploaded Prescriptions ({uploadedFiles.length})
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '20px'
                  }}>
                    {uploadedFiles.map((file) => (
                      <div key={file.id} style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '10px',
                        padding: '20px',
                        background: 'white'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '15px'
                        }}>
                          <div>
                            <h4 style={{
                              fontSize: '1rem',
                              fontWeight: 600,
                              color: '#333',
                              marginBottom: '5px'
                            }}>
                              {file.name}
                            </h4>
                            <p style={{
                              fontSize: '0.9rem',
                              color: '#666'
                            }}>
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <button
                            onClick={() => removeFile(file.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              fontSize: '1.2rem'
                            }}
                          >
                            ×
                          </button>
                        </div>
                        {file.type.startsWith('image/') && (
                          <img
                            src={file.preview}
                            alt={file.name}
                            style={{
                              width: '100%',
                              height: '150px',
                              objectFit: 'cover',
                              borderRadius: '8px'
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={handleSubmit}
                  disabled={uploadedFiles.length === 0 || uploading}
                  style={{
                    background: uploadedFiles.length === 0 || uploading ? '#ccc' : '#2186eb',
                    color: 'white',
                    border: 'none',
                    padding: '15px 40px',
                    borderRadius: '25px',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    cursor: uploadedFiles.length === 0 || uploading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 15px rgba(33, 134, 235, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {uploading ? 'Submitting...' : 'Submit Prescription'}
                </button>
              </div>
            </div>
          )}

          {/* Prescription History Tab */}
          {activeTab === 'history' && (
            <div style={{
              background: 'rgba(255,255,255,0.9)',
              borderRadius: '20px',
              padding: '40px',
              boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1)'
            }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: '#2186eb',
                marginBottom: '30px',
                textAlign: 'center'
              }}>
                Prescription History
              </h2>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '20px' }}>⏳</div>
                  <p>Loading prescriptions...</p>
                </div>
              ) : prescriptions.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#666'
                }}>
                  <div style={{ fontSize: '4rem', marginBottom: '20px' }}>
                    📋
                  </div>
                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: 600,
                    color: '#333',
                    marginBottom: '10px'
                  }}>
                    No prescriptions found
                  </h3>
                  <p>You haven't uploaded any prescriptions yet.</p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gap: '20px'
                }}>
                  {prescriptions.map((prescription) => (
                    <div key={prescription._id} style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '15px',
                        padding: '25px',
                        background: 'white'
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
                              width: '100px',
                              height: '100px',
                              objectFit: 'cover',
                              borderRadius: '10px'
                            }}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/100x100?text=Prescription';
                          }}
                          />

                          {/* Prescription Details */}
                          <div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              marginBottom: '10px'
                            }}>
                              <h3 style={{
                                fontSize: '1.2rem',
                                fontWeight: 600,
                                color: '#333',
                                margin: 0
                              }}>
                              Prescription #{prescription._id.slice(-6)}
                              </h3>
                              <span style={{
                                background: getStatusColor(prescription.status),
                                color: 'white',
                                padding: '4px 12px',
                                borderRadius: '15px',
                                fontSize: '0.9rem',
                                fontWeight: 500
                              }}>
                              {getStatusIcon(prescription.status)} {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                              </span>
                            </div>
                            
                            <p style={{
                              color: '#666',
                              marginBottom: '8px',
                              fontSize: '0.95rem'
                            }}>
                            <strong>Date:</strong> {formatDate(prescription.createdAt)}
                            </p>
                          {prescription.doctorName && (
                            <p style={{
                              color: '#666',
                              marginBottom: '8px',
                              fontSize: '0.95rem'
                            }}>
                              <strong>Doctor:</strong> {prescription.doctorName}
                            </p>
                          )}
                          {prescription.pharmacist && (
                            <p style={{
                              color: '#666',
                              marginBottom: '8px',
                              fontSize: '0.95rem'
                            }}>
                              <strong>Pharmacy:</strong> {prescription.pharmacist.pharmacyName || prescription.pharmacist.name}
                            </p>
                          )}
                            
                          {prescription.medicines && prescription.medicines.length > 0 && (
                            <div style={{ marginTop: '10px' }}>
                              <strong style={{ color: '#333' }}>Medicines:</strong>
                              <ul style={{
                                listStyle: 'none',
                                padding: 0,
                                margin: '5px 0 0 0'
                              }}>
                                {prescription.medicines.map((medicine, index) => (
                                  <li key={index} style={{
                                    color: '#666',
                                    fontSize: '0.9rem',
                                    marginBottom: '2px'
                                  }}>
                                    • {medicine.name} - {medicine.dosage} (Qty: {medicine.quantity})
                                  </li>
                                ))}
                              </ul>
                              {prescription.totalAmount > 0 && (
                                <p style={{
                                  color: '#333',
                                  fontSize: '1rem',
                                  fontWeight: 600,
                                  marginTop: '10px'
                                }}>
                                  Total: ₹{prescription.totalAmount}
                                </p>
                              )}
                            </div>
                          )}

                          {prescription.pharmacistNote && (
                              <p style={{
                              color: '#666',
                                fontSize: '0.9rem',
                                marginTop: '10px',
                                fontStyle: 'italic'
                              }}>
                              <strong>Note:</strong> {prescription.pharmacistNote}
                              </p>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                          }}>
                          <button 
                            onClick={() => handleDeletePrescription(prescription._id)}
                            style={{
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              padding: '8px 16px',
                              borderRadius: '20px',
                              fontSize: '0.9rem',
                              cursor: 'pointer',
                              fontWeight: 500
                            }}
                          >
                            Delete
                            </button>
                          {prescription.status === 'processed' && (
                            <button 
                              onClick={() => handleReorder(prescription)}
                              style={{
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '20px',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                fontWeight: 500
                              }}
                            >
                              Reorder
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}

          {/* Reorder Medicines Tab */}
          {activeTab === 'reorder' && (
            <div style={{
              background: 'rgba(255,255,255,0.9)',
              borderRadius: '20px',
              padding: '40px',
              boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1)'
            }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: '#2186eb',
                marginBottom: '30px',
                textAlign: 'center'
              }}>
                Reorder Medicines
              </h2>

              {processedPrescriptions.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#666'
                }}>
                  <div style={{ fontSize: '4rem', marginBottom: '20px' }}>
                    🔄
                  </div>
                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: 600,
                    color: '#333',
                    marginBottom: '10px'
                  }}>
                    No processed prescriptions found
                  </h3>
                  <p>You can reorder medicines from prescriptions that have been processed by pharmacists.</p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gap: '20px'
                }}>
                  {processedPrescriptions.map((prescription) => (
                    <div key={prescription._id} style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '15px',
                      padding: '25px',
                      background: 'white'
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
                            width: '100px',
                            height: '100px',
                            objectFit: 'cover',
                            borderRadius: '10px'
                          }}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/100x100?text=Prescription';
                          }}
                        />

                        {/* Prescription Details */}
                        <div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '10px'
                          }}>
                            <h3 style={{
                              fontSize: '1.2rem',
                              fontWeight: 600,
                              color: '#333',
                              margin: 0
                            }}>
                              Prescription #{prescription._id.slice(-6)}
                            </h3>
                            <span style={{
                              background: '#10b981',
                              color: 'white',
                              padding: '4px 12px',
                              borderRadius: '15px',
                              fontSize: '0.9rem',
                              fontWeight: 500
                            }}>
                              ✅ Processed
                            </span>
                          </div>
                          
                          <p style={{
                            color: '#666',
                            marginBottom: '8px',
                            fontSize: '0.95rem'
                          }}>
                            <strong>Processed Date:</strong> {formatDate(prescription.processedAt)}
                          </p>
                          {prescription.doctorName && (
                            <p style={{
                              color: '#666',
                              marginBottom: '8px',
                              fontSize: '0.95rem'
                            }}>
                              <strong>Doctor:</strong> {prescription.doctorName}
                            </p>
                          )}
                          {prescription.pharmacist && (
                            <p style={{
                              color: '#666',
                              marginBottom: '8px',
                              fontSize: '0.95rem'
                            }}>
                              <strong>Pharmacy:</strong> {prescription.pharmacist.pharmacyName || prescription.pharmacist.name}
                            </p>
                          )}
                          
                          <div style={{ marginTop: '10px' }}>
                            <strong style={{ color: '#333' }}>Medicines:</strong>
                            <ul style={{
                              listStyle: 'none',
                              padding: 0,
                              margin: '5px 0 0 0'
                            }}>
                              {prescription.medicines.map((medicine, index) => (
                                <li key={index} style={{
                                  color: '#666',
                                  fontSize: '0.9rem',
                                  marginBottom: '2px'
                                }}>
                                  • {medicine.name} - {medicine.dosage} (Qty: {medicine.quantity}) - ₹{medicine.price}
                                </li>
                              ))}
                            </ul>
                            <p style={{
                              color: '#333',
                              fontSize: '1.1rem',
                              fontWeight: 600,
                              marginTop: '10px'
                            }}>
                              Total: ₹{prescription.totalAmount}
                            </p>
                          </div>

                          {prescription.pharmacistNote && (
                            <p style={{
                              color: '#666',
                              fontSize: '0.9rem',
                              marginTop: '10px',
                              fontStyle: 'italic'
                            }}>
                              <strong>Note:</strong> {prescription.pharmacistNote}
                            </p>
                          )}
                        </div>

                        {/* Reorder Button */}
                        <div>
                          <button 
                            onClick={() => handleReorder(prescription)}
                            style={{
                              background: '#10b981',
                              color: 'white',
                              border: 'none',
                              padding: '12px 24px',
                              borderRadius: '25px',
                              fontSize: '1rem',
                              cursor: 'pointer',
                              fontWeight: 600,
                              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            🔄 Reorder All
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Prescriptions;
