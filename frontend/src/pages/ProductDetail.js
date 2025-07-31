import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getProductById, getSimilarProducts } from '../services/products';
import { getAllOffers } from '../services/offers';
import { useCart } from '../context/CartContext';
import ItemCard from '../components/ItemCard';
import { formatItemPriceData, formatPriceForDisplay } from '../utils/priceUtils';
import { useLocationPincode } from '../hooks/useLocationPincode';
import { getShuffledItems } from '../utils/shuffleUtils';
import useDeviceDetection from '../hooks/useDeviceDetection';


const ProductDetail = () => {
  const { id } = useParams();
  const { isMobile } = useDeviceDetection();
  const [product, setProduct] = useState(null);
  const [offers, setOffers] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [error, setError] = useState(null);
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
        const data = await getProductById(id);
        
        // Use the data directly from API without additional processing
        setProduct(data);
        
        // Debug logging
        console.log('ProductDetail - Data from API:', {
          id: data._id,
          name: data.name,
          price: data.price,
          discountPercentage: data.discountPercentage,
          discountedPrice: data.discountedPrice
        });
        
        // Fetch similar products using backend API
        const similarProds = await getSimilarProducts(data._id, 8);
        setSimilar(similarProds);
      } catch (e) {
        console.error('Error fetching product details:', e);
        setError('Failed to load product details');
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
            <p style={{ color: '#666', fontSize: 16 }}>Loading product details...</p>
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

  if (!product) {
    return (
      <>
        {!isMobile && <Header />}
        <div style={{ minHeight: '100vh', background: '#fff', padding: '40px 0 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: '#666' }}>
            <h2>Product Not Found</h2>
            <p>The product you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
        {!isMobile && <Footer />}
      </>
    );
  }

  // For now, only one image, but structure for multiple images
  const images = product.images && product.images.length > 0 ? product.images : [product.image];

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
                      <img src={img} alt={product.name} style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 6 }} onError={(e) => { e.target.src = '/placeholder-medicine.jpg'; }} />
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
                {product.discountPercentage && (
                  <div style={{ 
                    position: 'absolute', 
                    top: isMobile ? 8 : 12, 
                    left: isMobile ? 8 : 12, 
                    background: '#2ecc71', 
                    color: '#fff', 
                    fontWeight: 700, 
                    fontSize: isMobile ? 12 : 14, 
                    borderRadius: 6, 
                    padding: isMobile ? '1px 8px' : '2px 10px' 
                  }}>
                    {product.discountPercentage}% OFF
                  </div>
                )}
                <img 
                  src={images[selectedImage]} 
                  alt={product.name} 
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
                fontWeight: 700, 
                fontSize: isMobile ? 20 : 32, 
                marginBottom: isMobile ? 12 : 8,
                lineHeight: isMobile ? 1.3 : 1.2,
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
              }}>
                {product.name}
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
                {product.discountedPrice && product.discountedPrice < product.price ? (
                  <>
                    {formatPriceForDisplay(product.discountedPrice)} 
                    <span style={{ 
                      color: '#888', 
                      textDecoration: 'line-through', 
                      fontSize: isMobile ? 14 : 18, 
                      marginLeft: isMobile ? 4 : 8 
                    }}>
                      {formatPriceForDisplay(product.price)}
                    </span>
                  </>
                ) : (
                  <>{formatPriceForDisplay(product.price)}</>
                )}
                {product.discountPercentage && (
                  <span style={{ 
                    color: '#e53935', 
                    fontWeight: 600, 
                    fontSize: isMobile ? 12 : 16, 
                    marginLeft: isMobile ? 4 : 8 
                  }}>
                    Save {product.discountPercentage}%
                  </span>
                )}
              </div>
              <ul style={{ 
                color: '#222', 
                fontSize: isMobile ? 14 : 17, 
                margin: isMobile ? '12px 0 16px' : '18px 0 24px 0', 
                paddingLeft: isMobile ? 16 : 18,
                lineHeight: 1.5
              }}>
                <li>{product.description || 'No description available.'}</li>
              </ul>
              <button style={{ 
                background: '#19b6c9', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 8, 
                padding: isMobile ? '14px 24px' : '12px 48px', 
                fontWeight: 700, 
                fontSize: isMobile ? 16 : 18, 
                marginBottom: isMobile ? 16 : 18, 
                cursor: 'pointer',
                width: isMobile ? '100%' : 'auto'
              }} 
              onClick={() => addToCart(product._id, 'product', 1)}
              >
                ADD TO CART
              </button>
              <div 
                style={{ 
                  color: '#888', 
                  fontSize: isMobile ? 13 : 15, 
                  marginBottom: 8,
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

          {/* Similar products */}
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
              You might also like
            </div>
            {similar.length === 0 ? (
              <div style={{ color: '#888' }}>No similar products found.</div>
            ) : (
              <div className="hide-horizontal-scrollbar" style={{ 
                display: isMobile ? 'grid' : 'flex', 
                gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(140px, 1fr))' : 'auto',
                gap: isMobile ? 12 : 18, 
                overflowX: isMobile ? 'visible' : 'auto', 
                paddingBottom: 8 
              }}>
                {getShuffledItems(similar, isMobile ? 10 : 15).map((prod, idx) => (
                  <div key={idx} style={{ 
                    minWidth: isMobile ? 'auto' : 260 
                  }}>
                    <ItemCard item={prod} type="product" />
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

export default ProductDetail; 