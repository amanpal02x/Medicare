import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileCategoryList from '../components/MobileCategoryList';
import useDeviceDetection from '../hooks/useDeviceDetection';

const Categories = () => {
  const { isMobile } = useDeviceDetection();

  // For mobile, render MobileCategoryList directly without ResponsiveLayout wrapper
  if (isMobile) {
    return <MobileCategoryList />;
  }

  // For desktop, render with header and footer
  return (
    <>
      <Header />
      <MobileCategoryList />
      <Footer />
    </>
  );
};

export default Categories;
