import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import useDeviceDetection from '../hooks/useDeviceDetection';

const SupportTicketDetail = () => {
  const { isMobile } = useDeviceDetection();
  return (
    <>
      {!isMobile && <Header />}
      <div style={{ padding: '50px 20px', textAlign: 'center' }}>
        <h1>Support Ticket Detail</h1>
        <p>SupportTicketDetail functionality coming soon!</p>
      </div>
      {!isMobile && <Footer />}
    </>
  );
};

export default SupportTicketDetail;
