import React from 'react';
import Header from '../components/Header';
import useDeviceDetection from '../hooks/useDeviceDetection';

const Stores = () => {
  const { isMobile } = useDeviceDetection();

  return (
    <>
      {!isMobile && <Header />}
      <div style={{ padding: '50px 20px', textAlign: 'center' }}>
        <h1>Stores</h1>
        <p>Stores functionality coming soon!</p>
      </div>
    </>
  );
};

export default Stores;
