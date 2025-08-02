import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import useDeviceDetection from '../hooks/useDeviceDetection';
import { 
  LocationOn, 
  Phone, 
  AccessTime, 
  Star, 
  Search,
  FilterList,
  Directions,
  LocalPharmacy
} from '@mui/icons-material';

const Stores = () => {
  const { isMobile } = useDeviceDetection();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [userLocation, setUserLocation] = useState(null);
  const [stores, setStores] = useState([
    {
      id: 1,
      name: 'MedPlus Pharmacy',
      address: '123 Main Street, Andheri West, Mumbai',
      phone: '+91 98765 43210',
      rating: 4.5,
      distance: '0.8 km',
      open: true,
      hours: 'Open 24/7',
      services: ['Prescription', 'OTC', 'Delivery'],
      coordinates: { lat: 19.1197, lng: 72.8464 }
    },
    {
      id: 2,
      name: 'HealthFirst Medical Store',
      address: '456 Park Avenue, Bandra East, Mumbai',
      phone: '+91 98765 43211',
      rating: 4.3,
      distance: '1.2 km',
      open: true,
      hours: '8:00 AM - 10:00 PM',
      services: ['Prescription', 'OTC', 'Lab Tests'],
      coordinates: { lat: 19.0596, lng: 72.8295 }
    },
    {
      id: 3,
      name: 'Care Pharmacy',
      address: '789 Lake Road, Powai, Mumbai',
      phone: '+91 98765 43212',
      rating: 4.7,
      distance: '2.1 km',
      open: false,
      hours: '9:00 AM - 9:00 PM',
      services: ['Prescription', 'OTC', 'Home Delivery'],
      coordinates: { lat: 19.1197, lng: 72.9069 }
    },
    {
      id: 4,
      name: 'Wellness Corner',
      address: '321 Garden Street, Vashi, Navi Mumbai',
      phone: '+91 98765 43213',
      rating: 4.1,
      distance: '3.5 km',
      open: true,
      hours: '7:00 AM - 11:00 PM',
      services: ['Prescription', 'OTC', 'Health Products'],
      coordinates: { lat: 19.0760, lng: 72.8777 }
    },
    {
      id: 5,
      name: 'MediCare Express',
      address: '654 Business Park, Thane West',
      phone: '+91 98765 43214',
      rating: 4.6,
      distance: '4.2 km',
      open: true,
      hours: 'Open 24/7',
      services: ['Prescription', 'OTC', 'Emergency'],
      coordinates: { lat: 19.2183, lng: 72.9781 }
    }
  ]);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Error getting location:', error);
          // Default to Mumbai coordinates
          setUserLocation({ lat: 19.0760, lng: 72.8777 });
        }
      );
    }
  }, []);

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'open' && store.open) ||
                         (selectedFilter === '24h' && store.hours.includes('24/7'));
    return matchesSearch && matchesFilter;
  });

  const getDistanceColor = (distance) => {
    const km = parseFloat(distance);
    if (km <= 1) return '#4caf50';
    if (km <= 3) return '#ff9800';
    return '#f44336';
  };

  return (
    <>
      {!isMobile && <Header />}
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f6fdff 0%, #e3f0ff 100%)',
        paddingTop: !isMobile ? '128px' : '0'
      }}>
        
        {/* Hero Section */}
        <div style={{
          padding: isMobile ? '40px 20px' : '60px 40px',
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: isMobile ? '2.5rem' : '3rem',
            fontWeight: 700,
            marginBottom: '20px'
          }}>
            Find Nearby Pharmacies
          </h1>
          <p style={{
            fontSize: isMobile ? '1.1rem' : '1.2rem',
            opacity: 0.9,
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Locate verified pharmacies near you for quick and reliable medicine delivery
          </p>
        </div>

        {/* Search and Filter Section */}
        <div style={{
          padding: isMobile ? '20px' : '40px',
          background: 'white',
          borderBottom: '1px solid rgba(25,118,210,0.1)'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '20px',
              alignItems: 'center'
            }}>
              {/* Search Bar */}
              <div style={{
                flex: 1,
                position: 'relative'
              }}>
                <Search style={{
                  position: 'absolute',
                  left: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#666'
                }} />
                <input
                  type="text"
                  placeholder="Search by pharmacy name or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '15px 15px 15px 50px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1976d2'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>

              {/* Filter Buttons */}
              <div style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => setSelectedFilter('all')}
                  style={{
                    padding: '12px 20px',
                    border: selectedFilter === 'all' ? '2px solid #1976d2' : '2px solid #e0e0e0',
                    background: selectedFilter === 'all' ? '#1976d2' : 'white',
                    color: selectedFilter === 'all' ? 'white' : '#666',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.3s ease'
                  }}
                >
                  All Stores
                </button>
                <button
                  onClick={() => setSelectedFilter('open')}
                  style={{
                    padding: '12px 20px',
                    border: selectedFilter === 'open' ? '2px solid #1976d2' : '2px solid #e0e0e0',
                    background: selectedFilter === 'open' ? '#1976d2' : 'white',
                    color: selectedFilter === 'open' ? 'white' : '#666',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.3s ease'
                  }}
                >
                  Open Now
                </button>
                <button
                  onClick={() => setSelectedFilter('24h')}
                  style={{
                    padding: '12px 20px',
                    border: selectedFilter === '24h' ? '2px solid #1976d2' : '2px solid #e0e0e0',
                    background: selectedFilter === '24h' ? '#1976d2' : 'white',
                    color: selectedFilter === '24h' ? 'white' : '#666',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.3s ease'
                  }}
                >
                  24/7 Stores
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Map and Store List Section */}
        <div style={{
          padding: isMobile ? '20px' : '40px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 400px',
            gap: '30px',
            alignItems: 'start'
          }}>
            
            {/* Map Section */}
            <div style={{
              background: 'white',
              borderRadius: '15px',
              padding: '20px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              minHeight: '500px'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                color: '#1976d2',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <LocationOn />
                Interactive Map
              </h3>
              
              {/* Placeholder for Map */}
              <div style={{
                width: '100%',
                height: '400px',
                background: 'linear-gradient(135deg, #e3f0ff 0%, #f6fdff 100%)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed #1976d2',
                color: '#1976d2',
                fontSize: '1.1rem',
                fontWeight: 600
              }}>
                <div style={{ textAlign: 'center' }}>
                  <LocationOn style={{ fontSize: 48, marginBottom: '10px' }} />
                  <div>Interactive Map Coming Soon</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '5px' }}>
                    Real-time pharmacy locations
                  </div>
                </div>
              </div>
              
              <div style={{
                marginTop: '20px',
                padding: '15px',
                background: '#f8f9fa',
                borderRadius: '10px',
                fontSize: '0.9rem',
                color: '#666'
              }}>
                <strong>Map Features:</strong> Real-time location tracking, route planning, 
                store details, and distance calculation.
              </div>
            </div>

            {/* Store List Section */}
            <div style={{
              background: 'white',
              borderRadius: '15px',
              padding: '20px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              maxHeight: '600px',
              overflowY: 'auto'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                color: '#1976d2',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <LocalPharmacy />
                Nearby Pharmacies ({filteredStores.length})
              </h3>
              
              {filteredStores.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: '#666'
                }}>
                  <Search style={{ fontSize: 48, marginBottom: '10px', opacity: 0.5 }} />
                  <div>No pharmacies found</div>
                  <div style={{ fontSize: '0.9rem', marginTop: '5px' }}>
                    Try adjusting your search or filters
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {filteredStores.map((store) => (
                    <div key={store.id} style={{
                      border: '1px solid #e0e0e0',
                      borderRadius: '12px',
                      padding: '20px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}>
                      
                      {/* Store Header */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '10px'
                      }}>
                        <h4 style={{
                          fontSize: '1.2rem',
                          fontWeight: 600,
                          color: '#1976d2',
                          margin: 0
                        }}>
                          {store.name}
                        </h4>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          color: store.open ? '#4caf50' : '#f44336',
                          fontSize: '0.9rem',
                          fontWeight: 600
                        }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: store.open ? '#4caf50' : '#f44336'
                          }} />
                          {store.open ? 'Open' : 'Closed'}
                        </div>
                      </div>

                      {/* Store Details */}
                      <div style={{ marginBottom: '15px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '8px',
                          color: '#666',
                          fontSize: '0.9rem'
                        }}>
                          <LocationOn style={{ fontSize: 16 }} />
                          {store.address}
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '8px',
                          color: '#666',
                          fontSize: '0.9rem'
                        }}>
                          <Phone style={{ fontSize: 16 }} />
                          {store.phone}
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '8px',
                          color: '#666',
                          fontSize: '0.9rem'
                        }}>
                          <AccessTime style={{ fontSize: 16 }} />
                          {store.hours}
                        </div>
                      </div>

                      {/* Rating and Distance */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '15px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          <Star style={{ fontSize: 16, color: '#ffc107' }} />
                          <span style={{ fontWeight: 600 }}>{store.rating}</span>
                          <span style={{ color: '#666', fontSize: '0.9rem' }}>({Math.floor(Math.random() * 100) + 50} reviews)</span>
                        </div>
                        
                        <div style={{
                          color: getDistanceColor(store.distance),
                          fontWeight: 600,
                          fontSize: '0.9rem'
                        }}>
                          {store.distance}
                        </div>
                      </div>

                      {/* Services */}
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                        marginBottom: '15px'
                      }}>
                        {store.services.map((service, index) => (
                          <span key={index} style={{
                            background: '#e3f0ff',
                            color: '#1976d2',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: 500
                          }}>
                            {service}
                          </span>
                        ))}
                      </div>

                      {/* Action Buttons */}
                      <div style={{
                        display: 'flex',
                        gap: '10px'
                      }}>
                        <button style={{
                          flex: 1,
                          background: '#1976d2',
                          color: 'white',
                          border: 'none',
                          padding: '10px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          transition: 'background 0.3s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#1565c0'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#1976d2'}>
                          Order Now
                        </button>
                        
                        <button style={{
                          background: 'white',
                          color: '#1976d2',
                          border: '2px solid #1976d2',
                          padding: '10px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = '#1976d2';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'white';
                          e.currentTarget.style.color = '#1976d2';
                        }}>
                          <Directions style={{ fontSize: 16 }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div style={{
          padding: isMobile ? '40px 20px' : '60px 40px',
          background: 'white',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <h2 style={{
              fontSize: isMobile ? '2rem' : '2.5rem',
              fontWeight: 700,
              color: '#1976d2',
              marginBottom: '20px'
            }}>
              Why Choose Our Partner Pharmacies?
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '30px',
              marginTop: '40px'
            }}>
              <div>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: '#e3f0ff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px auto'
                }}>
                  <LocalPharmacy style={{ fontSize: 30, color: '#1976d2' }} />
                </div>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  color: '#1976d2',
                  marginBottom: '10px'
                }}>
                  Licensed & Verified
                </h3>
                <p style={{ color: '#666', lineHeight: 1.6 }}>
                  All partner pharmacies are licensed and regularly verified for quality standards.
                </p>
              </div>
              
              <div>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: '#e3f0ff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px auto'
                }}>
                  <AccessTime style={{ fontSize: 30, color: '#1976d2' }} />
                </div>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  color: '#1976d2',
                  marginBottom: '10px'
                }}>
                  Extended Hours
                </h3>
                <p style={{ color: '#666', lineHeight: 1.6 }}>
                  Many pharmacies operate 24/7 to ensure you get medicines when you need them.
                </p>
              </div>
              
              <div>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: '#e3f0ff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px auto'
                }}>
                  <Star style={{ fontSize: 30, color: '#1976d2' }} />
                </div>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  color: '#1976d2',
                  marginBottom: '10px'
                }}>
                  Customer Rated
                </h3>
                <p style={{ color: '#666', lineHeight: 1.6 }}>
                  All pharmacies are rated and reviewed by our customers for transparency.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Stores;
