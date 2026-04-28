import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Home, Plus, LogOut, User, Loader2, CheckCircle2, AlertCircle, X,
  Eye, Trash2, Pencil, ChevronRight, ChevronLeft, Building2, FileText,
  MapPin, BedDouble, Square, Bath, Layers, ChevronDown, MessageSquare,
  Bookmark, Heart, UserCircle, LayoutGrid, PlusCircle, TrendingUp,
  Clock, CheckCircle, PauseCircle, Menu,
} from 'lucide-react';
import {
  ilanEkle, ilanGuncelle, ilanSil, benimIlanlarim,
  kullaniciilanlarim, ilanDurumGuncelle,
} from '../services/api';
import { ILLER, ILCELER } from '../data/turkiyeAdresler';

const kullaniciBilgi = () => { try { return JSON.parse(localStorage.getItem('kullanici')) || {}; } catch { return {}; } };

const BOSLUK = {
  tip: 'Satılık', emlak_turu: 'Daire', baslik: '', aciklama: '',
  fiyat: '', metrekare: '', oda_sayisi: '', bina_yasi: '', kat: '', toplam_kat: '',
  isinma_tipi: '', banyo_sayisi: '', balkon: false, asansor: false, otopark: false,
  esyali: false, site_icerisinde: false, sehir: '', ilce: '', mahalle: '', gorsel: '',
};
const ADIMLAR = ['İlan Tipi', 'Özellikler', 'Konum & Fiyat'];

const fiyatFormat = (f) => f
  ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(f)
  : '—';

// ── Form bileşenleri ─────────────────────────────────────────────
const Inp = ({ label, name, type = 'text', value, onChange, placeholder, zorunlu }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 mb-1">
      {label}{zorunlu && <span className="text-red-400"> *</span>}
    </label>
    <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all" />
  </div>
);

const Sel = ({ label, name, value, onChange, opts }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
    <select name={name} value={value} onChange={onChange}
      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 bg-white transition-all">
      <option value="">Seçin</option>
      {opts.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const Toggle = ({ label, name, value, onChange }) => (
  <button type="button"
    onClick={() => onChange({ target: { name, value: !value, type: 'checkbox', checked: !value } })}
    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
      value ? 'bg-green-600 border-green-600 text-white shadow-sm' : 'border-gray-200 text-gray-500 hover:border-green-400 hover:text-green-600'
    }`}
  >
    <span className={`w-3 h-3 rounded-full flex-shrink-0 ${value ? 'bg-white' : 'bg-gray-300'}`} />
    {label}
  </button>
);

const AramaDropdown = ({ label, value, secenekler, onChange, disabled }) => {
  const [acik, setAcik]   = useState(false);
  const [arama, setArama] = useState('');
  const ref               = useRef(null);

  useEffect(() => {
    const h = (e) => { if (!ref.current?.contains(e.target)) setAcik(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filtrelenmis = secenekler.filter(s => s.toLowerCase().includes(arama.toLowerCase()));

  return (
    <div className="relative" ref={ref}>
      <button type="button" disabled={disabled}
        onClick={() => { if (!disabled) { setAcik(!acik); setArama(''); } }}
        className={`w-full flex items-center justify-between px-3 py-2.5 border rounded-xl text-sm transition-all ${
          disabled ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
          : acik ? 'border-green-500 bg-white ring-2 ring-green-100 text-gray-700'
          : 'border-gray-200 bg-white text-gray-700 hover:border-green-400'
        }`}
      >
        <span className={value ? 'text-gray-800 font-medium' : 'text-gray-400'}>{value || label}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${acik ? 'rotate-180' : ''}`} />
      </button>
      {acik && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input type="text" value={arama} onChange={e => setArama(e.target.value)}
              placeholder={`${label} ara...`}
              className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-green-400" autoFocus />
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            {filtrelenmis.length === 0
              ? <p className="text-xs text-gray-400 text-center py-3">Sonuç bulunamadı</p>
              : filtrelenmis.map(s => (
                <button key={s} type="button" onClick={() => { onChange(s); setAcik(false); setArama(''); }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${value === s ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
                  {s}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Sidebar nav öğesi ────────────────────────────────────────────
const NavItem = ({ id, icon: Icon, label, aktif, onClick, sub = false, badge }) => (
  <button onClick={() => onClick(id)}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
      sub ? 'pl-8' : ''
    } ${
      aktif
        ? 'bg-green-600 text-white shadow-sm'
        : 'text-slate-300 hover:bg-white/10 hover:text-white'
    }`}
  >
    <Icon size={sub ? 14 : 16} className="flex-shrink-0" />
    <span className="flex-1 text-left">{label}</span>
    {badge != null && (
      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${aktif ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-300'}`}>
        {badge}
      </span>
    )}
  </button>
);

// ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate     = useNavigate();
  const [searchParams] = useSearchParams();
  const kullanici    = kullaniciBilgi();

  const basTurkce = (str = '') =>
    str.split(' ').map(s => s.charAt(0).toUpperCase()).slice(0, 2).join('');

  // URL'den başlangıç sekmesi oku
  const urlSekme = searchParams.get('sekme');
  const [menu, setMenu]             = useState(urlSekme || 'anasayfa');
  const [sidebarAcik, setSidebar]   = useState(false);
  const [adim, setAdim]             = useState(0);
  const [form, setForm]             = useState(BOSLUK);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [mesaj, setMesaj]           = useState(null);
  const [hata, setHata]             = useState(null);
  const [limitAsimi, setLimitAsimi] = useState(false);
  const [ilanlar, setIlanlar]       = useState([]);
  const [listeleniyor, setListeleniyor] = useState(false);
  const [duzenle, setDuzenle]       = useState(null);

  const cikis = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('kullanici');
    navigate('/login');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => {
      const yeni = { ...f, [name]: type === 'checkbox' ? (checked ?? value) : value };
      if (name === 'sehir') yeni.ilce = '';
      return yeni;
    });
    setHata(null);
  };

  // İlanları çek
  const ilanlarıGetir = async () => {
    setListeleniyor(true);
    try {
      const r = kullanici.dukkan_id
        ? await benimIlanlarim(kullanici.dukkan_id)
        : await kullaniciilanlarim(kullanici.id);
      setIlanlar(r.data.ilanlar || []);
    } catch {
      setIlanlar([]);
    } finally {
      setListeleniyor(false);
    }
  };

  useEffect(() => {
    if (['anasayfa', 'ilanlar', 'ilanlar-aktif', 'ilanlar-pasif'].includes(menu)) {
      ilanlarıGetir();
    }
  }, [menu]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.baslik || !form.fiyat || !form.metrekare) {
      setHata('Başlık, fiyat ve metrekare zorunludur.'); return;
    }
    try {
      setYukleniyor(true); setHata(null); setLimitAsimi(false);
      if (duzenle) {
        await ilanGuncelle(duzenle.id, form);
        setMesaj('İlan başarıyla güncellendi!'); setDuzenle(null);
      } else {
        const r = await ilanEkle(form);
        setMesaj(`"${r.data.ilan.baslik}" yayınlandı!`);
      }
      setForm(BOSLUK); setAdim(0); setMenu('ilanlar');
    } catch (err) {
      if (err.response?.data?.limit_asimi) setLimitAsimi(true);
      else setHata(err.response?.data?.mesaj || 'Bir hata oluştu.');
    } finally { setYukleniyor(false); }
  };

  const sil = async (id, baslik) => {
    if (!confirm(`"${baslik}" ilanını silmek istiyor musunuz?`)) return;
    try {
      await ilanSil(id);
      setIlanlar(p => p.filter(i => i.id !== id));
      setMesaj('İlan silindi.');
    } catch { setHata('Silme başarısız.'); }
  };

  const durumDegistir = async (id, yeniDurum) => {
    try {
      await ilanDurumGuncelle(id, yeniDurum);
      setIlanlar(p => p.map(i => i.id === id ? { ...i, durum: yeniDurum } : i));
    } catch { setHata('Durum güncellenemedi.'); }
  };

  const duzenleBaslat = (ilan) => {
    setDuzenle(ilan);
    setForm({ ...BOSLUK, ...ilan, balkon: !!ilan.balkon, asansor: !!ilan.asansor, otopark: !!ilan.otopark, esyali: !!ilan.esyali, site_icerisinde: !!ilan.site_icerisinde });
    setAdim(0); setMenu('yeni'); setDuzenle(ilan);
  };

  const menuDegistir = (id) => {
    setMenu(id); setDuzenle(null); setMesaj(null); setHata(null);
    setLimitAsimi(false); setSidebar(false);
  };

  // Filtreli ilanlar
  const aktifIlanlar = ilanlar.filter(i => !i.durum || i.durum === 'aktif');
  const pasifIlanlar = ilanlar.filter(i => i.durum && i.durum !== 'aktif');

  const goruntulenenIlanlar =
    menu === 'ilanlar-aktif' ? aktifIlanlar :
    menu === 'ilanlar-pasif' ? pasifIlanlar :
    ilanlar;

  // Başlık
  const baslikMap = {
    anasayfa: 'Anasayfa',
    ilanlar: 'İlanlarım',
    'ilanlar-aktif': 'Aktif İlanlar',
    'ilanlar-pasif': 'Pasif İlanlar',
    yeni: duzenle ? 'İlan Düzenle' : 'İlan Ver',
    mesajlar: 'Mesajlarım',
    aramalar: 'Kayıtlı Aramalarım',
    favoriler: 'Favori İlanlarım',
    uyelik: 'Üyelik Bilgileri',
  };

  // ── Sidebar ──────────────────────────────────────────────────
  const Sidebar = () => (
    <aside className="w-64 flex-shrink-0 bg-slate-800 flex flex-col h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-slate-700">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-green-600 p-1.5 rounded-lg"><Home size={16} className="text-white" /></div>
          <span className="text-base font-bold text-white">Emlak<span className="text-green-400">Node</span></span>
        </Link>
      </div>

      {/* Kullanıcı */}
      <div className="px-4 py-4 border-b border-slate-700 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0">
          {basTurkce(kullanici.ad_soyad)}
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-bold text-white truncate">{kullanici.ad_soyad || 'Kullanıcı'}</p>
          <p className="text-xs text-slate-400 capitalize">{kullanici.rol || 'bireysel'}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <NavItem id="anasayfa" icon={LayoutGrid} label="Anasayfa" aktif={menu === 'anasayfa'} onClick={menuDegistir} />

        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 pt-4 pb-1">İlanlarım</p>
        <NavItem id="ilanlar" icon={FileText} label="Tüm İlanlar" aktif={menu === 'ilanlar'} onClick={menuDegistir} badge={ilanlar.length || null} />
        <NavItem id="ilanlar-aktif" icon={CheckCircle} label="Aktif İlanlar" aktif={menu === 'ilanlar-aktif'} onClick={menuDegistir} sub badge={aktifIlanlar.length || null} />
        <NavItem id="ilanlar-pasif" icon={PauseCircle} label="Pasif İlanlar" aktif={menu === 'ilanlar-pasif'} onClick={menuDegistir} sub badge={pasifIlanlar.length || null} />

        <div className="pt-1">
          <NavItem id="yeni" icon={PlusCircle} label={duzenle ? 'İlan Düzenle' : 'İlan Ver'} aktif={menu === 'yeni'} onClick={menuDegistir} />
        </div>

        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 pt-4 pb-1">Hesabım</p>
        <NavItem id="mesajlar"  icon={MessageSquare} label="Mesajlarım"         aktif={menu === 'mesajlar'}  onClick={menuDegistir} />
        <NavItem id="aramalar"  icon={Bookmark}      label="Kayıtlı Aramalarım" aktif={menu === 'aramalar'}  onClick={menuDegistir} />
        <NavItem id="favoriler" icon={Heart}          label="Favori İlanlarım"   aktif={menu === 'favoriler'} onClick={menuDegistir} />
        <NavItem id="uyelik"    icon={UserCircle}     label="Üyelik"             aktif={menu === 'uyelik'}    onClick={menuDegistir} />
      </nav>

      <div className="px-3 pb-4 border-t border-slate-700 pt-3">
        <Link to="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/10 hover:text-white transition-all">
          <Eye size={16} /> Siteye Dön
        </Link>
        <button onClick={cikis} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut size={16} /> Çıkış Yap
        </button>
      </div>
    </aside>
  );

  // ── Uyarı kutuları ───────────────────────────────────────────
  const Uyarilar = () => (
    <div className="space-y-3 mb-6">
      {mesaj && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
          <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
          <p className="text-green-800 text-sm font-medium flex-1">{mesaj}</p>
          <button onClick={() => setMesaj(null)}><X size={15} className="text-green-400" /></button>
        </div>
      )}
      {hata && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
          <p className="text-red-700 text-sm flex-1">{hata}</p>
          <button onClick={() => setHata(null)}><X size={15} className="text-red-400" /></button>
        </div>
      )}
      {limitAsimi && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertCircle size={20} className="text-amber-500" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-amber-800 mb-1">İlan Limitine Ulaştınız</p>
            <p className="text-sm text-amber-700 mb-3">
              Bireysel hesaplar en fazla <strong>3 ilan</strong> ekleyebilir. Daha fazla ilan vermek için kurumsal hesap açmanız gerekmektedir.
            </p>
            <Link to="/kayit" state={{ tab: 'kurumsal' }}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors">
              Kurumsal Hesap Aç
            </Link>
          </div>
          <button onClick={() => setLimitAsimi(false)} className="text-amber-400 hover:text-amber-600">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );

  // ── İlan kartı (liste görünümü) ──────────────────────────────
  const IlanKarti = ({ ilan }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex hover:shadow-md transition-all">
      <div className="w-32 h-28 flex-shrink-0 bg-slate-100 relative">
        {ilan.gorsel
          ? <img src={ilan.gorsel} alt={ilan.baslik} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center"><Building2 size={28} className="text-slate-300" /></div>}
        <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${ilan.tip === 'Kiralık' ? 'bg-blue-500' : 'bg-green-600'}`}>
          {ilan.tip || 'Satılık'}
        </span>
      </div>
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        <div>
          <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{ilan.baslik}</h3>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <MapPin size={11} className="text-green-500" />
            {[ilan.mahalle, ilan.ilce, ilan.sehir].filter(Boolean).join(', ') || '—'}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500 mt-2 flex-wrap">
          {ilan.oda_sayisi && <span className="flex items-center gap-1"><BedDouble size={11} className="text-green-500" />{ilan.oda_sayisi}</span>}
          {ilan.metrekare  && <span className="flex items-center gap-1"><Square    size={11} className="text-green-500" />{ilan.metrekare} m²</span>}
          {ilan.banyo_sayisi && <span className="flex items-center gap-1"><Bath   size={11} className="text-green-500" />{ilan.banyo_sayisi} banyo</span>}
          {ilan.kat        && <span className="flex items-center gap-1"><Layers   size={11} className="text-green-500" />{ilan.kat}. kat</span>}
        </div>
      </div>
      <div className="flex flex-col items-end justify-between p-4 border-l border-gray-100 min-w-[160px]">
        <div className="text-right">
          <p className="text-base font-extrabold text-green-600 leading-none">{fiyatFormat(ilan.fiyat)}</p>
          <p className="text-xs text-gray-400 mt-1">{ilan.emlak_turu || 'Daire'}</p>
        </div>
        <select value={ilan.durum || 'aktif'} onChange={e => durumDegistir(ilan.id, e.target.value)}
          className={`mt-2 text-xs font-bold px-2.5 py-1.5 rounded-lg border cursor-pointer focus:outline-none transition-all ${
            ilan.durum === 'pasif'     ? 'bg-gray-100 text-gray-500 border-gray-200'
            : ilan.durum === 'satildi'  ? 'bg-red-50 text-red-600 border-red-200'
            : ilan.durum === 'kiralandı'? 'bg-blue-50 text-blue-600 border-blue-200'
            :                            'bg-green-50 text-green-700 border-green-200'
          }`}
        >
          <option value="aktif">✅ Aktif</option>
          <option value="pasif">⏸ Pasif</option>
          <option value="satildi">🏷 Satıldı</option>
          <option value="kiralandı">🔑 Kiralandı</option>
        </select>
        <div className="flex gap-1.5 mt-2">
          <Link to={`/ilan/${ilan.id}`}
            className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-blue-500 hover:border-blue-200 transition-all"><Eye size={14} /></Link>
          <button onClick={() => duzenleBaslat(ilan)}
            className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-green-600 hover:border-green-300 transition-all"><Pencil size={14} /></button>
          <button onClick={() => sil(ilan.id, ilan.baslik)}
            className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-all"><Trash2 size={14} /></button>
        </div>
      </div>
    </div>
  );

  // ── ANASAYFA ─────────────────────────────────────────────────
  const Anasayfa = () => (
    <div className="space-y-6">
      {/* Karşılama */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-6 text-white">
        <p className="text-green-100 text-sm mb-1">Hoş geldiniz 👋</p>
        <h2 className="text-2xl font-extrabold">{kullanici.ad_soyad}</h2>
        <p className="text-green-200 text-sm mt-1 capitalize">{kullanici.rol || 'Bireysel'} Hesap · {kullanici.eposta}</p>
      </div>

      {/* Stat kartları */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Toplam İlan',  value: ilanlar.length,        icon: FileText,   renk: 'bg-blue-50 text-blue-600' },
          { label: 'Aktif İlan',   value: aktifIlanlar.length,   icon: CheckCircle, renk: 'bg-green-50 text-green-600' },
          { label: 'Pasif İlan',   value: pasifIlanlar.length,   icon: PauseCircle, renk: 'bg-gray-50 text-gray-500' },
          { label: 'İlan Hakkı',
            value: kullanici.dukkan_id ? '∞' : `${ilanlar.length}/3`,
            icon: TrendingUp, renk: 'bg-amber-50 text-amber-500' },
        ].map(({ label, value, icon: Icon, renk }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${renk}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-gray-900">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Son ilanlar */}
      {ilanlar.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2"><Clock size={15} className="text-green-500" /> Son İlanlar</h3>
            <button onClick={() => menuDegistir('ilanlar')} className="text-xs text-green-600 font-semibold hover:underline">Tümünü Gör</button>
          </div>
          <div className="divide-y divide-gray-50">
            {ilanlar.slice(0, 3).map(ilan => (
              <div key={ilan.id} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                  {ilan.gorsel
                    ? <img src={ilan.gorsel} alt="" className="w-full h-full object-cover" />
                    : <Building2 size={18} className="text-slate-300 m-auto mt-2.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{ilan.baslik}</p>
                  <p className="text-xs text-gray-400">{ilan.sehir} · {ilan.emlak_turu}</p>
                </div>
                <p className="text-sm font-bold text-green-600 flex-shrink-0">{fiyatFormat(ilan.fiyat)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bireysel kullanıcı için ilan hakkı bilgisi */}
      {!kullanici.dukkan_id && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-4">
          <AlertCircle size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-blue-800 text-sm mb-1">Bireysel İlan Hakkınız: {ilanlar.length}/3</p>
            <p className="text-xs text-blue-600">
              Daha fazla ilan vermek için kurumsal hesap açabilirsiniz.{' '}
              <Link to="/kayit" state={{ tab: 'kurumsal' }} className="font-bold underline">Kurumsal Kayıt Ol →</Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );

  // ── İLAN LİSTESİ ────────────────────────────────────────────
  const IlanListesi = ({ liste }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{liste.length} ilan</p>
        <button onClick={() => menuDegistir('yeni')}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-sm">
          <Plus size={15} /> Yeni İlan
        </button>
      </div>
      {listeleniyor
        ? <div className="flex justify-center py-16"><Loader2 size={28} className="text-green-500 animate-spin" /></div>
        : liste.length === 0
          ? (
            <div className="bg-white rounded-2xl p-14 text-center border border-gray-100 shadow-sm">
              <FileText size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="font-semibold text-gray-500">Henüz ilan yok</p>
              <button onClick={() => menuDegistir('yeni')}
                className="mt-4 px-5 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all">
                İlk İlanı Ekle
              </button>
            </div>
          )
          : liste.map(ilan => <IlanKarti key={ilan.id} ilan={ilan} />)
      }
    </div>
  );

  // ── Placeholder sayfalar ─────────────────────────────────────
  const Placeholder = ({ icon: Icon, baslik, aciklama }) => (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center mb-5">
        <Icon size={36} className="text-green-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-700 mb-2">{baslik}</h3>
      <p className="text-sm text-gray-400 max-w-xs">{aciklama}</p>
      <span className="mt-4 inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full">Yakında</span>
    </div>
  );

  // ── Üyelik ───────────────────────────────────────────────────
  const Uyelik = () => (
    <div className="max-w-lg space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-700 to-slate-600 px-6 py-8 flex items-center gap-5">
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold">
            {basTurkce(kullanici.ad_soyad)}
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white">{kullanici.ad_soyad}</h3>
            <p className="text-slate-300 text-sm mt-1 capitalize">{kullanici.rol} Hesap</p>
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {[
            { label: 'Ad Soyad', value: kullanici.ad_soyad },
            { label: 'E-posta',  value: kullanici.eposta },
            { label: 'Hesap Tipi', value: kullanici.dukkan_id ? 'Kurumsal (Patron)' : 'Bireysel' },
            { label: 'Toplam İlan', value: `${ilanlar.length} ilan` },
          ].map(({ label, value }) => (
            <div key={label} className="px-6 py-4 flex items-center justify-between">
              <span className="text-sm text-gray-400 font-medium">{label}</span>
              <span className="text-sm font-semibold text-gray-800">{value || '—'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── İLAN FORMU ───────────────────────────────────────────────
  const IlanFormu = () => (
    <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 space-y-6">

        {adim === 0 && (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">İlan Tipi</p>
              <div className="flex gap-3">
                {['Satılık', 'Kiralık'].map(t => (
                  <button key={t} type="button" onClick={() => setForm(f => ({ ...f, tip: t }))}
                    className={`flex-1 py-4 rounded-xl font-bold text-sm border-2 transition-all ${form.tip === t ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:border-green-400'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Emlak Türü</p>
              <div className="grid grid-cols-3 gap-3">
                {['Daire', 'Villa', 'Müstakil Ev', 'Arsa', 'İşyeri', 'Depo'].map(t => (
                  <button key={t} type="button" onClick={() => setForm(f => ({ ...f, emlak_turu: t }))}
                    className={`py-3 px-4 rounded-xl font-semibold text-sm border-2 transition-all flex items-center justify-center gap-2 ${form.emlak_turu === t ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:border-green-400'}`}>
                    <Building2 size={15} />{t}
                  </button>
                ))}
              </div>
            </div>
            <Inp label="İlan Başlığı" name="baslik" value={form.baslik} onChange={handleChange} placeholder="Örn: Kadıköy'de Deniz Manzaralı 3+1 Daire" zorunlu />
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Açıklama</label>
              <textarea name="aciklama" value={form.aciklama} onChange={handleChange} rows={4}
                placeholder="İlan hakkında detaylı bilgi girin…"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 resize-none transition-all" />
            </div>
          </div>
        )}

        {adim === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Sel label="Oda Sayısı" name="oda_sayisi" value={form.oda_sayisi} onChange={handleChange} opts={['Stüdyo','1+1','2+1','3+1','4+1','5+1','6+1','7+']} />
              <Inp label="Metrekare (m²)" name="metrekare" type="number" value={form.metrekare} onChange={handleChange} placeholder="120" zorunlu />
              <Inp label="Bina Yaşı" name="bina_yasi" type="number" value={form.bina_yasi} onChange={handleChange} placeholder="0 = Sıfır" />
              <Inp label="Bulunduğu Kat" name="kat" type="number" value={form.kat} onChange={handleChange} placeholder="3" />
              <Inp label="Toplam Kat" name="toplam_kat" type="number" value={form.toplam_kat} onChange={handleChange} placeholder="8" />
              <Inp label="Banyo Sayısı" name="banyo_sayisi" type="number" value={form.banyo_sayisi} onChange={handleChange} placeholder="1" />
              <Sel label="Isıtma" name="isinma_tipi" value={form.isinma_tipi} onChange={handleChange} opts={['Kombi','Doğalgaz','Merkezi','Klima','Soba','Yok']} />
              <Inp label="Görsel URL" name="gorsel" value={form.gorsel} onChange={handleChange} placeholder="https://..." />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Özellikler</p>
              <div className="flex flex-wrap gap-2">
                {[['balkon','Balkon'],['asansor','Asansör'],['otopark','Otopark'],['esyali','Eşyalı'],['site_icerisinde','Site İçinde']].map(([n, l]) => (
                  <Toggle key={n} name={n} label={l} value={form[n]} onChange={handleChange} />
                ))}
              </div>
            </div>
          </div>
        )}

        {adim === 2 && (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Konum</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Şehir</label>
                  <AramaDropdown label="Şehir seçin" value={form.sehir} secenekler={ILLER}
                    onChange={v => handleChange({ target: { name: 'sehir', value: v } })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">İlçe</label>
                  <AramaDropdown label={form.sehir ? 'İlçe seçin' : 'Önce şehir'}
                    value={form.ilce} secenekler={form.sehir ? (ILCELER[form.sehir] || []) : []}
                    onChange={v => handleChange({ target: { name: 'ilce', value: v } })} disabled={!form.sehir} />
                </div>
                <Inp label="Mahalle" name="mahalle" value={form.mahalle} onChange={handleChange} placeholder="Mahalle adı" />
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Fiyat</p>
              <Inp label="Fiyat (₺)" name="fiyat" type="number" value={form.fiyat} onChange={handleChange} placeholder="4500000" zorunlu />
              {form.fiyat && <p className="text-sm font-bold text-green-600 mt-2">{fiyatFormat(form.fiyat)}</p>}
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">İlan Özeti</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600"><Building2 size={14} className="text-green-500" />{form.emlak_turu} · {form.tip}</div>
                {form.oda_sayisi && <div className="flex items-center gap-2 text-gray-600"><BedDouble size={14} className="text-green-500" />{form.oda_sayisi}</div>}
                {form.metrekare  && <div className="flex items-center gap-2 text-gray-600"><Square    size={14} className="text-green-500" />{form.metrekare} m²</div>}
                {form.sehir      && <div className="flex items-center gap-2 text-gray-600"><MapPin    size={14} className="text-green-500" />{form.ilce && form.ilce + ', '}{form.sehir}</div>}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
        <button type="button" onClick={() => adim > 0 && setAdim(a => a - 1)} disabled={adim === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-all">
          <ChevronLeft size={16} />Geri
        </button>
        {adim < 2
          ? <button type="button" onClick={() => setAdim(a => a + 1)}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold shadow-md transition-all">
              İleri<ChevronRight size={16} />
            </button>
          : <button type="submit" disabled={yukleniyor}
              className="flex items-center gap-2 px-8 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-xl text-sm font-bold shadow-md transition-all">
              {yukleniyor ? <><Loader2 size={15} className="animate-spin" />Kaydediliyor…</> : <><CheckCircle2 size={15} />{duzenle ? 'Güncelle' : 'Yayınla'}</>}
            </button>
        }
      </div>
    </form>
  );

  // ── RENDER ───────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobil Sidebar Overlay */}
      {sidebarAcik && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebar(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Topbar */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors" onClick={() => setSidebar(true)}>
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-base font-extrabold text-gray-900">{baslikMap[menu]}</h1>
              {menu === 'yeni' && (
                <div className="flex gap-1.5 mt-1">
                  {ADIMLAR.map((a, i) => (
                    <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${i === adim ? 'bg-green-600 text-white' : i < adim ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                      {i + 1}. {a}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          {menu !== 'yeni' && (
            <button onClick={() => menuDegistir('yeni')}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors shadow-sm">
              <PlusCircle size={15} /> İlan Ver
            </button>
          )}
        </div>

        {/* İçerik */}
        <div className="p-6 max-w-4xl">
          <Uyarilar />
          {menu === 'anasayfa'      && <Anasayfa />}
          {(menu === 'ilanlar' || menu === 'ilanlar-aktif' || menu === 'ilanlar-pasif') && <IlanListesi liste={goruntulenenIlanlar} />}
          {menu === 'yeni'          && <IlanFormu />}
          {menu === 'mesajlar'      && <Placeholder icon={MessageSquare} baslik="Mesajlarım" aciklama="Gelen mesajlarınızı bu bölümden görüntüleyebileceksiniz." />}
          {menu === 'aramalar'      && <Placeholder icon={Bookmark}      baslik="Kayıtlı Aramalarım" aciklama="Kaydettiğiniz aramalar ve filtreler burada görünecek." />}
          {menu === 'favoriler'     && <Placeholder icon={Heart}          baslik="Favori İlanlarım" aciklama="Favorilediğiniz ilanlar bu bölümde listelenir." />}
          {menu === 'uyelik'        && <Uyelik />}
        </div>
      </div>
    </div>
  );
}
