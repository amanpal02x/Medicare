import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { searchMedicines } from '../services/medicines';
import { getAllProducts } from '../services/products';
import ItemCard from '../components/ItemCard';
import { getShuffledItems } from '../utils/shuffleUtils';

const Search = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'all';

  useEffect(() => {
    async function performSearch() {
      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const [medicines, products] = await Promise.all([
          searchMedicines(query),
          getAllProducts()
        ]);

        let allResults = [];

        // Add medicines
        if (category === 'all' || category === 'medicines') {
          allResults.push(...medicines.map(med => ({ ...med, type: 'medicine' })));
        }

        // Add products
        if (category === 'all' || category === 'products') {
          const filteredProducts = products.filter(p => 
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            (p.brand && p.brand.toLowerCase().includes(query.toLowerCase())) ||
            (p.category && p.category.toLowerCase().includes(query.toLowerCase()))
          );
          allResults.push(...filteredProducts.map(prod => ({ ...prod, type: 'product' })));
        }

        // Filter by deals if selected
        if (category === 'deals') {
          allResults = allResults.filter(item => (item.discountPercentage || 0) > 0);
        }

        setResults(allResults);
      } catch (err) {
        setError('Search failed. Please try again.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }

    performSearch();
  }, [query, category]);

  const filteredResults = activeTab === 'all' 
    ? results 
    : results.filter(item => item.type === activeTab);

  const medicines = results.filter(item => item.type === 'medicine');
  const products = results.filter(item => item.type === 'product');
  const deals = results.filter(item => (item.discountPercentage || 0) > 0);

  return (
    <>
      <Header />
      <div style={{ minHeight: '100vh', background: '#fff', padding: '40px 0 0 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          {/* Search Header */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#222', marginBottom: 8 }}>
              Search Results
            </h1>
            {query && (
              <p style={{ fontSize: 16, color: '#666', marginBottom: 16 }}>
                Showing results for "{query}"
              </p>
            )}
            
            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveTab('all')}
                style={{
                  padding: '8px 16px',
                  borderRadius: 20,
                  border: 'none',
                  background: activeTab === 'all' ? '#19b6c9' : '#f1f1f1',
                  color: activeTab === 'all' ? '#fff' : '#666',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
              >
                All ({results.length})
              </button>
              <button
                onClick={() => setActiveTab('medicines')}
                style={{
                  padding: '8px 16px',
                  borderRadius: 20,
                  border: 'none',
                  background: activeTab === 'medicines' ? '#e53935' : '#f1f1f1',
                  color: activeTab === 'medicines' ? '#fff' : '#666',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
              >
                Medicines ({medicines.length})
              </button>
              <button
                onClick={() => setActiveTab('products')}
                style={{
                  padding: '8px 16px',
                  borderRadius: 20,
                  border: 'none',
                  background: activeTab === 'products' ? '#4caf50' : '#f1f1f1',
                  color: activeTab === 'products' ? '#fff' : '#666',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
              >
                Products ({products.length})
              </button>
              <button
                onClick={() => setActiveTab('deals')}
                style={{
                  padding: '8px 16px',
                  borderRadius: 20,
                  border: 'none',
                  background: activeTab === 'deals' ? '#ff9800' : '#f1f1f1',
                  color: activeTab === 'deals' ? '#fff' : '#666',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
              >
                Deals ({deals.length})
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ width: 40, height: 40, border: '4px solid #f3f3f3', borderTop: '4px solid #19b6c9', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
              <p style={{ color: '#666', fontSize: 16 }}>Searching for "{query}"...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#e53935' }}>
              <h3>Search Error</h3>
              <p>{error}</p>
            </div>
          )}

          {/* No Results */}
          {!loading && !error && filteredResults.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <h3 style={{ color: '#666', marginBottom: 8 }}>No results found</h3>
              <p style={{ color: '#888' }}>
                We couldn't find any {activeTab === 'all' ? 'items' : activeTab} matching "{query}"
              </p>
              <div style={{ marginTop: 24 }}>
                <p style={{ color: '#666', marginBottom: 12 }}>Try:</p>
                <ul style={{ color: '#888', textAlign: 'left', maxWidth: 400, margin: '0 auto' }}>
                  <li>Checking your spelling</li>
                  <li>Using more general keywords</li>
                  <li>Using fewer keywords</li>
                  <li>Searching in a different category</li>
                </ul>
              </div>
            </div>
          )}

          {/* Search Results */}
          {!loading && !error && filteredResults.length > 0 && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <p style={{ color: '#666', fontSize: 14 }}>
                  Found {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'}
                </p>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                gap: 20,
                marginBottom: 40
              }}>
                {getShuffledItems(filteredResults).map((item, idx) => (
                  <div key={item._id || idx}>
                    <ItemCard item={item} type={item.type} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default Search;
