import { Routes, Route } from 'react-router-dom';
import Layout from './Components/Layout';
import Home from './pages/Home';
import Mobile from './pages/Products/Mobile';
import Automotive from './pages/Products/Automotive';
import Books from './pages/Products/Books';
import Laptops from './pages/Products/Laptops';
import Fashion from './pages/Products/Fashion';
import Grocery from './pages/Products/Grocery';
import Electronics from './pages/Products/Electronics';
import HomeKitchen from './pages/Products/HomeKitchen';
import SportsOutdoors from './pages/Products/Sportsoutdoors';
import BeautyHealth from './pages/Products/BeautyHealth';
import ToysGames from './pages/Products/ToysGames';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import ProductDetails from './pages/ProductDetails';
import Profile from './pages/Profile';
import Bill from './pages/Bill';
import ProductPage from './pages/ProductPage';
import SearchPage from './pages/SearchPage';
import AdminDashboard from './pages/AdminDashboard';
import SupportBlocked from './pages/SupportBlocked';
import ErrorBoundary from './Components/ErrorBoundary';
import { NotificationProvider } from './Context/NotificationContext';


function App() {
  return (
    <NotificationProvider>
        <Routes>
        <Route path="/Login" element={<Login />} />
        <Route path="/support-blocked" element={<SupportBlocked />} />
        <Route path="/admin" element={
          <ErrorBoundary>
            <AdminDashboard />
          </ErrorBoundary>
        } />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="Mobile" element={<Mobile />} />
          <Route path="Automotive" element={<Automotive />} />
          <Route path="Books" element={<Books />} />
          <Route path="Laptops" element={<Laptops />} />
          <Route path="Fashion" element={<Fashion />} />
          <Route path="Grocery" element={<Grocery />} />
          <Route path="Electronics" element={<Electronics />} />
          <Route path="HomeKitchen" element={<HomeKitchen />} />
          <Route path="SportsOutdoors" element={<SportsOutdoors />} />
          <Route path="BeautyHealth" element={<BeautyHealth />} />
          <Route path="ToysGames" element={<ToysGames />} />
          <Route path="Cart" element={<Cart />} />
          <Route path="Wishlist" element={<Wishlist />} />
          <Route path="Checkout" element={<Checkout />} />
          <Route path=":category/:id" element={<ProductDetails />} />
          <Route path="Profile" element={<Profile />} />
          <Route path="Bill" element={<Bill />} />
          <Route path="ProductPage" element={<ProductPage />} />
          <Route path="search" element={<SearchPage />} />
        </Route>
      </Routes>
    </NotificationProvider>
  );
}

export default App;



