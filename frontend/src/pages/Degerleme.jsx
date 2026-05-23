import { useState } from 'react';
import { Home, MapPin, Ruler, BedDouble, Building2, TrendingUp, TrendingDown, Minus, Sparkles, Loader2, CheckCircle2, AlertCircle, Navigation } from 'lucide-react';
import { aiMulkDegerle } from '../services/api';
import toast from 'react-hot-toast';

const SEHIRLER = ['İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa', 'Adana', 'Konya', 'Kayseri', 'Mersin', 'Eskişehir', 'Diğer'];

const Inp = ({ label, name, type = 'text', value, onChange, placeholder }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{label}</label>
    <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
      className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
  </div>
);

const Sel = ({ label, name, value, onChange, opts }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{label}</label>
    <select name={name} value={value} onChange={onChange}
      className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:border-blue-500 transition-all">
      <option value="">Seçin</option>
      {opts.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const formatFiyat = (sayi) => {
  if (!sayi) return '—';
  if (sayi >= 1_000_000) return `${(sayi / 1_000_000).toFixed(2)} Milyon ₺`;
  return `${sayi.toLocaleString('tr-TR')} ₺`;
};

export default function Degerleme() {
  const [form, setForm] = useState({
    tip: 'Satılık', emlak_turu: 'Daire', sehir: '', ilce: '', mahalle: '',
    metrekare: '', oda_sayisi: '', kat: '', bina_yasi: '', referans_nokta: '',
    balkon: false, asansor: false, otopark: false, esyali: false, site_icerisinde: false,
  });
  const [yukleniyor, setYukleniyor] = useState(false);
  const [sonuc, setSonuc] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.sehir || !form.metrekare) {
      toast.error('Şehir ve metrekare alanları zorunludur.');
      return;
    }
    setYukleniyor(true);
    setSonuc(null);
    try {
      const r = await aiMulkDegerle(form);
      setSonuc(r.data.degerleme);
      toast.success('Değerleme tamamlandı!');
    } catch (err) {
      const mesaj = err.response?.data?.mesaj || 'Değerleme yapılamadı. Lütfen tekrar deneyin.';
      toast.error(mesaj);
    } finally {
      setYukleniyor(false);
    }
  };

  const TrendIcon = ({ trend }) => {
    if (!trend) return <Minus size={16} className="text-gray-400" />;
    if (trend.toLowerCase().includes('yüksel')) return <TrendingUp size={16} className="text-blue-500" />;
    if (trend.toLowerCase().includes('düş')) return <TrendingDown size={16} className="text-red-500" />;
    return <Minus size={16} className="text-yellow-500" />;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      {/* Hero */}
      <div className="bg-gradient-to-r from-gray-900 via-slate-800 to-blue-900 py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-white/80 text-xs font-semibold mb-4">
            <Sparkles size={13} /> AI Destekli Değerleme
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">Mülkünüzün Değerini Öğrenin</h1>
          <p className="text-white/70 text-base max-w-xl mx-auto">
            Yapay zeka destekli sistemimiz, mülk bilgilerinizi analiz ederek gerçekçi piyasa değeri tahmini sunar.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 md:p-8 space-y-6">
          <h2 className="font-bold text-gray-800 dark:text-gray-100 text-lg flex items-center gap-2"><Home size={18} className="text-blue-600" /> Mülk Bilgileri</h2>

          {/* Tip & Tür */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">İşlem Tipi</label>
              <div className="flex gap-2">
                {['Satılık', 'Kiralık'].map(t => (
                  <button key={t} type="button" onClick={() => setForm(f => ({ ...f, tip: t }))}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${form.tip === t ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-blue-400 dark:hover:border-blue-500'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <Sel label="Emlak Türü" name="emlak_turu" value={form.emlak_turu} onChange={handleChange}
              opts={['Daire', 'Müstakil Ev', 'Villa', 'Rezidans', 'Ofis', 'Dükkan', 'Arsa', 'Depo']} />
          </div>

          {/* Konum */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1"><MapPin size={12} /> Konum</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Sel label="" name="sehir" value={form.sehir} onChange={handleChange} opts={SEHIRLER} />
              <Inp label="" name="ilce" value={form.ilce} onChange={handleChange} placeholder="İlçe" />
              <Inp label="" name="mahalle" value={form.mahalle} onChange={handleChange} placeholder="Mahalle" />
            </div>
          </div>

          {/* Özellikler */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1"><Ruler size={12} /> Mülk Özellikleri</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Inp label="Metrekare (m²)" name="metrekare" type="number" value={form.metrekare} onChange={handleChange} placeholder="120" />
              <Sel label="Oda Sayısı" name="oda_sayisi" value={form.oda_sayisi} onChange={handleChange}
                opts={['Stüdyo', '1+1', '2+1', '3+1', '4+1', '5+1', '6+1']} />
              <Inp label="Kat" name="kat" type="number" value={form.kat} onChange={handleChange} placeholder="3" />
              <Inp label="Bina Yaşı" name="bina_yasi" type="number" value={form.bina_yasi} onChange={handleChange} placeholder="0 = Sıfır" />
            </div>
          </div>

          {/* Checkboxlar */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Özellikler</label>
            <div className="flex flex-wrap gap-3">
              {[
                { name: 'balkon', label: 'Balkon' },
                { name: 'asansor', label: 'Asansör' },
                { name: 'otopark', label: 'Otopark' },
                { name: 'esyali', label: 'Eşyalı' },
                { name: 'site_icerisinde', label: 'Site İçinde' },
              ].map(({ name, label }) => (
                <label key={name} className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-medium cursor-pointer transition-all select-none
                  ${form[name] ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700' : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-blue-300'}`}>
                  <input type="checkbox" name={name} checked={form[name]} onChange={handleChange} className="hidden" />
                  {form[name] ? <CheckCircle2 size={15} /> : <div className="w-3.5 h-3.5 rounded border border-gray-300" />}
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Referans Nokta */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
              <Navigation size={12} /> Referans Nokta <span className="text-gray-400 font-normal">(opsiyonel)</span>
            </label>
            <input
              type="text" name="referans_nokta" value={form.referans_nokta} onChange={handleChange}
              placeholder="İşyeri, okul, alışveriş merkezi... (örn: Levent Metro, Atatürk Havalimanı)"
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">Girilen noktaya olan uzaklık ve ulaşım süresi değerlemeye yansıtılır.</p>
          </div>

          <button type="submit" disabled={yukleniyor}
            className="w-full py-3.5 bg-gradient-to-r from-gray-900 to-blue-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-60 text-sm">
            {yukleniyor ? <><Loader2 size={16} className="animate-spin" /> Değerleme yapılıyor...</> : <><Sparkles size={16} /> AI ile Değerle</>}
          </button>
        </form>

        {/* Sonuç */}
        {sonuc && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-900 via-slate-800 to-blue-900 p-6">
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Tahmini Piyasa Değeri</p>
              <p className="text-3xl font-black text-white">{formatFiyat(sonuc.tahminiOrtalama)}</p>
              <p className="text-white/60 text-sm mt-1">{formatFiyat(sonuc.minFiyat)} – {formatFiyat(sonuc.maxFiyat)} aralığı</p>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-gray-700 rounded-xl p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1">m² Birim Fiyatı</p>
                  <p className="text-lg font-black text-gray-800 dark:text-gray-100">{formatFiyat(sonuc.m2Fiyat)}<span className="text-xs font-normal text-gray-400">/m²</span></p>
                </div>
                <div className="bg-slate-50 dark:bg-gray-700 rounded-xl p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1">Piyasa Durumu</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{sonuc.piyasaDurumu || '—'}</p>
                </div>
                <div className="bg-slate-50 dark:bg-gray-700 rounded-xl p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1">Fiyat Trendi</p>
                  <div className="flex items-center gap-2">
                    <TrendIcon trend={sonuc.fiyatTrendi} />
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{sonuc.fiyatTrendi || '—'}</p>
                  </div>
                </div>
              </div>

              {sonuc.ozet && (
                <div className="border border-blue-100 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Piyasa Analizi</p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">{sonuc.ozet}</p>
                </div>
              )}

              {sonuc.tavsiye && (
                <div className="border border-blue-100 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Uzman Tavsiyesi</p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">{sonuc.tavsiye}</p>
                </div>
              )}

              {sonuc.referansUzakligi && (
                <div className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 flex items-start gap-3">
                  <Navigation size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1">
                      "{form.referans_nokta}" Uzaklığı
                    </p>
                    <p className="text-sm text-amber-900 dark:text-amber-200">{sonuc.referansUzakligi}</p>
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <AlertCircle size={12} />
                Bu değerleme yapay zeka tarafından üretilmiş tahmini bir sonuçtur. Kesin değer için profesyonel ekspertiz almanızı öneririz.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
