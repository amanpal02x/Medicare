import React from 'react';
import Header from '../components/Header';
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
    </>
  );
};

export default Brands;
