import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Home, Plus, LogOut, Loader2, CheckCircle2, AlertCircle, X,
  Eye, Trash2, Pencil, ChevronRight, ChevronLeft, Building2, FileText,
  MapPin, BedDouble, Square, Bath, Layers, ChevronDown, MessageSquare,
  Bookmark, Heart, UserCircle, LayoutGrid, PlusCircle, TrendingUp,
  Clock, CheckCircle, PauseCircle, Menu, Send, Lock, Store, Users,
  TrendingDown, ArrowLeft, BarChart2, ImagePlus, Sparkles,
  Bell, Shield, HelpCircle, Phone, Mail, Info, ChevronUp,
} from 'lucide-react';
import {
  ilanEkle, ilanGuncelle, ilanSil, benimIlanlarim,
  kullaniciilanlarim, ilanDurumGuncelle,
  profilGuncelle, sifreGuncelle,
  favorilerGetir, favoriSil,
  konusmalariGetir, mesajlariGetir, mesajGonder,
  dukkanGetir, dukkanGuncelle, danismanlarGetir, danismanEkle, danismanCikar, istatistiklerGetir,
  kayitliAramalarGetir, kayitliAramaSil,
  kayitliAdreslerGetir, kayitliAdresEkle, kayitliAdresSil,
  bildirimleriGetir, bildirimOku, hepsiniOku,
  fotografYukleAPI, okunmamisSayisi, okunmamisBildirimSayisi, aiAciklamaUret,
} from '../services/api';
import { ILLER, ILCELER } from '../data/turkiyeAdresler';

const kullaniciBilgi = () => { try { return JSON.parse(localStorage.getItem('kullanici')) || {}; } catch { return {}; } };

const BOSLUK = {
  tip: 'Satılık', emlak_turu: 'Daire', baslik: '', aciklama: '',
  fiyat: '', metrekare: '', oda_sayisi: '', bina_yasi: '', kat: '', toplam_kat: '',
  isinma_tipi: '', banyo_sayisi: '', balkon: false, asansor: false, otopark: false,
  esyali: false, site_icerisinde: false, krediye_uygunluk: false, takas: false,
  sehir: '', ilce: '', mahalle: '', gorsel: '', fotograflar: [],
};
const ADIMLAR = ['İlan Tipi', 'Özellikler', 'Konum & Fiyat'];

const fiyatFormat = (f) => f
  ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(f)
  : '—';

const tarihKisa = (t) => {
  if (!t) return '';
  const d = new Date(t);
  const fark = Math.floor((Date.now() - d) / 1000);
  if (fark < 60)     return 'az önce';
  if (fark < 3600)   return `${Math.floor(fark / 60)} dk`;
  if (fark < 86400)  return `${Math.floor(fark / 3600)} sa`;
  if (fark < 604800) return `${Math.floor(fark / 86400)} gün`;
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
};

const GORSEL_FALLBACK = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80';

// ── Küçük form bileşenleri ───────────────────────────────────────
const Inp = ({ label, name, type = 'text', value, onChange, placeholder, zorunlu }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
      {label}{zorunlu && <span className="text-red-400"> *</span>}
    </label>
    <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
      className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all" />
  </div>
);

const Sel = ({ label, name, value, onChange, opts }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{label}</label>
    <select name={name} value={value} onChange={onChange}
      className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all">
      <option value="">Seçin</option>
      {opts.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const Toggle = ({ label, name, value, onChange }) => (
  <button type="button"
    onClick={() => onChange({ target: { name, value: !value, type: 'checkbox', checked: !value } })}
    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
      value ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600'
    }`}
  >
    <span className={`w-3 h-3 rounded-full flex-shrink-0 ${value ? 'bg-white' : 'bg-gray-300 dark:bg-gray-600'}`} />
    {label}
  </button>
);

const FotoYukleme = ({ secilenler, onSecilenler, mevcutlar = [], onMevcutSil }) => {
  const inputRef = useRef(null);
  const [surukle, setSurukle] = useState(false);
  const [onizlemeler, setOnizlemeler] = useState([]);

  useEffect(() => {
    const urls = secilenler.map(f => URL.createObjectURL(f));
    setOnizlemeler(urls);
    return () => urls.forEach(u => URL.revokeObjectURL(u));
  }, [secilenler]);

  const dosyaEkle = (files) => {
    const gorseller = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (gorseller.length > 0) onSecilenler(p => [...p, ...gorseller]);
  };

  const sil = (i) => onSecilenler(p => p.filter((_, idx) => idx !== i));

  return (
    <div>
      <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Fotoğraflar</p>

      {(mevcutlar.length > 0 || onizlemeler.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-3">
          {mevcutlar.map((url, i) => (
            <div key={`m-${i}`} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 group flex-shrink-0">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => onMevcutSil(url)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <X size={16} className="text-white" />
              </button>
            </div>
          ))}
          {onizlemeler.map((url, i) => (
            <div key={`n-${i}`} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-blue-500 group flex-shrink-0">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <div className="absolute top-0.5 left-0.5 bg-blue-600 text-white text-[9px] font-bold px-1 py-0.5 rounded leading-none">YENİ</div>
              <button type="button" onClick={() => sil(i)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <X size={16} className="text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        onDragOver={e => { e.preventDefault(); setSurukle(true); }}
        onDragLeave={() => setSurukle(false)}
        onDrop={e => { e.preventDefault(); setSurukle(false); dosyaEkle(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
          surukle ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50/40 dark:hover:bg-blue-900/10'
        }`}
      >
        <ImagePlus size={22} className={`mx-auto mb-1.5 ${surukle ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}`} />
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Fotoğraf ekle</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Sürükle-bırak veya tıkla · JPG, PNG, WEBP · Max 15MB</p>
      </div>
      <input ref={inputRef} type="file" multiple accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden" onChange={e => { dosyaEkle(e.target.files); e.target.value = ''; }} />
    </div>
  );
};

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
          disabled ? 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed'
          : acik ? 'border-blue-500 bg-white dark:bg-gray-700 ring-2 ring-blue-100 dark:ring-blue-900 text-gray-700 dark:text-gray-200'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:border-blue-400'
        }`}
      >
        <span className={value ? 'text-gray-800 dark:text-gray-100 font-medium' : 'text-gray-400 dark:text-gray-500'}>{value || label}</span>
        <ChevronDown size={14} className={`text-gray-400 dark:text-gray-500 transition-transform ${acik ? 'rotate-180' : ''}`} />
      </button>
      {acik && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <input type="text" value={arama} onChange={e => setArama(e.target.value)}
              placeholder={`${label} ara...`}
              className="w-full px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" autoFocus />
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            {filtrelenmis.length === 0
              ? <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-3">Sonuç bulunamadı</p>
              : filtrelenmis.map(s => (
                <button key={s} type="button" onClick={() => { onChange(s); setAcik(false); setArama(''); }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${value === s ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                  {s}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

const NavItem = ({ id, icon: Icon, label, aktif, onClick, sub = false, badge }) => (
  <button onClick={() => onClick(id)}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${sub ? 'pl-8' : ''} ${
      aktif ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:bg-white/10 hover:text-white'
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

// ── Modül düzeyinde yardımcı ─────────────────────────────────────
const basTurkce = (str = '') =>
  str.split(' ').map(s => s.charAt(0).toUpperCase()).slice(0, 2).join('');

// ── KonusmaDetay — Dashboard dışında tanımlı (fokus kaybı önlenir) ──
const KonusmaDetay = ({ seciliKonusma, setSeciliKonusma, mesajListRef, mesajListesi, setMesajListesi, kullanici, yeniMesaj, setYeniMesaj, mesajGonderFn, mesajGond }) => {
  useEffect(() => {
    if (!seciliKonusma?.id) return;
    const iv = setInterval(async () => {
      try {
        const r = await mesajlariGetir(seciliKonusma.id);
        const gelen = r.data.mesajlar || [];
        setMesajListesi(prev => {
          if (gelen.length > prev.length) {
            const el = mesajListRef.current;
            const nearBottom = el && (el.scrollHeight - el.scrollTop - el.clientHeight < 120);
            if (nearBottom && el) setTimeout(() => { el.scrollTop = el.scrollHeight; }, 50);
            return gelen;
          }
          return prev;
        });
      } catch {}
    }, 5000);
    return () => clearInterval(iv);
  }, [seciliKonusma?.id]);

  return (
  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 180px)', minHeight: 400 }}>
    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-white dark:bg-gray-800">
      <button onClick={() => setSeciliKonusma(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <ArrowLeft size={18} className="text-gray-600 dark:text-gray-400" />
      </button>
      <div className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-sm font-extrabold text-gray-600 dark:text-gray-300 flex-shrink-0">
        {basTurkce(seciliKonusma?.karsi_ad || 'K')}
      </div>
      <div>
        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{seciliKonusma?.karsi_ad || 'Kullanıcı'}</p>
        {seciliKonusma?.ilan_baslik && <p className="text-xs text-gray-400 dark:text-gray-500">🏠 {seciliKonusma.ilan_baslik}</p>}
      </div>
    </div>
    <div ref={mesajListRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
      {mesajListesi.length === 0 && (
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 pt-8">Henüz mesaj yok</p>
      )}
      {mesajListesi.map(m => {
        const benden = parseInt(m.gonderen_id) === parseInt(kullanici.id);
        return (
          <div key={m.id} className={`flex ${benden ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${benden ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-sm shadow-sm'}`}>
              <p className="text-sm leading-relaxed">{m.metin}</p>
              <p className={`text-[10px] mt-1 text-right ${benden ? 'text-white/60' : 'text-gray-400 dark:text-gray-500'}`}>
                {new Date(m.olusturulma).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                {benden && (m.okundu ? ' ✓✓' : ' ✓')}
              </p>
            </div>
          </div>
        );
      })}
    </div>
    <div className="p-3 border-t border-gray-100 dark:border-gray-700 flex items-end gap-2 bg-white dark:bg-gray-800">
      <textarea
        value={yeniMesaj}
        onChange={e => setYeniMesaj(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); mesajGonderFn(); } }}
        placeholder="Mesajınızı yazın..."
        rows={1}
        className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-blue-500 resize-none"
        style={{ maxHeight: 100 }}
      />
      <button onClick={mesajGonderFn} disabled={!yeniMesaj.trim() || mesajGond}
        className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 text-white rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
        {mesajGond ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
      </button>
    </div>
  </div>
  );
};

// ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const kullanici      = kullaniciBilgi();
  const kurumsal       = !!kullanici.dukkan_id;


  const urlSekme = searchParams.get('sekme');
  const [menu, setMenu]               = useState(urlSekme || 'anasayfa');
  const [sidebarAcik, setSidebar]     = useState(false);
  const [adim, setAdim]               = useState(0);
  const [form, setForm]               = useState(BOSLUK);
  const [yukleniyor, setYukleniyor]   = useState(false);
  const [limitAsimi, setLimitAsimi]   = useState(false);
  const [ilanlar, setIlanlar]         = useState([]);
  const [listeleniyor, setListeleniyor] = useState(false);
  const [duzenle, setDuzenle]         = useState(null);
  const [secilenGorseller, setSecilenGorseller] = useState([]);
  const [aiYukleniyor, setAiYukleniyor] = useState(false);

  // Mesajlar
  const [konusmalar, setKonusmalar]       = useState([]);
  const [seciliKonusma, setSeciliKonusma] = useState(null);
  const [konusmaYuk, setKonusmaYuk]       = useState(false);
  const [mesajListesi, setMesajListesi]   = useState([]);
  const [yeniMesaj, setYeniMesaj]         = useState('');
  const [mesajGond, setMesajGond]         = useState(false);
  const mesajListRef = useRef(null);

  // Favoriler
  const [favoriler, setFavoriler] = useState([]);
  const [favYuk, setFavYuk]       = useState(false);

  // Kayıtlı Aramalar
  const [aramalar, setAramalar] = useState([]);
  const [aramaYuk, setAramaYuk] = useState(false);

  // Üyelik düzenleme
  const [profilForm, setProfilForm]   = useState({ ad_soyad: kullanici.ad_soyad || '', eposta: kullanici.eposta || '', telefon: kullanici.telefon || '' });
  const [profilDuzenle, setProfilDuz] = useState(false);
  const [profilKayit, setProfilKayit] = useState(false);
  const [sifreForm, setSifreForm]     = useState({ eski_sifre: '', yeni_sifre: '', yeni_sifre2: '' });
  const [sifreAcik, setSifreAcik]     = useState(false);
  const [sifreKayit, setSifreKayit]   = useState(false);

  // Kurumsal: Dükkan
  const [dukkan, setDukkan]           = useState(null);
  const [dukkanForm, setDukkanForm]   = useState({ dukkan_adi: '', sehir: '', ilce: '' });
  const [dukkanDuz, setDukkanDuz]     = useState(false);
  const [dukkanKayit, setDukkanKayit] = useState(false);
  const [dukkanYuk, setDukkanYuk]     = useState(false);

  // Kurumsal: Danışmanlar
  const [danismanlar, setDanismanlar] = useState([]);
  const [danisYuk, setDanisYuk]       = useState(false);
  const [danisEkleAcik, setDanisEkleAcik] = useState(false);
  const [danisEposta, setDanisEposta]     = useState('');
  const [danisKayit, setDanisKayit]       = useState(false);

  // Kurumsal: İstatistikler
  const [ist, setIst]   = useState(null);
  const [istYuk, setIstYuk] = useState(false);

  // Kayıtlı Adresler
  const [adresler, setAdresler]   = useState([]);
  const [adresYuk, setAdresYuk]   = useState(false);
  const [adresForm, setAdresForm] = useState({ baslik: '', sehir: '', ilce: '' });
  const [adresEkleAcik, setAdresEkleAcik] = useState(false);
  const [adresKayit, setAdresKayit] = useState(false);

  // Bildirimler
  const [bildirimler, setBildirimler]   = useState([]);
  const [bildirimYuk, setBildirimYuk]   = useState(false);

  // SSS (Yardım & Destek)
  const [acikSss, setAcikSss] = useState(null);

  const [okunmamis, setOkunmamis]               = useState(0);
  const [okunmamisBildirim, setOkunmamisBildirim] = useState(0);

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
  };

  const handleAiAciklama = async () => {
    setAiYukleniyor(true);
    try {
      const r = await aiAciklamaUret(form);
      setForm(f => ({ ...f, aciklama: r.data.aciklama }));
      toast.success('AI açıklama oluşturuldu!');
    } catch {
      toast.error('AI açıklama üretilemedi. API anahtarını kontrol edin.');
    } finally {
      setAiYukleniyor(false);
    }
  };

  const ilanlarıGetir = async () => {
    setListeleniyor(true);
    try {
      const r = kullanici.dukkan_id
        ? await benimIlanlarim(kullanici.dukkan_id)
        : await kullaniciilanlarim(kullanici.id);
      setIlanlar(r.data.ilanlar || []);
    } catch { setIlanlar([]); }
    finally { setListeleniyor(false); }
  };

  useEffect(() => {
    if (['anasayfa', 'ilanlar', 'ilanlar-aktif', 'ilanlar-pasif'].includes(menu)) {
      ilanlarıGetir();
    }
    if (menu === 'mesajlar') {
      setKonusmaYuk(true);
      konusmalariGetir().then(r => setKonusmalar(r.data.konusmalar || [])).catch(() => {}).finally(() => setKonusmaYuk(false));
    }
    if (menu === 'favoriler') {
      setFavYuk(true);
      favorilerGetir().then(r => setFavoriler(r.data.favoriler || [])).catch(() => {}).finally(() => setFavYuk(false));
    }
    if (menu === 'aramalar') {
      setAramaYuk(true);
      kayitliAramalarGetir().then(r => setAramalar(r.data.aramalar || [])).catch(() => {}).finally(() => setAramaYuk(false));
    }
    if (menu === 'dukkan' && kullanici.dukkan_id) {
      setDukkanYuk(true);
      dukkanGetir(kullanici.dukkan_id).then(r => {
        const d = r.data.dukkan;
        setDukkan(d);
        setDukkanForm({ dukkan_adi: d.dukkan_adi || '', sehir: d.sehir || '', ilce: d.ilce || '' });
      }).catch(() => {}).finally(() => setDukkanYuk(false));
    }
    if (menu === 'danismanlar' && kullanici.dukkan_id) {
      setDanisYuk(true);
      danismanlarGetir(kullanici.dukkan_id).then(r => setDanismanlar(r.data.danismanlar || [])).catch(() => {}).finally(() => setDanisYuk(false));
    }
    if (menu === 'istatistikler' && kullanici.dukkan_id) {
      setIstYuk(true);
      istatistiklerGetir(kullanici.dukkan_id).then(r => setIst(r.data.istatistikler)).catch(() => {}).finally(() => setIstYuk(false));
    }
    if (menu === 'adresler') {
      setAdresYuk(true);
      kayitliAdreslerGetir().then(r => setAdresler(r.data.adresler || [])).catch(() => {}).finally(() => setAdresYuk(false));
    }
    if (menu === 'bildirimler') {
      setBildirimYuk(true);
      bildirimleriGetir().then(r => setBildirimler(r.data.bildirimler || [])).catch(() => {}).finally(() => setBildirimYuk(false));
    }
  }, [menu]);

  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    okunmamisSayisi().then(r => setOkunmamis(r.data.sayi || 0)).catch(() => {});
    okunmamisBildirimSayisi().then(r => setOkunmamisBildirim(r.data.sayi || 0)).catch(() => {});
    const iv = setInterval(() => {
      okunmamisSayisi().then(r => setOkunmamis(r.data.sayi || 0)).catch(() => {});
      okunmamisBildirimSayisi().then(r => setOkunmamisBildirim(r.data.sayi || 0)).catch(() => {});
    }, 30000);
    return () => clearInterval(iv);
  }, []);

  const konusmaAc = async (konusma) => {
    setSeciliKonusma(konusma);
    if (konusma.okunmamis_sayi > 0) {
      setKonusmalar(prev => prev.map(k => k.id === konusma.id ? { ...k, okunmamis_sayi: 0 } : k));
      setOkunmamis(prev => Math.max(0, prev - konusma.okunmamis_sayi));
    }
    try {
      const r = await mesajlariGetir(konusma.id);
      setMesajListesi(r.data.mesajlar || []);
      setTimeout(() => {
        if (mesajListRef.current) mesajListRef.current.scrollTop = mesajListRef.current.scrollHeight;
      }, 100);
    } catch { setMesajListesi([]); }
  };

  const mesajGonderFn = async () => {
    const t = yeniMesaj.trim();
    if (!t || mesajGond || !seciliKonusma) return;
    setMesajGond(true);
    setYeniMesaj('');
    try {
      const r = await mesajGonder({ alici_id: seciliKonusma.karsi_id, ilan_id: seciliKonusma.ilan_id, metin: t });
      setMesajListesi(prev => [...prev, r.data.mesaj]);
      setTimeout(() => {
        if (mesajListRef.current) mesajListRef.current.scrollTop = mesajListRef.current.scrollHeight;
      }, 100);
    } catch { setYeniMesaj(t); }
    finally { setMesajGond(false); }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.baslik || !form.fiyat || !form.metrekare) {
      toast.error('Başlık, fiyat ve metrekare zorunludur.'); return;
    }
    try {
      setYukleniyor(true); setLimitAsimi(false);

      let mevcutUrls = Array.isArray(form.fotograflar) && form.fotograflar.length > 0
        ? form.fotograflar
        : (form.gorsel ? [form.gorsel] : []);

      if (secilenGorseller.length > 0) {
        const fd = new FormData();
        secilenGorseller.forEach(f => fd.append('fotograflar', f));
        const uploadResp = await fotografYukleAPI(fd);
        const yeniUrller = uploadResp.data.urls || [];
        mevcutUrls = [...mevcutUrls, ...yeniUrller];
      }

      const ilanData = {
        ...form,
        gorsel: mevcutUrls[0] || '',
        fotograflar: mevcutUrls,
      };

      if (duzenle) {
        await ilanGuncelle(duzenle.id, ilanData);
        toast.success('İlan başarıyla güncellendi!'); setDuzenle(null);
      } else {
        const r = await ilanEkle(ilanData);
        toast.success(`"${r.data.ilan.baslik}" yayınlandı!`);
      }
      setForm(BOSLUK); setAdim(0); setMenu('ilanlar'); setSecilenGorseller([]);
    } catch (err) {
      if (err.response?.data?.limit_asimi) setLimitAsimi(true);
      else toast.error(err.response?.data?.mesaj || 'Bir hata oluştu.');
    } finally { setYukleniyor(false); }
  };

  const sil = async (id) => {
    try {
      await ilanSil(id);
      setIlanlar(p => p.filter(i => i.id !== id));
      toast.success('İlan silindi.');
    } catch (err) {
      toast.error(err.response?.data?.mesaj || `Silme başarısız. (${err.response?.status || err.message})`);
    }
  };

  const silOnay = (id, baslik) => {
    toast((t) => (
      <div>
        <p className="text-sm mb-3">
          <span className="font-bold">"{baslik}"</span> silinsin mi?
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => { toast.dismiss(t.id); sil(id); }}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1.5 rounded-lg transition-colors"
          >Evet, Sil</button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-1.5 rounded-lg transition-colors"
          >İptal</button>
        </div>
      </div>
    ), { duration: 8000 });
  };

  const durumDegistir = async (id, yeniDurum) => {
    try {
      await ilanDurumGuncelle(id, yeniDurum);
      setIlanlar(p => p.map(i => i.id === id ? { ...i, durum: yeniDurum } : i));
    } catch { toast.error('Durum güncellenemedi.'); }
  };

  const duzenleBaslat = (ilan) => {
    const mevcutFotolar = Array.isArray(ilan.fotograflar) && ilan.fotograflar.length > 0
      ? ilan.fotograflar
      : (ilan.gorsel ? [ilan.gorsel] : []);
    setDuzenle(ilan);
    setForm({ ...BOSLUK, ...ilan, balkon: !!ilan.balkon, asansor: !!ilan.asansor, otopark: !!ilan.otopark, esyali: !!ilan.esyali, site_icerisinde: !!ilan.site_icerisinde, fotograflar: mevcutFotolar });
    setSecilenGorseller([]);
    setAdim(0); setMenu('yeni'); setDuzenle(ilan);
  };

  const menuDegistir = (id) => {
    setMenu(id); setDuzenle(null); setLimitAsimi(false); setSidebar(false);
    setSeciliKonusma(null); setProfilDuz(false); setSifreAcik(false); setDukkanDuz(false);
    setSecilenGorseller([]);
  };

  const aktifIlanlar = ilanlar.filter(i => !i.durum || i.durum === 'aktif');
  const pasifIlanlar = ilanlar.filter(i => i.durum && i.durum !== 'aktif');
  const goruntulenenIlanlar =
    menu === 'ilanlar-aktif' ? aktifIlanlar :
    menu === 'ilanlar-pasif' ? pasifIlanlar :
    ilanlar;

  const baslikMap = {
    anasayfa: 'Anasayfa',
    ilanlar: 'İlanlarım',
    'ilanlar-aktif': 'Aktif İlanlar',
    'ilanlar-pasif': 'Pasif İlanlar',
    yeni: duzenle ? 'İlan Düzenle' : 'İlan Ver',
    mesajlar: seciliKonusma ? `${seciliKonusma.karsi_ad || 'Konuşma'}` : 'Mesajlarım',
    aramalar: 'Kayıtlı Aramalarım',
    adresler: 'Kayıtlı Adreslerim',
    bildirimler: 'Bildirimler',
    favoriler: 'Favori İlanlarım',
    uyelik: 'Üyelik & Hesap',
    gizlilik: 'Gizlilik & Güvenlik',
    yardim: 'Yardım & Destek',
    dukkan: 'Dükkan Bilgileri',
    danismanlar: 'Danışmanlarım',
    istatistikler: 'İstatistikler',
  };

  // ── Sidebar ──────────────────────────────────────────────────
  const Sidebar = () => (
    <aside className="w-64 flex-shrink-0 bg-slate-800 flex flex-col h-screen sticky top-0 overflow-y-auto">
      <div className="px-5 py-4 border-b border-slate-700">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg"><Home size={16} className="text-white" /></div>
          <span className="text-base font-bold text-white">Emlak<span className="text-blue-400">Node</span></span>
        </Link>
      </div>
      <div className="px-4 py-4 border-b border-slate-700 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0">
          {basTurkce(kullanici.ad_soyad)}
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-bold text-white truncate">{kullanici.ad_soyad || 'Kullanıcı'}</p>
          <p className="text-xs text-slate-400">{kurumsal ? 'Kurumsal' : 'Bireysel'}</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        <NavItem id="anasayfa" icon={LayoutGrid} label="Anasayfa" aktif={menu === 'anasayfa'} onClick={menuDegistir} />

        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 pt-4 pb-1">İlanlarım</p>
        <NavItem id="ilanlar"       icon={FileText}   label="Tüm İlanlar"   aktif={menu === 'ilanlar'}       onClick={menuDegistir} badge={ilanlar.length || null} />
        <NavItem id="ilanlar-aktif" icon={CheckCircle} label="Aktif"        aktif={menu === 'ilanlar-aktif'} onClick={menuDegistir} sub badge={aktifIlanlar.length || null} />
        <NavItem id="ilanlar-pasif" icon={PauseCircle} label="Pasif"        aktif={menu === 'ilanlar-pasif'} onClick={menuDegistir} sub badge={pasifIlanlar.length || null} />
        <div className="pt-1">
          <NavItem id="yeni" icon={PlusCircle} label={duzenle ? 'İlan Düzenle' : 'İlan Ver'} aktif={menu === 'yeni'} onClick={menuDegistir} />
        </div>

        {kurumsal && (
          <>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 pt-4 pb-1">Dükkan</p>
            <NavItem id="dukkan"        icon={Store}    label="Dükkan Bilgileri" aktif={menu === 'dukkan'}        onClick={menuDegistir} />
            <NavItem id="danismanlar"   icon={Users}    label="Danışmanlarım"    aktif={menu === 'danismanlar'}   onClick={menuDegistir} />
            <NavItem id="istatistikler" icon={BarChart2} label="İstatistikler"   aktif={menu === 'istatistikler'} onClick={menuDegistir} />
          </>
        )}

        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 pt-4 pb-1">Hesabım</p>
        <NavItem id="mesajlar"   icon={MessageSquare} label="Mesajlarım"          aktif={menu === 'mesajlar'}   onClick={menuDegistir} badge={okunmamis || null} />
        <NavItem id="bildirimler" icon={Bell}         label="Bildirimler"         aktif={menu === 'bildirimler'} onClick={menuDegistir} badge={okunmamisBildirim || null} />
        <NavItem id="aramalar"   icon={Bookmark}      label="Kayıtlı Aramalarım" aktif={menu === 'aramalar'}   onClick={menuDegistir} />
        <NavItem id="adresler"   icon={MapPin}        label="Kayıtlı Adreslerim" aktif={menu === 'adresler'}   onClick={menuDegistir} />
        <NavItem id="favoriler"  icon={Heart}         label="Favori İlanlarım"   aktif={menu === 'favoriler'}  onClick={menuDegistir} />
        <NavItem id="uyelik"     icon={UserCircle}    label="Üyelik & Hesap"     aktif={menu === 'uyelik'}     onClick={menuDegistir} />
        <NavItem id="gizlilik"   icon={Shield}        label="Gizlilik & Güvenlik" aktif={menu === 'gizlilik'}  onClick={menuDegistir} />
        <NavItem id="yardim"     icon={HelpCircle}    label="Yardım & Destek"    aktif={menu === 'yardim'}     onClick={menuDegistir} />
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
      {limitAsimi && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertCircle size={20} className="text-amber-500" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-amber-800 mb-1">İlan Limitine Ulaştınız</p>
            <p className="text-sm text-amber-700 mb-3">
              Bireysel hesaplar en fazla <strong>3 ilan</strong> ekleyebilir.
            </p>
            <Link to="/kayit" state={{ tab: 'kurumsal' }}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors">
              Kurumsal Hesap Aç
            </Link>
          </div>
          <button onClick={() => setLimitAsimi(false)} className="text-amber-400 hover:text-amber-600"><X size={16} /></button>
        </div>
      )}
    </div>
  );

  // ── İlan kartı (liste) ───────────────────────────────────────
  const IlanKarti = ({ ilan }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex hover:shadow-md transition-all">
      <div className="w-32 h-28 flex-shrink-0 bg-slate-100 dark:bg-gray-700 relative">
        {ilan.gorsel
          ? <img src={ilan.gorsel} alt={ilan.baslik} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center"><Building2 size={28} className="text-slate-300 dark:text-gray-600" /></div>}
        <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${ilan.tip === 'Kiralık' ? 'bg-blue-500' : 'bg-blue-600'}`}>
          {ilan.tip || 'Satılık'}
        </span>
      </div>
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm line-clamp-1">{ilan.baslik}</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
            <MapPin size={11} className="text-blue-500" />
            {[ilan.mahalle, ilan.ilce, ilan.sehir].filter(Boolean).join(', ') || '—'}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-2 flex-wrap">
          {ilan.oda_sayisi && <span className="flex items-center gap-1"><BedDouble size={11} className="text-blue-500" />{ilan.oda_sayisi}</span>}
          {ilan.metrekare  && <span className="flex items-center gap-1"><Square    size={11} className="text-blue-500" />{ilan.metrekare} m²</span>}
          {ilan.banyo_sayisi && <span className="flex items-center gap-1"><Bath   size={11} className="text-blue-500" />{ilan.banyo_sayisi} banyo</span>}
          {ilan.kat        && <span className="flex items-center gap-1"><Layers   size={11} className="text-blue-500" />{ilan.kat}. kat</span>}
        </div>
      </div>
      <div className="flex flex-col items-end justify-between p-4 border-l border-gray-100 dark:border-gray-700 min-w-[160px]">
        <div className="text-right">
          <p className="text-base font-extrabold text-blue-600 leading-none">{fiyatFormat(ilan.fiyat)}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{ilan.emlak_turu || 'Daire'}</p>
        </div>
        <select value={ilan.durum || 'aktif'} onChange={e => durumDegistir(ilan.id, e.target.value)}
          className={`mt-2 text-xs font-bold px-2.5 py-1.5 rounded-lg border cursor-pointer focus:outline-none transition-all ${
            ilan.durum === 'pasif'      ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600'
            : ilan.durum === 'satildi'  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 border-red-200 dark:border-red-800'
            : ilan.durum === 'kiralandı'? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-200 dark:border-blue-800'
            :                            'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
          }`}
        >
          <option value="aktif">✅ Aktif</option>
          <option value="pasif">⏸ Pasif</option>
          <option value="satildi">🏷 Satıldı</option>
          <option value="kiralandı">🔑 Kiralandı</option>
        </select>
        <div className="flex gap-1.5 mt-2">
          <Link to={`/ilan/${ilan.id}`}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:text-blue-500 hover:border-blue-200 transition-all"><Eye size={14} /></Link>
          <button onClick={() => duzenleBaslat(ilan)}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:text-blue-600 hover:border-blue-300 transition-all"><Pencil size={14} /></button>
          <button onClick={() => silOnay(ilan.id, ilan.baslik)}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:text-red-500 hover:border-red-200 transition-all"><Trash2 size={14} /></button>
        </div>
      </div>
    </div>
  );

  // ── ANASAYFA ─────────────────────────────────────────────────
  const Anasayfa = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-gray-900 via-slate-800 to-blue-900 rounded-2xl p-6 text-white flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white font-extrabold text-xl flex-shrink-0">
          {basTurkce(kullanici.ad_soyad)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider mb-1">Hoş geldiniz</p>
          <h2 className="text-2xl font-extrabold truncate">{kullanici.ad_soyad}</h2>
          <p className="text-slate-400 text-sm mt-1">{kurumsal ? '🏢 Kurumsal Hesap' : '👤 Bireysel Hesap'} · {kullanici.eposta}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Toplam İlan',  value: ilanlar.length,       icon: FileText,    renk: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' },
          { label: 'Aktif İlan',   value: aktifIlanlar.length,  icon: CheckCircle, renk: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' },
          { label: 'Pasif İlan',   value: pasifIlanlar.length,  icon: PauseCircle, renk: 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400' },
          { label: 'İlan Hakkı',   value: kurumsal ? '∞' : `${ilanlar.length}/3`, icon: TrendingUp, renk: 'bg-amber-50 dark:bg-amber-900/20 text-amber-500' },
        ].map(({ label, value, icon: Icon, renk }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${renk}`}><Icon size={20} /></div>
            <div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">{value}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>
      {ilanlar.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2"><Clock size={15} className="text-blue-500" /> Son İlanlar</h3>
            <button onClick={() => menuDegistir('ilanlar')} className="text-xs text-blue-600 font-semibold hover:underline">Tümünü Gör</button>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-700">
            {ilanlar.slice(0, 3).map(ilan => (
              <div key={ilan.id} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                  {ilan.gorsel
                    ? <img src={ilan.gorsel} alt="" className="w-full h-full object-cover" />
                    : <Building2 size={18} className="text-slate-300 dark:text-gray-600 m-auto mt-2.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{ilan.baslik}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{ilan.sehir} · {ilan.emlak_turu}</p>
                </div>
                <p className="text-sm font-bold text-blue-600 flex-shrink-0">{fiyatFormat(ilan.fiyat)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {!kurumsal && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-5 flex items-start gap-4">
          <AlertCircle size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-blue-800 dark:text-blue-200 text-sm mb-1">Bireysel İlan Hakkınız: {ilanlar.length}/3</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">
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
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-sm">
          <Plus size={15} /> Yeni İlan
        </button>
      </div>
      {listeleniyor
        ? <div className="flex justify-center py-16"><Loader2 size={28} className="text-blue-500 animate-spin" /></div>
        : liste.length === 0
          ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-14 text-center border border-gray-100 dark:border-gray-700 shadow-sm">
              <FileText size={40} className="text-gray-200 dark:text-gray-600 mx-auto mb-3" />
              <p className="font-semibold text-gray-500 dark:text-gray-400">Henüz ilan yok</p>
              <button onClick={() => menuDegistir('yeni')}
                className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all">
                İlk İlanı Ekle
              </button>
            </div>
          )
          : liste.map(ilan => <IlanKarti key={ilan.id} ilan={ilan} />)
      }
    </div>
  );

  // ── FAVORİLER ────────────────────────────────────────────────
  const Favoriler = () => (
    <div className="space-y-4">
      {favYuk ? (
        <div className="flex justify-center py-16"><Loader2 size={28} className="text-blue-500 animate-spin" /></div>
      ) : favoriler.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-14 text-center border border-gray-100 dark:border-gray-700 shadow-sm">
          <Heart size={40} className="text-gray-200 dark:text-gray-600 mx-auto mb-3" />
          <p className="font-semibold text-gray-500 dark:text-gray-400">Favori ilanınız yok</p>
          <Link to="/" className="mt-4 inline-block px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all">
            İlanlara Göz At
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500">{favoriler.length} favori ilan</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriler.map(fav => {
              const ilan = fav.ilan || fav;
              return (
                <div key={fav.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                  <div className="relative h-36 overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img src={ilan.gorsel || GORSEL_FALLBACK} alt={ilan.baslik}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={e => { e.currentTarget.src = GORSEL_FALLBACK; }}
                    />
                    <span className={`absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-md ${ilan.tip === 'Kiralık' ? 'bg-blue-500' : 'bg-blue-600'}`}>
                      {ilan.tip || 'Satılık'}
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{ilan.baslik}</p>
                    {(ilan.ilce || ilan.sehir) && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                        <MapPin size={10} className="text-blue-500" />
                        {[ilan.ilce, ilan.sehir].filter(Boolean).join(' / ')}
                      </p>
                    )}
                    <p className="text-blue-700 font-extrabold text-sm mt-1">{fiyatFormat(ilan.fiyat)}</p>
                    <div className="flex gap-2 mt-2">
                      <Link to={`/ilan/${ilan.id}`}
                        className="flex-1 text-center text-xs font-bold border border-blue-200 text-blue-600 hover:bg-blue-50 py-1.5 rounded-lg transition-colors">
                        Detay
                      </Link>
                      <button onClick={async () => {
                          await favoriSil(ilan.id).catch(() => {});
                          setFavoriler(p => p.filter(f => f.id !== fav.id));
                        }}
                        className="flex-1 text-xs font-bold border border-red-100 text-red-400 hover:bg-red-50 py-1.5 rounded-lg transition-colors">
                        Kaldır
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );

  // ── MESAJLAR ─────────────────────────────────────────────────
  const MesajlarListesi = () => (
    <div>
      {konusmaYuk ? (
        <div className="flex justify-center py-16"><Loader2 size={28} className="text-blue-500 animate-spin" /></div>
      ) : konusmalar.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-14 text-center border border-gray-100 dark:border-gray-700 shadow-sm">
          <MessageSquare size={40} className="text-gray-200 dark:text-gray-600 mx-auto mb-3" />
          <p className="font-semibold text-gray-500 dark:text-gray-400">Henüz mesajınız yok</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">İlan sayfalarından mesaj gönderebilirsiniz.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden divide-y divide-gray-50 dark:divide-gray-700">
          {konusmalar.map(k => {
            const okunmamis = parseInt(k.okunmamis) > 0;
            return (
              <button key={k.id} onClick={() => konusmaAc(k)}
                className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-extrabold flex-shrink-0 ${okunmamis ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                  {basTurkce(k.karsi_ad || 'K')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm ${okunmamis ? 'font-extrabold text-gray-900 dark:text-gray-100' : 'font-semibold text-gray-800 dark:text-gray-200'}`}>{k.karsi_ad || 'Kullanıcı'}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 ml-2 flex-shrink-0">{tarihKisa(k.son_tarih)}</p>
                  </div>
                  {k.ilan_baslik && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">🏠 {k.ilan_baslik}</p>}
                  <div className="flex items-center justify-between mt-0.5">
                    <p className={`text-xs truncate flex-1 ${okunmamis ? 'text-gray-800 dark:text-gray-200 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>{k.son_mesaj || 'Konuşma başlatıldı'}</p>
                    {okunmamis && (
                      <span className="bg-blue-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 ml-2 flex-shrink-0">{k.okunmamis}</span>
                    )}
                  </div>
                </div>
                <ChevronRight size={14} className="text-gray-300 dark:text-gray-600 flex-shrink-0" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );


  // ── KAYITLI ARAMALAR ─────────────────────────────────────────
  const KayitliAramalar = () => (
    <div className="space-y-4">
      {aramaYuk ? (
        <div className="flex justify-center py-16"><Loader2 size={28} className="text-blue-500 animate-spin" /></div>
      ) : aramalar.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-14 text-center border border-gray-100 dark:border-gray-700 shadow-sm">
          <Bookmark size={40} className="text-gray-200 dark:text-gray-600 mx-auto mb-3" />
          <p className="font-semibold text-gray-500 dark:text-gray-400">Kayıtlı aramanız yok</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Arama sayfasında filtreleri kaydedebilirsiniz.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden divide-y divide-gray-50 dark:divide-gray-700">
          {aramalar.map(a => (
            <div key={a.id} className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Bookmark size={18} className="text-purple-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{a.baslik || a.sehir || 'Arama'}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {[a.tip, a.sehir, a.ilce].filter(Boolean).join(' · ')}
                  {a.min_fiyat && ` · Min: ${fiyatFormat(a.min_fiyat)}`}
                  {a.max_fiyat && ` · Max: ${fiyatFormat(a.max_fiyat)}`}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Link to={`/?${new URLSearchParams(Object.fromEntries(Object.entries(a).filter(([k, v]) => v && !['id', 'kullanici_id', 'baslik', 'olusturulma'].includes(k) && typeof v !== 'object'))).toString()}`}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:text-blue-600 hover:border-blue-300 transition-all" title="İlanlarda Ara">
                  <Eye size={14} />
                </Link>
                <button onClick={async () => {
                    await kayitliAramaSil(a.id).catch(() => {});
                    setAramalar(p => p.filter(x => x.id !== a.id));
                  }}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:text-red-500 hover:border-red-200 transition-all" title="Sil">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── KAYITLI ADRESLER ─────────────────────────────────────────
  const KayitliAdresler = () => (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">Kayıtlı Adreslerim</h2>
        <button onClick={() => setAdresEkleAcik(v => !v)}
          className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-xl transition-all">
          <Plus size={14} /> Adres Ekle
        </button>
      </div>

      {adresEkleAcik && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-sm p-5 space-y-3">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">Yeni Adres</h3>
          <input className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-blue-500" placeholder="Başlık (örn. Ev, İş Yeri)" value={adresForm.baslik} onChange={e => setAdresForm(f => ({ ...f, baslik: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <input className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-blue-500" placeholder="Şehir" value={adresForm.sehir} onChange={e => setAdresForm(f => ({ ...f, sehir: e.target.value }))} />
            <input className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-blue-500" placeholder="İlçe" value={adresForm.ilce} onChange={e => setAdresForm(f => ({ ...f, ilce: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setAdresEkleAcik(false); setAdresForm({ baslik: '', sehir: '', ilce: '' }); }}
              className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">İptal</button>
            <button disabled={adresKayit || !adresForm.baslik.trim()} onClick={async () => {
                setAdresKayit(true);
                try {
                  const r = await kayitliAdresEkle(adresForm);
                  setAdresler(p => [r.data.adres, ...p]);
                  setAdresForm({ baslik: '', sehir: '', ilce: '' });
                  setAdresEkleAcik(false);
                  toast.success('Adres eklendi.');
                } catch { toast.error('Adres eklenemedi.'); }
                finally { setAdresKayit(false); }
              }}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
              {adresKayit ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Kaydet
            </button>
          </div>
        </div>
      )}

      {adresYuk ? (
        <div className="flex justify-center py-16"><Loader2 size={28} className="text-blue-500 animate-spin" /></div>
      ) : adresler.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-14 text-center border border-gray-100 dark:border-gray-700 shadow-sm">
          <MapPin size={40} className="text-gray-200 dark:text-gray-600 mx-auto mb-3" />
          <p className="font-semibold text-gray-500 dark:text-gray-400">Kayıtlı adres yok</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Yukarıdaki butona basarak adres ekleyebilirsiniz.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden divide-y divide-gray-50 dark:divide-gray-700">
          {adresler.map(a => {
            const alt = [a.adres, a.ilce, a.sehir].filter(Boolean).join(', ');
            return (
              <div key={a.id} className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} className="text-purple-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{a.baslik}</p>
                  {alt && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{alt}</p>}
                </div>
                <button onClick={async () => {
                    await kayitliAdresSil(a.id).catch(() => {});
                    setAdresler(p => p.filter(x => x.id !== a.id));
                    toast.success('Adres silindi.');
                  }}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:text-red-500 hover:border-red-200 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── BİLDİRİMLER ──────────────────────────────────────────────
  const Bildirimler = () => {
    const okunmamisVar = bildirimler.some(b => !b.okundu);
    const TIPLER = {
      mesaj:   { ikon: MessageSquare, renk: 'text-blue-500',  bg: 'bg-blue-50' },
      ilan:    { ikon: FileText,      renk: 'text-green-500', bg: 'bg-green-50' },
      sistem:  { ikon: Info,          renk: 'text-gray-500',  bg: 'bg-gray-50' },
    };
    return (
      <div className="space-y-4 max-w-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">Bildirimler</h2>
          {okunmamisVar && (
            <button onClick={async () => {
                await hepsiniOku().catch(() => {});
                setBildirimler(p => p.map(b => ({ ...b, okundu: true })));
              }}
              className="text-xs text-blue-600 font-semibold hover:underline">Tümünü Okundu İşaretle</button>
          )}
        </div>
        {bildirimYuk ? (
          <div className="flex justify-center py-16"><Loader2 size={28} className="text-blue-500 animate-spin" /></div>
        ) : bildirimler.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-14 text-center border border-gray-100 dark:border-gray-700 shadow-sm">
            <Bell size={40} className="text-gray-200 dark:text-gray-600 mx-auto mb-3" />
            <p className="font-semibold text-gray-500 dark:text-gray-400">Bildirim yok</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden divide-y divide-gray-50 dark:divide-gray-700">
            {bildirimler.map(b => {
              const t = TIPLER[b.tip] || TIPLER.sistem;
              const Ikon = t.ikon;
              return (
                <div key={b.id} onClick={async () => {
                    if (!b.okundu) {
                      await bildirimOku(b.id).catch(() => {});
                      setBildirimler(p => p.map(x => x.id === b.id ? { ...x, okundu: true } : x));
                    }
                  }}
                  className={`flex items-start gap-4 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all ${!b.okundu ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''}`}>
                  <div className={`w-10 h-10 ${t.bg} rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Ikon size={18} className={t.renk} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${b.okundu ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-gray-100'}`}>{b.baslik}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{b.icerik}</p>
                    <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">{tarihKisa(b.olusturulma)}</p>
                  </div>
                  {!b.okundu && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ── GİZLİLİK & GÜVENLİK ─────────────────────────────────────
  const GizlilikGuvenlik = () => {
    const [acikOturum, setAcikOturum] = useState(false);
    return (
      <div className="max-w-lg space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
            <Shield size={16} className="text-blue-500" />
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Hesap Güvenliği</h3>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-700">
            <div className="px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Şifre Değiştir</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Hesap şifrenizi güncelleyin</p>
              </div>
              <button onClick={() => menuDegistir('uyelik')} className="text-xs text-blue-600 font-semibold border border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-all">Git</button>
            </div>
            <div className="px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">İki Faktörlü Doğrulama</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Ekstra güvenlik katmanı</p>
              </div>
              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2.5 py-1 rounded-full font-medium">Yakında</span>
            </div>
            <div className="px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Tüm Cihazlardan Çıkış</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Diğer cihazlardaki oturumları kapat</p>
              </div>
              <button onClick={() => {
                  if (acikOturum) {
                    localStorage.removeItem('token'); localStorage.removeItem('kullanici'); navigate('/login');
                  } else setAcikOturum(true);
                }}
                className={`text-xs font-semibold border px-3 py-1.5 rounded-lg transition-all ${acikOturum ? 'bg-red-500 text-white border-red-500 hover:bg-red-600' : 'text-red-500 border-red-200 hover:bg-red-50'}`}>
                {acikOturum ? 'Evet, Çıkış Yap' : 'Çıkış Yap'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
            <Info size={16} className="text-blue-500" />
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Veri & Gizlilik</h3>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-700">
            {[
              { label: 'Gizlilik Politikası', alt: 'Verilerinizin nasıl kullanıldığını öğrenin' },
              { label: 'Kullanım Koşulları', alt: 'Hizmet koşullarımızı inceleyin' },
              { label: 'KVKK Aydınlatma Metni', alt: 'Kişisel veri haklarınız' },
            ].map(({ label, alt }) => (
              <div key={label} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{label}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{alt}</p>
                </div>
                <ChevronRight size={16} className="text-gray-300 dark:text-gray-600" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-100 dark:border-red-900/50 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-red-100 dark:border-red-900/50">
            <p className="text-xs font-bold text-red-500 uppercase tracking-wider">Tehlikeli Bölge</p>
          </div>
          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Hesabı Sil</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Tüm veriler kalıcı olarak silinir</p>
            </div>
            <button onClick={() => { if (window.confirm('Hesabınızı kalıcı olarak silmek istediğinizden emin misiniz?')) toast.error('Bu işlem için destek ekibiyle iletişime geçin.'); }}
              className="text-xs text-red-500 font-semibold border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all">Hesabı Sil</button>
          </div>
        </div>
      </div>
    );
  };

  // ── YARDIM & DESTEK ──────────────────────────────────────────
  const YardimDestek = () => {
    const SSS = [
      { s: 'Nasıl ilan verebilirim?', c: 'Sol menüden "İlan Ver" butonuna tıklayarak yeni ilan oluşturabilirsiniz. Bireysel hesaplarda 3, kurumsal hesaplarda sınırsız ilan hakkı bulunur.' },
      { s: 'Favorilere nasıl ilan eklerim?', c: 'İlan detay sayfasında kalp ikonuna tıklayarak ilanı favorilerinize ekleyebilirsiniz.' },
      { s: 'Şifremi unuttum, ne yapmalıyım?', c: '"Üyelik & Hesap" bölümündeki "Şifre Değiştir" bölümünü kullanabilirsiniz. Giriş yapamıyorsanız destek ekibiyle iletişime geçin.' },
      { s: 'İlanım neden yayınlanmadı?', c: 'İlan onay sürecinde olabilir veya eksik bilgi içeriyor olabilir. İlanlarım sayfasından durumunu kontrol edin.' },
      { s: 'Birden fazla fotoğraf yükleyebilir miyim?', c: 'Evet, ilan oluştururken birden fazla fotoğraf yükleyebilirsiniz. Maksimum 50 fotoğraf desteklenmektedir.' },
      { s: 'Kurumsal hesap nasıl oluştururum?', c: 'Kayıt sayfasında "Emlak Ofisi" seçeneğini seçerek kurumsal hesap oluşturabilirsiniz.' },
    ];
    return (
      <div className="max-w-lg space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
            <Phone size={16} className="text-blue-500" />
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">İletişim</h3>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-700">
            <a href="mailto:destek@emlaknode.com" className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail size={18} className="text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">E-posta Desteği</p>
                <p className="text-xs text-blue-500">destek@emlaknode.com</p>
              </div>
            </a>
            <a href="tel:+908501234567" className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
              <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone size={18} className="text-green-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Telefon Desteği</p>
                <p className="text-xs text-green-500">0850 123 45 67</p>
              </div>
            </a>
          </div>
          <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-400 dark:text-gray-500">Çalışma Saatleri: Hafta içi 09:00 – 18:00</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
            <HelpCircle size={16} className="text-blue-500" />
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Sık Sorulan Sorular</h3>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-700">
            {SSS.map((item, i) => (
              <div key={i}>
                <button onClick={() => setAcikSss(acikSss === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{item.s}</span>
                  {acikSss === i ? <ChevronUp size={16} className="text-gray-400 dark:text-gray-500 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />}
                </button>
                {acikSss === i && (
                  <div className="px-5 pb-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-gray-900">{item.c}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Home size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">EmlakNode</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Sürüm 1.0.0 · Web Uygulaması</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── ÜYELİK ──────────────────────────────────────────────────
  const Uyelik = () => (
    <div className="max-w-lg space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-700 to-slate-600 px-6 py-8 flex items-center gap-5">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold">
            {basTurkce(kullanici.ad_soyad)}
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white">{kullanici.ad_soyad}</h3>
            <p className="text-slate-300 text-sm mt-1">{kurumsal ? 'Kurumsal Hesap' : 'Bireysel Hesap'}</p>
          </div>
        </div>
        {!profilDuzenle ? (
          <>
            <div className="divide-y divide-gray-50 dark:divide-gray-700">
              {[
                { label: 'Ad Soyad',    value: kullanici.ad_soyad },
                { label: 'E-posta',     value: kullanici.eposta },
                { label: 'Telefon',     value: kullanici.telefon || '—' },
                { label: 'Hesap Tipi',  value: kurumsal ? 'Kurumsal' : 'Bireysel' },
                { label: 'Toplam İlan', value: `${ilanlar.length} ilan` },
              ].map(({ label, value }) => (
                <div key={label} className="px-6 py-4 flex items-center justify-between">
                  <span className="text-sm text-gray-400 dark:text-gray-500 font-medium">{label}</span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{value || '—'}</span>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100 dark:border-gray-700">
              <button onClick={() => setProfilDuz(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-blue-200 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold rounded-xl transition-all text-sm">
                <Pencil size={14} /> Profili Düzenle
              </button>
            </div>
          </>
        ) : (
          <div className="p-5 space-y-4">
            <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Profil Bilgilerini Düzenle</h4>
            <Inp label="Ad Soyad" name="ad_soyad" value={profilForm.ad_soyad}
              onChange={e => setProfilForm(f => ({ ...f, ad_soyad: e.target.value }))} zorunlu />
            <Inp label="E-posta" name="eposta" type="email" value={profilForm.eposta}
              onChange={e => setProfilForm(f => ({ ...f, eposta: e.target.value }))} zorunlu />
            <Inp label="Telefon" name="telefon" value={profilForm.telefon || ''}
              onChange={e => setProfilForm(f => ({ ...f, telefon: e.target.value }))} placeholder="0555 555 55 55" />
            <div className="flex gap-2 pt-2">
              <button onClick={() => setProfilDuz(false)}
                className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                İptal
              </button>
              <button disabled={profilKayit} onClick={async () => {
                  if (!profilForm.ad_soyad.trim() || !profilForm.eposta.trim()) { toast.error('Ad soyad ve e-posta zorunludur.'); return; }
                  setProfilKayit(true);
                  try {
                    const r = await profilGuncelle(profilForm);
                    const yeniK = { ...kullanici, ...(r.data.kullanici || profilForm) };
                    localStorage.setItem('kullanici', JSON.stringify(yeniK));
                    setProfilDuz(false);
                    toast.success('Profil güncellendi!');
                  } catch (err) { toast.error(err.response?.data?.mesaj || 'Güncelleme başarısız.'); }
                  finally { setProfilKayit(false); }
                }}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                {profilKayit ? <><Loader2 size={14} className="animate-spin" />Kaydediliyor…</> : <><CheckCircle2 size={14} />Kaydet</>}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Şifre değiştir */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-gray-500 dark:text-gray-400" />
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Şifre Değiştir</h3>
          </div>
          {!sifreAcik && (
            <button onClick={() => setSifreAcik(true)} className="text-xs text-blue-600 font-semibold hover:underline">Değiştir</button>
          )}
        </div>
        {sifreAcik && (
          <div className="p-5 space-y-4">
            <Inp label="Mevcut Şifre" name="eski" type="password" value={sifreForm.eski_sifre}
              onChange={e => setSifreForm(f => ({ ...f, eski_sifre: e.target.value }))} placeholder="••••••••" zorunlu />
            <Inp label="Yeni Şifre" name="yeni" type="password" value={sifreForm.yeni_sifre}
              onChange={e => setSifreForm(f => ({ ...f, yeni_sifre: e.target.value }))} placeholder="En az 6 karakter" zorunlu />
            <Inp label="Yeni Şifre (Tekrar)" name="yeni2" type="password" value={sifreForm.yeni_sifre2}
              onChange={e => setSifreForm(f => ({ ...f, yeni_sifre2: e.target.value }))} placeholder="••••••••" zorunlu />
            <div className="flex gap-2 pt-2">
              <button onClick={() => { setSifreAcik(false); setSifreForm({ eski_sifre: '', yeni_sifre: '', yeni_sifre2: '' }); }}
                className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                İptal
              </button>
              <button disabled={sifreKayit} onClick={async () => {
                  if (sifreForm.yeni_sifre !== sifreForm.yeni_sifre2) { toast.error('Yeni şifreler eşleşmiyor.'); return; }
                  if (sifreForm.yeni_sifre.length < 6) { toast.error('Şifre en az 6 karakter olmalıdır.'); return; }
                  setSifreKayit(true);
                  try {
                    await sifreGuncelle({ eski_sifre: sifreForm.eski_sifre, yeni_sifre: sifreForm.yeni_sifre });
                    setSifreAcik(false);
                    setSifreForm({ eski_sifre: '', yeni_sifre: '', yeni_sifre2: '' });
                    toast.success('Şifre başarıyla güncellendi!');
                  } catch (err) { toast.error(err.response?.data?.mesaj || 'Şifre güncellenemedi.'); }
                  finally { setSifreKayit(false); }
                }}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                {sifreKayit ? <><Loader2 size={14} className="animate-spin" />Kaydediliyor…</> : <><Lock size={14} />Güncelle</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ── DÜKKAN BİLGİLERİ (Kurumsal) ─────────────────────────────
  const DukkanBilgileri = () => {
    if (dukkanYuk) return <div className="flex justify-center py-16"><Loader2 size={28} className="text-blue-500 animate-spin" /></div>;
    if (!dukkan) return <div className="text-center py-16 text-gray-400 text-sm">Dükkan bilgisi yüklenemedi.</div>;
    return (
      <div className="max-w-lg space-y-4">
        <div className="bg-blue-600 rounded-2xl p-6 text-white text-center">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Store size={32} className="text-blue-600" />
          </div>
          <h2 className="text-xl font-extrabold">{dukkan.dukkan_adi}</h2>
          <p className="text-blue-100 text-sm mt-1">
            {[dukkan.ilce, dukkan.sehir].filter(Boolean).join(', ') || 'Konum belirtilmemiş'}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Lisans Bilgileri</p>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-700">
            {[{ label: 'Vergi No', value: dukkan.vergi_no || '—' }, { label: 'Yetki Belge No', value: dukkan.yetki_belge_no || '—' }].map(({ label, value }) => (
              <div key={label} className="px-5 py-4 flex items-center justify-between">
                <span className="text-sm text-gray-400 dark:text-gray-500">{label}</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{value}</span>
              </div>
            ))}
          </div>
          <p className="px-5 py-3 text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900">* Bu bilgiler değiştirilemez.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Ofis Bilgileri</p>
            {!dukkanDuz && (
              <button onClick={() => setDukkanDuz(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all">
                <Pencil size={12} /> Düzenle
              </button>
            )}
          </div>
          {!dukkanDuz ? (
            <div className="divide-y divide-gray-50 dark:divide-gray-700">
              {[{ label: 'Dükkan Adı', value: dukkan.dukkan_adi }, { label: 'Şehir', value: dukkan.sehir || '—' }, { label: 'İlçe', value: dukkan.ilce || '—' }].map(({ label, value }) => (
                <div key={label} className="px-5 py-4 flex items-center justify-between">
                  <span className="text-sm text-gray-400 dark:text-gray-500">{label}</span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5 space-y-4">
              <Inp label="Dükkan / Ofis Adı" name="dukkan_adi" value={dukkanForm.dukkan_adi}
                onChange={e => setDukkanForm(f => ({ ...f, dukkan_adi: e.target.value }))} zorunlu />
              <Inp label="Şehir" name="sehir" value={dukkanForm.sehir}
                onChange={e => setDukkanForm(f => ({ ...f, sehir: e.target.value }))} placeholder="İstanbul" />
              <Inp label="İlçe" name="ilce" value={dukkanForm.ilce}
                onChange={e => setDukkanForm(f => ({ ...f, ilce: e.target.value }))} placeholder="Kadıköy" />
              <div className="flex gap-2 pt-2">
                <button onClick={() => { setDukkanForm({ dukkan_adi: dukkan.dukkan_adi || '', sehir: dukkan.sehir || '', ilce: dukkan.ilce || '' }); setDukkanDuz(false); }}
                  className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                  İptal
                </button>
                <button disabled={dukkanKayit} onClick={async () => {
                    if (!dukkanForm.dukkan_adi.trim()) { toast.error('Dükkan adı zorunludur.'); return; }
                    setDukkanKayit(true);
                    try {
                      const r = await dukkanGuncelle(kullanici.dukkan_id, dukkanForm);
                      setDukkan(r.data.dukkan);
                      setDukkanDuz(false);
                      toast.success('Dükkan bilgileri güncellendi!');
                    } catch (err) { toast.error(err.response?.data?.mesaj || 'Güncelleme başarısız.'); }
                    finally { setDukkanKayit(false); }
                  }}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                  {dukkanKayit ? <><Loader2 size={14} className="animate-spin" />Kaydediliyor…</> : <><CheckCircle2 size={14} />Kaydet</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── DANIŞMANLAR (Kurumsal) ───────────────────────────────────
  const Danismanlar = () => {
    if (danisYuk) return <div className="flex justify-center py-16"><Loader2 size={28} className="text-blue-500 animate-spin" /></div>;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{danismanlar.length} danışman</p>
          <button onClick={() => { setDanisEkleAcik(true); setDanisEposta(''); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">
            <Users size={13} /> Danışman Ekle
          </button>
        </div>

        {danisEkleAcik && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-sm p-5 space-y-3">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm flex items-center gap-2">
              <Users size={15} className="text-blue-500" /> Yeni Danışman Ekle
            </h3>
            <Inp label="Danışmanın E-posta Adresi" name="danis_eposta" value={danisEposta}
              onChange={e => setDanisEposta(e.target.value)} placeholder="ornek@mail.com" zorunlu />
            <div className="flex gap-2 pt-1">
              <button onClick={() => setDanisEkleAcik(false)}
                className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                İptal
              </button>
              <button disabled={danisKayit} onClick={async () => {
                  if (!danisEposta.trim()) { toast.error('E-posta zorunludur.'); return; }
                  setDanisKayit(true);
                  try {
                    const r = await danismanEkle(kullanici.dukkan_id, { eposta: danisEposta });
                    toast.success(r.data.mesaj || 'Danışman eklendi!');
                    setDanisEkleAcik(false);
                    danismanlarGetir(kullanici.dukkan_id).then(res => setDanismanlar(res.data.danismanlar || [])).catch(() => {});
                  } catch (err) { toast.error(err.response?.data?.mesaj || 'Danışman eklenemedi.'); }
                  finally { setDanisKayit(false); }
                }}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                {danisKayit ? <><Loader2 size={14} className="animate-spin" />Ekleniyor…</> : <><Users size={14} />Ekle</>}
              </button>
            </div>
          </div>
        )}

        {danismanlar.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-14 text-center border border-gray-100 dark:border-gray-700 shadow-sm">
            <Users size={40} className="text-gray-200 dark:text-gray-600 mx-auto mb-3" />
            <p className="font-semibold text-gray-500 dark:text-gray-400">Henüz danışman yok</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">E-posta adresiyle kayıtlı kullanıcıları ekleyin</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden divide-y divide-gray-50 dark:divide-gray-700">
            {danismanlar.map(d => (
              <div key={d.id} className="flex items-center gap-4 p-4">
                <div className="w-11 h-11 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-sm font-extrabold text-blue-700 dark:text-blue-300 flex-shrink-0">
                  {basTurkce(d.ad_soyad || 'D')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{d.ad_soyad}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{d.eposta}</p>
                </div>
                <span className="text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2.5 py-1 rounded-full capitalize">
                  {d.rol || 'Danışman'}
                </span>
                <button onClick={async () => {
                    if (!window.confirm(`${d.ad_soyad || d.eposta} ekipten çıkarılsın mı?`)) return;
                    try {
                      await danismanCikar(kullanici.dukkan_id, d.id);
                      setDanismanlar(prev => prev.filter(x => x.id !== d.id));
                      toast.success('Danışman ekipten çıkarıldı.');
                    } catch (err) { toast.error(err.response?.data?.mesaj || 'İşlem başarısız.'); }
                  }}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all flex-shrink-0">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ── İSTATİSTİKLER (Kurumsal) ─────────────────────────────────
  const Istatistikler = () => {
    if (istYuk) return <div className="flex justify-center py-16"><Loader2 size={28} className="text-blue-500 animate-spin" /></div>;
    if (!ist) return <div className="text-center py-16 text-gray-400 text-sm">Veri yüklenemedi.</div>;

    const Cubuk = ({ label, sayi, toplam, renk }) => {
      const oran = toplam > 0 ? (sayi / toplam) : 0;
      return (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-700 dark:text-gray-300">{label}</span>
            <span className="font-extrabold text-gray-900 dark:text-gray-100">{sayi ?? 0}</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${Math.round(oran * 100)}%`, backgroundColor: renk }} />
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">%{Math.round(oran * 100)}</p>
        </div>
      );
    };

    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 text-white flex items-center gap-6">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Home size={24} className="text-white" />
          </div>
          <div>
            <p className="text-4xl font-extrabold">{ist.toplam ?? 0}</p>
            <p className="text-blue-100 text-sm">Toplam İlan</p>
          </div>
          <div className="w-px h-10 bg-white/30" />
          <div>
            <p className="text-4xl font-extrabold">{ist.danismanlar ?? 0}</p>
            <p className="text-blue-100 text-sm">Danışman</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Aktif',        value: ist.aktif,       border: 'border-l-blue-500',  bg: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' },
            { label: 'Pasif',        value: ist.pasif,       border: 'border-l-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20 text-orange-500' },
            { label: 'Satıldı',      value: ist.satildi,     border: 'border-l-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' },
            { label: 'Fiyat Düştü',  value: ist.fiyat_dustu, border: 'border-l-red-400',    bg: 'bg-red-50 dark:bg-red-900/20 text-red-500' },
          ].map(({ label, value, border, bg }) => (
            <div key={label} className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 border-l-4 ${border} flex items-center gap-4`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                <BarChart2 size={18} />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">{value ?? 0}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 space-y-5">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm flex items-center gap-2"><BarChart2 size={15} className="text-blue-500" />Dağılım</h3>
          <Cubuk label="Satılık" sayi={ist.satilik} toplam={ist.toplam} renk="#2563eb" />
          <Cubuk label="Kiralık" sayi={ist.kiralik} toplam={ist.toplam} renk="#3b82f6" />
          <Cubuk label="Aktif"   sayi={ist.aktif}   toplam={ist.toplam} renk="#2563eb" />
          <Cubuk label="Pasif"   sayi={ist.pasif}   toplam={ist.toplam} renk="#f97316" />
          <Cubuk label="Satıldı" sayi={ist.satildi} toplam={ist.toplam} renk="#8b5cf6" />
        </div>
        {ist.fiyat_dustu > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 flex items-center gap-4 border-l-4 border-l-red-400">
            <TrendingDown size={24} className="text-red-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{ist.fiyat_dustu} ilan fiyatı düşürüldü</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Aktif ilanların %{Math.round((ist.fiyat_dustu / (ist.toplam || 1)) * 100)}'inde fiyat indirimi var
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── İLAN FORMU ───────────────────────────────────────────────
  const IlanFormu = () => (
    <form onSubmit={submit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-6 space-y-6">
        {adim === 0 && (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">İlan Tipi</p>
              <div className="flex gap-3">
                {['Satılık', 'Kiralık'].map(t => (
                  <button key={t} type="button" onClick={() => setForm(f => ({ ...f, tip: t }))}
                    className={`flex-1 py-4 rounded-xl font-bold text-sm border-2 transition-all ${form.tip === t ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-blue-400'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Emlak Türü</p>
              <div className="grid grid-cols-3 gap-3">
                {['Daire', 'Villa', 'Müstakil Ev', 'Arsa', 'İşyeri', 'Depo'].map(t => (
                  <button key={t} type="button" onClick={() => setForm(f => ({ ...f, emlak_turu: t }))}
                    className={`py-3 px-4 rounded-xl font-semibold text-sm border-2 transition-all flex items-center justify-center gap-2 ${form.emlak_turu === t ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-blue-400'}`}>
                    <Building2 size={15} />{t}
                  </button>
                ))}
              </div>
            </div>
            <Inp label="İlan Başlığı" name="baslik" value={form.baslik} onChange={handleChange} placeholder="Örn: Kadıköy'de Deniz Manzaralı 3+1 Daire" zorunlu />
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400">Açıklama</label>
                <button type="button" onClick={handleAiAciklama} disabled={aiYukleniyor}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100 transition-all disabled:opacity-50">
                  {aiYukleniyor ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  {aiYukleniyor ? 'Oluşturuluyor...' : form.aciklama ? 'Yeniden Üret' : 'AI ile Üret'}
                </button>
              </div>
              <textarea name="aciklama" value={form.aciklama} onChange={handleChange} rows={4}
                placeholder="İlan hakkında detaylı bilgi girin veya AI ile otomatik oluşturun…"
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 resize-none transition-all" />
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
            </div>
            <FotoYukleme
              secilenler={secilenGorseller}
              onSecilenler={setSecilenGorseller}
              mevcutlar={Array.isArray(form.fotograflar) ? form.fotograflar : (form.gorsel ? [form.gorsel] : [])}
              onMevcutSil={(url) => setForm(f => ({
                ...f,
                fotograflar: (Array.isArray(f.fotograflar) ? f.fotograflar : []).filter(u => u !== url),
                gorsel: f.gorsel === url ? ((Array.isArray(f.fotograflar) ? f.fotograflar : []).filter(u => u !== url)[0] || '') : f.gorsel,
              }))}
            />
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Özellikler</p>
              <div className="flex flex-wrap gap-2">
                {[['balkon','Balkon'],['asansor','Asansör'],['otopark','Otopark'],['esyali','Eşyalı'],['site_icerisinde','Site İçinde'],['krediye_uygunluk','Krediye Uygun'],['takas','Takas']].map(([n, l]) => (
                  <Toggle key={n} name={n} label={l} value={form[n]} onChange={handleChange} />
                ))}
              </div>
            </div>
          </div>
        )}

        {adim === 2 && (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Konum</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Şehir</label>
                  <AramaDropdown label="Şehir seçin" value={form.sehir} secenekler={ILLER}
                    onChange={v => handleChange({ target: { name: 'sehir', value: v } })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">İlçe</label>
                  <AramaDropdown label={form.sehir ? 'İlçe seçin' : 'Önce şehir'}
                    value={form.ilce} secenekler={form.sehir ? (ILCELER[form.sehir] || []) : []}
                    onChange={v => handleChange({ target: { name: 'ilce', value: v } })} disabled={!form.sehir} />
                </div>
                <Inp label="Mahalle" name="mahalle" value={form.mahalle} onChange={handleChange} placeholder="Mahalle adı" />
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Fiyat</p>
              <Inp label="Fiyat (₺)" name="fiyat" type="number" value={form.fiyat} onChange={handleChange} placeholder="4500000" zorunlu />
              {form.fiyat && <p className="text-sm font-bold text-blue-600 mt-2">{fiyatFormat(form.fiyat)}</p>}
            </div>
            <div className="bg-slate-50 dark:bg-gray-900 rounded-2xl p-4 border border-slate-100 dark:border-gray-700">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">İlan Özeti</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300"><Building2 size={14} className="text-blue-500" />{form.emlak_turu} · {form.tip}</div>
                {form.oda_sayisi && <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300"><BedDouble size={14} className="text-blue-500" />{form.oda_sayisi}</div>}
                {form.metrekare  && <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300"><Square    size={14} className="text-blue-500" />{form.metrekare} m²</div>}
                {form.sehir      && <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300"><MapPin    size={14} className="text-blue-500" />{form.ilce && form.ilce + ', '}{form.sehir}</div>}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
        <button type="button" onClick={() => adim > 0 && setAdim(a => a - 1)} disabled={adim === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-all">
          <ChevronLeft size={16} />Geri
        </button>
        {adim < 2
          ? <button type="button" onClick={() => setAdim(a => a + 1)}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md transition-all">
              İleri<ChevronRight size={16} />
            </button>
          : <button type="submit" disabled={yukleniyor}
              className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-sm font-bold shadow-md transition-all">
              {yukleniyor
                ? <><Loader2 size={15} className="animate-spin" />{secilenGorseller.length > 0 ? 'Fotoğraflar yükleniyor…' : 'Kaydediliyor…'}</>
                : <><CheckCircle2 size={15} />{duzenle ? 'Güncelle' : 'Yayınla'}</>}
            </button>
        }
      </div>
    </form>
  );

  // ── RENDER ───────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-gray-950 font-sans">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {sidebarAcik && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebar(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64"><Sidebar /></div>
        </div>
      )}

      <div className="flex-1 min-w-0">
        {/* Topbar */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => setSidebar(true)}>
              <Menu size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                {menu === 'mesajlar' && seciliKonusma && (
                  <button onClick={() => setSeciliKonusma(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <ArrowLeft size={16} className="text-gray-600 dark:text-gray-400" />
                  </button>
                )}
                <h1 className="text-base font-extrabold text-gray-900 dark:text-gray-100">{baslikMap[menu] || menu}</h1>
              </div>
              {menu === 'yeni' && (
                <div className="flex gap-1.5 mt-1">
                  {ADIMLAR.map((a, i) => (
                    <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${i === adim ? 'bg-blue-600 text-white' : i < adim ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'}`}>
                      {i + 1}. {a}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          {menu !== 'yeni' && (
            <button onClick={() => menuDegistir('yeni')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors shadow-sm">
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
          {menu === 'mesajlar'      && (seciliKonusma
            ? <KonusmaDetay
                seciliKonusma={seciliKonusma}
                setSeciliKonusma={setSeciliKonusma}
                mesajListRef={mesajListRef}
                mesajListesi={mesajListesi}
                setMesajListesi={setMesajListesi}
                kullanici={kullanici}
                yeniMesaj={yeniMesaj}
                setYeniMesaj={setYeniMesaj}
                mesajGonderFn={mesajGonderFn}
                mesajGond={mesajGond}
              />
            : <MesajlarListesi />
          )}
          {menu === 'aramalar'      && <KayitliAramalar />}
          {menu === 'adresler'      && <KayitliAdresler />}
          {menu === 'bildirimler'   && <Bildirimler />}
          {menu === 'favoriler'     && <Favoriler />}
          {menu === 'uyelik'        && <Uyelik />}
          {menu === 'gizlilik'      && <GizlilikGuvenlik />}
          {menu === 'yardim'        && <YardimDestek />}
          {kurumsal && menu === 'dukkan'        && <DukkanBilgileri />}
          {kurumsal && menu === 'danismanlar'   && <Danismanlar />}
          {kurumsal && menu === 'istatistikler' && <Istatistikler />}
        </div>
      </div>
    </div>
  );
}
