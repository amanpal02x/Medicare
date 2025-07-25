import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getProductById, getAllProducts } from '../services/products';
import { getAllOffers } from '../services/offers';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [offers, setOffers] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getProductById(id);
        setProduct(data);
        // Fetch similar products (same category, exclude self)
        if (data.category) {
          const all = await getAllProducts();
          setSimilar(all.filter(p => p.category === data.category && p._id !== data._id).slice(0, 4));
        }
      } catch (e) {
        setError('Failed to load product details');
      }
      setLoading(false);
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!product) return <div>Product not found.</div>;

  // For now, only one image, but structure for multiple images
  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  return (
    <>
      <Header />
      <div style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #e3e0ff 0%, #b8d0f6 100%)', padding: '40px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', borderRadius: 18, background: '#fff', boxShadow: '0 2px 16px rgba(25,118,210,0.07)', padding: 32, display: 'flex', gap: 32, alignItems: 'flex-start' }}>
          {/* Left column: Thumbnails and main image */}
          <div style={{ minWidth: 220, maxWidth: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
            {/* Thumbnails */}
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
                  <img src={`${process.env.REACT_APP_API_URL || 'https://medicare-ydw4.onrender.com'}${img}`} alt={product.name} style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 6 }} />
                </div>
              ))}
            </div>
            {/* Main image card */}
            <div style={{ background: '#f8fbff', borderRadius: 14, boxShadow: '0 2px 8px rgba(25,118,210,0.07)', padding: 18, textAlign: 'center', minWidth: 180, minHeight: 220, position: 'relative' }}>
              {product.discountPercentage && <div style={{ position: 'absolute', top: 12, left: 12, background: '#2ecc71', color: '#fff', fontWeight: 700, fontSize: 14, borderRadius: 6, padding: '2px 10px' }}>{product.discountPercentage}% OFF</div>}
              <img src={`${process.env.REACT_APP_API_URL || 'https://medicare-ydw4.onrender.com'}${images[selectedImage]}`} alt={product.name} style={{ width: 120, height: 90, objectFit: 'contain', margin: '18px 0 10px' }} />
              <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 6 }}>{product.name}</div>
              {product.mrp && <div style={{ color: '#888', fontSize: 14, textDecoration: 'line-through', marginBottom: 2 }}>MRP ₹{product.mrp}</div>}
              <div style={{ fontWeight: 700, fontSize: 18, color: '#222', marginBottom: 10 }}>
                {product.discountedPrice && product.discountedPrice < product.price ? (
                  <>
                    ₹{product.discountedPrice} <span style={{ color: '#888', textDecoration: 'line-through', fontSize: 15, marginLeft: 8 }}>₹{product.price}</span>
                  </>
                ) : (
                  <>₹{product.price}</>
                )}
              </div>
              <button style={{ background: '#fff', color: '#19b6c9', border: '1.5px solid #19b6c9', borderRadius: 6, padding: '7px 32px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }} onClick={() => addToCart(product._id, 'product', 1)}>Add</button>
            </div>
          </div>
          {/* Right column: Details */}
          <div style={{ flex: 1, minWidth: 320 }}>
            <div style={{ fontWeight: 700, fontSize: 32, marginBottom: 8 }}>{product.name}</div>
            <div style={{ fontSize: 24, color: '#19b6c9', fontWeight: 700, marginBottom: 6 }}>
              {product.discountedPrice && product.discountedPrice < product.price ? (
                <>
                  ₹{product.discountedPrice} <span style={{ color: '#888', textDecoration: 'line-through', fontSize: 18, marginLeft: 8 }}>₹{product.price}</span>
                </>
              ) : (
                <>₹{product.price}</>
              )}
              {product.discountPercentage && <span style={{ color: '#e53935', fontWeight: 600, fontSize: 16, marginLeft: 8 }}>Save {product.discountPercentage}%</span>}
            </div>
            <ul style={{ color: '#222', fontSize: 17, margin: '18px 0 24px 0', paddingLeft: 18 }}>
              <li>{product.description || 'No description available.'}</li>
            </ul>
            <button style={{ background: '#19b6c9', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 48px', fontWeight: 700, fontSize: 18, marginBottom: 18, cursor: 'pointer' }} onClick={() => addToCart(product._id, 'product', 1)}>ADD TO CART</button>
            <div style={{ color: '#888', fontSize: 15, marginBottom: 8 }}>Delivering to 110002</div>
            {/* Offers */}
            <div style={{ marginTop: 32 }}>
              <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 12 }}>Available Offers</div>
              {loadingOffers ? (
                <div>Loading offers...</div>
              ) : offers.length === 0 ? (
                <div>No offers available at the moment.</div>
              ) : (
                <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
                  {offers.map((offer, idx) => (
                    <div key={idx} style={{
                      background: '#fff',
                      borderRadius: 12,
                      boxShadow: '0 2px 8px rgba(25,118,210,0.07)',
                      padding: '18px 24px',
                      minWidth: 260,
                      maxWidth: 320,
                      flex: '1 1 260px',
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      position: 'relative',
                      marginBottom: 8
                    }}>
                      <div style={{ flex: 1 }}>
                        <b style={{ fontSize: 16, color: '#1976d2', marginBottom: 6 }}>{offer.code}</b>
                        <div style={{ fontSize: 15, color: '#333', marginBottom: 2 }}>{offer.desc || offer.description}</div>
                      </div>
                      <button style={{
                        background: '#00cfff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '4px 16px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: 13
                      }} onClick={() => navigator.clipboard.writeText(offer.code)}>Copy</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Similar products */}
            <div style={{ marginTop: 32 }}>
              <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 12 }}>Similar products</div>
              {similar.length === 0 ? (
                <div style={{ color: '#888' }}>No similar products found.</div>
              ) : (
                <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
                  {similar.map((prod, idx) => (
                    <div key={idx} style={{
                      background: '#fff',
                      borderRadius: 10,
                      padding: 18,
                      minWidth: 220,
                      textAlign: 'center',
                      border: '1px solid #e3f2fd',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(25,118,210,0.07)'
                    }} onClick={() => window.location.href = `/products/${prod._id}`}>
                      {prod.image && <img src={`${process.env.REACT_APP_API_URL || 'https://medicare-ydw4.onrender.com'}${prod.image}`} alt={prod.name} style={{ width: 80, height: 60, objectFit: 'contain', marginBottom: 8 }} />}
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{prod.name}</div>
                      <div style={{ color: '#1976d2', fontWeight: 600, fontSize: 16 }}>₹{prod.price}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductDetail; 