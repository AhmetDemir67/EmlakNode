import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home   from './pages/Home';
import Login  from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ana Sayfa — Navbar + Home */}
        <Route path="/" element={
          <div className="min-h-screen bg-slate-50">
            <Navbar />
            <Home />
          </div>
        } />

        {/* Giriş Sayfası — Navbar yok, tam sayfa tasarım */}
        <Route path="/login" element={<Login />} />

        {/* TODO: İleride eklenecekler */}
        {/* <Route path="/kayit"     element={<Register />} /> */}
        {/* <Route path="/ilan/:id"  element={<ListingDetail />} /> */}
        {/* <Route path="/panel"     element={<Dashboard />} /> */}
        {/* <Route path="*"          element={<NotFound />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
