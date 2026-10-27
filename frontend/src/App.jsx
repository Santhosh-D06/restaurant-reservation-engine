import { Link, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Restaurants from './pages/Restaurants';
import RestaurantDetails from './pages/RestaurantDetails';
import Reserve from './pages/Reserve';
import MyReservations from './pages/MyReservations';
import Cart from './pages/Cart';
import MyOrders from './pages/MyOrders';
import OrderDetails from './pages/OrderDetails';
import Dashboard from './pages/Dashboard';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRestaurants from './pages/admin/AdminRestaurants';
import AdminMenus from './pages/admin/AdminMenus';
import AdminTables from './pages/admin/AdminTables';
import AdminReservations from './pages/admin/AdminReservations';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';

const NotFound = () => (
  <div className="container"><h1>Page not found</h1><Link to="/">Go home</Link></div>
);

const customer = (el) => <ProtectedRoute role="customer">{el}</ProtectedRoute>;

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Navbar />
        <main className="page">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/restaurants" element={<Restaurants />} />
            <Route path="/restaurants/:id" element={<RestaurantDetails />} />
            <Route path="/cart" element={<Cart />} />

            <Route path="/restaurants/:id/reserve" element={customer(<Reserve />)} />
            <Route path="/reservations/:reservationId/edit" element={customer(<Reserve />)} />
            <Route path="/dashboard" element={customer(<Dashboard />)} />
            <Route path="/my-reservations" element={customer(<MyReservations />)} />
            <Route path="/my-orders" element={customer(<MyOrders />)} />
            <Route path="/orders/:id" element={customer(<OrderDetails />)} />

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="restaurants" element={<AdminRestaurants />} />
              <Route path="menus" element={<AdminMenus />} />
              <Route path="tables" element={<AdminTables />} />
              <Route path="reservations" element={<AdminReservations />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="customers" element={<AdminCustomers />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <footer className="footer">© TableEase · College project demo · payments are simulated (demonstration only)</footer>
      </CartProvider>
    </AuthProvider>
  );
}
