import React from 'react';
import Header from '../components/Header';
import useDeviceDetection from '../hooks/useDeviceDetection';

const About = () => {
  const { isMobile } = useDeviceDetection();

  return (
    <>
      {!isMobile && <Header />}
      <div style={{ padding: '50px 20px', textAlign: 'center' }}>
        <h1>About Us</h1>
        <p>About us functionality coming soon!</p>
      </div>
    </>
  );
};

export default About;
