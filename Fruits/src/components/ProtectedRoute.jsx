import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { ShopContext } from '../Context/ShopContext';

// eslint-disable-next-line react/prop-types
const ProtectedRoute = ({ children }) => {
  const { token } = useContext(ShopContext);

  if (!token) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
