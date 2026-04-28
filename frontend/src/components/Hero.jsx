import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, ChevronDown, X, Map, Building2, Hash } from 'lucide-react';

const TABS = ['Satılık', 'Kiralık', 'Projeler', 'Emlak Ofisleri', 'İlan No'];

const GM_TIPLERI    = ['Konut', 'İşyeri', 'Arsa', 'Bina', 'Devremülk', 'Turistik'];
const PROJE_TIPLERI = ['Konut Projesi', 'Ticari Proje', 'Arsa Projesi', 'Karma Proje', 'Tatil Projesi'];
const ODA_SECENEGI  = ['Stüdyo', '1+1', '2+1', '3+1', '4+1', '5+1', '6+1+'];
const FIYAT_ARALIK  = [
  { label: 'Fiyat Giriniz', min: '', max: '' },
  { label: '0 – 1M ₺',     min: '',          max: '1000000'  },
  { label: '1M – 3M ₺',    min: '1000000',   max: '3000000'  },
  { label: '3M – 5M ₺',    min: '3000000',   max: '5000000'  },
  { label: '5M – 10M ₺',   min: '5000000',   max: '10000000' },
  { label: '10M+ ₺',       min: '10000000',  max: ''         },
];

const HERO_IMG = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=85';

// ── Dropdown bileşeni ─────────────────────────────────────────────
const Dropdown = ({ label, value, items, acik, setAcik, onSec, dropRef, minWidth = 130 }) => (
  <div className="relative flex-shrink-0" ref={dropRef}>
    <button
      type="button"
      onClick={() => setAcik(!acik)}
      style={{ minWidth }}
      className={`h-full flex items-center gap-2 px-3 py-2 border rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
        acik
          ? 'border-green-500 bg-green-50 text-green-700 ring-2 ring-green-100'
          : 'border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700 bg-white'
      }`}
    >
      <span className="flex-1 text-left truncate">{value || label}</span>
      <ChevronDown size={13} className={`flex-shrink-0 transition-transform duration-200 ${acik ? 'rotate-180' : ''}`} />
    </button>

    {acik && (
      <div className="absolute top-full left-0 mt-1.5 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[200] py-1.5 overflow-hidden" style={{ minWidth: Math.max(minWidth, 160) }}>
        {items.map((item, i) => {
          const itemLabel = typeof item === 'string' ? item : item.label;
          const isAktif   = typeof item === 'string' ? value === item : value === item.label;
          return (
            <button
              key={i}
              type="button"
              onClick={() => { onSec(item); setAcik(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                isAktif ? 'text-green-700 bg-green-50 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              {itemLabel}
            </button>
          );
        })}
      </div>
    )}
  </div>
);

// ── Metin girişi (ortak stil) ─────────────────────────────────────
const MetinGirisi = ({ icon: Icon, value, onChange, onKeyDown, placeholder, type = 'text' }) => (
  <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100 transition-all min-w-0">
    <Icon size={16} className="text-green-500 flex-shrink-0" />
    <input
      type={type}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 py-3 bg-transparent min-w-0"
    />
    {value && (
      <button type="button" onClick={() => onChange({ target: { value: '' } })} className="flex-shrink-0">
        <X size={13} className="text-gray-300 hover:text-gray-500" />
      </button>
    )}
  </div>
);

// ═══════════════════════════════════════════════════════════════════
const Hero = ({ onAra, onHaritaAra }) => {
  const [aktifTab,  setAktifTab]  = useState('Satılık');
  const [konum,     setKonum]     = useState('');
  const [gmTipi,    setGmTipi]    = useState('Konut');
  const [projeTipi, setProjeTipi] = useState('');
  const [ofisAdi,   setOfisAdi]   = useState('');
  const [ilanNo,    setIlanNo]    = useState('');
  const [oda,       setOda]       = useState('');
  const [fiyat,     setFiyat]     = useState(FIYAT_ARALIK[0]);

  const [gmAcik,     setGmAcik]     = useState(false);
  const [projeAcik,  setProjeAcik]  = useState(false);
  const [odaAcik,    setOdaAcik]    = useState(false);
  const [fiyatAcik,  setFiyatAcik]  = useState(false);

  const gmRef    = useRef(null);
  const projeRef = useRef(null);
  const odaRef   = useRef(null);
  const fiyatRef = useRef(null);

  // Tüm dropdown'ları dışarı tıklayınca kapat
  useEffect(() => {
    const handler = (e) => {
      if (!gmRef.current?.contains(e.target))    setGmAcik(false);
      if (!projeRef.current?.contains(e.target)) setProjeAcik(false);
      if (!odaRef.current?.contains(e.target))   setOdaAcik(false);
      if (!fiyatRef.current?.contains(e.target)) setFiyatAcik(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const buildParams = () => {
    if (aktifTab === 'Emlak Ofisleri') return { ofis_adi: ofisAdi.trim() };
    if (aktifTab === 'İlan No')        return { ilan_id: ilanNo.trim() };
    return {
      sehir:      konum.trim(),
      tip:        aktifTab === 'Satılık' || aktifTab === 'Kiralık' ? aktifTab : '',
      oda_sayisi: oda === 'Stüdyo' ? '1+0' : oda,
      min_fiyat:  fiyat.min,
      max_fiyat:  fiyat.max,
    };
  };

  const handleAra         = () => onAra?.(buildParams());
  const handleHaritadaAra = () => { onAra?.(buildParams()); onHaritaAra?.(); };
  const enterAra          = (e) => { if (e.key === 'Enter') handleAra(); };

  const solDropdownGorunsun = aktifTab === 'Satılık' || aktifTab === 'Kiralık' || aktifTab === 'Projeler';
  const filtrelerGorunsun   = aktifTab === 'Satılık' || aktifTab === 'Kiralık' || aktifTab === 'Projeler';
  const haritaGorunsun      = aktifTab !== 'Emlak Ofisleri' && aktifTab !== 'İlan No';

  return (
    <section className="relative h-[460px] md:h-[500px] overflow-hidden">

      {/* Arka plan fotoğraf */}
      <img
        src={HERO_IMG}
        alt="Emlak platformu arka plan"
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/40" />

      {/* İçerik */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-1.5 leading-tight drop-shadow-lg">
          Satılık Ev Arıyorsan Çözüm Net:
          <span className="text-green-400"> EmlakNode</span>
        </h1>
        <p className="text-white/70 text-sm md:text-base mb-6 drop-shadow">
          Türkiye'nin güvenilir emlak platformu · 500.000+ güncel ilan
        </p>

        {/* Arama Kartı */}
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-visible">

          {/* Tab'lar */}
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setAktifTab(tab)}
                className={`flex-shrink-0 px-5 py-3.5 text-sm font-bold border-b-2 -mb-px transition-all ${
                  aktifTab === tab
                    ? 'text-green-600 border-green-600 bg-green-50/50'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ── Arama Satırı ── */}
          <div className="flex items-stretch gap-2 px-3 py-3">

            {/* Sol dropdown: Satılık/Kiralık → Gayrimenkul Tipi, Projeler → Proje Tipi */}
            {(aktifTab === 'Satılık' || aktifTab === 'Kiralık') && (
              <Dropdown
                label="Gayrimenkul Tipi"
                value={gmTipi}
                items={GM_TIPLERI}
                acik={gmAcik}
                setAcik={setGmAcik}
                onSec={v => setGmTipi(v)}
                dropRef={gmRef}
                minWidth={155}
              />
            )}
            {aktifTab === 'Projeler' && (
              <Dropdown
                label="Proje Tipi"
                value={projeTipi}
                items={PROJE_TIPLERI}
                acik={projeAcik}
                setAcik={setProjeAcik}
                onSec={v => setProjeTipi(v)}
                dropRef={projeRef}
                minWidth={155}
              />
            )}

            {/* Metin girişi — tabın içeriğine göre */}
            {aktifTab === 'Emlak Ofisleri' && (
              <MetinGirisi
                icon={Building2}
                value={ofisAdi}
                onChange={e => setOfisAdi(e.target.value)}
                onKeyDown={enterAra}
                placeholder="Emlak ofisi veya danışman adı yazın..."
              />
            )}
            {aktifTab === 'İlan No' && (
              <MetinGirisi
                icon={Hash}
                value={ilanNo}
                onChange={e => setIlanNo(e.target.value)}
                onKeyDown={enterAra}
                placeholder="İlan numarasını girin..."
                type="number"
              />
            )}
            {(aktifTab !== 'Emlak Ofisleri' && aktifTab !== 'İlan No') && (
              <MetinGirisi
                icon={MapPin}
                value={konum}
                onChange={e => setKonum(e.target.value)}
                onKeyDown={enterAra}
                placeholder="İl, ilçe, mahalle, site, okul, metro..."
              />
            )}

            {/* Oda Sayısı + Fiyat — Satılık / Kiralık / Projeler */}
            {filtrelerGorunsun && (
              <>
                <Dropdown
                  label="Oda Sayısı"
                  value={oda}
                  items={['Tümü', ...ODA_SECENEGI]}
                  acik={odaAcik}
                  setAcik={setOdaAcik}
                  onSec={v => setOda(v === 'Tümü' ? '' : v)}
                  dropRef={odaRef}
                  minWidth={120}
                />
                <Dropdown
                  label="Fiyat Bilgisi"
                  value={fiyat.min || fiyat.max ? fiyat.label : ''}
                  items={FIYAT_ARALIK}
                  acik={fiyatAcik}
                  setAcik={setFiyatAcik}
                  onSec={v => setFiyat(v)}
                  dropRef={fiyatRef}
                  minWidth={135}
                />
              </>
            )}

            {/* Ara */}
            <button
              type="button"
              onClick={handleAra}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 active:scale-95 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md whitespace-nowrap"
            >
              <Search size={16} />
              Ara
            </button>

            {/* Haritada Ara — Emlak Ofisleri ve İlan No'da gizle */}
            {haritaGorunsun && (
              <button
                type="button"
                onClick={handleHaritadaAra}
                className="flex items-center gap-2 border-2 border-green-600 text-green-600 hover:bg-green-50 active:scale-95 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap"
              >
                <Map size={15} />
                Haritada Ara
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
