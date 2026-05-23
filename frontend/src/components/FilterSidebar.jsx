import { SlidersHorizontal, X, MapPin, Banknote, BedDouble, Home, Maximize2, Bookmark } from 'lucide-react';

const ODA_SECENEKLERI = ['Stüdyo', '1+1', '2+1', '3+1', '4+1', '5+1+'];
const EMLAK_TURLERI   = ['Daire', 'Villa', 'Müstakil Ev', 'Arsa', 'İşyeri', 'Depo'];

const BolumBaslik = ({ icon: Icon, baslik }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
      <Icon size={13} className="text-blue-600" />
    </div>
    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{baslik}</span>
  </div>
);

const INPUT_CLS = "w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 placeholder:text-slate-300 dark:placeholder:text-gray-500 transition-all";

const MinMaxInput = ({ minVal, maxVal, minName, maxName, minPlaceholder, maxPlaceholder, onChange }) => (
  <div className="flex items-center gap-2">
    <input type="number" name={minName} value={minVal} onChange={onChange} placeholder={minPlaceholder} className={INPUT_CLS} />
    <span className="text-slate-400 text-xs font-medium flex-shrink-0">–</span>
    <input type="number" name={maxName} value={maxVal} onChange={onChange} placeholder={maxPlaceholder} className={INPUT_CLS} />
  </div>
);

const FilterSidebar = ({ filtreler, onChange, onTemizle, aktifSayi, onAramaKaydet, aramaKayit }) => {

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
    <aside className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm overflow-hidden sticky top-20 transition-colors duration-200">

      {/* Başlık */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-blue-600" />
          <span className="font-bold text-slate-800 dark:text-gray-100 text-sm">Filtreler</span>
          {aktifSayi > 0 && (
            <span className="bg-blue-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
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
            <input type="text" name="sehir" value={filtreler.sehir} onChange={handleChange} placeholder="Şehir" className={INPUT_CLS} />
            <input type="text" name="ilce"  value={filtreler.ilce}  onChange={handleChange} placeholder="İlçe"  className={INPUT_CLS} />
          </div>
        </div>

        <div className="h-px bg-slate-100 dark:bg-gray-700" />

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
                      : 'bg-blue-600 border-blue-600 text-white'
                    : 'border-slate-200 dark:border-gray-600 text-slate-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                {tip}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-slate-100 dark:bg-gray-700" />

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
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                    : 'border-slate-200 dark:border-gray-600 text-slate-600 dark:text-gray-300 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                {tur}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-slate-100 dark:bg-gray-700" />

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
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-slate-200 dark:border-gray-600 text-slate-600 dark:text-gray-300 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                {oda}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-slate-100 dark:bg-gray-700" />

        {/* Fiyat Aralığı */}
        <div>
          <BolumBaslik icon={Banknote} baslik="Fiyat Aralığı (₺)" />
          <MinMaxInput
            minVal={filtreler.min_fiyat} maxVal={filtreler.max_fiyat}
            minName="min_fiyat" maxName="max_fiyat"
            minPlaceholder="Min ₺" maxPlaceholder="Max ₺"
            onChange={handleChange}
          />
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
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-slate-200 dark:border-gray-600 text-slate-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-slate-100 dark:bg-gray-700" />

        {/* Metrekare */}
        <div>
          <BolumBaslik icon={Maximize2} baslik="Metrekare (m²)" />
          <MinMaxInput
            minVal={filtreler.min_metrekare} maxVal={filtreler.max_metrekare}
            minName="min_metrekare" maxName="max_metrekare"
            minPlaceholder="Min m²" maxPlaceholder="Max m²"
            onChange={handleChange}
          />
        </div>
      </div>

      {aktifSayi > 0 && (
        <div className="px-5 py-3 bg-blue-50 dark:bg-blue-900/30 border-t border-blue-100 dark:border-blue-800 space-y-2">
          <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold text-center">
            {aktifSayi} filtre aktif
          </p>
          {onAramaKaydet && (
            <button
              onClick={onAramaKaydet}
              disabled={aramaKayit}
              className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold py-2 rounded-xl transition-colors"
            >
              <Bookmark size={12} />
              {aramaKayit ? 'Kaydediliyor…' : 'Aramayı Kaydet'}
            </button>
          )}
        </div>
      )}
    </aside>
  );
};

export default FilterSidebar;
