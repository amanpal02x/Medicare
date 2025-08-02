import React from 'react';
import Header from '../components/Header';
import MobileCategoryList from '../components/MobileCategoryList';
import useDeviceDetection from '../hooks/useDeviceDetection';

const Categories = () => {
  const { isMobile } = useDeviceDetection();

  return (
    <>
      {!isMobile && <Header />}
      <MobileCategoryList />
    </>
  );
};

export default Categories;
