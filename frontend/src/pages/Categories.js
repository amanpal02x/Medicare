import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ShopByCategories from '../components/ShopByCategories';
import useDeviceDetection from '../hooks/useDeviceDetection';

const Categories = () => {
  const { isMobile } = useDeviceDetection();

  return (
    <>
      {!isMobile && <Header />}
      <ShopByCategories />
      {!isMobile && <Footer />}
    </>
  );
};

export default Categories;
