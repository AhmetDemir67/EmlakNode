import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar        from './components/Navbar';
import PrivateRoute  from './components/PrivateRoute';
import Home          from './pages/Home';
import Login         from './pages/Login';
import Register      from './pages/Register';
import Dashboard     from './pages/Dashboard';
import ListingDetail from './pages/ListingDetail';
import NotFound      from './pages/NotFound';

const WithNavbar = ({ children }) => (
  <div className="min-h-screen bg-slate-50">
    <Navbar />
    {children}
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WithNavbar><Home /></WithNavbar>} />

        <Route path="/login" element={<Login />} />
        <Route path="/kayit" element={<Register />} />

        <Route path="/panel" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />

        <Route path="/ilan/:id" element={
          <WithNavbar><ListingDetail /></WithNavbar>
        } />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
