import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import './index.css';
import DashboardLayout from './components/DashboardLayout';
import ResponsiveLayout from './components/ResponsiveLayout';
import PharmacistDashboard from './pages/PharmacistDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Search from './pages/Search';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import PharmacistMedicines from './pages/PharmacistMedicines';
import PharmacistOrderManagement from './pages/PharmacistOrderManagement';
import PharmacistDiscounts from './pages/PharmacistDiscounts';
import DeliveryDashboard from './pages/DeliveryDashboard';
import DeliveryOrders from './pages/DeliveryOrders';
import DeliveryOrderDetail from './pages/DeliveryOrderDetail';
import DeliveryProfile from './pages/DeliveryProfile';
import DeliveryProfileSetup from './pages/DeliveryProfileSetup';
import DeliveryLocation from './pages/DeliveryLocation';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AdminUsers from './pages/AdminUsers';
import AdminPharmacies from './pages/AdminPharmacies';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminSettings from './pages/AdminSettings';
import PharmacistProfile from './pages/PharmacistProfile';
import LandingPage from './pages/LandingPage';
import Categories from './pages/Categories';
import BestSellers from './pages/BestSellers';
import Brands from './pages/Brands';
import About from './pages/About';
import Stores from './pages/Stores';
import { CartProvider } from './context/CartContext';
import Orders from './pages/Orders';
import Prescriptions from './pages/Prescriptions';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import Products from './pages/Products';
import SalesReport from './pages/SalesReport';
import HelpSupports from './pages/HelpSupport';
import Settings from './pages/Settings';
import PharmacistInvoices from './pages/PharmacistInvoices';
import ProductDetail from './pages/ProductDetail';
import PharmacistPrescriptions from './pages/PharmacistPrescriptions';
import PharmacistDeals from './pages/PharmacistDeals';
import PharmacistSales from './pages/PharmacistSales';
import PharmacistCustomers from './pages/PharmacistCustomers';
import PharmacistSuppliers from './pages/PharmacistSuppliers';
import HelpSupportPharmacist from './pages/HelpSupportPharmacist';
import AdminOrders from './pages/AdminOrders';
import AdminMedicines from './pages/AdminMedicines';
import AdminPrescriptions from './pages/AdminPrescriptions';
import AdminPayments from './pages/AdminPayments';
import AdminRefunds from './pages/AdminRefunds';
import AdminDeliveries from './pages/AdminDeliveries';
import AdminSupport from './pages/AdminSupport';
import AdminCategories from './pages/AdminCategories';
import SupportTicketDetail from './pages/SupportTicketDetail';
import NotificationDetail from './pages/NotificationDetail';
import Notifications from './pages/Notifications';
import OrderDetail from './pages/OrderDetail';
import Checkout from './pages/Checkout';
import DeliveryMobileLayout from './components/DeliveryMobileLayout';
import NotificationPopup from './components/NotificationPopup';
import MedicineDetail from './pages/MedicineDetail';
import Medicines from './pages/Medicines';
import { NotificationProvider } from './context/NotificationContext';
import OrderChat from './pages/OrderChat';
import PharmacistRegister from './pages/PharmacistRegister';
import DeliveryRegister from './pages/DeliveryRegister';
import RegisterRedirect from './pages/RegisterRedirect';
import AdminPharmacistMedicines from './pages/AdminPharmacistMedicines';
import AdminPharmacistSales from './pages/AdminPharmacistSales';
import ResponsiveTest from './components/ResponsiveTest';

function PrivateRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user) {
    if (user.role === 'pharmacist') return <Navigate to="/pharmacist" />;
    if (user.role === 'admin') return <Navigate to="/admin" />;
    if (user.role === 'deliveryBoy') return <Navigate to="/delivery" />;
    return <Navigate to="/" />;
  }
  return children;
}

function RootRoute() {
  const { user } = useAuth();
  if (user && user.role === 'pharmacist') {
    return <Navigate to="/pharmacist" />;
  }
  if (user && user.role === 'admin') {
    return <Navigate to="/admin" />;
  }
  if (user && user.role === 'deliveryBoy') {
    return <Navigate to="/delivery" />;
  }
  return <ResponsiveLayout isPublic={true}><LandingPage /></ResponsiveLayout>;
}

function AppContent() {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#1976d2' },
      secondary: { main: '#9c27b0' },
    },
  });
  const toggleDarkMode = () => setDarkMode((prev) => !prev);
  return (
    <CartProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {user && user.role === 'user' ? (
          <Router>
            <NotificationPopup />
            <Routes>
              <Route path="/" element={<RootRoute />} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register-redirect" element={<RegisterRedirect />} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/register/pharmacist" element={<PharmacistRegister />} />
              <Route path="/register/delivery" element={<DeliveryRegister />} />
              <Route path="/user" element={<Navigate to="/" />} />
              <Route path="/search" element={<PrivateRoute roles={['user']}><ResponsiveLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><Search /></ResponsiveLayout></PrivateRoute>} />
              <Route path="/cart" element={<PrivateRoute roles={['user']}><ResponsiveLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><Cart /></ResponsiveLayout></PrivateRoute>} />
              <Route path="/checkout" element={<PrivateRoute roles={['user']}><ResponsiveLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><Checkout /></ResponsiveLayout></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute roles={['user']}><ResponsiveLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><Profile /></ResponsiveLayout></PrivateRoute>} />
              <Route path="/pharmacist" element={<PrivateRoute roles={['pharmacist']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><PharmacistDashboard /></DashboardLayout></PrivateRoute>} />
              <Route path="/delivery" element={<PrivateRoute roles={['deliveryBoy']}><DeliveryMobileLayout><DeliveryDashboard /></DeliveryMobileLayout></PrivateRoute>} />
              <Route path="/delivery/orders" element={<PrivateRoute roles={['deliveryBoy']}><DeliveryMobileLayout><DeliveryOrders /></DeliveryMobileLayout></PrivateRoute>} />
              <Route path="/delivery/orders/:orderId" element={<PrivateRoute roles={['deliveryBoy']}><DeliveryMobileLayout><DeliveryOrderDetail /></DeliveryMobileLayout></PrivateRoute>} />
              <Route path="/delivery/profile" element={<PrivateRoute roles={['deliveryBoy']}><DeliveryMobileLayout><DeliveryProfile /></DeliveryMobileLayout></PrivateRoute>} />
              <Route path="/delivery/profile-setup" element={<PrivateRoute roles={['deliveryBoy']}><DeliveryMobileLayout><DeliveryProfileSetup /></DeliveryMobileLayout></PrivateRoute>} />
              <Route path="/delivery/location" element={<PrivateRoute roles={['deliveryBoy']}><DeliveryMobileLayout><DeliveryLocation /></DeliveryMobileLayout></PrivateRoute>} />
              <Route path="/admin" element={<PrivateRoute roles={['admin']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><AdminDashboard /></DashboardLayout></PrivateRoute>} />
              <Route path="/admin/users" element={<PrivateRoute roles={['admin']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><AdminUsers /></DashboardLayout></PrivateRoute>} />
              <Route path="/admin/pharmacies" element={<PrivateRoute roles={['admin']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><AdminPharmacies /></DashboardLayout></PrivateRoute>} />
              <Route path="/admin/deliveries" element={<PrivateRoute roles={['admin']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><AdminDeliveries /></DashboardLayout></PrivateRoute>} />
              <Route path="/admin/payments" element={<PrivateRoute roles={['admin']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><AdminPayments /></DashboardLayout></PrivateRoute>} />
              <Route path="/admin/refunds" element={<PrivateRoute roles={['admin']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><AdminRefunds /></DashboardLayout></PrivateRoute>} />
              <Route path="/admin/support" element={<PrivateRoute roles={['admin']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><AdminSupport /></DashboardLayout></PrivateRoute>} />
              <Route path="/admin/analytics" element={<PrivateRoute roles={['admin']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><AdminAnalytics /></DashboardLayout></PrivateRoute>} />
              <Route path="/admin/settings" element={<PrivateRoute roles={['admin']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><AdminSettings /></DashboardLayout></PrivateRoute>} />
              <Route path="/admin/orders" element={<PrivateRoute roles={['admin']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><AdminOrders /></DashboardLayout></PrivateRoute>} />
              <Route path="/admin/medicines" element={<PrivateRoute roles={['admin']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><AdminMedicines /></DashboardLayout></PrivateRoute>} />
              <Route path="/admin/pharmacists/:pharmacistId/medicines" element={<PrivateRoute roles={['admin']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><AdminPharmacistMedicines /></DashboardLayout></PrivateRoute>} />
              <Route path="/admin/pharmacist-sales" element={<PrivateRoute roles={['admin']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><AdminPharmacistSales /></DashboardLayout></PrivateRoute>} />
              <Route path="/admin/prescriptions" element={<PrivateRoute roles={['admin']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><AdminPrescriptions /></DashboardLayout></PrivateRoute>} />
              <Route path="/admin/categories" element={<PrivateRoute roles={['admin']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><AdminCategories /></DashboardLayout></PrivateRoute>} />
              <Route path="/pharmacist/medicines" element={<PrivateRoute roles={['pharmacist']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><PharmacistMedicines /></DashboardLayout></PrivateRoute>} />
              <Route path="/pharmacist/order-management" element={<PrivateRoute roles={['pharmacist']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><PharmacistOrderManagement /></DashboardLayout></PrivateRoute>} />
              <Route path="/pharmacist/discounts" element={<PrivateRoute roles={['pharmacist']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><PharmacistDiscounts /></DashboardLayout></PrivateRoute>} />
              <Route path="/pharmacist/profile" element={<PrivateRoute roles={['pharmacist']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><PharmacistProfile /></DashboardLayout></PrivateRoute>} />
              <Route path="/pharmacist/purchase" element={<PrivateRoute roles={['pharmacist']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><div style={{padding: 32}}><h2>Purchase Page</h2><p>Purchase management coming soon!</p></div></DashboardLayout></PrivateRoute>} />
              <Route path="/pharmacist/sale" element={<PrivateRoute roles={['pharmacist']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><PharmacistSales /></DashboardLayout></PrivateRoute>} />
              <Route path="/pharmacist/products" element={<PrivateRoute roles={['pharmacist']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><Products /></DashboardLayout></PrivateRoute>} />
              <Route path="/pharmacist/suppliers" element={<PrivateRoute roles={['pharmacist']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><PharmacistSuppliers /></DashboardLayout></PrivateRoute>} />
              <Route path="/pharmacist/customers" element={<PrivateRoute roles={['pharmacist']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><PharmacistCustomers /></DashboardLayout></PrivateRoute>} />
              <Route path="/pharmacist/sales-report" element={<PrivateRoute roles={['pharmacist']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><SalesReport /></DashboardLayout></PrivateRoute>} />
              <Route path="/pharmacist/help-support" element={
                <PrivateRoute roles={['pharmacist']}>
                  <DashboardLayout>
                    <HelpSupportPharmacist />
                  </DashboardLayout>
                </PrivateRoute>
              } />
              <Route path="/pharmacist/settings" element={<PrivateRoute roles={['pharmacist']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><Settings /></DashboardLayout></PrivateRoute>} />
              <Route path="/pharmacist/invoices" element={<PrivateRoute roles={['pharmacist']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><PharmacistInvoices /></DashboardLayout></PrivateRoute>} />
              <Route path="/pharmacist/prescriptions" element={<PrivateRoute roles={['pharmacist']}><DashboardLayout><PharmacistPrescriptions /></DashboardLayout></PrivateRoute>} />
              <Route path="/pharmacist/deals" element={<PrivateRoute roles={['pharmacist']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><PharmacistDeals /></DashboardLayout></PrivateRoute>} />
              <Route path="/categories" element={<ResponsiveLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><Categories /></ResponsiveLayout>} />
              <Route path="/best-sellers" element={<BestSellers />} />
              <Route path="/brands" element={<Brands />} />
              <Route path="/about" element={<About />} />
              <Route path="/stores" element={<Stores />} />
              <Route path="/orders" element={<PrivateRoute roles={['user']}><ResponsiveLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><Orders /></ResponsiveLayout></PrivateRoute>} />
              <Route path="/orders/:orderId/chat" element={<PrivateRoute roles={['user']}><ResponsiveLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><OrderChat /></ResponsiveLayout></PrivateRoute>} />
              <Route path="/order-detail/:id" element={<PrivateRoute roles={['user']}><ResponsiveLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><OrderDetail standalone={true} /></ResponsiveLayout></PrivateRoute>} />
              <Route path="/prescriptions" element={<PrivateRoute roles={['user']}><ResponsiveLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><Prescriptions /></ResponsiveLayout></PrivateRoute>} />
              <Route path="/products/:id" element={<ResponsiveLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><ProductDetail /></ResponsiveLayout>} />
              <Route path="/medicines/:id" element={<ResponsiveLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><MedicineDetail /></ResponsiveLayout>} />
              <Route path="/support-ticket/:id" element={<PrivateRoute><ResponsiveLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><SupportTicketDetail /></ResponsiveLayout></PrivateRoute>} />
              <Route path="/notifications" element={<PrivateRoute><ResponsiveLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><Notifications /></ResponsiveLayout></PrivateRoute>} />
              <Route path="/help-supports" element={<ResponsiveLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><HelpSupports /></ResponsiveLayout>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        ) : (
          <Router>
            <NotificationPopup />
            <Routes>
              <Route path="/" element={<RootRoute />} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register-redirect" element={<RegisterRedirect />} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/register/pharmacist" element={<PharmacistRegister />} />
              <Route path="/register/delivery" element={<DeliveryRegister />} />
              <Route path="/user" element={<Navigate to="/" />} />
              <Route path="/search" element={<PrivateRoute roles={['user']}><ResponsiveLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><Search /></ResponsiveLayout></PrivateRoute>} />
              <Route path="/cart" element={<PrivateRoute roles={['user']}><ResponsiveLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><Cart /></ResponsiveLayout></PrivateRoute>} />
              <Route path="/checkout" element={<PrivateRoute roles={['user']}><ResponsiveLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><Checkout /></ResponsiveLayout></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute roles={['user']}><ResponsiveLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><Profile /></ResponsiveLayout></PrivateRoute>} />
              <Route path="/pharmacist" element={<PrivateRoute roles={['pharmacist']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><PharmacistDashboard /></DashboardLayout></PrivateRoute>} />
              <Route path="/delivery" element={<PrivateRoute roles={['deliveryBoy']}><DeliveryMobileLayout><DeliveryDashboard /></DeliveryMobileLayout></PrivateRoute>} />
              <Route path="/delivery/orders" element={<PrivateRoute roles={['deliveryBoy']}><DeliveryMobileLayout><DeliveryOrders /></DeliveryMobileLayout></PrivateRoute>} />
              <Route path="/delivery/orders/:orderId" element={<PrivateRoute roles={['deliveryBoy']}><DeliveryMobileLayout><DeliveryOrderDetail /></DeliveryMobileLayout></PrivateRoute>} />
              <Route path="/delivery/profile" element={<PrivateRoute roles={['deliveryBoy']}><DeliveryMobileLayout><DeliveryProfile /></DeliveryMobileLayout></PrivateRoute>} />
              <Route path="/delivery/profile-setup" element={<PrivateRoute roles={['deliveryBoy']}><DeliveryMobileLayout><DeliveryProfileSetup /></DeliveryMobileLayout></PrivateRoute>} />
              <Route path="/delivery/location" element={<PrivateRoute roles={['deliveryBoy']}><DeliveryMobileLayout><DeliveryLocation /></DeliveryMobileLayout></PrivateRoute>} />
              <Route path="/admin" element={<PrivateRoute roles={['admin']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><AdminDashboard /></DashboardLayout></PrivateRoute>} />
              <Route path="/admin/users" element={<PrivateRoute roles={['admin']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><AdminUsers /></DashboardLayout></PrivateRoute>} />
              <Route path="/admin/pharmacies" element={<PrivateRoute roles={['admin']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><AdminPharmacies /></DashboardLayout></PrivateRoute>} />
              <Route path="/admin/deliveries" element={<PrivateRoute roles={['admin']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><AdminDeliveries /></DashboardLayout></PrivateRoute>} />
              <Route path="/admin/payments" element={<PrivateRoute roles={['admin']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><AdminPayments /></DashboardLayout></PrivateRoute>} />
              <Route path="/admin/refunds" element={<PrivateRoute roles={['admin']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><AdminRefunds /></DashboardLayout></PrivateRoute>} />
              <Route path="/admin/support" element={<PrivateRoute roles={['admin']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><AdminSupport /></DashboardLayout></PrivateRoute>} />
              <Route path="/admin/analytics" element={<PrivateRoute roles={['admin']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><AdminAnalytics /></DashboardLayout></PrivateRoute>} />
              <Route path="/admin/settings" element={<PrivateRoute roles={['admin']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><AdminSettings /></DashboardLayout></PrivateRoute>} />
              <Route path="/admin/orders" element={<PrivateRoute roles={['admin']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><AdminOrders /></DashboardLayout></PrivateRoute>} />
              <Route path="/admin/medicines" element={<PrivateRoute roles={['admin']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><AdminMedicines /></DashboardLayout></PrivateRoute>} />
              <Route path="/admin/pharmacists/:pharmacistId/medicines" element={<PrivateRoute roles={['admin']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><AdminPharmacistMedicines /></DashboardLayout></PrivateRoute>} />
              <Route path="/admin/prescriptions" element={<PrivateRoute roles={['admin']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><AdminPrescriptions /></DashboardLayout></PrivateRoute>} />
              <Route path="/admin/categories" element={<PrivateRoute roles={['admin']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><AdminCategories /></DashboardLayout></PrivateRoute>} />
              <Route path="/pharmacist/medicines" element={<PrivateRoute roles={['pharmacist']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><PharmacistMedicines /></DashboardLayout></PrivateRoute>} />
              <Route path="/pharmacist/order-management" element={<PrivateRoute roles={['pharmacist']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><PharmacistOrderManagement /></DashboardLayout></PrivateRoute>} />
              <Route path="/pharmacist/discounts" element={<PrivateRoute roles={['pharmacist']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><PharmacistDiscounts /></DashboardLayout></PrivateRoute>} />
              <Route path="/pharmacist/profile" element={<PrivateRoute roles={['pharmacist']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><PharmacistProfile /></DashboardLayout></PrivateRoute>} />
              <Route path="/pharmacist/purchase" element={<PrivateRoute roles={['pharmacist']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><div style={{padding: 32}}><h2>Purchase Page</h2><p>Purchase management coming soon!</p></div></DashboardLayout></PrivateRoute>} />
              <Route path="/pharmacist/sale" element={<PrivateRoute roles={['pharmacist']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><PharmacistSales /></DashboardLayout></PrivateRoute>} />
              <Route path="/pharmacist/products" element={<PrivateRoute roles={['pharmacist']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><Products /></DashboardLayout></PrivateRoute>} />
              <Route path="/pharmacist/suppliers" element={<PrivateRoute roles={['pharmacist']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><PharmacistSuppliers /></DashboardLayout></PrivateRoute>} />
              <Route path="/pharmacist/customers" element={<PrivateRoute roles={['pharmacist']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><PharmacistCustomers /></DashboardLayout></PrivateRoute>} />
              <Route path="/pharmacist/sales-report" element={<PrivateRoute roles={['pharmacist']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><SalesReport /></DashboardLayout></PrivateRoute>} />
              <Route path="/pharmacist/help-support" element={<PrivateRoute roles={['pharmacist']}><HelpSupportPharmacist /></PrivateRoute>} />
              <Route path="/pharmacist/settings" element={<PrivateRoute roles={['pharmacist']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><Settings /></DashboardLayout></PrivateRoute>} />
              <Route path="/pharmacist/invoices" element={<PrivateRoute roles={['pharmacist']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><PharmacistInvoices /></DashboardLayout></PrivateRoute>} />
              <Route path="/pharmacist/prescriptions" element={<PrivateRoute roles={['pharmacist']}><DashboardLayout><PharmacistPrescriptions /></DashboardLayout></PrivateRoute>} />
              <Route path="/pharmacist/deals" element={<PrivateRoute roles={['pharmacist']}><DashboardLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><PharmacistDeals /></DashboardLayout></PrivateRoute>} />
              <Route path="/categories" element={<ResponsiveLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><Categories /></ResponsiveLayout>} />
              <Route path="/best-sellers" element={<ResponsiveLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><BestSellers /></ResponsiveLayout>} />
              <Route path="/brands" element={<ResponsiveLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><Brands /></ResponsiveLayout>} />
              <Route path="/about" element={<ResponsiveLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><About /></ResponsiveLayout>} />
              <Route path="/stores" element={<ResponsiveLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><Stores /></ResponsiveLayout>} />
              <Route path="/orders" element={<PrivateRoute roles={['user']}><ResponsiveLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><Orders /></ResponsiveLayout></PrivateRoute>} />
              <Route path="/orders/:orderId/chat" element={<PrivateRoute roles={['user']}><ResponsiveLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><OrderChat /></ResponsiveLayout></PrivateRoute>} />
              <Route path="/order-detail/:id" element={<PrivateRoute roles={['user']}><ResponsiveLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><OrderDetail standalone={true} /></ResponsiveLayout></PrivateRoute>} />
              <Route path="/prescriptions" element={<PrivateRoute roles={['user']}><ResponsiveLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><Prescriptions /></ResponsiveLayout></PrivateRoute>} />
              <Route path="/products/:id" element={<ResponsiveLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><ProductDetail /></ResponsiveLayout>} />
              <Route path="/medicines/:id" element={<ResponsiveLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><MedicineDetail /></ResponsiveLayout>} />
              <Route path="/support-ticket/:id" element={<PrivateRoute><ResponsiveLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><SupportTicketDetail /></ResponsiveLayout></PrivateRoute>} />
              <Route path="/notifications" element={<PrivateRoute><ResponsiveLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><Notifications /></ResponsiveLayout></PrivateRoute>} />
              <Route path="/help-supports" element={<ResponsiveLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}><HelpSupports /></ResponsiveLayout>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        )}
      </ThemeProvider>
    </CartProvider>
  );
}

function App() {
  return (
    <SocketProvider>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </SocketProvider>
  );
}

export default App;