import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { divIcon } from 'leaflet';
import {
  MapPin, BedDouble, Square, Building2, Thermometer,
  Layers, ArrowLeft, Heart, Share2, Phone, User,
  Calendar, CheckCircle2, Loader2, AlertCircle, Home,
  ChevronRight, TrendingUp, Eye,
} from 'lucide-react';
import { ilanDetayGetir } from '../services/api';

// ── Yardımcı: Fiyat formatlayıcı ───────────────────────────────
const fiyatFormatla = (fiyat) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(fiyat);

// ── Mini Harita Bileşeni ────────────────────────────────────────
const noktalanmisIkon = divIcon({
  html: '<div style="width:14px;height:14px;background:#16a34a;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>',
  className: '',
  iconAnchor: [7, 7],
});

const MiniHarita = ({ ilan }) => {
  const [konum, setKonum] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const getKonum = async () => {
      if (ilan.enlem && ilan.boylam) {
        setKonum([parseFloat(ilan.enlem), parseFloat(ilan.boylam)]);
        setYukleniyor(false);
        return;
      }
      const sorgu = [ilan.mahalle, ilan.ilce, ilan.sehir].filter(Boolean).join(', ');
      if (!sorgu) { setYukleniyor(false); return; }
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(sorgu)}&format=json&limit=1&countrycodes=tr`;
        const res  = await fetch(url, { headers: { 'Accept-Language': 'tr', 'User-Agent': 'EmlakNode/1.0' } });
        const veri = await res.json();
        if (veri.length > 0) setKonum([parseFloat(veri[0].lat), parseFloat(veri[0].lon)]);
      } catch { /* konum bulunamadı */ }
      setYukleniyor(false);
    };
    getKonum();
  }, [ilan]);

  if (yukleniyor) return (
    <div className="h-56 bg-slate-100 rounded-2xl flex items-center justify-center">
      <Loader2 size={22} className="animate-spin text-green-500" />
    </div>
  );
  if (!konum) return null;

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm" style={{ height: 220 }}>
      <MapContainer center={konum} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={true} scrollWheelZoom={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
        <Marker position={konum} icon={noktalanmisIkon} />
      </MapContainer>
    </div>
  );
};

// ── Yardımcı: Tarih formatlayıcı ───────────────────────────────
const tarihFormatla = (tarih) =>
  new Date(tarih).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

// ── Skeleton Yüklenme Ekranı ────────────────────────────────────
const SkeletonDetail = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
    <div className="h-4 bg-slate-200 rounded w-64 mb-8" />
    <div className="h-12 bg-slate-200 rounded w-3/4 mb-4" />
    <div className="h-8 bg-green-100 rounded w-48 mb-8" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <div className="h-80 bg-slate-200 rounded-2xl" />
        <div className="bg-white rounded-2xl p-6 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-slate-100 rounded w-full" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-48 bg-slate-200 rounded-2xl" />
        <div className="h-40 bg-slate-200 rounded-2xl" />
      </div>
    </div>
  </div>
);

// ── Özellik Satırı Componenti ───────────────────────────────────
const OzellikSatiri = ({ icon: Icon, etiket, deger, renk = 'text-green-600' }) => {
  if (!deger && deger !== 0) return null;
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-2.5 text-slate-600">
        <div className={`p-1.5 bg-green-50 rounded-lg`}>
          <Icon size={15} className={renk} />
        </div>
        <span className="text-sm font-medium">{etiket}</span>
      </div>
      <span className="text-sm font-semibold text-slate-800">{deger}</span>
    </div>
  );
};

// ── Ana Bileşen ──────────────────────────────────────────────────
const ListingDetail = () => {
  const { id } = useParams();
  const [ilan, setIlan]             = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata]             = useState(null);
  const [begenildi, setBegenildi]   = useState(false);
  const [gorsellendi, setGorsellendi] = useState(false);

  useEffect(() => {
    const detayGetir = async () => {
      try {
        setYukleniyor(true);
        setHata(null);
        const yanit = await ilanDetayGetir(id);
        setIlan(yanit.data.ilan);
      } catch (err) {
        if (err.response?.status === 404) {
          setHata('Bu ilan bulunamadı veya kaldırılmış olabilir.');
        } else {
          setHata('İlan yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
        }
      } finally {
        setYukleniyor(false);
      }
    };
    detayGetir();
  }, [id]);

  if (yukleniyor) return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 pt-8 flex items-center gap-2 text-slate-400">
        <Loader2 size={18} className="animate-spin text-green-600" />
        <span className="text-sm">İlan yükleniyor...</span>
      </div>
      <SkeletonDetail />
    </div>
  );

  if (hata) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} className="text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">İlan Bulunamadı</h2>
        <p className="text-slate-500 text-sm mb-6">{hata}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          <Home size={16} />
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );

  if (!ilan) return null;

  const gorselUrl = ilan.gorsel || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80';
  const tip       = ilan.tip || 'Satılık';
  const tipRenk   = tip === 'Satılık' ? 'bg-green-600' : 'bg-blue-500';

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Breadcrumb ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Breadcrumb sol */}
            <nav className="flex items-center gap-1.5 text-sm text-slate-500 overflow-hidden">
              <Link to="/" className="flex items-center gap-1 hover:text-green-600 transition-colors font-medium whitespace-nowrap">
                <Home size={14} />
                <span>Ana Sayfa</span>
              </Link>
              <ChevronRight size={14} className="flex-shrink-0 text-slate-300" />
              <span className="text-slate-400 hidden sm:block">{ilan.sehir}</span>
              <ChevronRight size={14} className="flex-shrink-0 text-slate-300 hidden sm:block" />
              <span className="text-slate-800 font-semibold truncate max-w-xs">{ilan.baslik}</span>
            </nav>

            {/* Aksiyonlar sağ */}
            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
              <button
                onClick={() => setBegenildi(!begenildi)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all ${
                  begenildi
                    ? 'bg-red-50 border-red-200 text-red-500'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-red-200 hover:text-red-400'
                }`}
              >
                <Heart size={14} className={begenildi ? 'fill-red-500' : ''} />
                <span className="hidden sm:inline">{begenildi ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}</span>
              </button>
              <button
                onClick={() => navigator.clipboard?.writeText(window.location.href)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 transition-all"
              >
                <Share2 size={14} />
                <span className="hidden sm:inline">Paylaş</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Başlık Bandı ───────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Tip rozeti */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className={`${tipRenk} text-white text-xs font-bold px-3 py-1.5 rounded-full`}>
                  {tip}
                </span>
                {ilan.oneCikan && (
                  <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1.5 rounded-full">
                    ⭐ Öne Çıkan
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-slate-400 border border-slate-200 px-2.5 py-1.5 rounded-full">
                  <Eye size={12} />
                  İlan #{ilan.id}
                </span>
              </div>

              {/* Başlık */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-2">
                {ilan.baslik}
              </h1>

              {/* Konum */}
              <div className="flex items-center gap-1.5 text-slate-500">
                <MapPin size={15} className="text-green-500" />
                <span className="text-sm">
                  {ilan.ilce && `${ilan.ilce}, `}{ilan.sehir}
                </span>
              </div>
            </div>

            {/* Fiyat */}
            <div className="text-right flex-shrink-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-green-600 tracking-tight">
                {fiyatFormatla(ilan.fiyat)}
              </div>
              {ilan.metrekare && (
                <div className="text-sm text-slate-400 mt-1">
                  {Math.round(ilan.fiyat / ilan.metrekare).toLocaleString('tr-TR')} ₺/m²
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Ana İçerik ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── SOL KOLON (2/3) ─────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Görsel */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-200 shadow-md group">
              {gorsellendi ? null : (
                <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center">
                  <Home size={40} className="text-slate-300" />
                </div>
              )}
              <img
                src={gorselUrl}
                alt={ilan.baslik}
                onLoad={() => setGorsellendi(true)}
                className={`w-full h-72 sm:h-96 object-cover transition-all duration-500 group-hover:scale-[1.02] ${
                  gorsellendi ? 'opacity-100' : 'opacity-0'
                }`}
              />
              {/* Görsel üstü degradesi */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

              {/* Görsel altı bilgi şeridi */}
              <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
                <div className="flex gap-2">
                  {ilan.oda_sayisi && (
                    <span className="bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <BedDouble size={12} className="text-green-600" />
                      {ilan.oda_sayisi}
                    </span>
                  )}
                  {ilan.metrekare && (
                    <span className="bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <Square size={12} className="text-green-600" />
                      {ilan.metrekare} m²
                    </span>
                  )}
                </div>
                {ilan.olusturulma_tarihi && (
                  <span className="bg-black/40 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1">
                    <Calendar size={11} />
                    {tarihFormatla(ilan.olusturulma_tarihi)}
                  </span>
                )}
              </div>
            </div>

            {/* Açıklama Kartı */}
            {(ilan.aciklama || ilan.ai_aciklama) && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-green-600 rounded-full" />
                  İlan Açıklaması
                </h2>
                <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-line">
                  {ilan.aciklama || ilan.ai_aciklama}
                </p>
              </div>
            )}

            {/* AI Açıklama (ayrı göster) */}
            {ilan.ai_aciklama && ilan.aciklama && (
              <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-3xl border border-violet-100 p-6 sm:p-8">
                <h2 className="text-lg font-bold text-violet-800 mb-3 flex items-center gap-2">
                  <TrendingUp size={18} className="text-violet-500" />
                  AI Destekli Analiz
                </h2>
                <p className="text-violet-700 leading-relaxed text-sm whitespace-pre-line">
                  {ilan.ai_aciklama}
                </p>
              </div>
            )}

            {/* Konum Kartı — gerçek Leaflet harita */}
            {(ilan.enlem || ilan.boylam || ilan.ilce || ilan.sehir) && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <div className="w-1 h-6 bg-green-600 rounded-full" />
                    Konum
                  </h2>
                  {(ilan.ilce || ilan.sehir) && (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin size={12} className="text-green-500" />
                      {[ilan.ilce, ilan.sehir].filter(Boolean).join(', ')}
                    </span>
                  )}
                </div>
                <MiniHarita ilan={ilan} />
              </div>
            )}
          </div>

          {/* ── SAĞ KOLON (1/3) ─────────────────────────────────── */}
          <div className="space-y-5">

            {/* Özellikler Kartı */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CheckCircle2 size={17} className="text-green-600" />
                İlan Özellikleri
              </h2>

              <div className="divide-y divide-slate-50">
                <OzellikSatiri icon={BedDouble}   etiket="Oda Sayısı"    deger={ilan.oda_sayisi} />
                <OzellikSatiri icon={Square}       etiket="Brüt Alan"     deger={ilan.metrekare ? `${ilan.metrekare} m²` : null} />
                <OzellikSatiri
                  icon={Building2}
                  etiket="Bina Yaşı"
                  deger={ilan.bina_yasi != null ? (ilan.bina_yasi === 0 ? 'Sıfır Bina' : `${ilan.bina_yasi} Yıl`) : null}
                />
                <OzellikSatiri icon={Layers}       etiket="Bulunduğu Kat" deger={ilan.kat != null ? `${ilan.kat}. Kat` : null} />
                <OzellikSatiri icon={Thermometer}  etiket="Isınma"        deger={ilan.isinma_tipi} />
                <OzellikSatiri
                  icon={Calendar}
                  etiket="İlan Tarihi"
                  deger={ilan.olusturulma_tarihi ? tarihFormatla(ilan.olusturulma_tarihi) : null}
                />
              </div>
            </div>

            {/* Ofis / İrtibat Kartı */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Building2 size={17} className="text-green-600" />
                Emlak Ofisi
              </h2>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Building2 size={20} className="text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">
                    {ilan.dukkan_adi || 'Emlak Ofisi'}
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin size={11} />
                    {ilan.ilce && `${ilan.ilce}, `}{ilan.sehir}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <button className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-green-300 active:scale-[0.98] text-sm">
                  <Phone size={15} />
                  Ara — İletişime Geç
                </button>
                <button className="w-full flex items-center justify-center gap-2 border border-green-300 text-green-600 hover:bg-green-50 font-semibold py-3 px-4 rounded-xl transition-all text-sm">
                  <User size={15} />
                  Danışman Bilgileri
                </button>
              </div>
            </div>

            {/* Geri Dön Butonu */}
            <Link
              to="/"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-slate-200 text-slate-500 hover:border-green-300 hover:text-green-600 transition-all text-sm font-medium group"
            >
              <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
              İlan Listesine Dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
