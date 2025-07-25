import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getMedicineById, getAllMedicines } from '../services/medicines';
import { getAllOffers } from '../services/offers';
import { useCart } from '../context/CartContext';
import ItemCard from '../components/ItemCard';
import RatingDisplay from '../components/RatingDisplay';
import RatingModal from '../components/RatingModal';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';

const MedicineDetail = () => {
  const { id } = useParams();
  const [medicine, setMedicine] = useState(null);
  const [offers, setOffers] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [frequentlyBought, setFrequentlyBought] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getMedicineById(id);
        setMedicine(data);
        // Fetch similar medicines (same category, exclude self)
        if (data.category) {
          const all = await getAllMedicines();
          setSimilar(all.filter(m => m.category === data.category && m._id !== data._id).slice(0, 8));
          setFrequentlyBought(all.filter(m => m._id !== data._id).slice(0, 8));
        }
      } catch (e) {
        setError('Failed to load medicine details');
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
  if (!medicine) return <div>Medicine not found.</div>;

  // For now, only one image, but structure for multiple images
  const images = medicine.images && medicine.images.length > 0 ? medicine.images : [medicine.image];
  const highlights = medicine.highlights || [
    medicine.description || 'No description available.'
  ];

  return (
    <>
      <Header />
      <div style={{ minHeight: '100vh', background: '#fff', padding: '40px 0 0 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', borderRadius: 0, background: '#fff', boxShadow: '0 2px 16px rgba(25,118,210,0.07)', padding: '32px 12px', display: 'flex', gap: 32, alignItems: 'flex-start' }}>
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
                  <img src={`${process.env.REACT_APP_API_URL || 'https://medicare-ydw4.onrender.com'}${img}`} alt={medicine.name} style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 6 }} />
                </div>
              ))}
            </div>
            {/* Main image card */}
            <div style={{ background: '#f8fbff', borderRadius: 14, boxShadow: '0 2px 8px rgba(25,118,210,0.07)', padding: 18, textAlign: 'center', minWidth: 180, minHeight: 220, position: 'relative' }}>
              {medicine.discountPercentage && <div style={{ position: 'absolute', top: 12, left: 12, background: '#e53935', color: '#fff', fontWeight: 700, fontSize: 14, borderRadius: 6, padding: '2px 10px' }}>Save {medicine.discountPercentage} %</div>}
              <img src={`${process.env.REACT_APP_API_URL || 'https://medicare-ydw4.onrender.com'}${images[selectedImage]}`} alt={medicine.name} style={{ width: 220, height: 160, objectFit: 'contain', margin: '18px 0 10px' }} />
            </div>
          </div>
          {/* Right column: Details */}
          <div style={{ flex: 1, minWidth: 320 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 28 }}>{medicine.name}</div>
              {/* Tags */}
              {medicine.category && <span style={{ background: '#e3f0ff', color: '#1976d2', borderRadius: 8, padding: '2px 10px', fontWeight: 600, fontSize: 13 }}>{medicine.category.name || medicine.category}</span>}
              {medicine.subcategory && <span style={{ background: '#e3f0ff', color: '#1976d2', borderRadius: 8, padding: '2px 10px', fontWeight: 600, fontSize: 13 }}>{medicine.subcategory}</span>}
              {/* Wishlist */}
              <span style={{ marginLeft: 8, cursor: 'pointer' }} onClick={() => setWishlist(w => !w)}>
                {wishlist ? <FavoriteIcon style={{ color: '#e53935' }} /> : <FavoriteBorderIcon style={{ color: '#888' }} />}
              </span>
            </div>
            <div style={{ fontSize: 22, color: '#19b6c9', fontWeight: 700, marginBottom: 6 }}>
              {medicine.discountedPrice && medicine.discountedPrice < medicine.price ? (
                <>
                  ₹{medicine.discountedPrice} <span style={{ color: '#888', textDecoration: 'line-through', fontSize: 16, marginLeft: 8 }}>₹{medicine.price}</span>
                </>
              ) : (
                <>₹{medicine.price}</>
              )}
              {medicine.discountPercentage && <span style={{ color: '#e53935', fontWeight: 600, fontSize: 15, marginLeft: 8 }}>Save {medicine.discountPercentage}%</span>}
            </div>
            {/* Highlights */}
            <ul style={{ color: '#222', fontSize: 16, margin: '18px 0 18px 0', paddingLeft: 18 }}>
              {highlights.map((h, i) => <li key={i}>{h}</li>)}
            </ul>
            <button style={{ background: '#19b6c9', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 48px', fontWeight: 700, fontSize: 18, marginBottom: 12, cursor: 'pointer' }} onClick={() => addToCart(medicine._id, 'medicine', 1)}>ADD TO CART</button>
            <div style={{ color: '#2186eb', fontSize: 15, fontWeight: 600, marginBottom: 18 }}>Delivering to 110002</div>
            {/* Info cards removed as per user request */}
          </div>
        </div>
        {/* Offers */}
        <div style={{ maxWidth: 1200, margin: '32px auto 0', background: '#fff', borderRadius: 12, padding: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 24, margin: '32px 0 18px 0', paddingLeft: 16 }}>Available Offers</div>
          {loadingOffers ? (
            <div style={{ paddingLeft: 16 }}>Loading offers...</div>
          ) : offers.length === 0 ? (
            <div style={{ paddingLeft: 16 }}>No offers available at the moment.</div>
          ) : (
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', overflowX: 'auto', padding: '0 16px 24px 16px' }}>
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
        <div style={{ maxWidth: 1200, margin: '32px auto 0', background: '#e0f7fa', borderRadius: 12, padding: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 12, color: '#0097a7' }}>Similar products</div>
          {similar.length === 0 ? (
            <div style={{ color: '#888' }}>No similar products found.</div>
          ) : (
            <div style={{ display: 'flex', gap: 18, overflowX: 'auto', paddingBottom: 8 }}>
              {similar.map((med, idx) => (
                <div key={idx} style={{ minWidth: 260 }}>
                  <ItemCard item={med} type="medicine" />
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Frequently Bought Together */}
        <div style={{ maxWidth: 1200, margin: '32px auto 0', background: '#fce4ec', borderRadius: 12, padding: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 12, color: '#c2185b' }}>Frequently Bought Together</div>
          {frequentlyBought.length === 0 ? (
            <div style={{ color: '#888' }}>No recommendations available.</div>
          ) : (
            <div style={{ display: 'flex', gap: 18, overflowX: 'auto', paddingBottom: 8 }}>
              {frequentlyBought.map((med, idx) => (
                <div key={idx} style={{ minWidth: 260 }}>
                  <ItemCard item={med} type="medicine" />
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Rating & Reviews */}
        <div style={{ maxWidth: 1200, margin: '32px auto 0', background: '#fff', borderRadius: 12, padding: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 12 }}>Rating & Reviews</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <RatingDisplay itemId={medicine._id} type="medicine" averageRating={medicine.averageRating || 0} totalRatings={medicine.totalRatings || 0} />
            </div>
            <button style={{ background: '#19b6c9', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 32px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }} onClick={() => setShowRatingModal(true)}>WRITE REVIEW</button>
          </div>
          <RatingModal open={showRatingModal} onClose={() => setShowRatingModal(false)} type="medicine" itemId={medicine._id} itemName={medicine.name} />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MedicineDetail; 