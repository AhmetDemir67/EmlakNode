import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar         from './components/Navbar';
import PrivateRoute   from './components/PrivateRoute';
import Home           from './pages/Home';
import Login          from './pages/Login';
import Dashboard      from './pages/Dashboard';
import ListingDetail  from './pages/ListingDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Herkese Açık ─────────────────────────────── */}
        <Route path="/" element={
          <div className="min-h-screen bg-slate-50">
            <Navbar />
            <Home />
          </div>
        } />

        <Route path="/login" element={<Login />} />

        {/* ── Korumalı Rotalar (Token Zorunlu) ─────────── */}
        <Route path="/panel" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />

        {/* ── İlan Detay (Herkese Açık) ──────────────────── */}
        <Route path="/ilan/:id" element={
          <div className="min-h-screen bg-slate-50">
            <Navbar />
            <ListingDetail />
          </div>
        } />

        {/* TODO: İleride eklenecekler */}
        {/* <Route path="/kayit" element={<Register />} /> */}
        {/* <Route path="*"      element={<NotFound />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
