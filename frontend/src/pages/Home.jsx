import { useState, useEffect, useMemo } from 'react';
import ListingCard   from '../components/ListingCard';
import FilterSidebar from '../components/FilterSidebar';
import MapView       from '../components/MapView';
import Hero          from '../components/Hero';
import { ilanlarGetir } from '../services/api';
import {
  TrendingUp, Loader2, AlertCircle, RefreshCw,
  SlidersHorizontal, X, LayoutGrid, Map,
} from 'lucide-react';

// ── Başlangıç filtre değerleri ─────────────────────────────────
const BOSLUK_FILTRE = { minFiyat: '', maxFiyat: '', odaSayisi: '', tip: '' };

const Home = () => {
  const [ilanlar, setIlanlar]         = useState([]);
  const [yukleniyor, setYukleniyor]   = useState(true);
  const [hata, setHata]               = useState(null);
  const [filtreler, setFiltreler]     = useState(BOSLUK_FILTRE);
  const [mobilFiltre, setMobilFiltre] = useState(false);
  const [gorunum, setGorunum]         = useState('liste'); // 'liste' | 'harita'

  // ── API ────────────────────────────────────────────────────────
  const verileriGetir = async () => {
    try {
      setYukleniyor(true);
      setHata(null);
      const yanit = await ilanlarGetir({ limit: 100 });
      setIlanlar(yanit.data.ilanlar || []);
    } catch {
      setHata('İlanlar yüklenirken bir hata oluştu. Backend sunucusunun çalıştığından emin olun.');
    } finally {
      setYukleniyor(false);
    }
  };
  useEffect(() => { verileriGetir(); }, []);

  // ── Client-side filtreleme ─────────────────────────────────────
  const filtrelenmisIlanlar = useMemo(() =>
    ilanlar.filter((ilan) => {
      if (filtreler.minFiyat && ilan.fiyat < Number(filtreler.minFiyat)) return false;
      if (filtreler.maxFiyat && ilan.fiyat > Number(filtreler.maxFiyat)) return false;
      if (filtreler.odaSayisi && ilan.oda_sayisi !== filtreler.odaSayisi) return false;
      if (filtreler.tip && (ilan.tip || 'Satılık') !== filtreler.tip)    return false;
      return true;
    }),
  [ilanlar, filtreler]);

  // Kart formatı için ek alanlar
  const ilanlarFormatli = useMemo(() =>
    filtrelenmisIlanlar.map((ilan) => ({
      ...ilan,
      tip:    ilan.tip    || 'Satılık',
      gorsel: ilan.gorsel || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
      ofis:   ilan.dukkan_adi || 'Emlak Ofisi',
      oneCikan: false,
    })),
  [filtrelenmisIlanlar]);

  const aktifFiltreSayisi = useMemo(() =>
    Object.values(filtreler).filter(Boolean).length, [filtreler]);

  const filtreTemizle = () => setFiltreler(BOSLUK_FILTRE);

  // ── Alt bileşenler ─────────────────────────────────────────────
  const YukleniyorGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
          <div className="h-52 bg-gray-200" />
          <div className="p-4 space-y-3">
            <div className="h-6 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  const HataEkrani = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md text-center">
        <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
        <p className="text-red-700 font-medium mb-4">{hata}</p>
        <button onClick={verileriGetir}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors mx-auto">
          <RefreshCw size={15} /> Tekrar Dene
        </button>
      </div>
    </div>
  );

  const SonucYokEkrani = () => (
    <div className="flex flex-col items-center py-20 gap-4 text-center">
      <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center">
        <AlertCircle size={32} className="text-orange-300" />
      </div>
      <div>
        <p className="font-semibold text-slate-600 mb-1">
          {aktifFiltreSayisi > 0 ? 'Filtrelerinize uygun ilan bulunamadı.' : 'Henüz hiç ilan eklenmemiş.'}
        </p>
        {aktifFiltreSayisi > 0 && (
          <button onClick={filtreTemizle}
            className="flex items-center gap-1.5 text-sm text-orange-500 hover:underline font-medium mx-auto mt-2">
            <X size={14} /> Filtreleri Temizle
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Hero />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Üst Bar ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">

          {/* Sol: Başlık */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-orange-500" />
              <span className="text-orange-500 font-semibold text-sm">Güncel İlanlar</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-bold text-gray-900">
                Satılık &amp; Kiralık İlanlar
              </h2>
              {yukleniyor && <Loader2 size={16} className="text-orange-500 animate-spin" />}
              {!yukleniyor && !hata && (
                <span className="text-xs bg-orange-100 text-orange-600 font-semibold px-2.5 py-1 rounded-full">
                  {filtrelenmisIlanlar.length} ilan
                  {aktifFiltreSayisi > 0 && ` (${ilanlar.length} içinden)`}
                </span>
              )}
            </div>
          </div>

          {/* Sağ: Toggle + Mobil Filtre */}
          <div className="flex items-center gap-2">
            {/* Mobil filtre butonu */}
            <button
              onClick={() => setMobilFiltre(true)}
              className="lg:hidden flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:border-orange-400 hover:text-orange-500 transition-all relative"
            >
              <SlidersHorizontal size={15} />
              Filtrele
              {aktifFiltreSayisi > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {aktifFiltreSayisi}
                </span>
              )}
            </button>

            {/* ── Liste / Harita Toggle ── */}
            <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1">
              <button
                onClick={() => setGorunum('liste')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  gorunum === 'liste'
                    ? 'bg-white text-orange-500 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <LayoutGrid size={15} />
                Liste
              </button>
              <button
                onClick={() => setGorunum('harita')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  gorunum === 'harita'
                    ? 'bg-white text-orange-500 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Map size={15} />
                Harita
              </button>
            </div>
          </div>
        </div>

        {/* ── İki Kolonlu Layout ─────────────────────────────────── */}
        <div className="flex gap-7">

          {/* Sol: Filtre Sidebar — hem liste hem harita görünümünde */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <FilterSidebar
              filtreler={filtreler}
              onChange={setFiltreler}
              onTemizle={filtreTemizle}
              aktifSayi={aktifFiltreSayisi}
            />
          </div>

          {/* Sağ: İçerik alanı */}
          <div className="flex-1 min-w-0">

            {/* ── HARITA GÖRÜNÜMÜ ────────────────────────────────── */}
            {gorunum === 'harita' && (
              <MapView ilanlar={ilanlarFormatli} />
            )}

            {/* ── LİSTE GÖRÜNÜMÜ ─────────────────────────────────── */}
            {gorunum === 'liste' && (
              <>
                {yukleniyor && <YukleniyorGrid />}
                {!yukleniyor && hata && <HataEkrani />}
                {!yukleniyor && !hata && filtrelenmisIlanlar.length === 0 && <SonucYokEkrani />}
                {!yukleniyor && !hata && filtrelenmisIlanlar.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {ilanlarFormatli.map((ilan) => (
                      <ListingCard key={ilan.id} ilan={ilan} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Mobil: Filtre Overlay ──────────────────────────────── */}
      {mobilFiltre && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobilFiltre(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[90vw] bg-slate-50 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b bg-white">
              <span className="font-bold text-slate-800">Filtreleme</span>
              <button onClick={() => setMobilFiltre(false)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <FilterSidebar
                filtreler={filtreler}
                onChange={setFiltreler}
                onTemizle={filtreTemizle}
                aktifSayi={aktifFiltreSayisi}
              />
            </div>
            <div className="p-4 border-t bg-white sticky bottom-0">
              <button onClick={() => setMobilFiltre(false)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors">
                {filtrelenmisIlanlar.length} İlanı Gör
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
