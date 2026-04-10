import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { Link } from 'react-router-dom';
import { MapPin, BedDouble, Square } from 'lucide-react';

// ── Türkiye'deki büyük şehirlerin koordinatları ───────────────────
const SEHIR_KOORDINATLARI = {
  'İstanbul': [41.015, 28.979],
  'Istanbul': [41.015, 28.979],
  'Ankara':   [39.920, 32.854],
  'İzmir':    [38.423, 27.142],
  'Izmir':    [38.423, 27.142],
  'Bursa':    [40.183, 29.067],
  'Antalya':  [36.897, 30.713],
  'Adana':    [37.000, 35.321],
  'Konya':    [37.874, 32.493],
  'Kocaeli':  [40.765, 29.940],
  'Gaziantep':[37.066, 37.383],
};

// ── Varsayılan koordinat (merkez Türkiye) ─────────────────────────
const TURKEY_CENTER = [39.0, 35.0];

// ── Fiyat formatlayıcı ────────────────────────────────────────────
const fiyatKisa = (fiyat) => {
  if (fiyat >= 1_000_000) return `${(fiyat / 1_000_000).toFixed(1)}M ₺`;
  if (fiyat >= 1_000)     return `${Math.round(fiyat / 1_000)}K ₺`;
  return `${fiyat} ₺`;
};

// ── Harita zoom reset için yardımcı ──────────────────────────────
const MapResetter = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

// ── Özel fiyat marker ikonu ───────────────────────────────────────
const fiyatIkonu = (fiyat, tip) => divIcon({
  html: `<div class="fiyat-marker" style="background:${tip === 'Kiralık' ? '#3b82f6' : '#f97316'}">${fiyatKisa(fiyat)}</div>`,
  className: '',
  iconAnchor: [30, 15],
  popupAnchor: [0, -18],
});

// ── Koordinat atayıcı (enlem/boylam yoksa şehre göre + offset) ───
let _seed = 0;
const koordinatVer = (ilan) => {
  if (ilan.enlem && ilan.boylam) return [parseFloat(ilan.enlem), parseFloat(ilan.boylam)];
  const base = SEHIR_KOORDINATLARI[ilan.sehir] || TURKEY_CENTER;
  _seed++;
  // Her ilana küçük rastgele offset ekle (üst üste binmesin)
  const offset = ((_seed * 17) % 40 - 20) * 0.008;
  const offset2 = ((_seed * 13) % 40 - 20) * 0.008;
  return [base[0] + offset, base[1] + offset2];
};

// ── Ana Bileşen ──────────────────────────────────────────────────
const MapView = ({ ilanlar }) => {
  _seed = 0; // her render'da sıfırla (tutarlı koordinatlar için)

  // Koordinatlı ilan listesi
  const ilanlarKoordinatli = useMemo(() =>
    ilanlar.map((ilan) => ({
      ...ilan,
      _konum: koordinatVer(ilan),
    })),
  [ilanlar]);

  // Harita merkezi: ilanlar varsa ilk ilanın şehri, yoksa Türkiye merkezi
  const merkez = ilanlarKoordinatli.length > 0
    ? ilanlarKoordinatli[0]._konum
    : TURKEY_CENTER;
  const zoom   = ilanlar.length > 0 ? 11 : 6;

  if (ilanlar.length === 0) {
    return (
      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-[600px] flex items-center justify-center bg-slate-100">
        <div className="text-center text-slate-400">
          <MapPin size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="font-semibold">Gösterilecek ilan bulunamadı.</p>
          <p className="text-sm mt-1">Filtreleri temizleyip tekrar deneyin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md relative">
      {/* İlan sayısı rozeti */}
      <div className="absolute top-3 left-3 z-[1000] bg-white shadow-md rounded-xl px-3 py-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700 border border-slate-100">
        <MapPin size={14} className="text-orange-500" />
        {ilanlar.length} ilan haritada
      </div>

      <MapContainer
        center={merkez}
        zoom={zoom}
        style={{ height: '600px', width: '100%' }}
        scrollWheelZoom={true}
      >
        <MapResetter center={merkez} zoom={zoom} />

        {/* OpenStreetMap tile katmanı */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* İlan marker'ları */}
        {ilanlarKoordinatli.map((ilan) => (
          <Marker
            key={ilan.id}
            position={ilan._konum}
            icon={fiyatIkonu(ilan.fiyat, ilan.tip || 'Satılık')}
          >
            <Popup>
              <div className="rounded-2xl overflow-hidden w-[220px]">
                {/* Görsel */}
                <div className="relative">
                  <img
                    src={ilan.gorsel || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=75'}
                    alt={ilan.baslik}
                    className="w-full h-32 object-cover"
                  />
                  <span className={`absolute top-2 left-2 text-xs font-bold px-2.5 py-1 rounded-full text-white ${
                    (ilan.tip || 'Satılık') === 'Kiralık' ? 'bg-blue-500' : 'bg-orange-500'
                  }`}>
                    {ilan.tip || 'Satılık'}
                  </span>
                </div>

                {/* İçerik */}
                <div className="p-3 bg-white">
                  <div className="text-lg font-extrabold text-orange-500 leading-none mb-1">
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(ilan.fiyat)}
                  </div>
                  <p className="text-xs font-semibold text-slate-800 leading-snug mb-2 line-clamp-2">
                    {ilan.baslik}
                  </p>

                  {/* Özellikler */}
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                    {ilan.oda_sayisi && (
                      <span className="flex items-center gap-1">
                        <BedDouble size={11} className="text-orange-400" />
                        {ilan.oda_sayisi}
                      </span>
                    )}
                    {ilan.metrekare && (
                      <span className="flex items-center gap-1">
                        <Square size={11} className="text-orange-400" />
                        {ilan.metrekare} m²
                      </span>
                    )}
                    {ilan.sehir && (
                      <span className="flex items-center gap-1">
                        <MapPin size={11} className="text-orange-400" />
                        {ilan.sehir}
                      </span>
                    )}
                  </div>

                  {/* Detay butonu */}
                  <Link
                    to={`/ilan/${ilan.id}`}
                    className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-2 rounded-xl transition-colors"
                  >
                    İlanı İncele →
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
