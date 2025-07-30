import React, { useEffect, useState, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ShopByCategories from '../components/ShopByCategories';
import ItemCard from '../components/ItemCard';
import { useNavigate } from 'react-router-dom';
import { getActiveDeals } from '../services/deals';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton, Divider } from '@mui/material';
import useNearbyProductsAndMedicines from '../hooks/useNearbyProductsAndMedicines';
import SearchBar from '../components/SearchBar';
import { getShuffledItems, shuffleWithDiscountPriority } from '../utils/shuffleUtils';
import useDeviceDetection from '../hooks/useDeviceDetection';

const LandingPage = () => {
  const [deals, setDeals] = useState([]);
  const [loadingDeals, setLoadingDeals] = useState(true);
  const navigate = useNavigate();
  const { isMobile } = useDeviceDetection();
  const {
    products,
    medicines,
    loading: loadingNearby,
    error: errorNearby,
    locationError,
    refresh,
  } = useNearbyProductsAndMedicines();

  useEffect(() => {
    async function fetchDeals() {
      setLoadingDeals(true);
      try {
        const dealsData = await getActiveDeals();
        setDeals(dealsData);
      } catch {
        setDeals([]);
      } finally {
        setLoadingDeals(false);
      }
    }
    fetchDeals();
  }, []);

  // Filter deals to only those whose item is in nearby products/medicines
  const productIds = new Set(products.map(p => p._id));
  const medicineIds = new Set(medicines.map(m => m._id));
  const filteredDeals = deals.filter(deal => {
    if (deal.itemType?.toLowerCase() === 'medicine') {
      return medicineIds.has(deal.item?._id);
    } else {
      return productIds.has(deal.item?._id);
    }
  });

  // For Deal You Love, combine and filter items with discount above 50%
  const dealYouLove = React.useMemo(() => {
    const combined = [...products, ...medicines];
    // Use shuffle utility to get random sequence with discount priority
    return shuffleWithDiscountPriority(combined, 15, 50);
  }, [products, medicines]);

  const sectionStyle = {
    maxWidth: 1300,
    margin: '40px auto',
    padding: '0 16px',
  };
  const cardsRowStyle = {
    display: 'flex',
    gap: 24,
    overflowX: 'auto',
    paddingBottom: 8,
  };

  const isLoading = loadingNearby || loadingDeals;

  return (
    <>
      {!isMobile && <Header />}
      {/* Hero/Banner Section at the Top - pixel-perfect match */}
      <div style={{
        background: 'linear-gradient(120deg, #eaf4ff 0%, #f6fbff 100%)',
        padding: '48px 0 8px 0',
        textAlign: 'center',
        minHeight: 340,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <h1 style={{ fontSize: 48, fontWeight: 800, color: '#2186eb', marginBottom: 10, letterSpacing: 1, lineHeight: 1.1 }}>Welcome to MediCare</h1>
        <div style={{ fontSize: 26, color: '#555', fontWeight: 500, marginBottom: 8 }}>Affordable Medicines Delivered</div>
        <div style={{ fontSize: 17, color: '#444', marginBottom: 32 }}>Compare prices, save more, and order with ease.</div>
        <SearchBar />
      </div>
      {/* Shop By Categories below the banner */}
      <div style={{ margin: '12px 0 0 0' }}>
        <ShopByCategories />
      </div>

      {/* Deal of the Day Section */}
      <div style={sectionStyle}>
        <h2 style={{ fontWeight: 700, marginBottom: 18, color: '#19b6c9' }}>Deal of the Day</h2>
        {isLoading ? (
          <div>Loading deals...</div>
        ) : filteredDeals.length === 0 ? (
          <div>No deals available from online pharmacists in your area.</div>
        ) : (
          <div className="hide-horizontal-scrollbar" style={cardsRowStyle}>
            {getShuffledItems(filteredDeals, 15).map((deal) => (
              <ItemCard 
                key={deal._id} 
                item={deal.item} 
                type={deal.itemType?.toLowerCase() || 'product'} 
                dealDiscount={deal.discountPercentage}
                dealEndTime={deal.endTime}
              />
            ))}
          </div>
        )}
      </div>

      {/* Medicines Section */}
      <div style={sectionStyle}>
        <h2 style={{ fontWeight: 700, marginBottom: 18, color: '#19b6c9' }}>Medicines</h2>
        {isLoading ? (
          <div>Loading medicines...</div>
        ) : medicines.length === 0 ? (
          <div>No medicines available from online pharmacists in your area.</div>
        ) : (
          <div className="hide-horizontal-scrollbar" style={cardsRowStyle}>
            {getShuffledItems(medicines, 15).map((medicine) => (
              <ItemCard key={medicine._id} item={medicine} type="medicine" />
            ))}
          </div>
        )}
      </div>

      {/* Products Section */}
      <div style={sectionStyle}>
        <h2 style={{ fontWeight: 700, marginBottom: 18, color: '#19b6c9' }}>Products</h2>
        {isLoading ? (
          <div>Loading products...</div>
        ) : products.length === 0 ? (
          <div>No products available from online pharmacists in your area.</div>
        ) : (
          <div className="hide-horizontal-scrollbar" style={cardsRowStyle}>
            {getShuffledItems(products, 15).map((product) => (
              <ItemCard key={product._id} item={product} type="product" />
            ))}
          </div>
        )}
      </div>

      {/* Deal You Love Section */}
      <div style={sectionStyle}>
        <h2 style={{ fontWeight: 700, marginBottom: 18, color: '#19b6c9' }}>Deal You Love</h2>
        {isLoading ? (
          <div>Loading deals you love...</div>
        ) : dealYouLove.length === 0 ? (
          <div>No products or medicines with discounts above 50% available from online pharmacists in your area.</div>
        ) : (
          <div className="hide-horizontal-scrollbar" style={cardsRowStyle}>
            {dealYouLove.map((item) => (
              <ItemCard key={item._id} item={item} type={item.category ? 'product' : 'medicine'} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default LandingPage; 