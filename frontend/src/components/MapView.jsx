import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { Link } from 'react-router-dom';
import { MapPin, BedDouble, Square, Loader2, Building2, Navigation } from 'lucide-react';

// ── Sabitler ──────────────────────────────────────────────────────
const TURKEY_CENTER = [39.0, 35.0];
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/search';

// ── Fiyat formatlayıcı ────────────────────────────────────────────
const fiyatKisa = (fiyat) => {
  if (fiyat >= 1_000_000) return `${(fiyat / 1_000_000).toFixed(1)}M ₺`;
  if (fiyat >= 1_000)     return `${Math.round(fiyat / 1_000)}K ₺`;
  return `${fiyat} ₺`;
};

// ── Tam fiyat formatlayıcı ────────────────────────────────────────
const fiyatTam = (fiyat) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(fiyat);

// ── Adres stringi oluşturucu ──────────────────────────────────────
const adresOlustur = (ilan) =>
  [ilan.mahalle, ilan.ilce, ilan.sehir].filter(Boolean).join(', ') || null;

// ── Nominatim geocode önbelleği ───────────────────────────────────
const geocodeCache = new Map();

// ── Nominatim'den koordinat getir ────────────────────────────────
// null sonuçları da önbelleğe alır — aynı adres için tekrar sorgu yapmaz
const geocodeAdres = async (anahtar, sorgu) => {
  if (geocodeCache.has(anahtar)) return geocodeCache.get(anahtar);

  try {
    const url = `${NOMINATIM_BASE}?q=${encodeURIComponent(sorgu)}&format=json&limit=1&countrycodes=tr&addressdetails=0`;
    const yanit = await fetch(url, {
      headers: { 'Accept-Language': 'tr', 'User-Agent': 'EmlakNode/1.0' },
    });
    if (!yanit.ok) throw new Error('Nominatim yanıt vermedi');
    const veri = await yanit.json();
    if (veri.length > 0) {
      const konum = [parseFloat(veri[0].lat), parseFloat(veri[0].lon)];
      geocodeCache.set(anahtar, konum);
      return konum;
    }
  } catch (e) {
    console.warn(`Geocode hatası [${anahtar}]:`, e.message);
  }
  geocodeCache.set(anahtar, null);
  return null;
};

// ── Rate-limited sıralı geocoding  ───────────────────────────────
// Nominatim'in 1 istek/sn politikasına uymak için sıralı bekleme
const bekle = (ms) => new Promise((res) => setTimeout(res, ms));

// ── Harita merkezi güncelleyici ───────────────────────────────────
const MapResetter = ({ center, zoom }) => {
  const map = useMap();
  const ilkRef = useRef(true);
  useEffect(() => {
    if (ilkRef.current) { ilkRef.current = false; return; }
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
};

// ── Özel fiyat marker ikonu ───────────────────────────────────────
const fiyatIkonu = (fiyat, tip) =>
  divIcon({
    html: `<div class="fiyat-marker" style="background:${tip === 'Kiralık' ? '#3b82f6' : '#16a34a'}">${fiyatKisa(fiyat)}</div>`,
    className: '',
    iconAnchor: [30, 15],
    popupAnchor: [0, -20],
  });

// ── Geocode durum tipi ────────────────────────────────────────────
// { id, konum: [lat, lon] | null, yukleniyor: bool }
const INITIAL_STATE = { listesi: [], merkez: TURKEY_CENTER, zoom: 6, hazir: false };

// ═══════════════════════════════════════════════════════════════════
// Ana Bileşen
// ═══════════════════════════════════════════════════════════════════
const MapView = ({ ilanlar }) => {
  const [durum, setDurum] = useState(INITIAL_STATE);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [tamamlanan, setTamamlanan] = useState(0);
  const iptalRef = useRef(false);

  // İlanlar değişince geocoding başlat
  useEffect(() => {
    if (!ilanlar || ilanlar.length === 0) {
      setDurum(INITIAL_STATE);
      return;
    }

    iptalRef.current = false;
    setYukleniyor(true);
    setTamamlanan(0);

    const geocodeTumu = async () => {
      const sonuclar = [];

      for (let i = 0; i < ilanlar.length; i++) {
        if (iptalRef.current) break;

        const ilan = ilanlar[i];

        // 1) Veritabanında enlem/boylam varsa doğrudan kullan
        if (ilan.enlem && ilan.boylam) {
          sonuclar.push({ ...ilan, _konum: [parseFloat(ilan.enlem), parseFloat(ilan.boylam)] });
          setTamamlanan(i + 1);
          continue;
        }

        // 2) Geocoding için anahtar ve sorgu oluştur
        const mahalle = ilan.mahalle || '';
        const ilce    = ilan.ilce    || '';
        const sehir   = ilan.sehir   || '';
        const anahtar  = `${mahalle}|${ilce}|${sehir}`.toLowerCase().trim();
        const sorguStr = adresOlustur(ilan);

        if (!sorguStr) {
          sonuclar.push({ ...ilan, _konum: null });
          setTamamlanan(i + 1);
          continue;
        }

        // 3) Cache'de yoksa API çağrısı yap; Nominatim rate limit: 1 req/s
        const oncekiCache = geocodeCache.has(anahtar);
        let konum = await geocodeAdres(anahtar, sorguStr);
        if (!oncekiCache && !iptalRef.current) await bekle(1100);

        // 4) Tam adres bulunamazsa yalnızca şehir ile tekrar dene (fallback)
        if (!konum && sehir && !iptalRef.current) {
          const sehirAnahtar = `sehir|${sehir}`.toLowerCase();
          const sehirCache   = geocodeCache.has(sehirAnahtar);
          konum = await geocodeAdres(sehirAnahtar, sehir);
          if (!sehirCache && !iptalRef.current) await bekle(1100);
        }

        sonuclar.push({ ...ilan, _konum: konum });
        setTamamlanan(i + 1);
      }

      if (iptalRef.current) return;

      // Geçerli konumları filtrele
      const konumluIlanlar = sonuclar.filter((i) => i._konum);

      // Merkezi hesapla: tüm konumların ortalaması
      let merkez = TURKEY_CENTER;
      let zoom = 6;

      if (konumluIlanlar.length > 0) {
        const ortalamLat = konumluIlanlar.reduce((t, i) => t + i._konum[0], 0) / konumluIlanlar.length;
        const ortalamLon = konumluIlanlar.reduce((t, i) => t + i._konum[1], 0) / konumluIlanlar.length;
        merkez = [ortalamLat, ortalamLon];
        zoom = konumluIlanlar.length === 1 ? 13 : 9;
      }

      setDurum({ listesi: sonuclar, merkez, zoom, hazir: true });
      setYukleniyor(false);
    };

    geocodeTumu();

    return () => { iptalRef.current = true; };
  }, [ilanlar]);

  // ── Boş durum ─────────────────────────────────────────────────
  if (!ilanlar || ilanlar.length === 0) {
    return (
      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-[600px] flex items-center justify-center bg-slate-50">
        <div className="text-center text-slate-400">
          <MapPin size={42} className="mx-auto mb-3 text-slate-300" />
          <p className="font-semibold text-slate-500">Gösterilecek ilan bulunamadı.</p>
          <p className="text-sm mt-1 text-slate-400">Filtreleri temizleyip tekrar deneyin.</p>
        </div>
      </div>
    );
  }

  // ── Yükleme ekranı ────────────────────────────────────────────
  const yuklemeOrani = ilanlar.length > 0 ? Math.round((tamamlanan / ilanlar.length) * 100) : 0;

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md relative">

      {/* ── İlan sayısı rozeti ── */}
      <div className="absolute top-3 left-3 z-[1000] bg-white shadow-md rounded-xl px-3 py-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700 border border-slate-100">
        <MapPin size={14} className="text-green-600" />
        {durum.listesi.filter((i) => i._konum).length} ilan haritada
      </div>

      {/* ── Yükleme overlay ── */}
      {yukleniyor && (
        <div className="absolute inset-0 z-[2000] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-3 text-slate-700 font-semibold">
            <Loader2 size={22} className="text-green-600 animate-spin" />
            <span>Adresler haritaya yerleştiriliyor…</span>
          </div>
          <div className="w-64">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>{tamamlanan} / {ilanlar.length} ilan</span>
              <span>{yuklemeOrani}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 rounded-full transition-all duration-300"
                style={{ width: `${yuklemeOrani}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-slate-400">OpenStreetMap Nominatim API kullanılıyor</p>
        </div>
      )}

      <MapContainer
        center={durum.merkez}
        zoom={durum.zoom}
        style={{ height: '600px', width: '100%' }}
        scrollWheelZoom={true}
      >
        <MapResetter center={durum.merkez} zoom={durum.zoom} />

        {/* OpenStreetMap tile katmanı */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* İlan marker'ları — sadece başarılı geocode olanlar */}
        {durum.listesi
          .filter((ilan) => ilan._konum)
          .map((ilan) => (
            <Marker
              key={ilan.id}
              position={ilan._konum}
              icon={fiyatIkonu(ilan.fiyat, ilan.tip || 'Satılık')}
            >
              <Popup minWidth={240} maxWidth={260}>
                <div className="rounded-2xl overflow-hidden w-[240px] -m-3">

                  {/* ── Görsel ── */}
                  <div className="relative">
                    <img
                      src={ilan.gorsel || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=75'}
                      alt={ilan.baslik}
                      className="w-full h-32 object-cover"
                    />
                    <span className={`absolute top-2 left-2 text-xs font-bold px-2.5 py-1 rounded-full text-white shadow-sm ${
                      (ilan.tip || 'Satılık') === 'Kiralık' ? 'bg-blue-500' : 'bg-green-600'
                    }`}>
                      {ilan.tip || 'Satılık'}
                    </span>
                  </div>

                  {/* ── İçerik ── */}
                  <div className="p-3 bg-white space-y-2">

                    {/* Fiyat */}
                    <div className="text-lg font-extrabold text-green-600 leading-none">
                      {fiyatTam(ilan.fiyat)}
                    </div>

                    {/* Başlık */}
                    <p className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2">
                      {ilan.baslik}
                    </p>

                    {/* ── Adres Bilgisi ── */}
                    {(ilan.ilce || ilan.sehir) && (
                      <div className="flex items-start gap-1.5 bg-green-50 border border-green-100 rounded-lg px-2.5 py-2">
                        <Navigation size={12} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-slate-700 leading-snug">
                          {[ilan.ilce, ilan.sehir].filter(Boolean).join(' / ')}
                        </div>
                      </div>
                    )}

                    {/* Özellikler */}
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      {ilan.oda_sayisi && (
                        <span className="flex items-center gap-1">
                          <BedDouble size={11} className="text-green-500" />
                          {ilan.oda_sayisi}
                        </span>
                      )}
                      {ilan.metrekare && (
                        <span className="flex items-center gap-1">
                          <Square size={11} className="text-green-500" />
                          {ilan.metrekare} m²
                        </span>
                      )}
                      {ilan.dukkan_adi && (
                        <span className="flex items-center gap-1 truncate">
                          <Building2 size={11} className="text-green-500 flex-shrink-0" />
                          <span className="truncate">{ilan.dukkan_adi}</span>
                        </span>
                      )}
                    </div>

                    {/* Detay butonu */}
                    <Link
                      to={`/ilan/${ilan.id}`}
                      className="block w-full text-center bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 rounded-xl transition-colors"
                    >
                      İlanı İncele →
                    </Link>
                  </div>

                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {/* ── Konum bulunamayan ilanlar uyarısı ── */}
      {durum.hazir && durum.listesi.some((i) => !i._konum) && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-sm border border-slate-200 shadow-md rounded-xl px-4 py-2 text-xs text-slate-500 flex items-center gap-2">
          <MapPin size={12} className="text-amber-500" />
          {durum.listesi.filter((i) => !i._konum).length} ilanın konumu bulunamadı
        </div>
      )}
    </div>
  );
};

export default MapView;
