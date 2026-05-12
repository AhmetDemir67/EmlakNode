import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Navbar        from './components/Navbar';
import Footer        from './components/Footer';
import PrivateRoute  from './components/PrivateRoute';
import Home          from './pages/Home';
import Login         from './pages/Login';
import Register      from './pages/Register';
import Dashboard     from './pages/Dashboard';
import ListingDetail from './pages/ListingDetail';
import Listings      from './pages/Listings';
import NotFound      from './pages/NotFound';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

const WithNavbar = ({ children }) => (
  <div className="min-h-screen bg-slate-50 flex flex-col">
    <Navbar />
    <div className="flex-1">{children}</div>
    <Footer />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: { fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500 },
          success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<WithNavbar><Home /></WithNavbar>} />

        <Route path="/login" element={<Login />} />
        <Route path="/kayit" element={<Register />} />

        <Route path="/panel" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />

        <Route path="/ilanlar" element={
          <WithNavbar><Listings /></WithNavbar>
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
