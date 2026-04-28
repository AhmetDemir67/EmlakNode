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
      className="flex-shrink-0 w-60 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
    >
      <div className="relative h-40 overflow-hidden bg-gray-100">
        <img
          src={ilan.gorsel || GORSEL_FALLBACK}
          alt={ilan.baslik}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => { e.currentTarget.src = GORSEL_FALLBACK; }}
        />
        <div className="absolute top-2 left-2 flex gap-1.5">
          <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide">
            ÖNE ÇIKAN
          </span>
        </div>
        {ilan.tip && (
          <div className="absolute top-2 right-2">
            <span className="bg-black/55 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
              {ilan.tip}
            </span>
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col gap-1">
        <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2">{ilan.baslik}</h3>
        {bilgiler.length > 0 && (
          <p className="text-[11px] text-gray-500">{bilgiler.join(' · ')}</p>
        )}
        {(ilan.sehir || ilan.ilce) && (
          <p className="text-[11px] text-gray-400">
            📍 {[ilan.ilce, ilan.sehir].filter(Boolean).join(', ')}
          </p>
        )}
        <p className="text-green-700 font-extrabold text-sm mt-0.5">{fiyatFormat(ilan.fiyat)}</p>
        <button
          onClick={e => { e.stopPropagation(); navigate(`/ilan/${ilan.id}`); }}
          className="mt-1.5 w-full bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-1.5 rounded-lg transition-colors"
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
    if (tabId === 'fiyat_dusen_satilik') liste = liste.filter(i => i.tip === 'Satılık');
    if (tabId === 'fiyat_dusen_kiralik') liste = liste.filter(i => i.tip === 'Kiralık');
    return liste.slice(0, 20);
  };

  const gosterilen = filtrele(aktifTab);

  const kaydir = (yon) => {
    scrollRef.current?.scrollBy({ left: yon * 272, behavior: 'smooth' });
  };

  if (ilanlar.length === 0) return null;

  return (
    <section className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-extrabold text-gray-900">Ev Mi Arıyorsun?</h2>
          <a
            href="/"
            onClick={e => e.preventDefault()}
            className="text-green-600 hover:text-green-700 text-sm font-semibold flex items-center gap-1 transition-colors"
          >
            Tüm İlanlar <ArrowRight size={14} />
          </a>
        </div>

        {/* Sekmeler */}
        <div className="flex gap-0 mb-6 border-b border-gray-200 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setAktifTab(tab.id)}
              className={`flex-shrink-0 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap ${
                aktifTab === tab.id
                  ? 'text-green-600 border-green-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
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
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10 bg-white shadow-md border border-gray-100 rounded-full w-9 h-9 flex items-center justify-center hover:bg-green-50 hover:border-green-300 transition-colors"
          >
            <ChevronLeft size={18} className="text-gray-600" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {gosterilen.length > 0
              ? gosterilen.map(ilan => <IlanKarti key={ilan.id} ilan={ilan} />)
              : (
                <p className="text-gray-400 text-sm py-8 px-2">
                  Bu kategoride ilan bulunamadı.
                </p>
              )
            }
          </div>

          <button
            onClick={() => kaydir(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 bg-white shadow-md border border-gray-100 rounded-full w-9 h-9 flex items-center justify-center hover:bg-green-50 hover:border-green-300 transition-colors"
          >
            <ChevronRight size={18} className="text-gray-600" />
          </button>
        </div>

      </div>
    </section>
  );
};

export default OnecikarIlanlar;
