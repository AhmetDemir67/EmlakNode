import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, ChevronDown, X, Map, Building2, Hash, Shield, Sparkles } from 'lucide-react';

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

// ── Glassmorphism Dropdown ────────────────────────────────────────
const Dropdown = ({ label, value, items, acik, setAcik, onSec, dropRef, minWidth = 130 }) => (
  <div className="relative flex-shrink-0" ref={dropRef}>
    <button
      type="button"
      onClick={() => setAcik(!acik)}
      style={{ minWidth }}
      className={`h-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap border ${
        acik
          ? 'bg-white/20 border-white/40 text-white'
          : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/15 hover:border-white/30 hover:text-white'
      }`}
    >
      <span className="flex-1 text-left truncate">{value || label}</span>
      <ChevronDown size={13} className={`flex-shrink-0 transition-transform duration-200 ${acik ? 'rotate-180' : ''}`} />
    </button>

    {acik && (
      <div className="absolute top-full left-0 mt-1.5 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-[200] py-1.5 overflow-hidden" style={{ minWidth: Math.max(minWidth, 160) }}>
        {items.map((item, i) => {
          const itemLabel = typeof item === 'string' ? item : item.label;
          const isAktif   = typeof item === 'string' ? value === item : value === item.label;
          return (
            <button
              key={i}
              type="button"
              onClick={() => { onSec(item); setAcik(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                isAktif
                  ? 'text-amber-400 bg-amber-400/10 font-semibold'
                  : 'text-gray-200 hover:bg-white/5 hover:text-white'
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

// ── Glassmorphism Metin Girişi ────────────────────────────────────
const MetinGirisi = ({ icon: Icon, value, onChange, onKeyDown, placeholder, type = 'text' }) => (
  <div className="flex-1 flex items-center gap-2 border border-white/20 bg-white/10 hover:bg-white/15 hover:border-white/30 rounded-xl px-3 focus-within:border-white/40 focus-within:bg-white/15 transition-all min-w-0">
    <Icon size={16} className="text-blue-400 flex-shrink-0" />
    <input
      type={type}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className="flex-1 outline-none text-sm text-white placeholder-white/40 py-3 bg-transparent min-w-0"
    />
    {value && (
      <button type="button" onClick={() => onChange({ target: { value: '' } })} className="flex-shrink-0">
        <X size={13} className="text-white/30 hover:text-white/60" />
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

  const [gmAcik,    setGmAcik]    = useState(false);
  const [projeAcik, setProjeAcik] = useState(false);
  const [odaAcik,   setOdaAcik]   = useState(false);
  const [fiyatAcik, setFiyatAcik] = useState(false);

  const gmRef    = useRef(null);
  const projeRef = useRef(null);
  const odaRef   = useRef(null);
  const fiyatRef = useRef(null);

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

  const filtrelerGorunsun = aktifTab === 'Satılık' || aktifTab === 'Kiralık' || aktifTab === 'Projeler';
  const haritaGorunsun    = aktifTab !== 'Emlak Ofisleri' && aktifTab !== 'İlan No';

  return (
    <section className="relative min-h-[580px] md:min-h-[640px] overflow-hidden flex flex-col">

      {/* Arka plan */}
      <img
        src={HERO_IMG}
        alt="Emlak platformu arka plan"
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />
      {/* Çok katmanlı karanlık overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/70 to-black/60" />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-950/40 via-transparent to-slate-950/40" />

      {/* İçerik */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center py-12">

        {/* Premium badge */}
        <div className="inline-flex items-center gap-2 bg-white/8 backdrop-blur-md border border-white/15 rounded-full px-4 py-1.5 mb-5">
          <Sparkles size={12} className="text-amber-400" />
          <span className="text-white/70 text-xs font-semibold tracking-widest uppercase">AI Destekli Platform</span>
        </div>

        {/* Başlık */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 leading-tight drop-shadow-2xl">
          Hayalinizdeki Mülkü<br />
          <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-amber-400 bg-clip-text text-transparent">
            EmlakNode
          </span>
          <span className="text-white">'da Bulun</span>
        </h1>
        <p className="text-white/55 text-sm md:text-base mb-8 drop-shadow tracking-wide">
          Türkiye'nin güvenilir emlak platformu &nbsp;·&nbsp; 500.000+ güncel ilan
        </p>

        {/* Arama Kartı — Glassmorphism */}
        <div className="bg-white/8 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl w-full max-w-5xl overflow-visible">

          {/* Tab'lar */}
          <div className="flex border-b border-white/10 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setAktifTab(tab)}
                className={`flex-shrink-0 px-5 py-3.5 text-sm font-bold border-b-2 -mb-px transition-all ${
                  aktifTab === tab
                    ? 'text-amber-400 border-amber-400 bg-white/8'
                    : 'text-white/45 border-transparent hover:text-white/75 hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Arama Satırı */}
          <div className="flex items-stretch gap-2 px-3 py-3">

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
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 active:scale-95 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/30 whitespace-nowrap"
            >
              <Search size={16} />
              Ara
            </button>

            {haritaGorunsun && (
              <button
                type="button"
                onClick={handleHaritadaAra}
                className="flex items-center gap-2 bg-white/10 border border-white/25 text-white hover:bg-white/18 active:scale-95 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap"
              >
                <Map size={15} />
                Haritada Ara
              </button>
            )}
          </div>
        </div>

        {/* İstatistik pills */}
        <div className="flex items-center gap-3 mt-6 flex-wrap justify-center">
          {[
            { icon: '🏠', label: '500K+ İlan' },
            { icon: '👥', label: '200K+ Kullanıcı' },
            { icon: '🤝', label: '10K+ Danışman' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-2 bg-white/8 backdrop-blur-md border border-white/12 rounded-full px-4 py-1.5">
              <span className="text-sm">{icon}</span>
              <span className="text-white/65 text-xs font-semibold">{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 bg-white/8 backdrop-blur-md border border-white/12 rounded-full px-4 py-1.5">
            <Shield size={12} className="text-emerald-400" />
            <span className="text-white/65 text-xs font-semibold">Güvenli & Doğrulanmış</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
