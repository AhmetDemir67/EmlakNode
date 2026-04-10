import { SlidersHorizontal, X, ChevronDown, Banknote, BedDouble } from 'lucide-react';

// ── Seçenek listeleri ─────────────────────────────────────────────
const ODA_SECENEKLERI = [
  { deger: '',    etiket: 'Tümü'  },
  { deger: '1+0', etiket: '1+0'  },
  { deger: '1+1', etiket: '1+1'  },
  { deger: '2+1', etiket: '2+1'  },
  { deger: '3+1', etiket: '3+1'  },
  { deger: '4+1', etiket: '4+1'  },
  { deger: '5+1', etiket: '5+1+' },
];

// ── Yardımcı: Label + İkon başlığı ───────────────────────────────
const BolumBaslik = ({ icon: Icon, baslik }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className="p-1.5 bg-orange-50 rounded-lg">
      <Icon size={14} className="text-orange-500" />
    </div>
    <span className="text-sm font-semibold text-slate-700">{baslik}</span>
  </div>
);

// ── Ana Bileşen ──────────────────────────────────────────────────
const FilterSidebar = ({ filtreler, onChange, onTemizle, aktifSayi }) => {

  const handleChange = (alan, deger) => {
    onChange({ ...filtreler, [alan]: deger });
  };

  return (
    <aside className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden sticky top-20">

      {/* ── Başlık ────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-orange-50 to-white">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-orange-500" />
          <span className="font-bold text-slate-800 text-sm">Filtreler</span>
          {aktifSayi > 0 && (
            <span className="bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
              {aktifSayi}
            </span>
          )}
        </div>
        {aktifSayi > 0 && (
          <button
            onClick={onTemizle}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors font-medium"
          >
            <X size={12} />
            Temizle
          </button>
        )}
      </div>

      {/* ── Filtre Alanları ────────────────────────────── */}
      <div className="p-5 space-y-6">

        {/* Fiyat Aralığı */}
        <div>
          <BolumBaslik icon={Banknote} baslik="Fiyat Aralığı (₺)" />
          <div className="space-y-2.5">
            <div className="relative">
              <input
                id="filter-min-fiyat"
                type="number"
                placeholder="Min fiyat"
                value={filtreler.minFiyat}
                onChange={(e) => handleChange('minFiyat', e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400
                           placeholder:text-slate-300 text-slate-700 transition-all"
              />
              {filtreler.minFiyat && (
                <button
                  onClick={() => handleChange('minFiyat', '')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 font-medium">ile</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <div className="relative">
              <input
                id="filter-max-fiyat"
                type="number"
                placeholder="Max fiyat"
                value={filtreler.maxFiyat}
                onChange={(e) => handleChange('maxFiyat', e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400
                           placeholder:text-slate-300 text-slate-700 transition-all"
              />
              {filtreler.maxFiyat && (
                <button
                  onClick={() => handleChange('maxFiyat', '')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Ayraç */}
        <div className="h-px bg-slate-100" />

        {/* Oda Sayısı */}
        <div>
          <BolumBaslik icon={BedDouble} baslik="Oda Sayısı" />
          <div className="relative">
            <select
              id="filter-oda"
              value={filtreler.odaSayisi}
              onChange={(e) => handleChange('odaSayisi', e.target.value)}
              className="w-full appearance-none pl-3 pr-9 py-2.5 text-sm border border-slate-200 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400
                         text-slate-700 bg-white transition-all cursor-pointer"
            >
              {ODA_SECENEKLERI.map((s) => (
                <option key={s.deger} value={s.deger}>{s.etiket}</option>
              ))}
            </select>
            <ChevronDown
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>

          {/* Hızlı seçim butonları */}
          <div className="grid grid-cols-3 gap-1.5 mt-2.5">
            {ODA_SECENEKLERI.filter(s => s.deger !== '').map((s) => (
              <button
                key={s.deger}
                onClick={() => handleChange('odaSayisi', filtreler.odaSayisi === s.deger ? '' : s.deger)}
                className={`text-xs py-1.5 rounded-lg font-semibold border transition-all ${
                  filtreler.odaSayisi === s.deger
                    ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300 hover:text-orange-500'
                }`}
              >
                {s.etiket}
              </button>
            ))}
          </div>
        </div>

        {/* Ayraç */}
        <div className="h-px bg-slate-100" />

        {/* İlan Tipi */}
        <div>
          <BolumBaslik icon={SlidersHorizontal} baslik="İlan Tipi" />
          <div className="flex gap-2">
            {['Tümü', 'Satılık', 'Kiralık'].map((tip) => {
              const deger = tip === 'Tümü' ? '' : tip;
              const aktif = filtreler.tip === deger;
              return (
                <button
                  key={tip}
                  onClick={() => handleChange('tip', deger)}
                  className={`flex-1 text-xs py-2 rounded-xl font-semibold border transition-all ${
                    aktif
                      ? deger === 'Kiralık'
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300'
                  }`}
                >
                  {tip}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Alt Bilgi ──────────────────────────────────── */}
      {aktifSayi > 0 && (
        <div className="px-5 py-3 bg-orange-50 border-t border-orange-100">
          <p className="text-xs text-orange-600 font-medium text-center">
            {aktifSayi} aktif filtre uygulanıyor
          </p>
        </div>
      )}
    </aside>
  );
};

export default FilterSidebar;
