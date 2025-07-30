import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getMedicineById, getSimilarMedicines, getFrequentlySearchedMedicines } from '../services/medicines';
import { getAllOffers } from '../services/offers';
import { useCart } from '../context/CartContext';
import ItemCard from '../components/ItemCard';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VerifiedIcon from '@mui/icons-material/Verified';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import { formatItemPriceData, formatPriceForDisplay } from '../utils/priceUtils';
import { useLocationPincode } from '../hooks/useLocationPincode';
import { getShuffledItems } from '../utils/shuffleUtils';
import useDeviceDetection from '../hooks/useDeviceDetection';


const MedicineDetail = () => {
  const { id } = useParams();
  const { isMobile } = useDeviceDetection();
  const [medicine, setMedicine] = useState(null);
  const [offers, setOffers] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const { pincode: deliveryPincode, loading: pincodeLoading } = useLocationPincode();
  const { addToCart } = useCart();

  const API_BASE = (process.env.REACT_APP_API_URL || 'https://medicare-ydw4.onrender.com').replace(/\/$/, '');
  function joinUrl(base, path) {
    return `${base}/${path.replace(/^\//, '')}`;
  }

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const data = await getMedicineById(id);
        
        // Use the data directly from API without additional processing
        setMedicine(data);
        
        // Debug logging
        console.log('MedicineDetail - Data from API:', {
          id: data._id,
          name: data.name,
          price: data.price,
          discountPercentage: data.discountPercentage,
          discountedPrice: data.discountedPrice
        });
        
        // Fetch similar medicines using backend API
        const similarMeds = await getSimilarMedicines(data._id, 8);
        setSimilar(similarMeds);
      } catch (e) {
        console.error('Error fetching medicine details:', e);
        setError('Failed to load medicine details');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  useEffect(() => {
    async function fetchOffers() {
      try {
        const data = await getAllOffers();
        setOffers(data);
      } catch (e) {
        setOffers([]);
      }
      setLoadingOffers(false);
    }
    fetchOffers();
  }, []);



  if (loading) {
    return (
      <>
        {!isMobile && <Header />}
        <div style={{ minHeight: '100vh', background: '#fff', padding: '40px 0 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, border: '4px solid #f3f3f3', borderTop: '4px solid #19b6c9', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
            <p style={{ color: '#666', fontSize: 16 }}>Loading medicine details...</p>
          </div>
        </div>
        {!isMobile && <Footer />}
      </>
    );
  }

  if (error) {
    return (
      <>
        {!isMobile && <Header />}
        <div style={{ minHeight: '100vh', background: '#fff', padding: '40px 0 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: '#e53935' }}>
            <h2>Error</h2>
            <p>{error}</p>
          </div>
        </div>
        {!isMobile && <Footer />}
      </>
    );
  }

  if (!medicine) {
    return (
      <>
        {!isMobile && <Header />}
        <div style={{ minHeight: '100vh', background: '#fff', padding: '40px 0 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: '#666' }}>
            <h2>Medicine Not Found</h2>
            <p>The medicine you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
        {!isMobile && <Footer />}
      </>
    );
  }

  // For now, only one image, but structure for multiple images
  const images = medicine.images && medicine.images.length > 0 ? medicine.images : [medicine.image];
  const highlights = medicine.highlights || [
    medicine.description || 'No description available.'
  ];

  // Mock medicine-specific data (in real app, this would come from API)
  const medicineInfo = {
    dosage: medicine.dosage || 'As prescribed by your doctor',
    sideEffects: medicine.sideEffects || ['Nausea', 'Dizziness', 'Headache'],
    usage: medicine.usage || 'Take with or without food as directed by your healthcare provider',
    storage: medicine.storage || 'Store in a cool, dry place away from direct sunlight',
    expiryDate: medicine.expiryDate || '2025-12-31',
    manufacturer: medicine.manufacturer || 'Generic Pharmaceutical Co.',
    prescriptionRequired: medicine.prescriptionRequired || false
  };

  return (
    <>
      {!isMobile && <Header />}
      <div style={{ minHeight: '100vh', background: '#fff', padding: isMobile ? '16px 0 0 0' : '40px 0 0 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '0 16px' : '0 20px' }}>
          {/* Main Product Section */}
          <div style={{ 
            display: isMobile ? 'block' : 'flex', 
            gap: isMobile ? 0 : 32, 
            alignItems: isMobile ? 'stretch' : 'flex-start', 
            marginBottom: isMobile ? 24 : 32 
          }}>
            {/* Left column: Thumbnails and main image */}
            <div style={{ 
              minWidth: isMobile ? 'auto' : 220, 
              maxWidth: isMobile ? '100%' : 260, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: isMobile ? 12 : 18,
              marginBottom: isMobile ? 20 : 0
            }}>
              {/* Thumbnails - Hide on mobile for space */}
              {!isMobile && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      style={{
                        border: selectedImage === idx ? '2px solid #19b6c9' : '2px solid #e3f0ff',
                        borderRadius: 8,
                        padding: 2,
                        cursor: 'pointer',
                        marginBottom: 2,
                        boxShadow: selectedImage === idx ? '0 2px 8px #19b6c933' : 'none',
                      }}
                    >
                      <img src={img} alt={medicine.name} style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 6 }} onError={(e) => { e.target.src = '/placeholder-medicine.jpg'; }} />
                    </div>
                  ))}
                </div>
              )}
              {/* Main image card */}
              <div style={{ 
                background: '#f8fbff', 
                borderRadius: isMobile ? 12 : 14, 
                boxShadow: '0 2px 8px rgba(25,118,210,0.07)', 
                padding: isMobile ? 12 : 18, 
                textAlign: 'center', 
                position: 'relative',
                width: isMobile ? '100%' : 'auto'
              }}>
                {medicine.discountPercentage && (
                  <div style={{ 
                    position: 'absolute', 
                    top: isMobile ? 8 : 12, 
                    left: isMobile ? 8 : 12, 
                    background: '#e53935', 
                    color: '#fff', 
                    fontWeight: 700, 
                    fontSize: isMobile ? 12 : 14, 
                    borderRadius: 6, 
                    padding: isMobile ? '1px 8px' : '2px 10px' 
                  }}>
                    Save {medicine.discountPercentage} %
                  </div>
                )}
                <img 
                  src={images[selectedImage]} 
                  alt={medicine.name} 
                  style={{ 
                    width: isMobile ? '100%' : 220, 
                    height: isMobile ? 200 : 160, 
                    objectFit: 'contain', 
                    margin: isMobile ? '12px 0 8px' : '18px 0 10px' 
                  }} 
                  onError={(e) => { e.target.src = '/placeholder-medicine.jpg'; }} 
                />
              </div>
            </div>
            {/* Right column: Details */}
            <div style={{ 
              flex: isMobile ? 'none' : 1, 
              minWidth: isMobile ? 'auto' : 320,
              padding: isMobile ? '0' : '0'
            }}>
              <div style={{ 
                display: 'flex', 
                flexWrap: isMobile ? 'wrap' : 'nowrap',
                alignItems: 'center', 
                gap: isMobile ? 8 : 12, 
                marginBottom: isMobile ? 12 : 8 
              }}>
                <div style={{ 
                  fontWeight: 700, 
                  fontSize: isMobile ? 18 : 28,
                  lineHeight: isMobile ? 1.3 : 1.2,
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  flex: isMobile ? '1 1 100%' : 'none'
                }}>
                  {medicine.name}
                </div>
                {/* Tags */}
                {medicine.category && (
                  <span style={{ 
                    background: '#e3f0ff', 
                    color: '#1976d2', 
                    borderRadius: 8, 
                    padding: isMobile ? '1px 8px' : '2px 10px', 
                    fontWeight: 600, 
                    fontSize: isMobile ? 11 : 13 
                  }}>
                    {medicine.category.name || medicine.category}
                  </span>
                )}
                {medicine.subcategory && (
                  <span style={{ 
                    background: '#e3f0ff', 
                    color: '#1976d2', 
                    borderRadius: 8, 
                    padding: isMobile ? '1px 8px' : '2px 10px', 
                    fontWeight: 600, 
                    fontSize: isMobile ? 11 : 13 
                  }}>
                    {medicine.subcategory}
                  </span>
                )}
                {/* Prescription Required Badge */}
                {medicineInfo.prescriptionRequired && (
                  <span style={{ 
                    background: '#fff3e0', 
                    color: '#f57c00', 
                    borderRadius: 8, 
                    padding: isMobile ? '1px 8px' : '2px 10px', 
                    fontWeight: 600, 
                    fontSize: isMobile ? 11 : 13, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 4 
                  }}>
                    <WarningIcon style={{ fontSize: isMobile ? 14 : 16 }} />
                    Prescription Required
                  </span>
                )}
                {/* Wishlist */}
                <span style={{ 
                  marginLeft: isMobile ? 0 : 8, 
                  cursor: 'pointer' 
                }} onClick={() => setWishlist(w => !w)}>
                  {wishlist ? <FavoriteIcon style={{ color: '#e53935' }} /> : <FavoriteBorderIcon style={{ color: '#888' }} />}
                </span>
              </div>
              
              {/* Trust Badges */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: isMobile ? 12 : 16, 
                marginBottom: isMobile ? 8 : 12,
                flexWrap: isMobile ? 'wrap' : 'nowrap'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 4, 
                  color: '#4caf50', 
                  fontSize: isMobile ? 12 : 14 
                }}>
                  <VerifiedIcon style={{ fontSize: isMobile ? 14 : 16 }} />
                  Genuine Product
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 4, 
                  color: '#2196f3', 
                  fontSize: isMobile ? 12 : 14 
                }}>
                  <LocalShippingIcon style={{ fontSize: isMobile ? 14 : 16 }} />
                  Fast Delivery
                </div>
              </div>

              <div style={{ 
                fontSize: isMobile ? 18 : 24, 
                color: '#19b6c9', 
                fontWeight: 700, 
                marginBottom: isMobile ? 12 : 6,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: isMobile ? 4 : 8
              }}>
                {medicine.discountedPrice && medicine.discountedPrice < medicine.price ? (
                  <>
                    {formatPriceForDisplay(medicine.discountedPrice)} 
                    <span style={{ 
                      color: '#888', 
                      textDecoration: 'line-through', 
                      fontSize: isMobile ? 14 : 16, 
                      marginLeft: isMobile ? 4 : 8 
                    }}>
                      {formatPriceForDisplay(medicine.price)}
                    </span>
                  </>
                ) : (
                  <>{formatPriceForDisplay(medicine.price)}</>
                )}
                {medicine.discountPercentage && (
                  <span style={{ 
                    color: '#e53935', 
                    fontWeight: 600, 
                    fontSize: isMobile ? 12 : 15, 
                    marginLeft: isMobile ? 4 : 8 
                  }}>
                    Save {medicine.discountPercentage}%
                  </span>
                )}
              </div>
              
              {/* Highlights */}
              <ul style={{ 
                color: '#222', 
                fontSize: isMobile ? 14 : 16, 
                margin: isMobile ? '12px 0 16px' : '18px 0 18px 0', 
                paddingLeft: isMobile ? 16 : 18,
                lineHeight: 1.5
              }}>
                {highlights.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
              
              <button style={{ 
                background: '#19b6c9', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 8, 
                padding: isMobile ? '14px 24px' : '12px 48px', 
                fontWeight: 700, 
                fontSize: isMobile ? 16 : 18, 
                marginBottom: isMobile ? 16 : 12, 
                cursor: 'pointer',
                width: isMobile ? '100%' : 'auto'
              }} 
              onClick={() => addToCart(medicine._id, 'medicine', 1)}
              >
                ADD TO CART
              </button>
              <div 
                style={{ 
                  color: '#2186eb', 
                  fontSize: isMobile ? 13 : 15, 
                  fontWeight: 600, 
                  marginBottom: isMobile ? 16 : 18,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
                onClick={() => {
                  // Trigger location dialog from Header component
                  const event = new CustomEvent('openLocationDialog');
                  window.dispatchEvent(event);
                }}
                title="Click to change delivery location"
              >
                Delivering to {pincodeLoading ? '...' : deliveryPincode}
              </div>
            </div>
          </div>

          {/* Medicine Information Tabs */}
          <div style={{ 
            maxWidth: 1200, 
            margin: isMobile ? '24px auto 0' : '32px auto 0', 
            background: '#f8f9fa', 
            borderRadius: isMobile ? 8 : 12, 
            padding: isMobile ? 16 : 24 
          }}>
            <div style={{ 
              display: 'flex', 
              gap: 0, 
              marginBottom: isMobile ? 16 : 24, 
              borderBottom: '1px solid #e0e0e0',
              overflowX: isMobile ? 'auto' : 'visible'
            }}>
              {[
                { id: 'description', label: 'Description' },
                { id: 'usage', label: 'Usage & Dosage' },
                { id: 'sideEffects', label: 'Side Effects' },
                { id: 'storage', label: 'Storage & Info' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: isMobile ? '8px 16px' : '12px 24px',
                    cursor: 'pointer',
                    borderBottom: activeTab === tab.id ? '3px solid #19b6c9' : '3px solid transparent',
                    color: activeTab === tab.id ? '#19b6c9' : '#666',
                    fontWeight: activeTab === tab.id ? 600 : 400,
                    fontSize: isMobile ? 14 : 16,
                    whiteSpace: 'nowrap',
                    minWidth: isMobile ? 'auto' : 'auto'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            <div style={{ minHeight: 200 }}>
              {activeTab === 'description' && (
                <div>
                  <h3 style={{ marginBottom: 16, color: '#333' }}>Product Description</h3>
                  <p style={{ lineHeight: 1.6, color: '#555' }}>{medicine.description || 'No description available.'}</p>
                </div>
              )}
              
              {activeTab === 'usage' && (
                <div>
                  <h3 style={{ marginBottom: 16, color: '#333' }}>Usage & Dosage</h3>
                  <div style={{ background: '#e3f2fd', padding: 16, borderRadius: 8, marginBottom: 16 }}>
                    <strong>Dosage:</strong> {medicineInfo.dosage}
                  </div>
                  <div style={{ background: '#f3e5f5', padding: 16, borderRadius: 8 }}>
                    <strong>Usage Instructions:</strong> {medicineInfo.usage}
                  </div>
                </div>
              )}
              
              {activeTab === 'sideEffects' && (
                <div>
                  <h3 style={{ marginBottom: 16, color: '#333' }}>Side Effects</h3>
                  <div style={{ background: '#fff3e0', padding: 16, borderRadius: 8 }}>
                    <strong>Common side effects may include:</strong>
                    <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                      {medicineInfo.sideEffects.map((effect, index) => (
                        <li key={index} style={{ marginBottom: 4 }}>{effect}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {activeTab === 'storage' && (
                <div>
                  <h3 style={{ marginBottom: 16, color: '#333' }}>Storage & Additional Information</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div style={{ background: '#e8f5e8', padding: 16, borderRadius: 8 }}>
                      <strong>Storage:</strong> {medicineInfo.storage}
                    </div>
                    <div style={{ background: '#e8f5e8', padding: 16, borderRadius: 8 }}>
                      <strong>Expiry Date:</strong> {new Date(medicineInfo.expiryDate).toLocaleDateString()}
                    </div>
                    <div style={{ background: '#e8f5e8', padding: 16, borderRadius: 8 }}>
                      <strong>Manufacturer:</strong> {medicineInfo.manufacturer}
                    </div>
                    <div style={{ background: '#e8f5e8', padding: 16, borderRadius: 8 }}>
                      <strong>Prescription Required:</strong> {medicineInfo.prescriptionRequired ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Offers */}
          {!loadingOffers && offers.length > 0 && (
            <div style={{ 
              maxWidth: 1200, 
              margin: isMobile ? '24px auto 0' : '32px auto 0', 
              background: '#fff3e0', 
              borderRadius: isMobile ? 8 : 12, 
              padding: isMobile ? 16 : 24 
            }}>
              <div style={{ 
                fontWeight: 700, 
                fontSize: isMobile ? 16 : 20, 
                marginBottom: isMobile ? 8 : 12, 
                color: '#f57c00' 
              }}>
                Special Offers
              </div>
              <div className="hide-horizontal-scrollbar" style={{ 
                display: 'flex', 
                gap: isMobile ? 12 : 18, 
                overflowX: 'auto', 
                paddingBottom: 8 
              }}>
                {offers.slice(0, isMobile ? 3 : 5).map((offer, idx) => (
                  <div key={idx} style={{ 
                    minWidth: isMobile ? 160 : 200, 
                    background: '#fff', 
                    borderRadius: 8, 
                    padding: isMobile ? 12 : 16, 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
                  }}>
                    <div style={{ 
                      fontWeight: 600, 
                      fontSize: isMobile ? 14 : 16, 
                      marginBottom: isMobile ? 6 : 8 
                    }}>
                      {offer.title}
                    </div>
                    <div style={{ 
                      color: '#666', 
                      fontSize: isMobile ? 12 : 14 
                    }}>
                      {offer.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Similar medicines */}
          <div style={{ 
            maxWidth: 1200, 
            margin: isMobile ? '24px auto 0' : '32px auto 0', 
            background: '#e0f7fa', 
            borderRadius: isMobile ? 8 : 12, 
            padding: isMobile ? 16 : 24 
          }}>
            <div style={{ 
              fontWeight: 700, 
              fontSize: isMobile ? 16 : 20, 
              marginBottom: isMobile ? 8 : 12, 
              color: '#0097a7' 
            }}>
              Related medicines you might need
            </div>
            {similar.length === 0 ? (
              <div style={{ color: '#888' }}>No similar medicines found.</div>
            ) : (
              <div className="hide-horizontal-scrollbar" style={{ 
                display: 'flex', 
                gap: isMobile ? 12 : 18, 
                overflowX: 'auto', 
                paddingBottom: 8 
              }}>
                {getShuffledItems(similar, isMobile ? 10 : 15).map((med, idx) => (
                  <div key={idx} style={{ 
                    minWidth: isMobile ? 200 : 260 
                  }}>
                    <ItemCard item={med} type="medicine" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {!isMobile && <Footer />}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default MedicineDetail; 