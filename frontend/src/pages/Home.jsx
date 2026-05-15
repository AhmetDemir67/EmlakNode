import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ListingCard      from '../components/ListingCard';
import FilterSidebar    from '../components/FilterSidebar';
import MapView          from '../components/MapView';
import Hero             from '../components/Hero';
import OnecikarIlanlar  from '../components/OnecikarIlanlar';
import EmlakHaberleri   from '../components/EmlakHaberleri';
import { ilanlarGetir } from '../services/api';
import {
  TrendingUp, Loader2, AlertCircle, RefreshCw,
  SlidersHorizontal, X, LayoutGrid, Map,
  Building2, Users, MapPin, Shield,
} from 'lucide-react';

const BOSLUK_FILTRE = {
  sehir: '', ilce: '', tip: '', emlak_turu: '',
  oda_sayisi: '', min_fiyat: '', max_fiyat: '',
  min_metrekare: '', max_metrekare: '',
};

const GORSEL_FALLBACK = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80';

const Home = () => {
  const [searchParams]                = useSearchParams();
  const [ilanlar, setIlanlar]         = useState([]);
  const [yukleniyor, setYukleniyor]   = useState(true);
  const [hata, setHata]               = useState(null);
  const [filtreler, setFiltreler]     = useState(() => {
    // Navbar dropdown'dan gelen URL parametrelerini başlangıç filtresi olarak oku
    const urlTip         = searchParams.get('tip')        || '';
    const urlEmlakTuru   = searchParams.get('emlak_turu') || '';
    return { ...BOSLUK_FILTRE, tip: urlTip, emlak_turu: urlEmlakTuru };
  });
  const [mobilFiltre, setMobilFiltre] = useState(false);
  const [gorunum, setGorunum]         = useState('liste');

  // ── Server-side veri çekme ─────────────────────────────────────
  const verileriGetir = useCallback(async () => {
    try {
      setYukleniyor(true);
      setHata(null);
      const params = { limit: 100 };
      Object.entries(filtreler).forEach(([k, v]) => { if (v) params[k] = v; });
      const yanit = await ilanlarGetir(params);
      setIlanlar(yanit.data.ilanlar || []);
    } catch {
      setHata('İlanlar yüklenirken bir hata oluştu. Backend sunucusunun çalıştığından emin olun.');
    } finally {
      setYukleniyor(false);
    }
  }, [filtreler]);

  // Navbar dropdown URL parametresi değişince filtreyi güncelle
  useEffect(() => {
    const urlTip       = searchParams.get('tip')        || '';
    const urlEmlakTuru = searchParams.get('emlak_turu') || '';
    setFiltreler(f => ({ ...f, tip: urlTip, emlak_turu: urlEmlakTuru }));
  }, [searchParams]);

  // Filtreler değişince 350ms debounce ile yeniden çek
  useEffect(() => {
    const timer = setTimeout(verileriGetir, 350);
    return () => clearTimeout(timer);
  }, [verileriGetir]);

  // ── Hero'dan gelen arama ───────────────────────────────────────
  const heroAra = (params) => setFiltreler({ ...BOSLUK_FILTRE, ...params });

  const filtreTemizle = () => setFiltreler(BOSLUK_FILTRE);

  const aktifFiltreSayisi = useMemo(
    () => Object.values(filtreler).filter(Boolean).length,
    [filtreler],
  );

  const ilanlarFormatli = useMemo(() =>
    ilanlar.map(ilan => ({
      ...ilan,
      tip:    ilan.tip    || 'Satılık',
      gorsel: ilan.gorsel || GORSEL_FALLBACK,
      ofis:   ilan.dukkan_adi || 'Emlak Ofisi',
    })),
  [ilanlar]);

  // ── Alt bileşenler ─────────────────────────────────────────────
  const YukleniyorGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
          <div className="h-52 bg-gray-200 dark:bg-gray-700" />
          <div className="p-4 space-y-3">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-full" />
            <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  const HataEkrani = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md text-center">
        <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
        <p className="text-red-700 font-semibold mb-1">Bağlantı Hatası</p>
        <p className="text-red-600 text-sm mb-5">{hata}</p>
        <button
          onClick={verileriGetir}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors mx-auto"
        >
          <RefreshCw size={15} /> Tekrar Dene
        </button>
      </div>
    </div>
  );

  const SonucYokEkrani = () => (
    <div className="flex flex-col items-center py-20 gap-4 text-center">
      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
        <AlertCircle size={28} className="text-blue-400" />
      </div>
      <div>
        <p className="font-semibold text-slate-600 mb-1">
          {aktifFiltreSayisi > 0 ? 'Filtrelerinize uygun ilan bulunamadı.' : 'Henüz hiç ilan eklenmemiş.'}
        </p>
        {aktifFiltreSayisi > 0 && (
          <button
            onClick={filtreTemizle}
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline font-medium mt-2"
          >
            <X size={14} /> Filtreleri Temizle
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Hero onAra={heroAra} onHaritaAra={() => setGorunum('harita')} />

      {/* Stats / Trust Bar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { value: '10.000+', label: 'Aktif İlan',     Icon: Building2 },
              { value: '5.000+',  label: 'Mutlu Müşteri',  Icon: Users },
              { value: '81',      label: 'İl Kapsamı',     Icon: MapPin },
              { value: '7/24',    label: 'Güvenli Platform', Icon: Shield },
            ].map(({ value, label, Icon }) => (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Icon size={18} className="text-blue-600" />
                </div>
                <span className="text-xl font-black text-gray-900 dark:text-white">{value}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Üst Bar ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">

          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-blue-600" />
              <span className="text-blue-600 font-semibold text-sm">Güncel İlanlar</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Satılık &amp; Kiralık İlanlar</h2>
              {yukleniyor && <Loader2 size={16} className="text-blue-500 animate-spin" />}
              {!yukleniyor && !hata && (
                <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2.5 py-1 rounded-full">
                  {ilanlar.length} ilan
                  {aktifFiltreSayisi > 0 && ' bulundu'}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobil filtre butonu */}
            <button
              onClick={() => setMobilFiltre(true)}
              className="lg:hidden flex items-center gap-2 border border-slate-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 dark:text-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all relative"
            >
              <SlidersHorizontal size={15} />
              Filtrele
              {aktifFiltreSayisi > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {aktifFiltreSayisi}
                </span>
              )}
            </button>

            {/* Liste / Harita toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
              <button
                onClick={() => setGorunum('liste')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  gorunum === 'liste' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200'
                }`}
              >
                <LayoutGrid size={15} /> Liste
              </button>
              <button
                onClick={() => setGorunum('harita')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  gorunum === 'harita' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200'
                }`}
              >
                <Map size={15} /> Harita
              </button>
            </div>
          </div>
        </div>

        {/* ── İki Kolonlu Layout ─────────────────────────────────── */}
        <div className="flex gap-7">

          {/* Filtre Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <FilterSidebar
              filtreler={filtreler}
              onChange={setFiltreler}
              onTemizle={filtreTemizle}
              aktifSayi={aktifFiltreSayisi}
            />
          </div>

          {/* İçerik */}
          <div className="flex-1 min-w-0">
            {gorunum === 'harita' && <MapView ilanlar={ilanlarFormatli} />}

            {gorunum === 'liste' && (
              <>
                {yukleniyor && <YukleniyorGrid />}
                {!yukleniyor && hata && <HataEkrani />}
                {!yukleniyor && !hata && ilanlar.length === 0 && <SonucYokEkrani />}
                {!yukleniyor && !hata && ilanlar.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {ilanlarFormatli.map(ilan => (
                      <ListingCard key={ilan.id} ilan={ilan} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Öne Çıkan İlanlar Slider ──────────────────────────── */}
      <OnecikarIlanlar ilanlar={ilanlarFormatli} />

      {/* ── Emlak Haberleri ────────────────────────────────────── */}
      <EmlakHaberleri />

      {/* ── Mobil Filtre Overlay ───────────────────────────────── */}
      {mobilFiltre && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobilFiltre(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[90vw] bg-slate-50 dark:bg-gray-900 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
              <span className="font-bold text-slate-800 dark:text-white">Filtreleme</span>
              <button onClick={() => setMobilFiltre(false)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-500 dark:text-gray-400 transition-colors">
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
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky bottom-0">
              <button
                onClick={() => setMobilFiltre(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors"
              >
                {ilanlar.length} İlanı Gör
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
