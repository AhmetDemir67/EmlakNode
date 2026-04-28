import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Plus, List, LogOut, User, Loader2, CheckCircle2, AlertCircle, X, Eye, Trash2, Pencil, ChevronRight, ChevronLeft, Building2, TrendingUp, FileText, MapPin, BedDouble, Square, Bath, Layers, ChevronDown } from 'lucide-react';
import { ilanEkle, ilanGuncelle, ilanSil, benimIlanlarim, ilanDurumGuncelle } from '../services/api';
import { ILLER, ILCELER } from '../data/turkiyeAdresler';

const kullaniciBilgi = () => { try { return JSON.parse(localStorage.getItem('kullanici')) || {}; } catch { return {}; } };

const BOSLUK = {
  tip: 'Satılık', emlak_turu: 'Daire', baslik: '', aciklama: '',
  fiyat: '', metrekare: '', oda_sayisi: '', bina_yasi: '', kat: '', toplam_kat: '',
  isinma_tipi: '', banyo_sayisi: '', balkon: false, asansor: false, otopark: false,
  esyali: false, site_icerisinde: false, sehir: '', ilce: '', mahalle: '', gorsel: '',
};

const ADIMLAR = ['İlan Tipi', 'Özellikler', 'Konum & Fiyat'];

const Inp = ({ label, name, type = 'text', value, onChange, placeholder, zorunlu }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 mb-1">{label}{zorunlu && <span className="text-red-400"> *</span>}</label>
    <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all" />
  </div>
);

const Sel = ({ label, name, value, onChange, opts }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
    <select name={name} value={value} onChange={onChange}
      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 bg-white transition-all">
      <option value="">Seçin</option>
      {opts.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const Toggle = ({ label, name, value, onChange }) => (
  <button
    type="button"
    onClick={() => onChange({ target: { name, value: !value, type: 'checkbox', checked: !value } })}
    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
      value ? 'bg-green-600 border-green-600 text-white shadow-sm' : 'border-gray-200 text-gray-500 hover:border-green-400 hover:text-green-600'
    }`}
  >
    <span className={`w-3 h-3 rounded-full flex-shrink-0 ${value ? 'bg-white' : 'bg-gray-300'}`} />
    {label}
  </button>
);

// ── Arama yapılabilir dropdown ────────────────────────────────────
const AramaDropdown = ({ label, value, secenekler, onChange, disabled }) => {
  const [acik, setAcik]     = useState(false);
  const [arama, setArama]   = useState('');
  const ref                 = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setAcik(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtrelenmis = secenekler.filter(s =>
    s.toLowerCase().includes(arama.toLowerCase())
  );

  const sec = (secenek) => {
    onChange(secenek);
    setAcik(false);
    setArama('');
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => { if (!disabled) setAcik(!acik); setArama(''); }}
        className={`w-full flex items-center justify-between px-3 py-2.5 border rounded-xl text-sm transition-all ${
          disabled
            ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
            : acik
              ? 'border-green-500 bg-white ring-2 ring-green-100 text-gray-700'
              : 'border-gray-200 bg-white text-gray-700 hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-100'
        }`}
      >
        <span className={value ? 'text-gray-800 font-medium' : 'text-gray-400'}>
          {value || label}
        </span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${acik ? 'rotate-180' : ''}`} />
      </button>

      {acik && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              value={arama}
              onChange={e => setArama(e.target.value)}
              placeholder={`${label} ara...`}
              className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-green-400"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            {filtrelenmis.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-3">Sonuç bulunamadı</p>
            ) : filtrelenmis.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => sec(s)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  value === s ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const fiyatFormat = (f) => f ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(f) : '-';

export default function Dashboard() {
  const navigate = useNavigate();
  const kullanici = kullaniciBilgi();
  const [menu, setMenu] = useState('yeni');
  const [adim, setAdim] = useState(0);
  const [form, setForm] = useState(BOSLUK);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [mesaj, setMesaj] = useState(null);
  const [hata, setHata] = useState(null);
  const [ilanlar, setIlanlar] = useState([]);
  const [listeleniyor, setListeleniyor] = useState(false);
  const [duzenle, setDuzenle] = useState(null);

  const cikis = () => { localStorage.removeItem('token'); localStorage.removeItem('kullanici'); navigate('/login'); };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => {
      const yeni = { ...f, [name]: type === 'checkbox' ? (checked ?? value) : value };
      // Şehir değişince ilçeyi sıfırla
      if (name === 'sehir') yeni.ilce = '';
      return yeni;
    });
    setHata(null);
  };

  useEffect(() => {
    if (menu === 'ilanlar' && kullanici.dukkan_id) {
      setListeleniyor(true);
      benimIlanlarim(kullanici.dukkan_id)
        .then(r => setIlanlar(r.data.ilanlar || []))
        .catch(() => setIlanlar([]))
        .finally(() => setListeleniyor(false));
    }
  }, [menu]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.baslik || !form.fiyat || !form.metrekare) { setHata('Başlık, fiyat ve metrekare zorunludur.'); return; }
    try {
      setYukleniyor(true); setHata(null);
      if (duzenle) {
        await ilanGuncelle(duzenle.id, form);
        setMesaj('İlan güncellendi!'); setDuzenle(null);
      } else {
        const r = await ilanEkle(form);
        setMesaj(`"${r.data.ilan.baslik}" yayınlandı!`);
      }
      setForm(BOSLUK); setAdim(0); setMenu('ilanlar');
    } catch (err) { setHata(err.response?.data?.mesaj || 'Bir hata oluştu.'); }
    finally { setYukleniyor(false); }
  };

  const sil = async (id, baslik) => {
    if (!confirm(`"${baslik}" ilanını silmek istiyor musunuz?`)) return;
    try { await ilanSil(id); setIlanlar(p => p.filter(i => i.id !== id)); setMesaj('İlan silindi.'); }
    catch { setHata('Silme başarısız.'); }
  };

  const durumDegistir = async (id, yeniDurum) => {
    try {
      await ilanDurumGuncelle(id, yeniDurum);
      setIlanlar(p => p.map(i => i.id === id ? { ...i, durum: yeniDurum } : i));
    } catch { setHata('Durum güncellenemedi.'); }
  };

  const duzenleBaslat = (ilan) => {
    setDuzenle(ilan);
    setForm({ ...BOSLUK, ...ilan, balkon: !!ilan.balkon, asansor: !!ilan.asansor, otopark: !!ilan.otopark, esyali: !!ilan.esyali, site_icerisinde: !!ilan.site_icerisinde });
    setAdim(0); setMenu('yeni');
  };

  const navLink = (id, icon, label) => (
    <button key={id} onClick={() => { setMenu(id); setDuzenle(null); setMesaj(null); setHata(null); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${menu === id ? 'bg-green-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}>
      {icon}{label}
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden font-sans">
      {/* SIDEBAR */}
      <aside className="w-60 flex flex-col bg-slate-800 border-r border-slate-700 flex-shrink-0">
        <div className="p-5 border-b border-slate-700">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-green-600 p-1.5 rounded-lg"><Home size={16} className="text-white" /></div>
            <span className="text-base font-bold text-white">Emlak<span className="text-green-500">Node</span></span>
          </Link>
        </div>
        <div className="px-4 py-4 border-b border-slate-700 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-semibold text-white truncate">{kullanici.ad_soyad || 'Kullanıcı'}</div>
            <div className="text-xs text-slate-400 capitalize">{kullanici.rol || 'danışman'}</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navLink('yeni', <Plus size={17} />, duzenle ? 'İlanı Düzenle' : 'Yeni İlan Ekle')}
          {navLink('ilanlar', <List size={17} />, 'İlanlarım')}
          <div className="pt-2 border-t border-slate-700 mt-2">
            <Link to="/">{navLink('site', <Eye size={17} />, 'Siteyi Gör')}</Link>
          </div>
        </nav>
        <div className="p-3 border-t border-slate-700">
          <button onClick={cikis} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut size={16} />Çıkış Yap
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="bg-white border-b border-gray-100 px-8 py-4 sticky top-0 z-10 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">{menu === 'yeni' ? (duzenle ? `Düzenle: ${duzenle.baslik?.slice(0, 30)}…` : 'Yeni İlan Ekle') : 'İlanlarım'}</h1>
            <p className="text-xs text-gray-400 mt-0.5">{menu === 'yeni' ? `Adım ${adim + 1} / ${ADIMLAR.length}: ${ADIMLAR[adim]}` : 'Tüm ilanlarınızı yönetin'}</p>
          </div>
          <div className="flex gap-2 text-xs">
            {ADIMLAR.map((a, i) => (
              <div key={i} className={`px-3 py-1.5 rounded-full font-semibold transition-all ${i === adim && menu === 'yeni' ? 'bg-green-600 text-white' : i < adim && menu === 'yeni' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>{i + 1}. {a}</div>
            ))}
          </div>
        </div>

        <div className="p-8 max-w-4xl mx-auto">
          {/* Mesaj / Hata */}
          {mesaj && <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-6"><CheckCircle2 size={18} className="text-green-500 flex-shrink-0" /><p className="text-green-800 text-sm font-medium flex-1">{mesaj}</p><button onClick={() => setMesaj(null)}><X size={15} className="text-green-400" /></button></div>}
          {hata && <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6"><AlertCircle size={18} className="text-red-400 flex-shrink-0" /><p className="text-red-700 text-sm flex-1">{hata}</p><button onClick={() => setHata(null)}><X size={15} className="text-red-400" /></button></div>}

          {/* YENİ İLAN FORMU */}
          {menu === 'yeni' && (
            <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 space-y-6">

                {/* ADIM 1: İlan Tipi & Emlak Türü */}
                {adim === 0 && (
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">İlan Tipi</p>
                      <div className="flex gap-3">
                        {['Satılık', 'Kiralık'].map(t => (
                          <button key={t} type="button" onClick={() => setForm(f => ({ ...f, tip: t }))}
                            className={`flex-1 py-4 rounded-xl font-bold text-sm border-2 transition-all ${form.tip === t ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:border-green-400'}`}>{t}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Emlak Türü</p>
                      <div className="grid grid-cols-3 gap-3">
                        {['Daire', 'Villa', 'Müstakil Ev', 'Arsa', 'İşyeri', 'Depo'].map(t => (
                          <button key={t} type="button" onClick={() => setForm(f => ({ ...f, emlak_turu: t }))}
                            className={`py-3 px-4 rounded-xl font-semibold text-sm border-2 transition-all flex items-center justify-center gap-2 ${form.emlak_turu === t ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:border-green-400'}`}>
                            <Building2 size={15} />{t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Inp label="İlan Başlığı" name="baslik" value={form.baslik} onChange={handleChange} placeholder="Örn: Kadıköy'de Deniz Manzaralı 3+1 Daire" zorunlu />
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Açıklama</label>
                      <textarea name="aciklama" value={form.aciklama} onChange={handleChange} rows={4}
                        placeholder="İlan hakkında detaylı bilgi girin…"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 resize-none transition-all" />
                    </div>
                  </div>
                )}

                {/* ADIM 2: Konut Özellikleri */}
                {adim === 1 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <Sel label="Oda Sayısı" name="oda_sayisi" value={form.oda_sayisi} onChange={handleChange} opts={['Stüdyo','1+1','2+1','3+1','4+1','5+1','6+1','7+']} />
                      <Inp label="Metrekare (m²)" name="metrekare" type="number" value={form.metrekare} onChange={handleChange} placeholder="120" zorunlu />
                      <Inp label="Bina Yaşı" name="bina_yasi" type="number" value={form.bina_yasi} onChange={handleChange} placeholder="0 = Sıfır" />
                      <Inp label="Bulunduğu Kat" name="kat" type="number" value={form.kat} onChange={handleChange} placeholder="3" />
                      <Inp label="Toplam Kat" name="toplam_kat" type="number" value={form.toplam_kat} onChange={handleChange} placeholder="8" />
                      <Inp label="Banyo Sayısı" name="banyo_sayisi" type="number" value={form.banyo_sayisi} onChange={handleChange} placeholder="1" />
                      <Sel label="Isıtma" name="isinma_tipi" value={form.isinma_tipi} onChange={handleChange} opts={['Kombi','Doğalgaz','Merkezi','Klima','Soba','Yok']} />
                      <Inp label="Görsel URL" name="gorsel" value={form.gorsel} onChange={handleChange} placeholder="https://..." />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Özellikler</p>
                      <div className="flex flex-wrap gap-2">
                        {[['balkon', 'Balkon'], ['asansor', 'Asansör'], ['otopark', 'Otopark'], ['esyali', 'Eşyalı'], ['site_icerisinde', 'Site İçinde']].map(([n, l]) => (
                          <Toggle key={n} name={n} label={l} value={form[n]} onChange={handleChange} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ADIM 3: Konum & Fiyat */}
                {adim === 2 && (
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Konum</p>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Şehir</label>
                          <AramaDropdown
                            label="Şehir seçin"
                            value={form.sehir}
                            secenekler={ILLER}
                            onChange={v => handleChange({ target: { name: 'sehir', value: v } })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">İlçe</label>
                          <AramaDropdown
                            label={form.sehir ? 'İlçe seçin' : 'Önce şehir seçin'}
                            value={form.ilce}
                            secenekler={form.sehir ? (ILCELER[form.sehir] || []) : []}
                            onChange={v => handleChange({ target: { name: 'ilce', value: v } })}
                            disabled={!form.sehir}
                          />
                        </div>
                        <Inp label="Mahalle" name="mahalle" value={form.mahalle} onChange={handleChange} placeholder="Mahalle adı" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Fiyat</p>
                      <Inp label="Fiyat (₺)" name="fiyat" type="number" value={form.fiyat} onChange={handleChange} placeholder="4500000" zorunlu />
                      {form.fiyat && <p className="text-sm font-bold text-green-600 mt-2">{fiyatFormat(form.fiyat)}</p>}
                    </div>
                    {/* Özet */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">İlan Özeti</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600"><Building2 size={14} className="text-green-500" />{form.emlak_turu} · {form.tip}</div>
                        {form.oda_sayisi && <div className="flex items-center gap-2 text-gray-600"><BedDouble size={14} className="text-green-500" />{form.oda_sayisi}</div>}
                        {form.metrekare && <div className="flex items-center gap-2 text-gray-600"><Square size={14} className="text-green-500" />{form.metrekare} m²</div>}
                        {form.sehir && <div className="flex items-center gap-2 text-gray-600"><MapPin size={14} className="text-green-500" />{form.ilce && form.ilce + ', '}{form.sehir}</div>}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ALT BUTONLAR */}
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                <button type="button" onClick={() => adim > 0 ? setAdim(a => a - 1) : null} disabled={adim === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-all">
                  <ChevronLeft size={16} />Geri
                </button>
                {adim < 2 ? (
                  <button type="button" onClick={() => setAdim(a => a + 1)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold shadow-md transition-all">
                    İleri<ChevronRight size={16} />
                  </button>
                ) : (
                  <button type="submit" disabled={yukleniyor}
                    className="flex items-center gap-2 px-8 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-xl text-sm font-bold shadow-md transition-all">
                    {yukleniyor ? <><Loader2 size={15} className="animate-spin" />Kaydediliyor…</> : <><CheckCircle2 size={15} />{duzenle ? 'Güncelle' : 'Yayınla'}</>}
                  </button>
                )}
              </div>
            </form>
          )}

          {/* İLANLARIM */}
          {menu === 'ilanlar' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{ilanlar.length} ilan bulundu</p>
                <button onClick={() => { setMenu('yeni'); setDuzenle(null); setAdim(0); }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-md">
                  <Plus size={15} />Yeni İlan
                </button>
              </div>
              {listeleniyor ? (
                <div className="flex items-center justify-center py-16"><Loader2 size={28} className="text-green-500 animate-spin" /></div>
              ) : ilanlar.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                  <FileText size={40} className="text-gray-200 mx-auto mb-3" />
                  <p className="font-semibold text-gray-500">Henüz ilan eklenmedi</p>
                  <p className="text-sm text-gray-400 mt-1">İlk ilanınızı eklemek için yukarıdaki butona tıklayın.</p>
                </div>
              ) : ilanlar.map(ilan => (
                <div key={ilan.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex hover:shadow-md transition-all">
                  <div className="w-32 h-28 flex-shrink-0 bg-slate-100 relative">
                    {ilan.gorsel ? <img src={ilan.gorsel} alt={ilan.baslik} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><Building2 size={28} className="text-slate-300" /></div>}
                    <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full text-white ${ilan.tip === 'Kiralık' ? 'bg-blue-500' : 'bg-green-600'}`}>{ilan.tip || 'Satılık'}</span>
                  </div>
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-1">{ilan.baslik}</h3>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><MapPin size={11} className="text-green-500" />{[ilan.mahalle, ilan.ilce, ilan.sehir].filter(Boolean).join(', ') || '—'}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                      {ilan.oda_sayisi && <span className="flex items-center gap-1"><BedDouble size={12} className="text-green-500" />{ilan.oda_sayisi}</span>}
                      {ilan.metrekare && <span className="flex items-center gap-1"><Square size={12} className="text-green-500" />{ilan.metrekare} m²</span>}
                      {ilan.banyo_sayisi && <span className="flex items-center gap-1"><Bath size={12} className="text-green-500" />{ilan.banyo_sayisi} banyo</span>}
                      {ilan.kat && <span className="flex items-center gap-1"><Layers size={12} className="text-green-500" />{ilan.kat}. kat</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between p-4 border-l border-gray-100 min-w-[155px]">
                    <div className="text-right">
                      <p className="text-lg font-extrabold text-green-600 leading-none">{fiyatFormat(ilan.fiyat)}</p>
                      <p className="text-xs text-gray-400 mt-1">{ilan.emlak_turu || 'Daire'}</p>
                    </div>
                    {/* Durum seçici */}
                    <select
                      value={ilan.durum || 'aktif'}
                      onChange={e => durumDegistir(ilan.id, e.target.value)}
                      className={`mt-2 text-xs font-bold px-2.5 py-1.5 rounded-lg border cursor-pointer focus:outline-none transition-all ${
                        ilan.durum === 'pasif'     ? 'bg-gray-100 text-gray-500 border-gray-200' :
                        ilan.durum === 'satildi'   ? 'bg-red-50 text-red-600 border-red-200' :
                        ilan.durum === 'kiralandı' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                     'bg-green-50 text-green-700 border-green-200'
                      }`}
                    >
                      <option value="aktif">✅ Aktif</option>
                      <option value="pasif">⏸ Pasif</option>
                      <option value="satildi">🏷 Satıldı</option>
                      <option value="kiralandı">🔑 Kiralandı</option>
                    </select>
                    <div className="flex gap-2 mt-2">
                      <Link to={`/ilan/${ilan.id}`} className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-blue-500 hover:border-blue-200 transition-all"><Eye size={15} /></Link>
                      <button onClick={() => duzenleBaslat(ilan)} className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-green-600 hover:border-green-300 transition-all"><Pencil size={15} /></button>
                      <button onClick={() => sil(ilan.id, ilan.baslik)} className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-all"><Trash2 size={15} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
