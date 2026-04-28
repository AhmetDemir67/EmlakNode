import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home, Menu, X, ChevronDown, LogOut,
  LayoutDashboard, User, PlusCircle,
} from 'lucide-react';

const NAV_LINKLERI = [
  { href: '/?tip=Satılık', label: 'Satılık' },
  { href: '/?tip=Kiralık', label: 'Kiralık' },
  { href: '#',             label: 'Projeler' },
  { href: '#',             label: 'Değerleme' },
];

const Navbar = () => {
  const navigate                    = useNavigate();
  const [menuAcik, setMenuAcik]     = useState(false);
  const [kulAcik, setKulAcik]       = useState(false);
  const kulDropRef                  = useRef(null);

  const kullanici = (() => {
    try { return JSON.parse(localStorage.getItem('kullanici')) || null; }
    catch { return null; }
  })();

  const cikisYap = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('kullanici');
    navigate('/');
  };

  // Dropdown dışı tıklama kapatma
  useEffect(() => {
    const handler = (e) => {
      if (kulDropRef.current && !kulDropRef.current.contains(e.target)) {
        setKulAcik(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const basTurkce = (str = '') =>
    str.split(' ').map(s => s.charAt(0).toUpperCase()).slice(0, 2).join('');

  return (
    <nav className="sticky top-0 z-50">
      {/* ── Duyuru Bandı ──────────────────────────────── */}
      <div className="bg-green-700 text-white text-center text-xs font-semibold py-2 px-4 tracking-wide">
        🏠 Doğru Evi Yanlış Yerde Arama · Türkiye'nin En Güncel Emlak Platformu&nbsp;
        <span className="underline underline-offset-2 cursor-pointer hover:text-green-100 transition-colors">
          EmlakNode
        </span>
        &nbsp;ile Fırsatları Yakala!
      </div>

    <div className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ──────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="bg-green-600 text-white p-1.5 rounded-lg">
              <Home size={18} />
            </div>
            <span className="text-xl font-extrabold text-gray-900 tracking-tight">
              Emlak<span className="text-green-600">Node</span>
            </span>
          </Link>

          {/* ── Desktop Nav ───────────────────────────── */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKLERI.map(link => (
              <a
                key={link.label}
                href={link.href}
                className="px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:text-green-600 hover:bg-green-50 transition-all"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* ── Desktop Sağ ───────────────────────────── */}
          <div className="hidden md:flex items-center gap-2">
            {kullanici ? (
              <>
                {/* Panel linki */}
                <Link
                  to="/panel"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                >
                  <LayoutDashboard size={15} />
                  Panel
                </Link>

                {/* Kullanıcı dropdown */}
                <div className="relative" ref={kulDropRef}>
                  <button
                    onClick={() => setKulAcik(!kulAcik)}
                    className={`flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-xl border transition-all ${
                      kulAcik
                        ? 'border-green-400 bg-green-50 text-green-700'
                        : 'border-gray-200 text-gray-700 hover:border-green-400 hover:bg-green-50/50'
                    }`}
                  >
                    <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center text-white text-xs font-extrabold">
                      {basTurkce(kullanici.ad_soyad)}
                    </div>
                    <div className="text-left hidden lg:block">
                      <div className="text-xs font-bold leading-none">{kullanici.ad_soyad?.split(' ')[0]}</div>
                      <div className="text-[10px] text-gray-400 capitalize leading-none mt-0.5">{kullanici.rol}</div>
                    </div>
                    <ChevronDown size={14} className={`transition-transform ${kulAcik ? 'rotate-180' : ''}`} />
                  </button>

                  {kulAcik && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden py-1">
                      <div className="px-4 py-3 border-b border-gray-50">
                        <p className="text-sm font-bold text-gray-900">{kullanici.ad_soyad}</p>
                        <p className="text-xs text-gray-400 capitalize mt-0.5">{kullanici.rol}</p>
                      </div>
                      <Link
                        to="/panel"
                        onClick={() => setKulAcik(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                      >
                        <LayoutDashboard size={15} />
                        Dashboard
                      </Link>
                      <Link
                        to="/panel"
                        onClick={() => setKulAcik(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                      >
                        <PlusCircle size={15} />
                        İlan Ver
                      </Link>
                      <div className="border-t border-gray-50 mt-1 pt-1">
                        <button
                          onClick={cikisYap}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={15} />
                          Çıkış Yap
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-green-600 transition-colors"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/kayit"
                  className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg text-gray-700 hover:border-green-500 hover:text-green-600 transition-all"
                >
                  Kayıt Ol
                </Link>
                <Link
                  to="/panel"
                  className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  <PlusCircle size={15} />
                  İlan Ver
                </Link>
              </>
            )}
          </div>

          {/* ── Mobil Hamburger ───────────────────────── */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            onClick={() => setMenuAcik(!menuAcik)}
          >
            {menuAcik ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── Mobil Menü ────────────────────────────────── */}
      {menuAcik && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1">
          {NAV_LINKLERI.map(link => (
            <a
              key={link.label}
              href={link.href}
              className="flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-green-50 hover:text-green-600 transition-all"
              onClick={() => setMenuAcik(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="border-t border-gray-100 pt-3 mt-2 flex flex-col gap-2">
            {kullanici ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2 bg-green-50 rounded-xl">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                    {basTurkce(kullanici.ad_soyad)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{kullanici.ad_soyad}</p>
                    <p className="text-xs text-gray-400 capitalize">{kullanici.rol}</p>
                  </div>
                </div>
                <Link to="/panel" onClick={() => setMenuAcik(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100">
                  <LayoutDashboard size={15} /> Dashboard
                </Link>
                <button onClick={() => { cikisYap(); setMenuAcik(false); }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 text-left">
                  <LogOut size={15} /> Çıkış Yap
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuAcik(false)}
                  className="text-center border border-gray-200 py-2.5 rounded-xl text-sm font-semibold text-gray-700">
                  Giriş Yap
                </Link>
                <Link to="/kayit" onClick={() => setMenuAcik(false)}
                  className="text-center border border-green-300 py-2.5 rounded-xl text-sm font-semibold text-green-600">
                  Kayıt Ol
                </Link>
                <Link to="/panel" onClick={() => setMenuAcik(false)}
                  className="text-center bg-green-600 text-white py-2.5 rounded-xl text-sm font-bold">
                  İlan Ver
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
    </nav>
  );
};

export default Navbar;
