import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ShopByCategories from '../components/ShopByCategories';
import ShopByCategoriesView from '../components/ShopByCategoriesView';
import useDeviceDetection from '../hooks/useDeviceDetection';
import { useLocation } from 'react-router-dom';

const Categories = () => {
  const { isMobile } = useDeviceDetection();
  const location = useLocation();
  
  // Check if we're in the shop by categories view (from bottom nav)
  const isShopByCategoriesView = location.pathname === '/categories' && isMobile;

  return (
    <>
      {!isMobile && <Header />}
      {isShopByCategoriesView ? (
        <ShopByCategoriesView />
      ) : (
        <ShopByCategories />
      )}
      {!isMobile && <Footer />}
    </>
  );
};

export default Categories;
