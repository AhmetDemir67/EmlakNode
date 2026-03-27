import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home, Plus, List, LogOut, User,
  Loader2, CheckCircle2, AlertCircle, X,
  Building2, TrendingUp, Eye, FileText,
} from 'lucide-react';
import { ilanEkle } from '../services/api';

// ── Yardımcı: Kullanıcı bilgisini localStorage'dan al ──────────
const mevcutKullanici = () => {
  try { return JSON.parse(localStorage.getItem('kullanici')) || {}; }
  catch { return {}; }
};

// ── Boş Form ───────────────────────────────────────────────────
const BOSLUK = {
  baslik: '', aciklama: '', fiyat: '', metrekare: '',
  oda_sayisi: '', bina_yasi: '', kat: '', isinma_tipi: '',
  enlem: '', boylam: '',
};

// ── Sidebar Linki ─────────────────────────────────────────────
const SidebarLink = ({ icon: Icon, label, aktif = false, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
      aktif
        ? 'bg-orange-500 text-white shadow-md'
        : 'text-slate-400 hover:bg-slate-700 hover:text-white'
    }`}
  >
    <Icon size={18} />
    {label}
  </button>
);

// ── Stat Kartı ────────────────────────────────────────────────
const StatKart = ({ icon: Icon, renk, baslik, deger, aciklama }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-3">
      <div className={`p-2.5 rounded-xl ${renk}`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
    <div className="text-2xl font-bold text-gray-900">{deger}</div>
    <div className="text-sm font-medium text-gray-700 mt-0.5">{baslik}</div>
    <div className="text-xs text-gray-400 mt-1">{aciklama}</div>
  </div>
);

// ── Input Bileşeni ────────────────────────────────────────────
const FormInput = ({ label, name, type = 'text', placeholder, value, onChange, zorunlu }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {label} {zorunlu && <span className="text-red-400">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
    />
  </div>
);

// ── Ana Dashboard Bileşeni ────────────────────────────────────
const Dashboard = () => {
  const navigate  = useNavigate();
  const kullanici = mevcutKullanici();
  const [aktifMenu, setAktifMenu] = useState('yeni-ilan');

  // Form state
  const [form, setForm]             = useState(BOSLUK);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [basarili, setBasarili]     = useState(null);
  const [hata, setHata]             = useState(null);

  // Çıkış yap
  const cikisYap = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('kullanici');
    navigate('/login');
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setHata(null);
  };

  // Form gönder
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.baslik || !form.fiyat || !form.metrekare) {
      setHata('Başlık, fiyat ve metrekare zorunlu alanlardır.');
      return;
    }

    try {
      setYukleniyor(true);
      setHata(null);
      setBasarili(null);

      // api.js'deki axios instance JWT token'ı otomatik header'a ekliyor!
      const yanit = await ilanEkle(form);

      setBasarili(`"${yanit.data.ilan.baslik}" ilanı başarıyla eklendi! (ID: ${yanit.data.ilan.id})`);
      setForm(BOSLUK); // Formu temizle
    } catch (err) {
      setHata(err.response?.data?.mesaj || 'İlan eklenirken bir hata oluştu.');
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">

      {/* ── SIDEBAR ──────────────────────────────────────────── */}
      <aside className="w-64 flex flex-col bg-slate-800 border-r border-slate-700 flex-shrink-0">
        {/* Logo */}
        <div className="p-5 border-b border-slate-700">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-orange-500 text-white p-1.5 rounded-lg">
              <Home size={18} />
            </div>
            <span className="text-base font-bold text-white">
              Emlak<span className="text-orange-400">Node</span>
            </span>
          </Link>
        </div>

        {/* Kullanıcı Bilgisi */}
        <div className="px-4 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
              <User size={16} className="text-white" />
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-semibold text-white truncate">{kullanici.ad_soyad || 'Kullanıcı'}</div>
              <div className="text-xs text-slate-400 capitalize">{kullanici.rol || 'danışman'}</div>
            </div>
          </div>
        </div>

        {/* Navigasyon */}
        <nav className="flex-1 p-3 space-y-1">
          <SidebarLink
            icon={Plus}
            label="Yeni İlan Ekle"
            aktif={aktifMenu === 'yeni-ilan'}
            onClick={() => setAktifMenu('yeni-ilan')}
          />
          <SidebarLink
            icon={List}
            label="İlanlarım"
            aktif={aktifMenu === 'ilanlarim'}
            onClick={() => setAktifMenu('ilanlarim')}
          />
          <SidebarLink
            icon={TrendingUp}
            label="İstatistikler"
            aktif={aktifMenu === 'istatistik'}
            onClick={() => setAktifMenu('istatistik')}
          />
          <div className="pt-2 border-t border-slate-700 mt-2">
            <Link to="/">
              <SidebarLink icon={Eye} label="Siteyi Görüntüle" />
            </Link>
          </div>
        </nav>

        {/* Çıkış */}
        <div className="p-3 border-t border-slate-700">
          <button
            onClick={cikisYap}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={16} />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* ── ANA İÇERİK ───────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-10">
          <h1 className="text-xl font-bold text-gray-900">
            {aktifMenu === 'yeni-ilan' && 'Yeni İlan Ekle'}
            {aktifMenu === 'ilanlarim' && 'İlanlarım'}
            {aktifMenu === 'istatistik' && 'İstatistikler'}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {aktifMenu === 'yeni-ilan' && 'Formu doldurarak sisteme yeni ilan ekle'}
            {aktifMenu === 'ilanlarim' && 'Ofisine ait tüm ilanlar'}
            {aktifMenu === 'istatistik' && 'Performans göstergeleri'}
          </p>
        </div>

        <div className="p-8">
          {/* Stat Kartları */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatKart icon={FileText} renk="bg-orange-500" baslik="Toplam İlan" deger="1" aciklama="bu ay +1 eklendi" />
            <StatKart icon={Eye} renk="bg-blue-500" baslik="Görüntülenme" deger="248" aciklama="son 30 gün" />
            <StatKart icon={TrendingUp} renk="bg-green-500" baslik="Aktif İlan" deger="1" aciklama="yayında" />
            <StatKart icon={Building2} renk="bg-purple-500" baslik="Ofis" deger="Test Ofisi" aciklama="bağlı ofis" />
          </div>

          {/* Yeni İlan Formu */}
          {aktifMenu === 'yeni-ilan' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Plus size={16} className="text-orange-500" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-sm">İlan Bilgileri</h2>
                  <p className="text-xs text-gray-400">Zorunlu alanlar * ile işaretlidir</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Başarı / Hata Mesajları */}
                {basarili && (
                  <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
                    <CheckCircle2 size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-green-800 text-sm font-medium">{basarili}</p>
                    </div>
                    <button type="button" onClick={() => setBasarili(null)}>
                      <X size={16} className="text-green-400 hover:text-green-600" />
                    </button>
                  </div>
                )}
                {hata && (
                  <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                    <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 text-sm">{hata}</p>
                  </div>
                )}

                {/* Temel Bilgiler */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Temel Bilgiler</h3>
                  <div className="space-y-4">
                    <FormInput label="İlan Başlığı" name="baslik" value={form.baslik} onChange={handleChange}
                      placeholder="Örn: Kadıköy'de Deniz Manzaralı 3+1 Daire" zorunlu />
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Açıklama</label>
                      <textarea
                        name="aciklama" value={form.aciklama} onChange={handleChange} rows={3}
                        placeholder="İlan hakkında detaylı bilgi girin..."
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Fiyat & Metrekare */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Fiyat & Ölçüler</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput label="Fiyat (₺)" name="fiyat" type="number" value={form.fiyat}
                      onChange={handleChange} placeholder="Örn: 4500000" zorunlu />
                    <FormInput label="Metrekare (m²)" name="metrekare" type="number" value={form.metrekare}
                      onChange={handleChange} placeholder="Örn: 120" zorunlu />
                  </div>
                </div>

                {/* Konut Özellikleri */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Konut Özellikleri</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Oda Sayısı</label>
                      <select name="oda_sayisi" value={form.oda_sayisi} onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all bg-white">
                        <option value="">Seçin</option>
                        {['Stüdyo','1+1','2+1','3+1','4+1','5+1','6+1'].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <FormInput label="Bina Yaşı" name="bina_yasi" type="number" value={form.bina_yasi}
                      onChange={handleChange} placeholder="0 = Sıfır" />
                    <FormInput label="Kat" name="kat" type="number" value={form.kat}
                      onChange={handleChange} placeholder="Örn: 3" />
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Isıtma Tipi</label>
                      <select name="isinma_tipi" value={form.isinma_tipi} onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all bg-white">
                        <option value="">Seçin</option>
                        {['Kombi','Doğalgaz','Merkezi','Klima','Soba','Yok'].map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Konum (Harita) */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Harita Koordinatları <span className="text-gray-300 font-normal capitalize">(opsiyonel)</span></h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput label="Enlem (Latitude)" name="enlem" type="number" value={form.enlem}
                      onChange={handleChange} placeholder="Örn: 40.9923" />
                    <FormInput label="Boylam (Longitude)" name="boylam" type="number" value={form.boylam}
                      onChange={handleChange} placeholder="Örn: 29.0238" />
                  </div>
                </div>

                {/* Gönder */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    Token otomatik ekleniyor — ofis bilgin: <span className="font-semibold text-gray-600">ID #{kullanici.dukkan_id || '?'}</span>
                  </p>
                  <button
                    type="submit"
                    disabled={yukleniyor}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-md hover:shadow-lg"
                  >
                    {yukleniyor
                      ? <><Loader2 size={16} className="animate-spin" /> Ekleniyor...</>
                      : <><Plus size={16} /> İlanı Yayınla</>
                    }
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Diğer Menüler - Placeholder */}
          {aktifMenu === 'ilanlarim' && (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
              <List size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">İlanlarım listesi yakında eklenecek</p>
              <p className="text-gray-400 text-sm mt-1">GET /api/ilanlar ile kendi ilanların listelenecek</p>
            </div>
          )}
          {aktifMenu === 'istatistik' && (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
              <TrendingUp size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">İstatistikler yakında eklenecek</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
