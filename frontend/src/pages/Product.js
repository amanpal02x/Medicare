import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getProductById } from '../services/products';
import { getAllOffers } from '../services/offers';
import { getAllProducts } from '../services/products';
import { useCart } from '../context/CartContext';

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [offers, setOffers] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        const data = await getProductById(id);
        setProduct(data);
        
        // Fetch similar products (same category, exclude self)
        if (data.category) {
          const all = await getAllProducts();
          setSimilar(all.filter(p => p.category === data.category && p._id !== data._id).slice(0, 4));
        }
        
        // Fetch offers
        const offersData = await getAllOffers();
        setOffers(offersData);
      } catch (e) {
        setError('Failed to load product details');
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading) return <div style={{ padding: 80, textAlign: 'center' }}>Loading...</div>;
  if (error || !product) return <div style={{ padding: 80, textAlign: 'center', color: 'red' }}>{error || 'Product not found'}</div>;

  return (
    <>
      <Header />
      <div style={{ background: 'linear-gradient(120deg, #e3e0ff 0%, #b8d0f6 100%)', minHeight: '100vh', padding: '40px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', background: '#fff', borderRadius: 18, boxShadow: '0 2px 16px rgba(25,118,210,0.07)', padding: 32, display: 'flex', gap: 32 }}>
          {/* Left: Image and Card */}
          <div style={{ minWidth: 320, maxWidth: 340 }}>
            <div style={{ marginBottom: 18 }}>
              <img src={product.image} alt={product.name} style={{ width: 60, height: 60, borderRadius: 8, border: '2px solid #b8d0f6', marginBottom: 8 }} />
            </div>
            <div style={{ background: '#f8fbff', borderRadius: 14, boxShadow: '0 2px 8px rgba(25,118,210,0.07)', padding: 18, textAlign: 'center', position: 'relative' }}>
              {product.discountPercentage && <div style={{ position: 'absolute', top: 12, left: 12, background: '#2ecc71', color: '#fff', fontWeight: 700, fontSize: 14, borderRadius: 6, padding: '2px 10px' }}>{product.discountPercentage}% OFF</div>}
              <img src={product.image} alt={product.name} style={{ width: 120, height: 90, objectFit: 'contain', margin: '18px 0 10px' }} />
              <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 6 }}>{product.name}</div>
              {product.mrp && <div style={{ color: '#888', fontSize: 14, textDecoration: 'line-through', marginBottom: 2 }}>MRP ₹{product.mrp}</div>}
              <div style={{ fontWeight: 700, fontSize: 18, color: '#222', marginBottom: 10 }}>₹{product.price}</div>
              <button style={{ background: '#fff', color: '#19b6c9', border: '1.5px solid #19b6c9', borderRadius: 6, padding: '7px 32px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }} onClick={() => addToCart(product._id, 'product', 1)}>Add</button>
            </div>
          </div>
          {/* Right: Details */}
          <div style={{ flex: 1, minWidth: 320 }}>
            <div style={{ fontWeight: 700, fontSize: 32, marginBottom: 8 }}>{product.name}</div>
            <div style={{ fontSize: 24, color: '#19b6c9', fontWeight: 700, marginBottom: 6 }}>₹{product.price} {product.mrp && <span style={{ color: '#888', textDecoration: 'line-through', fontSize: 18, marginLeft: 8 }}>MRP ₹{product.mrp}</span>} {product.discountPercentage && <span style={{ color: '#e53935', fontWeight: 600, fontSize: 16, marginLeft: 8 }}>Save {product.discountPercentage}%</span>}</div>
            <ul style={{ color: '#222', fontSize: 17, margin: '18px 0 24px 0', paddingLeft: 18 }}>
              <li>{product.description || 'No description available.'}</li>
              {product.brand && <li>Brand: {product.brand}</li>}
              {product.category && <li>Category: {product.category}</li>}
            </ul>
            <button style={{ background: '#19b6c9', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 48px', fontWeight: 700, fontSize: 18, marginBottom: 18, cursor: 'pointer' }} onClick={() => addToCart(product._id, 'product', 1)}>ADD TO CART</button>
            <div style={{ color: '#888', fontSize: 15, marginBottom: 8 }}>Delivering to 110002</div>
          </div>
        </div>
        
        {/* Offers */}
        <div style={{ maxWidth: 1200, margin: '32px auto 0', padding: '0 16px' }}>
          <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 16 }}>Available Offers</div>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
            {offers.map((offer, idx) => (
              <div key={idx} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(25,118,210,0.07)', padding: '18px 24px', minWidth: 260, maxWidth: 320, flex: '1 1 260px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', position: 'relative' }}>
                <b style={{ fontSize: 18, color: '#1976d2', marginBottom: 6 }}>{offer.code}</b>
                <span style={{ fontSize: 15, color: '#333', marginBottom: 8 }}>{offer.desc || offer.description}</span>
                <button style={{ position: 'absolute', top: 16, right: 16, background: '#00cfff', color: '#fff', border: 'none', borderRadius: 6, padding: '2px 12px', fontWeight: 600, cursor: 'pointer', fontSize: 13 }} onClick={() => navigator.clipboard.writeText(offer.code)}>Copy</button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Similar Products */}
        <div style={{ maxWidth: 1200, margin: '32px auto 0', padding: '0 16px' }}>
          <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 16 }}>Similar Products</div>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
            {similar.map((sp, idx) => (
              <div key={idx} style={{ background: '#f8fbff', borderRadius: 14, boxShadow: '0 2px 8px rgba(25,118,210,0.07)', padding: 18, textAlign: 'center', minWidth: 220, maxWidth: 240, position: 'relative' }}>
                {sp.discountPercentage && <div style={{ position: 'absolute', top: 12, left: 12, background: '#2ecc71', color: '#fff', fontWeight: 700, fontSize: 14, borderRadius: 6, padding: '2px 10px' }}>{sp.discountPercentage}% OFF</div>}
                <img src={sp.image} alt={sp.name} style={{ width: 100, height: 80, objectFit: 'contain', margin: '18px 0 10px' }} />
                <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 6 }}>{sp.name}</div>
                {sp.mrp && <div style={{ color: '#888', fontSize: 14, textDecoration: 'line-through', marginBottom: 2 }}>MRP ₹{sp.mrp}</div>}
                <div style={{ fontWeight: 700, fontSize: 18, color: '#222', marginBottom: 10 }}>₹{sp.price}</div>
                <button style={{ background: '#fff', color: '#19b6c9', border: '1.5px solid #19b6c9', borderRadius: 6, padding: '7px 32px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }} onClick={() => addToCart(sp._id, 'product', 1)}>Add</button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Product;
