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
    margin: isMobile ? '24px auto' : '40px auto',
    padding: isMobile ? '0 12px' : '0 16px',
  };
  const cardsRowStyle = {
    display: isMobile ? 'grid' : 'flex',
    gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(140px, 1fr))' : undefined,
    gap: isMobile ? 12 : 24,
    overflowX: isMobile ? 'visible' : 'auto',
    paddingBottom: 8,
  };

  const isLoading = loadingNearby || loadingDeals;

  return (
    <>
      {!isMobile && <Header />}
      {/* Hero/Banner Section at the Top - pixel-perfect match */}
      <div style={{
        background: 'linear-gradient(120deg, #eaf4ff 0%, #f6fbff 100%)',
        padding: isMobile ? '32px 16px 24px 16px' : '48px 0 8px 0',
        textAlign: 'center',
        minHeight: isMobile ? 280 : 340,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <h1 style={{ 
          fontSize: isMobile ? 32 : 48, 
          fontWeight: 800, 
          color: '#2186eb', 
          marginBottom: isMobile ? 8 : 10, 
          letterSpacing: 1, 
          lineHeight: 1.1,
          padding: isMobile ? '0 8px' : 0
        }}>Welcome to MediCare</h1>
        <div style={{ 
          fontSize: isMobile ? 20 : 26, 
          color: '#555', 
          fontWeight: 500, 
          marginBottom: isMobile ? 6 : 8,
          padding: isMobile ? '0 16px' : 0
        }}>Affordable Medicines Delivered</div>
        <div style={{ 
          fontSize: isMobile ? 15 : 17, 
          color: '#444', 
          marginBottom: isMobile ? 24 : 32,
          padding: isMobile ? '0 20px' : 0,
          lineHeight: 1.4
        }}>Compare prices, save more, and order with ease.</div>
        <SearchBar />
      </div>
      {/* Shop By Categories below the banner - only show on desktop */}
      {!isMobile && (
        <div style={{ margin: '12px 0 0 0' }}>
          <ShopByCategories />
        </div>
      )}

      {/* Deal of the Day Section */}
      <div style={sectionStyle}>
        <h2 style={{ 
          fontWeight: 700, 
          marginBottom: isMobile ? 16 : 18, 
          color: '#19b6c9',
          fontSize: isMobile ? '20px' : '24px',
          textAlign: isMobile ? 'center' : 'left'
        }}>Deal of the Day</h2>
        {isLoading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: isMobile ? 20 : 40, 
            color: '#666',
            fontSize: isMobile ? '16px' : '18px'
          }}>Loading deals...</div>
        ) : filteredDeals.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: isMobile ? 20 : 40, 
            color: '#666',
            fontSize: isMobile ? '16px' : '18px'
          }}>No deals available from online pharmacists in your area.</div>
        ) : (
          <div className="hide-horizontal-scrollbar" style={cardsRowStyle}>
            {getShuffledItems(filteredDeals, isMobile ? 10 : 15).map((deal) => (
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
        <h2 style={{ 
          fontWeight: 700, 
          marginBottom: isMobile ? 16 : 18, 
          color: '#19b6c9',
          fontSize: isMobile ? '20px' : '24px',
          textAlign: isMobile ? 'center' : 'left'
        }}>Medicines</h2>
        {isLoading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: isMobile ? 20 : 40, 
            color: '#666',
            fontSize: isMobile ? '16px' : '18px'
          }}>Loading medicines...</div>
        ) : medicines.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: isMobile ? 20 : 40, 
            color: '#666',
            fontSize: isMobile ? '16px' : '18px'
          }}>No medicines available from online pharmacists in your area.</div>
        ) : (
          <div className="hide-horizontal-scrollbar" style={cardsRowStyle}>
            {getShuffledItems(medicines, isMobile ? 10 : 15).map((medicine) => (
              <ItemCard key={medicine._id} item={medicine} type="medicine" />
            ))}
          </div>
        )}
      </div>

      {/* Products Section */}
      <div style={sectionStyle}>
        <h2 style={{ 
          fontWeight: 700, 
          marginBottom: isMobile ? 16 : 18, 
          color: '#19b6c9',
          fontSize: isMobile ? '20px' : '24px',
          textAlign: isMobile ? 'center' : 'left'
        }}>Products</h2>
        {isLoading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: isMobile ? 20 : 40, 
            color: '#666',
            fontSize: isMobile ? '16px' : '18px'
          }}>Loading products...</div>
        ) : products.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: isMobile ? 20 : 40, 
            color: '#666',
            fontSize: isMobile ? '16px' : '18px'
          }}>No products available from online pharmacists in your area.</div>
        ) : (
          <div className="hide-horizontal-scrollbar" style={cardsRowStyle}>
            {getShuffledItems(products, isMobile ? 10 : 15).map((product) => (
              <ItemCard key={product._id} item={product} type="product" />
            ))}
          </div>
        )}
      </div>

      {/* Deal You Love Section */}
      <div style={sectionStyle}>
        <h2 style={{ 
          fontWeight: 700, 
          marginBottom: isMobile ? 16 : 18, 
          color: '#19b6c9',
          fontSize: isMobile ? '20px' : '24px',
          textAlign: isMobile ? 'center' : 'left'
        }}>Deal You Love</h2>
        {isLoading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: isMobile ? 20 : 40, 
            color: '#666',
            fontSize: isMobile ? '16px' : '18px'
          }}>Loading deals you love...</div>
        ) : dealYouLove.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: isMobile ? 20 : 40, 
            color: '#666',
            fontSize: isMobile ? '16px' : '18px'
          }}>No products or medicines with discounts above 50% available from online pharmacists in your area.</div>
        ) : (
          <div className="hide-horizontal-scrollbar" style={cardsRowStyle}>
            {getShuffledItems(dealYouLove, isMobile ? 10 : 15).map((item) => (
              <ItemCard key={item._id} item={item} type={item.category ? 'product' : 'medicine'} />
            ))}
          </div>
        )}
      </div>

      {!isMobile && <Footer />}
    </>
  );
};

export default LandingPage; 