import { Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './utils/ScrollToTop';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AdminAuthProvider } from './admin/context/AdminAuthContext';
import { CustomerAuthProvider } from './customer/context/CustomerAuthContext';
import { CartProvider } from './customer/context/CartContext';

// Customer components
import NavigationBar from './customer/components/NavigationBar/NavigationBar';
import Footer from './customer/components/Footer/Footer';
import HomePage from './customer/pages/HomePage/HomePage';
import ProductListing from './customer/pages/ProductListing/ProductListing';
import ProductDetail from './customer/pages/ProductDetail/ProductDetail';
import Cart from './customer/pages/Cart/Cart';
import CustomerLogin from './customer/pages/Auth/CustomerLogin';
import CustomerRegister from './customer/pages/Auth/CustomerRegister';
import Checkout from './customer/pages/Checkout/Checkout';
import OrderConfirmation from './customer/pages/OrderConfirmation/OrderConfirmation';
import MyOrders from './customer/pages/MyOrders/MyOrders';
import PaymentPage from './customer/pages/PaymentPage/PaymentPage';

// Admin components
import AdminLogin from './admin/pages/AdminLogin';
import AdminLayout from './admin/components/AdminLayout';
import Dashboard from './admin/pages/Dashboard';
import ProductManagement from './admin/pages/ProductManagement';
import CarouselManagement from './admin/pages/CarouselManagement';
import OrderManagement from './admin/pages/OrderManagement';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <AdminAuthProvider>
      <CustomerAuthProvider>
        <CartProvider>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
          <ScrollToTop />

          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />

            <Route path="/home" element={
              <>
                <NavigationBar />
                <HomePage />
                <Footer />
              </>
            } />

            <Route path="/products" element={
              <>
                <NavigationBar />
                <ProductListing />
              </>
            } />

            <Route path="/products/:category" element={
              <>
                <NavigationBar />
                <ProductListing />
              </>
            } />

            <Route path="/product/:id" element={
              <>
                <NavigationBar />
                <ProductDetail />
                <Footer />
              </>
            } />

            <Route path="/cart" element={
              <>
                <NavigationBar />
                <Cart />
                <Footer />
              </>
            } />

            {/* Auth Routes (no navbar) */}
            <Route path="/login" element={<CustomerLogin />} />
            <Route path="/register" element={<CustomerRegister />} />

            {/* Protected Routes */}
            <Route path="/checkout" element={
              <>
                <NavigationBar />
                <Checkout />
                <Footer />
              </>
            } />

            <Route path="/checkout/payment" element={
              <>
                <NavigationBar />
                <PaymentPage />
                <Footer />
              </>
            } />

            <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmation />} />

            <Route path="/my-orders" element={
              <>
                <NavigationBar />
                <MyOrders />
                <Footer />
              </>
            } />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="carousels" element={<CarouselManagement />} />
              <Route path="orders" element={<OrderManagement />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </CustomerAuthProvider>
    </AdminAuthProvider>
  );
}

export default App;