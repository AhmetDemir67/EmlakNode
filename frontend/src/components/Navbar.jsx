import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home, Menu, X, ChevronDown, LogOut,
  PlusCircle, FileText, MessageSquare, User, Bookmark,
  MapPin, Briefcase, Palmtree, Repeat2, Sun, Moon, Sparkles, Bell,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { okunmamisSayisi, okunmamisBildirimSayisi } from '../services/api';

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
            ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30'
            : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30'
        }`}
      >
        {label}
        <ChevronDown size={13} className={`transition-transform duration-200 ${acik ? 'rotate-180' : ''}`} />
      </button>

      {acik && (
        <div
          className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl z-[200] py-1.5 overflow-hidden"
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
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 transition-colors"
              >
                <Ikon size={15} className="text-blue-500 flex-shrink-0" />
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
  const { tema, toggle }            = useTheme();
  const [menuAcik, setMenuAcik]     = useState(false);
  const [kulAcik, setKulAcik]       = useState(false);
  const kulDropRef                  = useRef(null);

  const [mesajSayisi, setMesajSayisi]         = useState(0);
  const [bildirimSayisi, setBildirimSayisi]   = useState(0);

  const kullanici = (() => {
    try { return JSON.parse(localStorage.getItem('kullanici')) || null; }
    catch { return null; }
  })();

  const cikisYap = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('kullanici');
    setMesajSayisi(0);
    setBildirimSayisi(0);
    navigate('/');
  };

  useEffect(() => {
    const handler = (e) => {
      if (kulDropRef.current && !kulDropRef.current.contains(e.target)) setKulAcik(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!kullanici) return;
    const fetchSayilar = async () => {
      try {
        const [m, b] = await Promise.all([okunmamisSayisi(), okunmamisBildirimSayisi()]);
        setMesajSayisi(m.data.sayi || 0);
        setBildirimSayisi(b.data.sayi || 0);
      } catch { /* sessiz */ }
    };
    fetchSayilar();
    const interval = setInterval(fetchSayilar, 30000);
    return () => clearInterval(interval);
  }, [kullanici?.id]);

  const basTurkce = (str = '') =>
    str.split(' ').map(s => s.charAt(0).toUpperCase()).slice(0, 2).join('');

  return (
    <nav className="sticky top-0 z-50">

      {/* ── Duyuru Bandı ───────────────────────────────── */}
      <div className="bg-blue-700 dark:bg-blue-900 text-white text-center text-xs font-semibold py-2 px-4 tracking-wide">
        🏠 Doğru Evi Yanlış Yerde Arama · Türkiye'nin En Güncel Emlak Platformu&nbsp;
        <span className="underline underline-offset-2 cursor-pointer hover:text-blue-100 transition-colors">
          EmlakNode
        </span>
        &nbsp;ile Fırsatları Yakala!
      </div>

      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo ─────────────────────────────────── */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                <Home size={18} />
              </div>
              <span className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Emlak<span className="text-blue-600">Node</span>
              </span>
            </Link>

            {/* ── Desktop Nav ──────────────────────────── */}
            <div className="hidden md:flex items-center gap-0.5">
              <NavDropdown label="Satılık" secenekler={SATILIK_SECENEKLER} />
              <NavDropdown label="Kiralık" secenekler={KIRALIK_SECENEKLER} />
              <Link to="/degerleme"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all">
                <Sparkles size={13} /> Değerleme
              </Link>
              <a href="#"
                className="px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all">
                Emlak Haberleri
              </a>
            </div>

            {/* ── Desktop Sağ ──────────────────────────── */}
            <div className="hidden md:flex items-center gap-2">

              {/* ── Tema Toggle ── */}
              <button
                onClick={toggle}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={tema === 'dark' ? 'Aydınlık Mod' : 'Karanlık Mod'}
              >
                {tema === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {kullanici ? (
                <>
                  <div className="relative" ref={kulDropRef}>
                    <button
                      onClick={() => setKulAcik(!kulAcik)}
                      className={`flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-xl border transition-all ${
                        kulAcik
                          ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/30 text-blue-700'
                          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
                      }`}
                    >
                      <div className="relative w-7 h-7 flex-shrink-0">
                        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-extrabold">
                          {basTurkce(kullanici.ad_soyad)}
                        </div>
                        {(mesajSayisi + bildirimSayisi) > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center leading-none">
                            {(mesajSayisi + bildirimSayisi) > 9 ? '9+' : mesajSayisi + bildirimSayisi}
                          </span>
                        )}
                      </div>
                      <div className="text-left hidden lg:block">
                        <div className="text-xs font-bold leading-none">{kullanici.ad_soyad?.split(' ')[0]}</div>
                        <div className="text-[10px] text-gray-400 capitalize leading-none mt-0.5">{kullanici.rol}</div>
                      </div>
                      <ChevronDown size={14} className={`transition-transform ${kulAcik ? 'rotate-180' : ''}`} />
                    </button>

                    {kulAcik && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl z-50 overflow-hidden py-1">
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{kullanici.ad_soyad}</p>
                          <p className="text-xs text-gray-400 capitalize mt-0.5">{kullanici.eposta}</p>
                        </div>
                        <Link to="/panel?sekme=yeni" onClick={() => setKulAcik(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 transition-colors">
                          <PlusCircle size={15} className="text-blue-500" /> İlan Ver
                        </Link>
                        <Link to="/panel?sekme=ilanlar" onClick={() => setKulAcik(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 transition-colors">
                          <FileText size={15} className="text-blue-500" /> İlanlarım
                        </Link>
                        <Link to="/panel?sekme=aramalar" onClick={() => setKulAcik(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 transition-colors">
                          <Bookmark size={15} className="text-blue-500" /> Kayıtlı Aramalarım
                        </Link>
                        <Link to="/panel?sekme=mesajlar" onClick={() => setKulAcik(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 transition-colors">
                          <MessageSquare size={15} className="text-blue-500" />
                          <span className="flex-1">Mesajlarım</span>
                          {mesajSayisi > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">
                              {mesajSayisi > 9 ? '9+' : mesajSayisi}
                            </span>
                          )}
                        </Link>
                        <Link to="/panel?sekme=bildirimler" onClick={() => setKulAcik(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 transition-colors">
                          <Bell size={15} className="text-blue-500" />
                          <span className="flex-1">Bildirimler</span>
                          {bildirimSayisi > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">
                              {bildirimSayisi > 9 ? '9+' : bildirimSayisi}
                            </span>
                          )}
                        </Link>
                        <Link to="/panel?sekme=uyelik" onClick={() => setKulAcik(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 transition-colors">
                          <User size={15} className="text-blue-500" /> Üyelik
                        </Link>
                        <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                          <button onClick={cikisYap}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            <LogOut size={15} /> Çıkış Yap
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <Link to="/panel"
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 py-2 rounded-lg transition-colors shadow-sm">
                    <PlusCircle size={15} /> Ücretsiz İlan Ver
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login"
                    className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">
                    Giriş Yap
                  </Link>
                  <Link to="/kayit"
                    className="px-4 py-2 text-sm font-semibold border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-200 hover:border-blue-500 hover:text-blue-600 transition-all">
                    Kayıt Ol
                  </Link>
                  <Link to="/panel"
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 py-2 rounded-lg transition-colors shadow-sm">
                    <PlusCircle size={15} /> Ücretsiz İlan Ver
                  </Link>
                </>
              )}
            </div>

            {/* ── Mobil Sağ (tema + hamburger) ─────────── */}
            <div className="md:hidden flex items-center gap-1">
              <button
                onClick={toggle}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {tema === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setMenuAcik(!menuAcik)}
              >
                {menuAcik ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobil Menü ─────────────────────────────── */}
        {menuAcik && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 py-4 space-y-1">

            {/* Satılık alt öğeleri */}
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 pt-1 pb-0.5">Satılık</p>
            {SATILIK_SECENEKLER.map(s => {
              const Ikon = s.ikon;
              return (
                <button key={s.label}
                  onClick={() => { navigate(`/ilanlar?tip=${s.tip}&emlak_turu=${s.emlak_turu}`); setMenuAcik(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 transition-all">
                  <Ikon size={14} className="text-blue-500" /> {s.label}
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
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 transition-all">
                  <Ikon size={14} className="text-blue-500" /> {s.label}
                </button>
              );
            })}

            <div className="border-t border-gray-100 dark:border-gray-800 pt-3 mt-2 flex flex-col gap-1">
              {kullanici ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl mb-1">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                      {basTurkce(kullanici.ad_soyad)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{kullanici.ad_soyad}</p>
                      <p className="text-xs text-gray-400">{kullanici.eposta}</p>
                    </div>
                  </div>
                  <Link to="/panel?sekme=yeni" onClick={() => setMenuAcik(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600">
                    <PlusCircle size={14} className="text-blue-500" /> İlan Ver
                  </Link>
                  <Link to="/panel?sekme=ilanlar" onClick={() => setMenuAcik(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600">
                    <FileText size={14} className="text-blue-500" /> İlanlarım
                  </Link>
                  <Link to="/panel?sekme=mesajlar" onClick={() => setMenuAcik(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600">
                    <MessageSquare size={14} className="text-blue-500" />
                    <span className="flex-1">Mesajlarım</span>
                    {mesajSayisi > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">
                        {mesajSayisi > 9 ? '9+' : mesajSayisi}
                      </span>
                    )}
                  </Link>
                  <Link to="/panel?sekme=bildirimler" onClick={() => setMenuAcik(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600">
                    <Bell size={14} className="text-blue-500" />
                    <span className="flex-1">Bildirimler</span>
                    {bildirimSayisi > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">
                        {bildirimSayisi > 9 ? '9+' : bildirimSayisi}
                      </span>
                    )}
                  </Link>
                  <Link to="/panel?sekme=uyelik" onClick={() => setMenuAcik(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600">
                    <User size={14} className="text-blue-500" /> Üyelik
                  </Link>
                  <button onClick={() => { cikisYap(); setMenuAcik(false); }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-left">
                    <LogOut size={14} /> Çıkış Yap
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuAcik(false)}
                    className="text-center border border-gray-200 dark:border-gray-700 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Giriş Yap
                  </Link>
                  <Link to="/kayit" onClick={() => setMenuAcik(false)}
                    className="text-center border border-blue-300 py-2.5 rounded-xl text-sm font-semibold text-blue-600">
                    Kayıt Ol
                  </Link>
                  <Link to="/panel" onClick={() => setMenuAcik(false)}
                    className="text-center bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold">
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
