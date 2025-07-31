import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileCategoryList from '../components/MobileCategoryList';
import useDeviceDetection from '../hooks/useDeviceDetection';

const Categories = () => {
  const { isMobile } = useDeviceDetection();

  return (
    <>
      {!isMobile && <Header />}
      <MobileCategoryList />
      {!isMobile && <Footer />}
    </>
  );
};

export default Categories;
