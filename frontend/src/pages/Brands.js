import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import useDeviceDetection from '../hooks/useDeviceDetection';

const Brands = () => {
  const { isMobile } = useDeviceDetection();

  return (
    <>
      {!isMobile && <Header />}
      <div style={{ padding: '50px 20px', textAlign: 'center' }}>
        <h1>Brands</h1>
        <p>Brands functionality coming soon!</p>
      </div>
      {!isMobile && <Footer />}
    </>
  );
};

export default Brands;
