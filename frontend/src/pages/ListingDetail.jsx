import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import {
  MapPin, BedDouble, Square, Building2, Thermometer,
  Layers, ArrowLeft, Heart, Share2, Phone, User,
  Calendar, CheckCircle2, Loader2, AlertCircle, Home,
  ChevronRight, Eye, Maximize2, X, Map, MessageCircle,
  Shield, Flag, ExternalLink, Bath, Car, Trees, Sofa, Hash,
} from 'lucide-react';
import { ilanDetayGetir, ilanlarGetir } from '../services/api';

// ── Fiyat formatlayıcı ──────────────────────────────────────────
const fiyatFormatla = (fiyat) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(fiyat);

const tarihFormatla = (tarih) =>
  new Date(tarih).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });

const GORSEL_FALLBACK = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80';

// ── Harita bileşeni (mini + tam ekran) ─────────────────────────
const noktalanmisIkon = divIcon({
  html: `<div style="width:16px;height:16px;background:#16a34a;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.4)"></div>`,
  className: '',
  iconAnchor: [8, 8],
});

const KonumHaritasi = ({ ilan, tam = false, onKapat }) => {
  const [konum, setKonum]           = useState(null);
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
        const url  = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(sorgu)}&format=json&limit=1&countrycodes=tr`;
        const res  = await fetch(url, { headers: { 'Accept-Language': 'tr', 'User-Agent': 'EmlakNode/1.0' } });
        const veri = await res.json();
        if (veri.length > 0) setKonum([parseFloat(veri[0].lat), parseFloat(veri[0].lon)]);
      } catch { /* konum bulunamadı */ }
      setYukleniyor(false);
    };
    getKonum();
  }, [ilan]);

  if (tam) return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black">
      <div className="flex items-center justify-between px-4 py-3 bg-white shadow-md flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Map size={16} className="text-green-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate max-w-xs sm:max-w-lg">{ilan.baslik}</p>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <MapPin size={10} className="text-green-500" />
              {[ilan.ilce, ilan.sehir].filter(Boolean).join(', ')}
            </p>
          </div>
        </div>
        <button onClick={onKapat} className="ml-4 flex-shrink-0 w-9 h-9 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-xl flex items-center justify-center transition-colors">
          <X size={18} />
        </button>
      </div>
      <div className="flex-1 relative">
        {yukleniyor && <div className="absolute inset-0 bg-slate-800 flex items-center justify-center z-10"><Loader2 size={28} className="animate-spin text-green-400" /></div>}
        {!yukleniyor && !konum && <div className="absolute inset-0 bg-slate-800 flex items-center justify-center z-10"><MapPin size={32} className="text-slate-500" /></div>}
        {konum && (
          <MapContainer center={konum} zoom={16} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
            <Marker position={konum} icon={noktalanmisIkon}>
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{ilan.baslik}</p>
                  {ilan.fiyat && <p style={{ color: '#16a34a', fontWeight: 700, fontSize: 15 }}>{fiyatFormatla(ilan.fiyat)}</p>}
                  {(ilan.ilce || ilan.sehir) && <p style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>📍 {[ilan.ilce, ilan.sehir].filter(Boolean).join(', ')}</p>}
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        )}
      </div>
    </div>
  );

  if (yukleniyor) return <div className="h-52 bg-slate-100 rounded-2xl flex items-center justify-center"><Loader2 size={22} className="animate-spin text-green-500" /></div>;
  if (!konum) return null;
  return (
    <div className="rounded-2xl overflow-hidden" style={{ height: 260 }}>
      <MapContainer center={konum} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
        <Marker position={konum} icon={noktalanmisIkon} />
      </MapContainer>
    </div>
  );
};

// ── Skeleton yüklenme ───────────────────────────────────────────
const SkeletonDetail = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
    <div className="h-4 bg-slate-200 rounded w-64 mb-8" />
    <div className="h-10 bg-slate-200 rounded w-3/4 mb-4" />
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 space-y-4">
        <div className="h-80 bg-slate-200 rounded-2xl" />
        <div className="bg-white rounded-2xl p-6 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-4 bg-slate-100 rounded" />)}</div>
      </div>
      <div className="lg:col-span-4 space-y-4">
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    </div>
  </div>
);

// ── Küçük ilan kartı (benzer ilanlar + firma diğer ilanlar) ─────
const MiniIlanKarti = ({ ilan }) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/ilan/${ilan.id}`)}
      className="cursor-pointer group border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-all bg-white"
    >
      <div className="relative h-36 overflow-hidden bg-gray-100">
        <img
          src={ilan.gorsel || GORSEL_FALLBACK}
          alt={ilan.baslik}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => { e.currentTarget.src = GORSEL_FALLBACK; }}
        />
        {ilan.tip && (
          <span className="absolute top-2 left-2 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
            {ilan.tip}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-green-700 transition-colors">{ilan.baslik}</p>
        {(ilan.ilce || ilan.sehir) && (
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <MapPin size={10} className="text-green-500" />
            {[ilan.ilce, ilan.sehir].filter(Boolean).join(' - ')}
          </p>
        )}
        <p className="text-green-700 font-extrabold text-sm mt-1.5">{fiyatFormatla(ilan.fiyat)}</p>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// ANA BİLEŞEN
// ════════════════════════════════════════════════════════════════
const ListingDetail = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [ilan, setIlan]               = useState(null);
  const [yukleniyor, setYukleniyor]   = useState(true);
  const [hata, setHata]               = useState(null);
  const [begenildi, setBegenildi]     = useState(false);
  const [haritaAcik, setHaritaAcik]   = useState(false);
  const [firmaIlanlar, setFirmaIlanlar] = useState([]);
  const [benzerIlanlar, setBenzerIlanlar] = useState([]);

  useEffect(() => {
    const detayGetir = async () => {
      try {
        setYukleniyor(true); setHata(null);
        const yanit = await ilanDetayGetir(id);
        const veri  = yanit.data.ilan;
        setIlan(veri);

        // Aynı ofisten diğer ilanlar
        if (veri.dukkan_id) {
          const ofisYanit = await ilanlarGetir({ dukkan_id: veri.dukkan_id, limit: 4 });
          setFirmaIlanlar((ofisYanit.data.ilanlar || []).filter(i => String(i.id) !== String(id)).slice(0, 3));
        }
        // Benzer ilanlar (aynı şehir)
        if (veri.sehir) {
          const benzerYanit = await ilanlarGetir({ sehir: veri.sehir, limit: 5 });
          setBenzerIlanlar((benzerYanit.data.ilanlar || []).filter(i => String(i.id) !== String(id)).slice(0, 4));
        }
      } catch (err) {
        setHata(err.response?.status === 404 ? 'Bu ilan bulunamadı.' : 'İlan yüklenirken hata oluştu.');
      } finally {
        setYukleniyor(false);
      }
    };
    detayGetir();
  }, [id]);

  if (yukleniyor) return <div className="min-h-screen bg-slate-50"><SkeletonDetail /></div>;

  if (hata) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10 max-w-md w-full text-center">
        <AlertCircle size={36} className="text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">İlan Bulunamadı</h2>
        <p className="text-slate-500 text-sm mb-6">{hata}</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
          <Home size={16} /> Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );

  if (!ilan) return null;

  const gorselUrl = ilan.gorsel || GORSEL_FALLBACK;
  const tip       = ilan.tip || 'Satılık';
  const tipRenk   = tip === 'Satılık' ? 'bg-green-600' : 'bg-blue-500';
  const adSoyad   = ilan.dukkan_adi || 'Emlak Ofisi';
  const bas       = adSoyad.split(' ').map(s => s[0]?.toUpperCase()).slice(0, 2).join('');

  // Özellikler
  const ozellikler = [
    { ikon: BedDouble,   etiket: 'Oda Sayısı',        deger: ilan.oda_sayisi },
    { ikon: Bath,        etiket: 'Banyo Sayısı',       deger: ilan.banyo_sayisi ? `${ilan.banyo_sayisi} Banyo` : null },
    { ikon: Square,      etiket: 'Brüt Alan',          deger: ilan.metrekare ? `${ilan.metrekare} m²` : null },
    { ikon: Building2,   etiket: 'Bina Yaşı',          deger: ilan.bina_yasi != null ? (ilan.bina_yasi === 0 ? 'Sıfır' : `${ilan.bina_yasi} Yıl`) : null },
    { ikon: Layers,      etiket: 'Bulunduğu Kat',      deger: ilan.kat != null ? `${ilan.kat}. Kat` : null },
    { ikon: Layers,      etiket: 'Toplam Kat',         deger: ilan.toplam_kat ? `${ilan.toplam_kat} Kat` : null },
    { ikon: Thermometer, etiket: 'Isınma',             deger: ilan.isinma_tipi },
    { ikon: Calendar,    etiket: 'İlan Tarihi',        deger: ilan.olusturulma_tarihi ? tarihFormatla(ilan.olusturulma_tarihi) : null },
  ].filter(o => o.deger);

  // Boolean özellikler
  const boolOzellikler = [
    { ikon: Trees,  etiket: 'Balkon',         deger: ilan.balkon },
    { ikon: Car,    etiket: 'Otopark',         deger: ilan.otopark },
    { ikon: Sofa,   etiket: 'Eşyalı',         deger: ilan.esyali },
    { ikon: Square, etiket: 'Asansör',         deger: ilan.asansor },
    { ikon: Home,   etiket: 'Site İçerisinde', deger: ilan.site_icerisinde },
  ].filter(o => o.deger);

  // Mahalle arama linkleri
  const mahalleLinkleri = [
    ilan.sehir && ilan.mahalle && `${ilan.mahalle} Mahallesi Satılık Daire İlanları`,
    ilan.sehir && ilan.ilce    && `${ilan.ilce} Satılık Daire İlanları`,
    ilan.sehir                 && `${ilan.sehir} Satılık Konut İlanları`,
    ilan.sehir && ilan.ilce    && `${ilan.ilce} Kiralık Daire İlanları`,
    ilan.sehir                 && `${ilan.sehir} Satılık Arsa İlanları`,
    ilan.sehir && ilan.ilce    && `${ilan.ilce} Satılık İşyeri İlanları`,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ══ BREADCRUMB ÇUBUĞU ══════════════════════════════════════ */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-13 py-2.5">
            <nav className="flex items-center gap-1.5 text-sm text-slate-500 overflow-hidden flex-1">
              <Link to="/" className="flex items-center gap-1 hover:text-green-600 transition-colors font-medium whitespace-nowrap">
                <Home size={13} /> <span>Ana Sayfa</span>
              </Link>
              <ChevronRight size={13} className="flex-shrink-0 text-slate-300" />
              {ilan.sehir && <><span className="text-slate-400 hidden sm:block">{ilan.sehir}</span><ChevronRight size={13} className="flex-shrink-0 text-slate-300 hidden sm:block" /></>}
              {ilan.ilce  && <><span className="text-slate-400 hidden md:block">{ilan.ilce}</span><ChevronRight size={13} className="flex-shrink-0 text-slate-300 hidden md:block" /></>}
              <span className="text-slate-700 font-semibold truncate max-w-xs">{ilan.baslik}</span>
            </nav>
            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
              <button
                onClick={() => setBegenildi(!begenildi)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                  begenildi ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-slate-200 text-slate-500 hover:border-red-200 hover:text-red-400'
                }`}
              >
                <Heart size={13} className={begenildi ? 'fill-red-500' : ''} />
                <span className="hidden sm:inline">Favori</span>
              </button>
              <button
                onClick={() => { navigator.clipboard?.writeText(window.location.href); }}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-slate-300 transition-all"
              >
                <Share2 size={13} />
                <span className="hidden sm:inline">Paylaş</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ══ BAŞLIK ═════════════════════════════════════════════════ */}
        <div className="mb-5">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`${tipRenk} text-white text-xs font-bold px-3 py-1 rounded-full`}>{tip}</span>
            {ilan.emlak_turu && <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1 rounded-full">{ilan.emlak_turu}</span>}
            <span className="flex items-center gap-1 text-xs text-slate-400 border border-slate-200 px-2.5 py-1 rounded-full">
              <Hash size={10} /> İlan No: {ilan.id}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">{ilan.baslik}</h1>
          {(ilan.ilce || ilan.sehir) && (
            <p className="flex items-center gap-1.5 text-slate-500 mt-1.5 text-sm">
              <MapPin size={14} className="text-green-500" />
              {[ilan.mahalle, ilan.ilce, ilan.sehir].filter(Boolean).join(' / ')}
            </p>
          )}
        </div>

        {/* ══ İKİ KOLON ANA LAYOUT ═══════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── SOL: Ana İçerik ──────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-5">

            {/* Görsel */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-200 group shadow-sm">
              <img
                src={gorselUrl}
                alt={ilan.baslik}
                className="w-full h-72 sm:h-[420px] object-cover group-hover:scale-[1.01] transition-transform duration-500"
                onError={e => { e.currentTarget.src = GORSEL_FALLBACK; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              {/* Alt bilgi şeridi */}
              <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                <div className="flex gap-2 flex-wrap">
                  {ilan.oda_sayisi && (
                    <span className="bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <BedDouble size={11} className="text-green-600" /> {ilan.oda_sayisi}
                    </span>
                  )}
                  {ilan.metrekare && (
                    <span className="bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <Square size={11} className="text-green-600" /> {ilan.metrekare} m²
                    </span>
                  )}
                  {ilan.kat != null && (
                    <span className="bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <Layers size={11} className="text-green-600" /> {ilan.kat}. Kat
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setHaritaAcik(true)}
                  className="bg-white/90 backdrop-blur-sm hover:bg-white text-slate-700 hover:text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors"
                >
                  <Map size={11} className="text-green-600" /> Haritada Gör
                </button>
              </div>
            </div>

            {/* İlan Bilgileri grid */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-5 bg-green-600 rounded-full" /> İlan Bilgileri
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-0 divide-y divide-slate-50 border border-slate-100 rounded-xl overflow-hidden">
                {[
                  { etiket: 'İlan No',       deger: `#${ilan.id}` },
                  { etiket: 'Tarih',         deger: ilan.olusturulma_tarihi ? new Date(ilan.olusturulma_tarihi).toLocaleDateString('tr-TR') : '-' },
                  { etiket: 'Kategori',      deger: ilan.emlak_turu || '-' },
                  { etiket: 'Tip',           deger: ilan.tip || '-' },
                  { etiket: 'Net m²',        deger: ilan.metrekare ? `${ilan.metrekare} m²` : '-' },
                  { etiket: 'Oda Sayısı',    deger: ilan.oda_sayisi || '-' },
                  { etiket: 'Bina Kat Say.', deger: ilan.toplam_kat ? `${ilan.toplam_kat} Kat` : '-' },
                  { etiket: 'Bulunduğu Kat', deger: ilan.kat != null ? `${ilan.kat}. Kat` : '-' },
                  { etiket: 'Bina Yaşı',     deger: ilan.bina_yasi != null ? (ilan.bina_yasi === 0 ? 'Sıfır' : `${ilan.bina_yasi} Yıl`) : '-' },
                  { etiket: 'Isınma',        deger: ilan.isinma_tipi || '-' },
                  { etiket: 'Banyo',         deger: ilan.banyo_sayisi ? `${ilan.banyo_sayisi} Banyo` : '-' },
                  { etiket: 'Şehir',         deger: [ilan.ilce, ilan.sehir].filter(Boolean).join(', ') || '-' },
                ].map((item, i) => (
                  <div key={i} className={`px-4 py-3 ${i % 2 === 0 ? 'border-r border-slate-100' : ''} ${i < 9 ? 'border-b border-slate-100' : ''}`}>
                    <p className="text-xs text-slate-400 mb-0.5">{item.etiket}</p>
                    <p className="text-sm font-semibold text-slate-800">{item.deger}</p>
                  </div>
                ))}
              </div>

              {/* Boolean özellikler */}
              {boolOzellikler.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {boolOzellikler.map((o, i) => {
                    const Ikon = o.ikon;
                    return (
                      <span key={i} className="flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-100">
                        <Ikon size={11} /> {o.etiket}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Açıklama */}
            {(ilan.aciklama || ilan.ai_aciklama) && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 bg-green-600 rounded-full" /> İlan Açıklaması
                </h2>
                <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-line">
                  {ilan.aciklama || ilan.ai_aciklama}
                </p>
              </div>
            )}

            {/* Konum Bilgisi */}
            {(ilan.enlem || ilan.boylam || ilan.ilce || ilan.sehir) && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <div className="w-1 h-5 bg-green-600 rounded-full" /> Konum Bilgisi
                  </h2>
                  <button
                    onClick={() => setHaritaAcik(true)}
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all"
                  >
                    <Maximize2 size={12} /> Tam Ekran
                  </button>
                </div>
                <KonumHaritasi ilan={ilan} />
                {(ilan.ilce || ilan.sehir) && (
                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <MapPin size={12} className="text-green-500" />
                      {[ilan.mahalle, ilan.ilce, ilan.sehir].filter(Boolean).join(' / ')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── SAĞ: Fiyat + İletişim + Ofis ────────────────────── */}
          <div className="lg:col-span-4">
            <div className="sticky top-16 space-y-4">

              {/* Fiyat + İletişim kartı */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                {/* Fiyat */}
                <div className="mb-4">
                  <p className="text-3xl font-extrabold text-green-600">{fiyatFormatla(ilan.fiyat)}</p>
                  {ilan.metrekare && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      {Math.round(ilan.fiyat / ilan.metrekare).toLocaleString('tr-TR')} ₺/m²
                    </p>
                  )}
                </div>

                {/* Danışman */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                  <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0">
                    {bas}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{adSoyad}</p>
                    <p className="text-xs text-slate-400">Emlak Danışmanı</p>
                  </div>
                </div>

                {/* Butonlar */}
                <div className="space-y-2.5">
                  <button className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl transition-all hover:shadow-lg hover:shadow-green-200 active:scale-[.98] text-sm">
                    <Phone size={15} /> Telefona Bak
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 border-2 border-green-600 text-green-600 hover:bg-green-50 font-bold py-3 px-4 rounded-xl transition-all text-sm">
                    <MessageCircle size={15} /> Mesaj Gönder
                  </button>
                  {ilan.dukkan_id && (
                    <button className="w-full flex items-center justify-center gap-2 border border-slate-200 text-slate-600 hover:border-green-400 hover:text-green-600 hover:bg-green-50 font-semibold py-2.5 px-4 rounded-xl transition-all text-sm">
                      <ExternalLink size={14} /> Firma Profiline Git
                    </button>
                  )}
                  {(ilan.enlem || ilan.boylam || ilan.ilce || ilan.sehir) && (
                    <button
                      onClick={() => setHaritaAcik(true)}
                      className="w-full flex items-center justify-center gap-2 border border-slate-200 text-slate-600 hover:border-green-400 hover:text-green-600 hover:bg-green-50 font-semibold py-2.5 px-4 rounded-xl transition-all text-sm"
                    >
                      <Map size={14} /> Haritada Göster
                    </button>
                  )}
                </div>
              </div>

              {/* Güvenlik + Hatalı İlan */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
                <div className="flex items-start gap-3 text-xs text-slate-500 leading-relaxed">
                  <Shield size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-700 mb-0.5">Güvenlik Önerileri</p>
                    <p>Gayrimenkulü görmeden, sözleşme imzalamadan ödeme yapmayın. Şüpheli durumlarda destek hattını arayın.</p>
                  </div>
                </div>
                <div className="border-t border-slate-50 pt-3">
                  <button className="flex items-center gap-2 text-xs text-red-400 hover:text-red-600 font-semibold transition-colors">
                    <Flag size={13} /> Hatalı İlan Bildir
                  </button>
                </div>
              </div>

              {/* Geri dön */}
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:border-green-300 hover:text-green-600 transition-all text-sm font-medium group"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Geri Dön
              </button>
            </div>
          </div>
        </div>

        {/* ══ FİRMA KÜNYESİ ══════════════════════════════════════════ */}
        {(ilan.dukkan_adi || firmaIlanlar.length > 0) && (
          <div className="mt-8 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-slate-900">Firma Künyesi</h2>
                {firmaIlanlar.length > 0 && (
                  <button className="text-sm text-green-600 hover:underline font-semibold flex items-center gap-1">
                    Diğer İlanlarını Gör <ChevronRight size={14} />
                  </button>
                )}
              </div>

              {/* Ofis profil satırı */}
              <div className="flex items-center gap-4 mt-4">
                <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0">
                  {bas}
                </div>
                <div>
                  <p className="font-extrabold text-slate-900">{adSoyad}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {[ilan.dukkan_ilce, ilan.dukkan_sehir].filter(Boolean).join(', ') || [ilan.ilce, ilan.sehir].filter(Boolean).join(', ')}
                  </p>
                  {ilan.vergi_no && (
                    <p className="text-xs text-slate-400 mt-0.5">Vergi No: {ilan.vergi_no}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Firmanın diğer ilanları */}
            {firmaIlanlar.length > 0 && (
              <div className="p-6">
                <p className="text-sm font-bold text-slate-700 mb-4">Firmanın Diğer İlanları</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {firmaIlanlar.map(i => <MiniIlanKarti key={i.id} ilan={i} />)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ BU İLANA BAKANLAR DA BAKTI ════════════════════════════ */}
        {benzerIlanlar.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-extrabold text-slate-900 mb-4">Bu İlana Bakanlar da Baktı</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {benzerIlanlar.map(i => <MiniIlanKarti key={i.id} ilan={i} />)}
            </div>
          </div>
        )}

        {/* ══ MAHALLE ARAMA LİNKLERİ ════════════════════════════════ */}
        {mahalleLinkleri.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-sm font-bold text-slate-700 mb-3">
              {ilan.ilce || ilan.sehir} Bölgesinde Ara
            </h2>
            <div className="flex flex-wrap gap-2">
              {mahalleLinkleri.map((link, i) => (
                <button
                  key={i}
                  onClick={() => navigate(`/?sehir=${encodeURIComponent(ilan.sehir || '')}&tip=${encodeURIComponent(tip)}`)}
                  className="text-xs text-green-700 bg-green-50 hover:bg-green-100 border border-green-100 px-3 py-1.5 rounded-full transition-colors font-medium"
                >
                  {link}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ══ TAM EKRAN HARİTA MODALI ════════════════════════════════ */}
      {haritaAcik && (
        <KonumHaritasi ilan={ilan} tam={true} onKapat={() => setHaritaAcik(false)} />
      )}
    </div>
  );
};

export default ListingDetail;
