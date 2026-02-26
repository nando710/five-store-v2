import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { StoreLayout } from './layouts/StoreLayout';

// Auth Pages (to be implemented)
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Dashboard Pages (to be implemented)
import { Overview } from './pages/dashboard/Overview';
import { Products } from './pages/dashboard/Products';
import { Categories } from './pages/dashboard/Categories';
import { Orders } from './pages/dashboard/Orders';
import { Dispatch } from './pages/dashboard/Dispatch';
import { Franchisees } from './pages/dashboard/Franchisees';

// Store Pages (to be implemented)
import { Catalog } from './pages/store/Catalog';
import { Cart } from './pages/store/Cart';
import { Checkout } from './pages/store/Checkout';
import { MyOrders } from './pages/store/MyOrders';
import { ProductDetails } from './pages/store/ProductDetails';
import { Profile } from './pages/store/Profile';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Redirect root to login for now */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Admin/Superadmin/Expedição Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<DashboardLayout />}>
              <Route index element={<Overview />} />
              <Route path="products" element={<Products />} />
              <Route path="categories" element={<Categories />} />
              <Route path="franchisees" element={<Franchisees />} />
              <Route path="orders" element={<Orders />} />
              <Route path="dispatch" element={<Dispatch />} />
            </Route>
          </Route>

          {/* Franqueado/Consultor Routes */}
          <Route element={<ProtectedRoute allowedRoles={['store', 'admin']} />}>
            <Route path="/store" element={<CartProvider><StoreLayout /></CartProvider>}>
              <Route index element={<Catalog />} />
              <Route path="product/:id" element={<ProductDetails />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="orders" element={<MyOrders />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
