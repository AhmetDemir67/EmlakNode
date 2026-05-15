import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import {
  MapPin, BedDouble, Square, Building2, Thermometer,
  Layers, ArrowLeft, Heart, Share2, Phone, User,
  Calendar, CheckCircle2, Loader2, AlertCircle, Home,
  ChevronLeft, ChevronRight, Eye, Maximize2, X, Map, MessageCircle,
  Shield, Flag, ExternalLink, Bath, Car, Trees, Sofa, Hash, Send,
  Train, Bus, Navigation, Footprints, Sparkles, TrendingUp, RotateCcw,
} from 'lucide-react';
import { ilanDetayGetir, ilanlarGetir, favoriEkle, favoriSil, favoriKontrol, mesajGonder, aiUlasimAnalizi } from '../services/api';

// ── Fiyat formatlayıcı ──────────────────────────────────────────
const fiyatFormatla = (fiyat) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(fiyat);

const tarihFormatla = (tarih) =>
  new Date(tarih).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });

const GORSEL_FALLBACK = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80';

// ── Harita bileşeni (mini + tam ekran) ─────────────────────────
const noktalanmisIkon = divIcon({
  html: `<div style="width:16px;height:16px;background:#2563eb;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.4)"></div>`,
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
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Map size={16} className="text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate max-w-xs sm:max-w-lg">{ilan.baslik}</p>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <MapPin size={10} className="text-blue-500" />
              {[ilan.ilce, ilan.sehir].filter(Boolean).join(', ')}
            </p>
          </div>
        </div>
        <button onClick={onKapat} className="ml-4 flex-shrink-0 w-9 h-9 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-xl flex items-center justify-center transition-colors">
          <X size={18} />
        </button>
      </div>
      <div className="flex-1 relative">
        {yukleniyor && (
          <div className="absolute inset-0 bg-slate-800 flex flex-col items-center justify-center z-10 gap-3">
            <Loader2 size={28} className="animate-spin text-blue-400" />
            <p className="text-slate-400 text-sm">Konum yükleniyor…</p>
          </div>
        )}
        {!yukleniyor && !konum && (
          <div className="absolute inset-0 bg-slate-800 flex flex-col items-center justify-center z-10 gap-4 text-center px-6">
            <div className="w-16 h-16 bg-slate-700 rounded-2xl flex items-center justify-center">
              <MapPin size={28} className="text-slate-400" />
            </div>
            <div>
              <p className="text-white font-semibold">Konum Bulunamadı</p>
              <p className="text-slate-400 text-sm mt-1">Bu ilan için harita koordinatı mevcut değil.</p>
            </div>
            <button onClick={onKapat}
              className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors">
              Geri Dön
            </button>
          </div>
        )}
        {konum && (
          <MapContainer center={konum} zoom={16} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
            <Marker position={konum} icon={noktalanmisIkon}>
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{ilan.baslik}</p>
                  {ilan.fiyat && <p style={{ color: '#2563eb', fontWeight: 700, fontSize: 15 }}>{fiyatFormatla(ilan.fiyat)}</p>}
                  {(ilan.ilce || ilan.sehir) && <p style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>📍 {[ilan.ilce, ilan.sehir].filter(Boolean).join(', ')}</p>}
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        )}
      </div>
    </div>
  );

  if (yukleniyor) return <div className="h-52 bg-slate-100 rounded-2xl flex items-center justify-center"><Loader2 size={22} className="animate-spin text-blue-500" /></div>;
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
          <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
            {ilan.tip}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-700 transition-colors">{ilan.baslik}</p>
        {(ilan.ilce || ilan.sehir) && (
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <MapPin size={10} className="text-blue-500" />
            {[ilan.ilce, ilan.sehir].filter(Boolean).join(' - ')}
          </p>
        )}
        <p className="text-blue-700 font-extrabold text-sm mt-1.5">{fiyatFormatla(ilan.fiyat)}</p>
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
  const [favYukleniyor, setFavYuk]    = useState(false);
  const [telefonGoster, setTelGoster] = useState(false);
  const [mesajModAcik, setMesajMod]   = useState(false);
  const [mesajMetni, setMesajMetni]   = useState('');
  const [mesajGond, setMesajGond]     = useState(false);
  const [mesajGondOk, setMesajGondOk] = useState(false);
  const [haritaAcik, setHaritaAcik]   = useState(false);
  const [aktifFoto, setAktifFoto]     = useState(0);
  const [firmaIlanlar, setFirmaIlanlar]   = useState([]);
  const [benzerIlanlar, setBenzerIlanlar] = useState([]);
  const [bildirModal, setBildirModal]     = useState(false);
  const [bildirNeden, setBildirNeden]     = useState('');
  const [bildirGond, setBildirGond]       = useState(false);
  const [ulasim, setUlasim]               = useState(null);
  const [ulasimYukleniyor, setUlasimYuk]  = useState(false);
  const firmaRef = useRef(null);

  const girisYapilmis = !!localStorage.getItem('token');

  const ulasimGetir = async () => {
    if (!ilan?.sehir) return;
    setUlasimYuk(true);
    try {
      const r = await aiUlasimAnalizi({ sehir: ilan.sehir, ilce: ilan.ilce, mahalle: ilan.mahalle });
      setUlasim(r.data.ulasim);
    } catch {
      toast.error('Ulaşım bilgisi alınamadı.');
    } finally {
      setUlasimYuk(false);
    }
  };

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
        // Favori kontrolü
        if (localStorage.getItem('token')) {
          favoriKontrol(id).then(r => setBegenildi(r.data.favori || false)).catch(() => {});
        }

        // Benzer ilanlar — önce aynı tip+şehir, yeterli değilse sadece şehir
        if (veri.sehir) {
          const exclude = (liste) => liste.filter(i => String(i.id) !== String(id));
          let liste = [];
          if (veri.tip) {
            const r = await ilanlarGetir({ sehir: veri.sehir, tip: veri.tip, limit: 9 });
            liste = exclude(r.data.ilanlar || []);
          }
          if (liste.length < 4) {
            const r2 = await ilanlarGetir({ sehir: veri.sehir, limit: 9 });
            const ek = exclude(r2.data.ilanlar || []).filter(i => !liste.find(x => x.id === i.id));
            liste = [...liste, ...ek];
          }
          setBenzerIlanlar(liste.slice(0, 8));
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
        <Link to="/" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
          <Home size={16} /> Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );

  if (!ilan) return null;

  const gorselUrl = ilan.gorsel || GORSEL_FALLBACK;
  const galeri    = Array.isArray(ilan.fotograflar) && ilan.fotograflar.length > 0
    ? ilan.fotograflar
    : [gorselUrl];
  const tip       = ilan.tip || 'Satılık';
  const tipRenk   = tip === 'Satılık' ? 'bg-blue-600' : 'bg-blue-500';
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
              <Link to="/" className="flex items-center gap-1 hover:text-blue-600 transition-colors font-medium whitespace-nowrap">
                <Home size={13} /> <span>Ana Sayfa</span>
              </Link>
              <ChevronRight size={13} className="flex-shrink-0 text-slate-300" />
              {ilan.sehir && <><span className="text-slate-400 hidden sm:block">{ilan.sehir}</span><ChevronRight size={13} className="flex-shrink-0 text-slate-300 hidden sm:block" /></>}
              {ilan.ilce  && <><span className="text-slate-400 hidden md:block">{ilan.ilce}</span><ChevronRight size={13} className="flex-shrink-0 text-slate-300 hidden md:block" /></>}
              <span className="text-slate-700 font-semibold truncate max-w-xs">{ilan.baslik}</span>
            </nav>
            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
              <button
                disabled={favYukleniyor}
                onClick={async () => {
                  if (!girisYapilmis) { navigate('/login'); return; }
                  setFavYuk(true);
                  try {
                    if (begenildi) { await favoriSil(id); setBegenildi(false); }
                    else { await favoriEkle(id); setBegenildi(true); }
                  } catch { /* sessiz hata */ }
                  finally { setFavYuk(false); }
                }}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                  begenildi ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-slate-200 text-slate-500 hover:border-red-200 hover:text-red-400'
                }`}
              >
                {favYukleniyor ? <Loader2 size={13} className="animate-spin" /> : <Heart size={13} className={begenildi ? 'fill-red-500' : ''} />}
                <span className="hidden sm:inline">{begenildi ? 'Favoride' : 'Favori'}</span>
              </button>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  toast.success('İlan linki panoya kopyalandı!');
                }}
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
            {ilan.goruntuleme_sayisi > 0 && (
              <span className="flex items-center gap-1 text-xs text-slate-400 border border-slate-200 px-2.5 py-1 rounded-full">
                <Eye size={10} /> {ilan.goruntuleme_sayisi.toLocaleString('tr-TR')} görüntülenme
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">{ilan.baslik}</h1>
          {(ilan.ilce || ilan.sehir) && (
            <p className="flex items-center gap-1.5 text-slate-500 mt-1.5 text-sm">
              <MapPin size={14} className="text-blue-500" />
              {[ilan.mahalle, ilan.ilce, ilan.sehir].filter(Boolean).join(' / ')}
            </p>
          )}
        </div>

        {/* ══ İKİ KOLON ANA LAYOUT ═══════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── SOL: Ana İçerik ──────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-5">

            {/* Görsel Galerisi */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-200 shadow-sm">
              <img
                src={galeri[aktifFoto] || GORSEL_FALLBACK}
                alt={ilan.baslik}
                className="w-full h-72 sm:h-[420px] object-cover transition-opacity duration-200"
                onError={e => { e.currentTarget.src = GORSEL_FALLBACK; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

              {/* Önceki / Sonraki oklar */}
              {galeri.length > 1 && (
                <>
                  <button
                    onClick={() => setAktifFoto(i => (i - 1 + galeri.length) % galeri.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors z-10"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setAktifFoto(i => (i + 1) % galeri.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors z-10"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <div className="absolute top-3 right-3 bg-black/55 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    {aktifFoto + 1} / {galeri.length}
                  </div>
                </>
              )}

              {/* Alt bölüm: thumbnail şeridi + bilgi chips */}
              <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-2">
                {galeri.length > 1 && (
                  <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
                    {galeri.map((url, i) => (
                      <button key={i} type="button" onClick={() => setAktifFoto(i)}
                        className={`flex-shrink-0 w-12 h-9 rounded-lg overflow-hidden border-2 transition-all ${i === aktifFoto ? 'border-white shadow-lg' : 'border-transparent opacity-60 hover:opacity-90'}`}>
                        <img src={url} alt="" className="w-full h-full object-cover" onError={e => { e.currentTarget.src = GORSEL_FALLBACK; }} />
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex items-end justify-between">
                  <div className="flex gap-2 flex-wrap">
                    {ilan.oda_sayisi && (
                      <span className="bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <BedDouble size={11} className="text-blue-600" /> {ilan.oda_sayisi}
                      </span>
                    )}
                    {ilan.metrekare && (
                      <span className="bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <Square size={11} className="text-blue-600" /> {ilan.metrekare} m²
                      </span>
                    )}
                    {ilan.kat != null && (
                      <span className="bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <Layers size={11} className="text-blue-600" /> {ilan.kat}. Kat
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setHaritaAcik(true)}
                    className="bg-white/90 backdrop-blur-sm hover:bg-white text-slate-700 hover:text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors"
                  >
                    <Map size={11} className="text-blue-600" /> Haritada Gör
                  </button>
                </div>
              </div>
            </div>

            {/* İlan Bilgileri grid */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-5 bg-blue-600 rounded-full" /> İlan Bilgileri
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
                      <span key={i} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-100">
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
                  <div className="w-1 h-5 bg-blue-600 rounded-full" /> İlan Açıklaması
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
                    <div className="w-1 h-5 bg-blue-600 rounded-full" /> Konum Bilgisi
                  </h2>
                  <button
                    onClick={() => setHaritaAcik(true)}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all"
                  >
                    <Maximize2 size={12} /> Tam Ekran
                  </button>
                </div>
                <KonumHaritasi ilan={ilan} />
                {(ilan.ilce || ilan.sehir) && (
                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <MapPin size={12} className="text-blue-500" />
                      {[ilan.mahalle, ilan.ilce, ilan.sehir].filter(Boolean).join(' / ')}
                    </p>
                  </div>
                )}
              </div>
            )}
            {/* Nasıl Gidilir? */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-1 h-5 bg-blue-600 rounded-full" /> Nasıl Gidilir?
                </h2>
                {!ulasim && (
                  <button
                    onClick={ulasimGetir}
                    disabled={ulasimYukleniyor}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all"
                  >
                    {ulasimYukleniyor ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    {ulasimYukleniyor ? 'Analiz Ediliyor…' : 'AI ile Analiz Et'}
                  </button>
                )}
                {ulasim && (
                  <button onClick={() => { setUlasim(null); ulasimGetir(); }}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-600 transition-colors">
                    <RotateCcw size={12} /> Yenile
                  </button>
                )}
              </div>

              {!ulasim && !ulasimYukleniyor && (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <Bus size={24} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">AI Ulaşım Analizi</p>
                    <p className="text-xs text-slate-400 mt-1">Metro, otobüs, araç ve yürüyüş sürelerini AI ile analiz edin.</p>
                  </div>
                </div>
              )}

              {ulasimYukleniyor && (
                <div className="flex flex-col items-center gap-3 py-8">
                  <Loader2 size={28} className="animate-spin text-blue-500" />
                  <p className="text-sm text-slate-400">Konum analiz ediliyor…</p>
                </div>
              )}

              {ulasim && (
                <div className="space-y-3">
                  {/* Özet + Puan */}
                  {(ulasim.ozet || ulasim.puan) && (
                    <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-4">
                      <p className="flex-1 text-sm text-slate-600 leading-relaxed">{ulasim.ozet}</p>
                      {ulasim.puan && (
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black text-sm
                          ${ulasim.puan >= 7 ? 'bg-green-100 text-green-700' : ulasim.puan >= 4 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {ulasim.puan}
                          <span className="text-[9px] font-semibold opacity-70">/10</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Ulaşım satırları */}
                  {[
                    { ikon: Train,      renk: 'text-purple-600 bg-purple-50', baslik: 'Metro / Metrobüs / Tramvay', deger: ulasim.metro },
                    { ikon: Bus,        renk: 'text-blue-600 bg-blue-50',     baslik: 'Otobüs / Dolmuş',            deger: ulasim.otobus },
                    { ikon: Car,        renk: 'text-amber-600 bg-amber-50',   baslik: 'Araçla',                     deger: ulasim.araba },
                    { ikon: Footprints, renk: 'text-green-600 bg-green-50',   baslik: 'Yürüyerek',                  deger: ulasim.yuruyus },
                  ].filter(r => r.deger && r.deger !== 'null').map((row, i) => {
                    const Ikon = row.ikon;
                    return (
                      <div key={i} className="flex gap-3 p-3 rounded-xl border border-slate-100">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${row.renk}`}>
                          <Ikon size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-400">{row.baslik}</p>
                          <p className="text-sm text-slate-700 mt-0.5 leading-relaxed">{row.deger}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── SAĞ: Fiyat + İletişim + Ofis ────────────────────── */}
          <div className="lg:col-span-4">
            <div className="sticky top-16 space-y-4">

              {/* Fiyat + İletişim kartı */}
              <div className="rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Gradient fiyat başlığı */}
                <div className="bg-gradient-to-r from-gray-900 via-slate-800 to-blue-900 p-5">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`${tipRenk} text-white text-xs font-bold px-2.5 py-1 rounded-full`}>{tip}</span>
                    {ilan.emlak_turu && <span className="bg-white/20 text-white/90 text-xs font-semibold px-2.5 py-1 rounded-full">{ilan.emlak_turu}</span>}
                  </div>
                  <p className="text-3xl font-extrabold text-white">{fiyatFormatla(ilan.fiyat)}</p>
                  {ilan.metrekare && (
                    <p className="text-xs text-blue-300 mt-0.5">
                      {Math.round(ilan.fiyat / ilan.metrekare).toLocaleString('tr-TR')} ₺/m²
                    </p>
                  )}
                </div>
                <div className="bg-white p-5 pt-4">

                {/* Danışman */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0">
                    {bas}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{adSoyad}</p>
                    <p className="text-xs text-slate-400">Emlak Danışmanı</p>
                  </div>
                </div>

                {/* Butonlar */}
                <div className="space-y-2.5">
                  {telefonGoster && (ilan.sahip_telefon || ilan.kullanici_telefon) ? (
                    <a href={`tel:${ilan.sahip_telefon || ilan.kullanici_telefon}`}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all text-sm">
                      <Phone size={15} /> {ilan.sahip_telefon || ilan.kullanici_telefon}
                    </a>
                  ) : (
                    <button onClick={() => setTelGoster(true)}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all hover:shadow-lg hover:shadow-blue-200 active:scale-[.98] text-sm">
                      <Phone size={15} /> Telefona Bak
                    </button>
                  )}
                  <button onClick={() => {
                      if (!girisYapilmis) { navigate('/login'); return; }
                      setMesajMod(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-3 px-4 rounded-xl transition-all text-sm">
                    <MessageCircle size={15} /> Mesaj Gönder
                  </button>
                  {ilan.dukkan_id && (
                    <button
                      onClick={() => firmaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                      className="w-full flex items-center justify-center gap-2 border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 font-semibold py-2.5 px-4 rounded-xl transition-all text-sm">
                      <ExternalLink size={14} /> Firma Profiline Git
                    </button>
                  )}
                  {(ilan.enlem || ilan.boylam || ilan.ilce || ilan.sehir) && (
                    <button
                      onClick={() => setHaritaAcik(true)}
                      className="w-full flex items-center justify-center gap-2 border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 font-semibold py-2.5 px-4 rounded-xl transition-all text-sm"
                    >
                      <Map size={14} /> Haritada Göster
                    </button>
                  )}
                </div>
                </div>
              </div>

              {/* Güvenlik + Hatalı İlan */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
                <div className="flex items-start gap-3 text-xs text-slate-500 leading-relaxed">
                  <Shield size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-700 mb-0.5">Güvenlik Önerileri</p>
                    <p>Gayrimenkulü görmeden, sözleşme imzalamadan ödeme yapmayın. Şüpheli durumlarda destek hattını arayın.</p>
                  </div>
                </div>
                <div className="border-t border-slate-50 pt-3">
                  <button
                    onClick={() => setBildirModal(true)}
                    className="flex items-center gap-2 text-xs text-red-400 hover:text-red-600 font-semibold transition-colors">
                    <Flag size={13} /> Hatalı İlan Bildir
                  </button>
                </div>
              </div>

              {/* Geri dön */}
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-all text-sm font-medium group"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Geri Dön
              </button>
            </div>
          </div>
        </div>

        {/* ══ FİRMA KÜNYESİ ══════════════════════════════════════════ */}
        {(ilan.dukkan_adi || firmaIlanlar.length > 0) && (
          <div ref={firmaRef} className="mt-8 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-slate-900">Firma Künyesi</h2>
                {firmaIlanlar.length > 0 && (
                  <button
                    onClick={() => navigate(`/ilanlar?dukkan_id=${ilan.dukkan_id}`)}
                    className="text-sm text-blue-600 hover:underline font-semibold flex items-center gap-1">
                    Diğer İlanlarını Gör <ChevronRight size={14} />
                  </button>
                )}
              </div>

              {/* Ofis profil satırı */}
              <div className="flex items-center gap-4 mt-4">
                <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0">
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

        {/* ══ BU İLANA BAKANLAR BUNLARA DA BAKTI ═══════════════════ */}
        {benzerIlanlar.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Bu İlana Bakanlar Bunlara da Baktı</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {[ilan.ilce, ilan.sehir].filter(Boolean).join(' / ')} bölgesinde {ilan.tip || ''} ilanlar
                </p>
              </div>
              <button
                onClick={() => navigate(`/?sehir=${encodeURIComponent(ilan.sehir || '')}&tip=${encodeURIComponent(ilan.tip || '')}`)}
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 whitespace-nowrap"
              >
                Tümünü Gör <ChevronRight size={14} />
              </button>
            </div>

            {/* Yatay kaydırmalı kart listesi */}
            <div
              className="flex gap-4 overflow-x-auto pb-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {benzerIlanlar.map(i => (
                <div
                  key={i.id}
                  onClick={() => navigate(`/ilan/${i.id}`)}
                  className="flex-shrink-0 w-52 cursor-pointer group border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all bg-white"
                >
                  {/* Görsel */}
                  <div className="relative h-36 overflow-hidden bg-gray-100">
                    <img
                      src={i.gorsel || GORSEL_FALLBACK}
                      alt={i.baslik}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={e => { e.currentTarget.src = GORSEL_FALLBACK; }}
                    />
                    {i.tip && (
                      <span className={`absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-md ${i.tip === 'Satılık' ? 'bg-blue-600' : 'bg-blue-500'}`}>
                        {i.tip}
                      </span>
                    )}
                  </div>

                  {/* Bilgiler */}
                  <div className="p-3 flex flex-col gap-1">
                    <p className="text-xs font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-700 transition-colors">
                      {i.baslik}
                    </p>
                    {/* Özellik chip'leri */}
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {i.oda_sayisi && (
                        <span className="text-[10px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded-md font-medium">{i.oda_sayisi}</span>
                      )}
                      {i.metrekare && (
                        <span className="text-[10px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded-md font-medium">{i.metrekare} m²</span>
                      )}
                      {i.kat != null && (
                        <span className="text-[10px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded-md font-medium">{i.kat}. Kat</span>
                      )}
                    </div>
                    {(i.ilce || i.sehir) && (
                      <p className="text-[10px] text-gray-400 flex items-center gap-1">
                        <MapPin size={9} className="text-blue-500 flex-shrink-0" />
                        {[i.ilce, i.sehir].filter(Boolean).join(' / ')}
                      </p>
                    )}
                    <p className="text-blue-700 font-extrabold text-sm mt-0.5">{fiyatFormatla(i.fiyat)}</p>
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/ilan/${i.id}`); }}
                      className="mt-1 w-full text-xs font-bold text-blue-600 border border-blue-200 hover:bg-blue-50 py-1.5 rounded-lg transition-colors"
                    >
                      Telefona Bak
                    </button>
                  </div>
                </div>
              ))}
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
                  className="text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-3 py-1.5 rounded-full transition-colors font-medium"
                >
                  {link}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ══ HATALI İLAN BİLDİR MODALI ════════════════════════════ */}
      {bildirModal && (
        <div className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { if (!bildirGond) setBildirModal(false); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-gray-900 flex items-center gap-2">
                <Flag size={16} className="text-red-400" /> Hatalı İlan Bildir
              </h3>
              <button onClick={() => setBildirModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <p className="text-xs text-gray-400">Bu ilanı şüpheli veya hatalı bulduğunuz sebebi belirtin.</p>
            <div className="space-y-2">
              {['Yanlış fiyat veya bilgi', 'Sahte / dolandırıcı ilan', 'Uygunsuz içerik', 'Mükerrer (kopya) ilan', 'Diğer'].map(secenek => (
                <label key={secenek} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-red-200 hover:bg-red-50 cursor-pointer transition-all">
                  <input
                    type="radio" name="bildirNeden" value={secenek}
                    checked={bildirNeden === secenek}
                    onChange={() => setBildirNeden(secenek)}
                    className="accent-red-500"
                  />
                  <span className="text-sm text-slate-700">{secenek}</span>
                </label>
              ))}
            </div>
            <button
              disabled={!bildirNeden || bildirGond}
              onClick={async () => {
                setBildirGond(true);
                await new Promise(r => setTimeout(r, 800));
                setBildirGond(false);
                setBildirModal(false);
                setBildirNeden('');
                toast.success('Bildiriminiz alındı. Teşekkürler!');
              }}
              className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all text-sm"
            >
              {bildirGond ? <><Loader2 size={15} className="animate-spin" />Gönderiliyor…</> : <><Flag size={15} />Bildir</>}
            </button>
          </div>
        </div>
      )}

      {/* ══ MESAJ GÖNDER MODALI ═══════════════════════════════════ */}
      {mesajModAcik && (
        <div className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { if (!mesajGond) setMesajMod(false); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-gray-900">Mesaj Gönder</h3>
              <button onClick={() => setMesajMod(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <p className="text-xs text-gray-400 truncate">🏠 {ilan.baslik}</p>
            {mesajGondOk ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <CheckCircle2 size={40} className="text-blue-500" />
                <p className="font-semibold text-gray-800">Mesajınız gönderildi!</p>
                <p className="text-xs text-gray-400">Yanıtları Mesajlarım bölümünden takip edebilirsiniz.</p>
                <button onClick={() => { setMesajMod(false); setMesajGondOk(false); setMesajMetni(''); }}
                  className="mt-2 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
                  Tamam
                </button>
              </div>
            ) : (
              <>
                <textarea
                  value={mesajMetni}
                  onChange={e => setMesajMetni(e.target.value)}
                  placeholder="Mesajınızı yazın..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
                />
                <button disabled={!mesajMetni.trim() || mesajGond}
                  onClick={async () => {
                    const t = mesajMetni.trim();
                    if (!t) return;
                    setMesajGond(true);
                    try {
                      await mesajGonder({ ilan_id: ilan.id, alici_id: ilan.kullanici_id, metin: t });
                      setMesajGondOk(true);
                    } catch { toast.error('Mesaj gönderilemedi, tekrar deneyin.'); }
                    finally { setMesajGond(false); }
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all text-sm">
                  {mesajGond ? <><Loader2 size={15} className="animate-spin" />Gönderiliyor…</> : <><Send size={15} />Gönder</>}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══ TAM EKRAN HARİTA MODALI ════════════════════════════════ */}
      {haritaAcik && (
        <KonumHaritasi ilan={ilan} tam={true} onKapat={() => setHaritaAcik(false)} />
      )}
    </div>
  );
};

export default ListingDetail;
