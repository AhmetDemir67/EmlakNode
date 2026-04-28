import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home, Menu, X, ChevronDown, LogOut,
  LayoutDashboard, PlusCircle,
  Building, MapPin, Briefcase, Palmtree, Repeat2, Sun,
} from 'lucide-react';

// ── Dropdown verileri ────────────────────────────────────────────
const SATILIK_SECENEKLER = [
  { label: 'Konut',              ikon: Home,      tip: 'Satılık', emlak_turu: 'Daire'   },
  { label: 'Arsa',               ikon: MapPin,    tip: 'Satılık', emlak_turu: 'Arsa'    },
  { label: 'Kat Karşılığı Arsa', ikon: MapPin,    tip: 'Satılık', emlak_turu: 'Arsa'    },
  { label: 'İşyeri',             ikon: Briefcase, tip: 'Satılık', emlak_turu: 'İşyeri'  },
  { label: 'Devren İşyeri',      ikon: Repeat2,   tip: 'Satılık', emlak_turu: 'İşyeri'  },
  { label: 'Turistik Tesis',     ikon: Palmtree,  tip: 'Satılık', emlak_turu: 'Villa'   },
];

const KIRALIK_SECENEKLER = [
  { label: 'Konut',                ikon: Home,      tip: 'Kiralık', emlak_turu: 'Daire'  },
  { label: 'Günlük Kiralık Konut', ikon: Sun,       tip: 'Kiralık', emlak_turu: 'Daire'  },
  { label: 'Arsa',                 ikon: MapPin,    tip: 'Kiralık', emlak_turu: 'Arsa'   },
  { label: 'İşyeri',               ikon: Briefcase, tip: 'Kiralık', emlak_turu: 'İşyeri' },
  { label: 'Turistik Tesis',       ikon: Palmtree,  tip: 'Kiralık', emlak_turu: 'Villa'  },
];

// ── Dropdown nav öğesi ───────────────────────────────────────────
const NavDropdown = ({ label, secenekler }) => {
  const navigate  = useNavigate();
  const [acik, setAcik] = useState(false);
  const timerRef  = useRef(null);
  const wrapRef   = useRef(null);

  const ac    = () => { clearTimeout(timerRef.current); setAcik(true);  };
  const kapat = () => { timerRef.current = setTimeout(() => setAcik(false), 130); };

  const git = (s) => {
    const params = new URLSearchParams({ tip: s.tip });
    if (s.emlak_turu) params.set('emlak_turu', s.emlak_turu);
    navigate(`/ilanlar?${params.toString()}`);
    setAcik(false);
  };

  return (
    <div ref={wrapRef} className="relative" onMouseEnter={ac} onMouseLeave={kapat}>
      <button
        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
          acik
            ? 'text-green-600 bg-green-50'
            : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
        }`}
      >
        {label}
        <ChevronDown size={13} className={`transition-transform duration-200 ${acik ? 'rotate-180' : ''}`} />
      </button>

      {acik && (
        <div
          className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[200] py-1.5 overflow-hidden"
          style={{ minWidth: 200 }}
          onMouseEnter={ac}
          onMouseLeave={kapat}
        >
          {secenekler.map((s) => {
            const Ikon = s.ikon;
            return (
              <button
                key={s.label}
                onClick={() => git(s)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
              >
                <Ikon size={15} className="text-green-500 flex-shrink-0" />
                {s.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
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

  useEffect(() => {
    const handler = (e) => {
      if (kulDropRef.current && !kulDropRef.current.contains(e.target)) setKulAcik(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const basTurkce = (str = '') =>
    str.split(' ').map(s => s.charAt(0).toUpperCase()).slice(0, 2).join('');

  return (
    <nav className="sticky top-0 z-50">

      {/* ── Duyuru Bandı ───────────────────────────────── */}
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

            {/* ── Logo ─────────────────────────────────── */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="bg-green-600 text-white p-1.5 rounded-lg">
                <Home size={18} />
              </div>
              <span className="text-xl font-extrabold text-gray-900 tracking-tight">
                Emlak<span className="text-green-600">Node</span>
              </span>
            </Link>

            {/* ── Desktop Nav ──────────────────────────── */}
            <div className="hidden md:flex items-center gap-0.5">
              <NavDropdown label="Satılık" secenekler={SATILIK_SECENEKLER} />
              <NavDropdown label="Kiralık" secenekler={KIRALIK_SECENEKLER} />
              <a href="#"
                className="px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:text-green-600 hover:bg-green-50 transition-all">
                Projeler
              </a>
              <a href="#"
                className="px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:text-green-600 hover:bg-green-50 transition-all">
                Emlak Haberleri
              </a>
            </div>

            {/* ── Desktop Sağ ──────────────────────────── */}
            <div className="hidden md:flex items-center gap-2">
              {kullanici ? (
                <>
                  <Link to="/panel"
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all">
                    <LayoutDashboard size={15} /> Panel
                  </Link>

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
                        <Link to="/panel" onClick={() => setKulAcik(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors">
                          <LayoutDashboard size={15} /> Dashboard
                        </Link>
                        <Link to="/panel" onClick={() => setKulAcik(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors">
                          <PlusCircle size={15} /> İlan Ver
                        </Link>
                        <div className="border-t border-gray-50 mt-1 pt-1">
                          <button onClick={cikisYap}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                            <LogOut size={15} /> Çıkış Yap
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login"
                    className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-green-600 transition-colors">
                    Giriş Yap
                  </Link>
                  <Link to="/kayit"
                    className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg text-gray-700 hover:border-green-500 hover:text-green-600 transition-all">
                    Kayıt Ol
                  </Link>
                  <Link to="/panel"
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-4 py-2 rounded-lg transition-colors shadow-sm">
                    <PlusCircle size={15} /> Ücretsiz İlan Ver
                  </Link>
                </>
              )}
            </div>

            {/* ── Mobil Hamburger ──────────────────────── */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              onClick={() => setMenuAcik(!menuAcik)}
            >
              {menuAcik ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* ── Mobil Menü ─────────────────────────────── */}
        {menuAcik && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1">

            {/* Satılık alt öğeleri */}
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 pt-1 pb-0.5">Satılık</p>
            {SATILIK_SECENEKLER.map(s => {
              const Ikon = s.ikon;
              return (
                <button key={s.label}
                  onClick={() => { navigate(`/ilanlar?tip=${s.tip}&emlak_turu=${s.emlak_turu}`); setMenuAcik(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-green-50 hover:text-green-600 transition-all">
                  <Ikon size={14} className="text-green-500" /> {s.label}
                </button>
              );
            })}

            {/* Kiralık alt öğeleri */}
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 pt-3 pb-0.5">Kiralık</p>
            {KIRALIK_SECENEKLER.map(s => {
              const Ikon = s.ikon;
              return (
                <button key={s.label + '_k'}
                  onClick={() => { navigate(`/ilanlar?tip=${s.tip}&emlak_turu=${s.emlak_turu}`); setMenuAcik(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-green-50 hover:text-green-600 transition-all">
                  <Ikon size={14} className="text-green-500" /> {s.label}
                </button>
              );
            })}

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
                    Ücretsiz İlan Ver
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
