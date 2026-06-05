import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TABS = [
  { id: 'one_cikan',            label: 'Öne Çıkan İlanlar'       },
  { id: 'yeni',                 label: 'Yeni İlanlar'             },
  { id: 'fiyat_dusen_satilik',  label: 'Fiyatı Düşen Satılıklar' },
  { id: 'fiyat_dusen_kiralik',  label: 'Fiyatı Düşen Kiralıklar' },
  { id: 'projeler',             label: 'Öne Çıkan Projeler'       },
];

const GORSEL_FALLBACK = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80';

const fiyatFormat = (fiyat) => {
  if (!fiyat) return '';
  if (fiyat >= 1_000_000) return `${(fiyat / 1_000_000).toFixed(2).replace('.', ',')} Milyon ₺`;
  if (fiyat >= 1_000)     return `${Math.round(fiyat / 1_000).toLocaleString('tr-TR')} Bin ₺`;
  return `${Number(fiyat).toLocaleString('tr-TR')} ₺`;
};

const IlanKarti = ({ ilan }) => {
  const navigate = useNavigate();
  const bilgiler = [
    ilan.emlak_turu,
    ilan.oda_sayisi,
    ilan.kat        ? `${ilan.kat}. Kat`    : null,
    ilan.metrekare  ? `${ilan.metrekare} m²` : null,
  ].filter(Boolean);

  return (
    <div
      onClick={() => navigate(`/ilan/${ilan.id}`)}
      className="flex-shrink-0 w-60 bg-white dark:bg-gray-800/80 dark:backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden cursor-pointer hover:shadow-xl dark:hover:shadow-blue-950/30 hover:-translate-y-1 transition-all duration-200 group"
    >
      <div className="relative h-40 overflow-hidden bg-gray-100 dark:bg-gray-700">
        <img
          src={ilan.gorsel || GORSEL_FALLBACK}
          alt={ilan.baslik}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => { e.currentTarget.src = GORSEL_FALLBACK; }}
        />
        <div className="absolute top-2 left-2 flex gap-1.5">
          <span className="bg-gradient-to-r from-amber-500 to-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide shadow-sm">
            ÖNE ÇIKAN
          </span>
        </div>
        {ilan.tip && (
          <div className="absolute top-2 right-2">
            <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-md border border-white/10">
              {ilan.tip}
            </span>
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col gap-1">
        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-amber-400 transition-colors">{ilan.baslik}</h3>
        {bilgiler.length > 0 && (
          <p className="text-[11px] text-gray-500 dark:text-gray-400">{bilgiler.join(' · ')}</p>
        )}
        {(ilan.sehir || ilan.ilce) && (
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            📍 {[ilan.ilce, ilan.sehir].filter(Boolean).join(', ')}
          </p>
        )}
        <p className="text-amber-500 dark:text-amber-400 font-extrabold text-sm mt-0.5">{fiyatFormat(ilan.fiyat)}</p>
        <button
          onClick={e => { e.stopPropagation(); navigate(`/ilan/${ilan.id}`); }}
          className="mt-1.5 w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-xs font-bold py-1.5 rounded-lg transition-all shadow-sm"
        >
          İncele
        </button>
      </div>
    </div>
  );
};

const OnecikarIlanlar = ({ ilanlar = [] }) => {
  const [aktifTab, setAktifTab] = useState('one_cikan');
  const scrollRef = useRef(null);

  const filtrele = (tabId) => {
    let liste = [...ilanlar];
    switch (tabId) {
      case 'one_cikan':
        // En çok görüntülenenleri öne al
        liste = liste.sort((a, b) => (b.goruntuleme_sayisi || 0) - (a.goruntuleme_sayisi || 0));
        break;
      case 'yeni':
        // En yeni ilanlar
        liste = liste.sort((a, b) => new Date(b.olusturulma_tarihi) - new Date(a.olusturulma_tarihi));
        break;
      case 'fiyat_dusen_satilik':
        liste = liste.filter(i =>
          i.tip === 'Satılık' &&
          i.onceki_fiyat != null &&
          parseFloat(i.onceki_fiyat) > parseFloat(i.fiyat)
        );
        break;
      case 'fiyat_dusen_kiralik':
        liste = liste.filter(i =>
          i.tip === 'Kiralık' &&
          i.onceki_fiyat != null &&
          parseFloat(i.onceki_fiyat) > parseFloat(i.fiyat)
        );
        break;
      case 'projeler':
        // Arsa, Villa, Rezidans gibi proje kategorileri
        liste = liste.filter(i => ['Arsa', 'Villa', 'Rezidans', 'Depo'].includes(i.emlak_turu));
        if (liste.length === 0) {
          // Fallback: emlak_turu'na göre değil tip bazlı göster
          liste = [...ilanlar].sort((a, b) => new Date(b.olusturulma_tarihi) - new Date(a.olusturulma_tarihi));
        }
        break;
      default:
        break;
    }
    return liste.slice(0, 20);
  };

  const gosterilen = filtrele(aktifTab);

  const kaydir = (yon) => {
    scrollRef.current?.scrollBy({ left: yon * 272, behavior: 'smooth' });
  };

  if (ilanlar.length === 0) return null;

  return (
    <section className="bg-gray-50 dark:bg-gray-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
            Ev Mi Arıyorsun? <span className="bg-gradient-to-r from-blue-600 to-violet-500 bg-clip-text text-transparent">En İyiler Burada</span>
          </h2>
          <a
            href="/ilanlar"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-semibold flex items-center gap-1 transition-colors"
          >
            Tüm İlanlar <ArrowRight size={14} />
          </a>
        </div>

        {/* Sekmeler */}
        <div className="flex gap-0 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setAktifTab(tab.id)}
              className={`flex-shrink-0 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap ${
                aktifTab === tab.id
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Slider */}
        <div className="relative">
          <button
            onClick={() => kaydir(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10 bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 rounded-full w-9 h-9 flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 transition-colors"
          >
            <ChevronLeft size={18} className="text-gray-600 dark:text-gray-300" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {gosterilen.length > 0
              ? gosterilen.map(ilan => <IlanKarti key={ilan.id} ilan={ilan} />)
              : (
                <div className="flex flex-col items-center justify-center py-10 px-6 text-center w-full">
                  <p className="text-3xl mb-2">🔍</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold">Bu kategoride henüz ilan bulunamadı.</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Yakında yeni ilanlar eklenecek.</p>
                </div>
              )
            }
          </div>

          <button
            onClick={() => kaydir(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 rounded-full w-9 h-9 flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 transition-colors"
          >
            <ChevronRight size={18} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

      </div>
    </section>
  );
};

export default OnecikarIlanlar;
