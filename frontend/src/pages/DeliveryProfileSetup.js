import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DeliveryApprovalGuard from '../components/DeliveryApprovalGuard';

const DeliveryProfileSetup = () => {
  return (
    <>
      <Header />
      <div style={{ padding: '50px 20px', textAlign: 'center' }}>
        <h1>Delivery Profile Setup</h1>
        <p>DeliveryProfileSetup functionality coming soon!</p>
      </div>
      <Footer />
    </>
  );
};

export default function WrappedDeliveryProfileSetup(props) {
  return (
    <DeliveryApprovalGuard>
      <DeliveryProfileSetup {...props} />
    </DeliveryApprovalGuard>
  );
}

// Keep the original export for named import if needed
export { DeliveryProfileSetup };
