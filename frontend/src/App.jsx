import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ListingCard from './components/ListingCard';
import { ilanlarGetir } from './services/api';
import { TrendingUp, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

function App() {
  const [ilanlar, setIlanlar]     = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata]           = useState(null);

  // ── Veriyi API'den Çek ──────────────────────────────────────────
  const verileriGetir = async () => {
    try {
      setYukleniyor(true);
      setHata(null);
      const yanit = await ilanlarGetir({ limit: 8 });
      setIlanlar(yanit.data.ilanlar || []);
    } catch (err) {
      console.error('İlanlar yüklenemedi:', err.message);
      setHata('İlanlar yüklenirken bir hata oluştu. Backend sunucusunun çalıştığından emin olun.');
    } finally {
      setYukleniyor(false);
    }
  };

  useEffect(() => {
    verileriGetir();
  }, []);

  // ── Yükleniyor Durumu ───────────────────────────────────────────
  const YukleniyorGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
          <div className="h-52 bg-gray-200" />
          <div className="p-4 space-y-3">
            <div className="h-6 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
            <div className="flex gap-3 pt-2">
              <div className="h-3 bg-gray-100 rounded w-1/4" />
              <div className="h-3 bg-gray-100 rounded w-1/4" />
              <div className="h-3 bg-gray-100 rounded w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // ── Hata Durumu ─────────────────────────────────────────────────
  const HataEkrani = () => (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md text-center">
        <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
        <p className="text-red-700 font-medium mb-4">{hata}</p>
        <button
          onClick={verileriGetir}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors mx-auto"
        >
          <RefreshCw size={15} />
          Tekrar Dene
        </button>
      </div>
    </div>
  );

  // ── Boş Durum ───────────────────────────────────────────────────
  const BosEkran = () => (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
      <AlertCircle size={40} className="text-gray-300" />
      <p className="font-medium">Henüz hiç ilan eklenmemiş.</p>
      <p className="text-sm">API'ye POST /api/ilanlar ile ilan ekleyebilirsin.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Hero />

      {/* İlanlar Bölümü */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Bölüm Başlığı */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={18} className="text-orange-500" />
              <span className="text-orange-500 font-semibold text-sm">Öne Çıkan İlanlar</span>
            </div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">Güncel Satılık & Kiralık İlanlar</h2>
              {yukleniyor && <Loader2 size={18} className="text-orange-500 animate-spin" />}
              {!yukleniyor && !hata && (
                <span className="text-xs bg-orange-100 text-orange-600 font-semibold px-2.5 py-1 rounded-full">
                  {ilanlar.length} ilan
                </span>
              )}
            </div>
          </div>
          <button className="hidden sm:block text-orange-500 font-semibold text-sm hover:underline">
            Tümünü Gör →
          </button>
        </div>

        {/* İçerik */}
        {yukleniyor && <YukleniyorGrid />}
        {!yukleniyor && hata && <HataEkrani />}
        {!yukleniyor && !hata && ilanlar.length === 0 && <BosEkran />}
        {!yukleniyor && !hata && ilanlar.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ilanlar.map((ilan) => (
              <ListingCard
                key={ilan.id}
                ilan={{
                  ...ilan,
                  // API'den gelen alanları ListingCard'ın beklediği formata uyarla
                  tip: ilan.tip || 'Satılık',
                  gorsel: ilan.gorsel || `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80`,
                  ofis: ilan.dukkan_adi || 'Emlak Ofisi',
                  oneCikan: false,
                }}
              />
            ))}
          </div>
        )}

        {/* Mobilde Tümünü Gör */}
        {!yukleniyor && ilanlar.length > 0 && (
          <div className="sm:hidden mt-6 text-center">
            <button className="text-orange-500 font-semibold border border-orange-200 px-6 py-2.5 rounded-xl hover:bg-orange-50 transition-colors">
              Tümünü Gör
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default App;
