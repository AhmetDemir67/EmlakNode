import { Navigate } from 'react-router-dom';

/**
 * Korumalı Rota Bileşeni
 * - localStorage'da token varsa: çocuk bileşeni render eder
 * - Token yoksa: /login'e yönlendirir
 *
 * Kullanım:
 * <Route path="/panel" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
 */
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
