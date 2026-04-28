import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Home, ChevronRight, MapPin, BedDouble, Square, Layers,
  Building2, Phone, SlidersHorizontal, X, Loader2,
  AlertCircle, RefreshCw, ChevronLeft, ChevronDown,
} from 'lucide-react';
import FilterSidebar from '../components/FilterSidebar';
import { ilanlarGetir } from '../services/api';

const GORSEL_FALLBACK = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80';
const SAYFA_BASI    = 15;

const BOSLUK_FILTRE = {
  sehir: '', ilce: '', tip: '', emlak_turu: '',
  oda_sayisi: '', min_fiyat: '', max_fiyat: '',
  min_metrekare: '', max_metrekare: '',
};

const fiyatFormatla = (f) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(f);

// ── Yatay ilan kartı ─────────────────────────────────────────────
const IlanKarti = ({ ilan }) => {
  const navigate = useNavigate();
  const tip      = ilan.tip || 'Satılık';
  const tipRenk  = tip === 'Satılık' ? 'bg-green-600' : 'bg-blue-500';

  return (
    <div
      onClick={() => navigate(`/ilan/${ilan.id}`)}
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex hover:shadow-md hover:border-green-200 transition-all cursor-pointer group"
    >
      {/* Görsel */}
      <div className="relative w-52 sm:w-64 flex-shrink-0 overflow-hidden bg-gray-100">
        <img
          src={ilan.gorsel || GORSEL_FALLBACK}
          alt={ilan.baslik}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => { e.currentTarget.src = GORSEL_FALLBACK; }}
        />
        <span className={`absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-md ${tipRenk}`}>
          {tip}
        </span>
      </div>

      {/* İçerik */}
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        <div>
          {/* Başlık + emlak türü */}
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-green-700 transition-colors">
              {ilan.baslik}
            </h3>
            {ilan.emlak_turu && (
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                {ilan.emlak_turu}
              </span>
            )}
          </div>

          {/* Konum */}
          {(ilan.ilce || ilan.sehir) && (
            <p className="text-xs text-gray-400 flex items-center gap-1 mb-2">
              <MapPin size={10} className="text-green-500 flex-shrink-0" />
              {[ilan.mahalle, ilan.ilce, ilan.sehir].filter(Boolean).join(' / ')}
            </p>
          )}

          {/* Özellik chip'leri */}
          <div className="flex flex-wrap gap-1.5">
            {ilan.oda_sayisi && (
              <span className="flex items-center gap-1 text-[11px] bg-slate-50 text-slate-600 px-2 py-1 rounded-lg font-medium border border-slate-100">
                <BedDouble size={10} className="text-green-500" /> {ilan.oda_sayisi}
              </span>
            )}
            {ilan.metrekare && (
              <span className="flex items-center gap-1 text-[11px] bg-slate-50 text-slate-600 px-2 py-1 rounded-lg font-medium border border-slate-100">
                <Square size={10} className="text-green-500" /> {ilan.metrekare} m²
              </span>
            )}
            {ilan.kat != null && (
              <span className="flex items-center gap-1 text-[11px] bg-slate-50 text-slate-600 px-2 py-1 rounded-lg font-medium border border-slate-100">
                <Layers size={10} className="text-green-500" /> {ilan.kat}. Kat
              </span>
            )}
            {ilan.bina_yasi != null && (
              <span className="flex items-center gap-1 text-[11px] bg-slate-50 text-slate-600 px-2 py-1 rounded-lg font-medium border border-slate-100">
                <Building2 size={10} className="text-green-500" />
                {ilan.bina_yasi === 0 ? 'Sıfır' : `${ilan.bina_yasi} Yıllık`}
              </span>
            )}
          </div>
        </div>

        {/* Alt: Fiyat + Ofis + Buton */}
        <div className="flex items-end justify-between gap-2 mt-3 flex-wrap">
          <div>
            <p className="text-lg font-extrabold text-green-600 leading-none">{fiyatFormatla(ilan.fiyat)}</p>
            {ilan.dukkan_adi && (
              <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                <Building2 size={9} /> {ilan.dukkan_adi}
              </p>
            )}
          </div>
          <button
            onClick={e => { e.stopPropagation(); navigate(`/ilan/${ilan.id}`); }}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
          >
            <Phone size={12} /> Telefona Bak
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Sayfalama ────────────────────────────────────────────────────
const Sayfalama = ({ aktif, toplam, onChange }) => {
  const sayfaSayisi = Math.ceil(toplam / SAYFA_BASI);
  if (sayfaSayisi <= 1) return null;

  const goster = () => {
    const pages = [];
    if (sayfaSayisi <= 7) {
      for (let i = 1; i <= sayfaSayisi; i++) pages.push(i);
    } else {
      pages.push(1);
      if (aktif > 3) pages.push('...');
      for (let i = Math.max(2, aktif - 1); i <= Math.min(sayfaSayisi - 1, aktif + 1); i++) pages.push(i);
      if (aktif < sayfaSayisi - 2) pages.push('...');
      pages.push(sayfaSayisi);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1.5 pt-6">
      <button
        disabled={aktif === 1}
        onClick={() => onChange(aktif - 1)}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-green-400 hover:text-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft size={16} />
      </button>

      {goster().map((p, i) =>
        p === '...'
          ? <span key={`e${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">…</span>
          : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold border transition-all ${
                aktif === p
                  ? 'bg-green-600 border-green-600 text-white shadow-md'
                  : 'border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-600'
              }`}
            >
              {p}
            </button>
          )
      )}

      <button
        disabled={aktif === Math.ceil(toplam / SAYFA_BASI)}
        onClick={() => onChange(aktif + 1)}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-green-400 hover:text-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
const Listings = () => {
  const [searchParams]                = useSearchParams();
  const navigate                      = useNavigate();

  const [ilanlar, setIlanlar]         = useState([]);
  const [yukleniyor, setYukleniyor]   = useState(true);
  const [hata, setHata]               = useState(null);
  const [mobilFiltre, setMobilFiltre] = useState(false);
  const [aktifSayfa, setAktifSayfa]   = useState(1);

  const [filtreler, setFiltreler] = useState(() => ({
    ...BOSLUK_FILTRE,
    tip:        searchParams.get('tip')        || '',
    emlak_turu: searchParams.get('emlak_turu') || '',
    sehir:      searchParams.get('sehir')      || '',
    ilce:       searchParams.get('ilce')       || '',
  }));

  // URL params değişince filtre güncelle
  useEffect(() => {
    setFiltreler(f => ({
      ...f,
      tip:        searchParams.get('tip')        || '',
      emlak_turu: searchParams.get('emlak_turu') || '',
      sehir:      searchParams.get('sehir')      || '',
    }));
    setAktifSayfa(1);
  }, [searchParams]);

  const verileriGetir = useCallback(async () => {
    try {
      setYukleniyor(true); setHata(null);
      const params = { limit: 100 };
      Object.entries(filtreler).forEach(([k, v]) => { if (v) params[k] = v; });
      const yanit = await ilanlarGetir(params);
      setIlanlar(yanit.data.ilanlar || []);
      setAktifSayfa(1);
    } catch {
      setHata('İlanlar yüklenirken bir hata oluştu.');
    } finally {
      setYukleniyor(false);
    }
  }, [filtreler]);

  useEffect(() => {
    const t = setTimeout(verileriGetir, 350);
    return () => clearTimeout(t);
  }, [verileriGetir]);

  const filtreTemizle = () => { setFiltreler(BOSLUK_FILTRE); setAktifSayfa(1); };

  const aktifFiltreSayisi = useMemo(
    () => Object.values(filtreler).filter(Boolean).length,
    [filtreler],
  );

  // Client-side sayfalama
  const sayfaIlanlar = useMemo(() => {
    const baslangic = (aktifSayfa - 1) * SAYFA_BASI;
    return ilanlar.slice(baslangic, baslangic + SAYFA_BASI);
  }, [ilanlar, aktifSayfa]);

  // Breadcrumb etiketi
  const etiket = [filtreler.tip, filtreler.emlak_turu].filter(Boolean).join(' ') || 'Tüm İlanlar';

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Breadcrumb ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-slate-500 flex-wrap">
            <Link to="/" className="flex items-center gap-1 hover:text-green-600 transition-colors font-medium">
              <Home size={13} /> Ana Sayfa
            </Link>
            <ChevronRight size={13} className="text-slate-300 flex-shrink-0" />
            {filtreler.tip && (
              <>
                <span className="text-slate-400">{filtreler.tip}</span>
                <ChevronRight size={13} className="text-slate-300 flex-shrink-0" />
              </>
            )}
            {filtreler.sehir && (
              <>
                <span className="text-slate-400">{filtreler.sehir}</span>
                <ChevronRight size={13} className="text-slate-300 flex-shrink-0" />
              </>
            )}
            <span className="text-slate-700 font-semibold">{etiket} İlanları</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ── Başlık + mobil filtre butonu ───────────────────── */}
        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">{etiket} İlanları</h1>
            {!yukleniyor && !hata && (
              <p className="text-sm text-gray-400 mt-0.5">
                <span className="font-bold text-green-600">{ilanlar.length}</span> ilan listeleniyor
              </p>
            )}
          </div>
          <button
            onClick={() => setMobilFiltre(true)}
            className="lg:hidden flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:border-green-500 hover:text-green-600 transition-all relative"
          >
            <SlidersHorizontal size={15} />
            Filtrele
            {aktifFiltreSayisi > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-green-600 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {aktifFiltreSayisi}
              </span>
            )}
          </button>
        </div>

        {/* ── İki Kolon ──────────────────────────────────────── */}
        <div className="flex gap-6">

          {/* Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <FilterSidebar
              filtreler={filtreler}
              onChange={f => { setFiltreler(f); setAktifSayfa(1); }}
              onTemizle={filtreTemizle}
              aktifSayi={aktifFiltreSayisi}
            />
          </div>

          {/* İlan Listesi */}
          <div className="flex-1 min-w-0">

            {/* Yükleniyor */}
            {yukleniyor && (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex animate-pulse h-40">
                    <div className="w-52 bg-gray-200 flex-shrink-0" />
                    <div className="flex-1 p-4 space-y-3">
                      <div className="h-4 bg-gray-100 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                      <div className="flex gap-2">{[...Array(3)].map((_, j) => <div key={j} className="h-6 w-16 bg-gray-100 rounded-lg" />)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Hata */}
            {!yukleniyor && hata && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md text-center">
                  <AlertCircle size={36} className="text-red-400 mx-auto mb-3" />
                  <p className="text-red-700 font-semibold mb-4">{hata}</p>
                  <button onClick={verileriGetir}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors mx-auto">
                    <RefreshCw size={14} /> Tekrar Dene
                  </button>
                </div>
              </div>
            )}

            {/* Sonuç yok */}
            {!yukleniyor && !hata && ilanlar.length === 0 && (
              <div className="flex flex-col items-center py-20 gap-4 text-center">
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center">
                  <AlertCircle size={28} className="text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-600 mb-1">Bu filtrelere uygun ilan bulunamadı.</p>
                  {aktifFiltreSayisi > 0 && (
                    <button onClick={filtreTemizle}
                      className="inline-flex items-center gap-1.5 text-sm text-green-600 hover:underline font-medium mt-2">
                      <X size={14} /> Filtreleri Temizle
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* İlan kartları */}
            {!yukleniyor && !hata && ilanlar.length > 0 && (
              <>
                <div className="space-y-3">
                  {sayfaIlanlar.map(ilan => <IlanKarti key={ilan.id} ilan={ilan} />)}
                </div>

                <Sayfalama
                  aktif={aktifSayfa}
                  toplam={ilanlar.length}
                  onChange={p => { setAktifSayfa(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobil Filtre Overlay ────────────────────────────── */}
      {mobilFiltre && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobilFiltre(false)} />
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
                onChange={f => { setFiltreler(f); setAktifSayfa(1); }}
                onTemizle={filtreTemizle}
                aktifSayi={aktifFiltreSayisi}
              />
            </div>
            <div className="p-4 border-t bg-white sticky bottom-0">
              <button onClick={() => setMobilFiltre(false)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors">
                {ilanlar.length} İlanı Gör
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Listings;
