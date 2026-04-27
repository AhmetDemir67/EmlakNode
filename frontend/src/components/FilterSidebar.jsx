import { SlidersHorizontal, X, MapPin, Banknote, BedDouble, Home, Maximize2 } from 'lucide-react';

const ODA_SECENEKLERI = ['Stüdyo', '1+1', '2+1', '3+1', '4+1', '5+1+'];
const EMLAK_TURLERI   = ['Daire', 'Villa', 'Müstakil Ev', 'Arsa', 'İşyeri', 'Depo'];

const BolumBaslik = ({ icon: Icon, baslik }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className="p-1.5 bg-green-50 rounded-lg">
      <Icon size={13} className="text-green-600" />
    </div>
    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{baslik}</span>
  </div>
);

const MinMaxInput = ({ minVal, maxVal, minName, maxName, minPlaceholder, maxPlaceholder, onChange }) => (
  <div className="flex items-center gap-2">
    <input
      type="number"
      name={minName}
      value={minVal}
      onChange={onChange}
      placeholder={minPlaceholder}
      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-500 placeholder:text-slate-300 transition-all"
    />
    <span className="text-slate-400 text-xs font-medium flex-shrink-0">–</span>
    <input
      type="number"
      name={maxName}
      value={maxVal}
      onChange={onChange}
      placeholder={maxPlaceholder}
      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-500 placeholder:text-slate-300 transition-all"
    />
  </div>
);

const FilterSidebar = ({ filtreler, onChange, onTemizle, aktifSayi }) => {

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...filtreler, [name]: value });
  };

  const toggle = (alan, deger) => {
    onChange({ ...filtreler, [alan]: filtreler[alan] === deger ? '' : deger });
  };

  const toggleMulti = (alan, deger) => {
    onChange({ ...filtreler, [alan]: filtreler[alan] === deger ? '' : deger });
  };

  return (
    <aside className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden sticky top-20">

      {/* Başlık */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-green-600" />
          <span className="font-bold text-slate-800 text-sm">Filtreler</span>
          {aktifSayi > 0 && (
            <span className="bg-green-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {aktifSayi}
            </span>
          )}
        </div>
        {aktifSayi > 0 && (
          <button
            onClick={onTemizle}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors font-semibold"
          >
            <X size={12} /> Temizle
          </button>
        )}
      </div>

      <div className="p-5 space-y-5 max-h-[calc(100vh-160px)] overflow-y-auto">

        {/* Konum */}
        <div>
          <BolumBaslik icon={MapPin} baslik="Konum" />
          <div className="space-y-2">
            <input
              type="text"
              name="sehir"
              value={filtreler.sehir}
              onChange={handleChange}
              placeholder="Şehir"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-500 placeholder:text-slate-300 transition-all"
            />
            <input
              type="text"
              name="ilce"
              value={filtreler.ilce}
              onChange={handleChange}
              placeholder="İlçe"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-500 placeholder:text-slate-300 transition-all"
            />
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        {/* İlan Tipi */}
        <div>
          <BolumBaslik icon={SlidersHorizontal} baslik="İlan Tipi" />
          <div className="flex gap-2">
            {['Satılık', 'Kiralık'].map(tip => (
              <button
                key={tip}
                onClick={() => toggle('tip', tip)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                  filtreler.tip === tip
                    ? tip === 'Kiralık'
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-green-600 border-green-600 text-white'
                    : 'border-slate-200 text-slate-500 hover:border-green-400 hover:text-green-600'
                }`}
              >
                {tip}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        {/* Emlak Türü */}
        <div>
          <BolumBaslik icon={Home} baslik="Emlak Türü" />
          <div className="grid grid-cols-2 gap-1.5">
            {EMLAK_TURLERI.map(tur => (
              <button
                key={tur}
                onClick={() => toggleMulti('emlak_turu', tur)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all truncate ${
                  filtreler.emlak_turu === tur
                    ? 'bg-green-600 border-green-600 text-white shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:border-green-400 hover:text-green-600'
                }`}
              >
                {tur}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        {/* Oda Sayısı */}
        <div>
          <BolumBaslik icon={BedDouble} baslik="Oda Sayısı" />
          <div className="grid grid-cols-3 gap-1.5">
            {ODA_SECENEKLERI.map(oda => (
              <button
                key={oda}
                onClick={() => {
                  const deger = oda === 'Stüdyo' ? '1+0' : oda === '5+1+' ? '5+1' : oda;
                  toggle('oda_sayisi', deger);
                }}
                className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  filtreler.oda_sayisi === (oda === 'Stüdyo' ? '1+0' : oda === '5+1+' ? '5+1' : oda)
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'border-slate-200 text-slate-600 hover:border-green-400 hover:text-green-600'
                }`}
              >
                {oda}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        {/* Fiyat Aralığı */}
        <div>
          <BolumBaslik icon={Banknote} baslik="Fiyat Aralığı (₺)" />
          <MinMaxInput
            minVal={filtreler.min_fiyat}
            maxVal={filtreler.max_fiyat}
            minName="min_fiyat"
            maxName="max_fiyat"
            minPlaceholder="Min ₺"
            maxPlaceholder="Max ₺"
            onChange={handleChange}
          />
          {/* Hızlı seçimler */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[
              { label: '< 1M',  min: '',         max: '1000000' },
              { label: '1-3M',  min: '1000000',  max: '3000000' },
              { label: '3-5M',  min: '3000000',  max: '5000000' },
              { label: '5M+',   min: '5000000',  max: ''        },
            ].map(({ label, min, max }) => (
              <button
                key={label}
                onClick={() => onChange({ ...filtreler, min_fiyat: min, max_fiyat: max })}
                className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                  filtreler.min_fiyat === min && filtreler.max_fiyat === max
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'border-slate-200 text-slate-500 hover:border-green-400 hover:text-green-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        {/* Metrekare */}
        <div>
          <BolumBaslik icon={Maximize2} baslik="Metrekare (m²)" />
          <MinMaxInput
            minVal={filtreler.min_metrekare}
            maxVal={filtreler.max_metrekare}
            minName="min_metrekare"
            maxName="max_metrekare"
            minPlaceholder="Min m²"
            maxPlaceholder="Max m²"
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Alt — aktif filtre özeti */}
      {aktifSayi > 0 && (
        <div className="px-5 py-3 bg-green-50 border-t border-green-100">
          <p className="text-xs text-green-700 font-semibold text-center">
            {aktifSayi} filtre aktif
          </p>
        </div>
      )}
    </aside>
  );
};

export default FilterSidebar;
