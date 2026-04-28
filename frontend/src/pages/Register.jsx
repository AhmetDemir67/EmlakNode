import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home, Mail, Lock, Eye, EyeOff, User, Building2,
  Loader2, AlertCircle, CheckCircle2, FileText, Hash,
  ChevronDown, X, MapPin,
} from 'lucide-react';
import { kayitOl, kurumsalKayitOl } from '../services/api';
import { ILLER, ILCELER } from '../data/turkiyeAdresler';

// ── Arama dropdown (şehir / ilçe seçimi) ────────────────────────
const AramaDropdown = ({ label, value, secenekler, onSec, disabled }) => {
  const [acik, setAcik]   = useState(false);
  const [arama, setArama] = useState('');

  const filtrelenmis = secenekler.filter(s =>
    s.toLowerCase().includes(arama.toLowerCase()),
  );

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setAcik(!acik)}
        className={`w-full flex items-center justify-between pl-10 pr-3.5 py-3 border rounded-xl text-sm text-left transition-all
          ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-100'
            : acik    ? 'border-green-500 ring-2 ring-green-100 text-gray-800'
                      : 'border-gray-200 hover:border-green-300 text-gray-700'
          }`}
      >
        <span className={value ? 'text-gray-800' : 'text-gray-400'}>
          {value || label}
        </span>
        <ChevronDown size={14} className={`text-gray-400 flex-shrink-0 transition-transform ${acik ? 'rotate-180' : ''}`} />
      </button>

      {acik && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5">
              <input
                autoFocus
                type="text"
                value={arama}
                onChange={e => setArama(e.target.value)}
                placeholder={`${label} ara...`}
                className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400"
              />
              {arama && (
                <button type="button" onClick={() => setArama('')}>
                  <X size={11} className="text-gray-400" />
                </button>
              )}
            </div>
          </div>
          <div className="max-h-44 overflow-y-auto">
            {filtrelenmis.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => { onSec(s); setAcik(false); setArama(''); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                  ${value === s
                    ? 'bg-green-50 text-green-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {s}
              </button>
            ))}
            {filtrelenmis.length === 0 && (
              <p className="px-4 py-3 text-sm text-gray-400">Sonuç bulunamadı</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Ortak text input ─────────────────────────────────────────────
const GirisAlani = ({ icon: Icon, label, name, type = 'text', value, onChange, placeholder, autoComplete, sag }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
    <div className="relative">
      <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm placeholder-gray-400
          focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
      />
      {sag}
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════
// BİREYSEL FORM
// ════════════════════════════════════════════════════════════════
const BireyselForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ ad_soyad: '', eposta: '', sifre: '', sifre_tekrar: '' });
  const [goster, setGoster]     = useState({ sifre: false, tekrar: false });
  const [yukleniyor, setYukl]   = useState(false);
  const [hata, setHata]         = useState(null);
  const [basarili, setBasarili] = useState(false);

  const degisti = e => { setForm({ ...form, [e.target.name]: e.target.value }); setHata(null); };

  const gonder = async (e) => {
    e.preventDefault();
    if (!form.ad_soyad || !form.eposta || !form.sifre || !form.sifre_tekrar)
      return setHata('Tüm alanları doldurunuz.');
    if (form.sifre !== form.sifre_tekrar)
      return setHata('Şifreler eşleşmiyor.');
    if (form.sifre.length < 6)
      return setHata('Şifre en az 6 karakter olmalıdır.');
    try {
      setYukl(true); setHata(null);
      await kayitOl({ ad_soyad: form.ad_soyad, eposta: form.eposta, sifre: form.sifre });
      setBasarili(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setHata(err.response?.data?.mesaj || 'Kayıt sırasında bir hata oluştu.');
    } finally {
      setYukl(false);
    }
  };

  return (
    <form onSubmit={gonder} className="space-y-4">
      {basarili && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
          <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
          <p className="text-green-700 text-sm font-medium">Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz…</p>
        </div>
      )}
      {hata && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
          <p className="text-red-700 text-sm">{hata}</p>
        </div>
      )}

      <GirisAlani icon={User}  label="Ad Soyad" name="ad_soyad" value={form.ad_soyad} onChange={degisti} placeholder="Adınız Soyadınız" autoComplete="name" />
      <GirisAlani icon={Mail}  label="E-posta"  name="eposta"   value={form.eposta}   onChange={degisti} placeholder="ornek@email.com"  autoComplete="email" />

      <GirisAlani
        icon={Lock} label="Şifre" name="sifre" type={goster.sifre ? 'text' : 'password'}
        value={form.sifre} onChange={degisti} placeholder="En az 6 karakter" autoComplete="new-password"
        sag={
          <button type="button" onClick={() => setGoster(g => ({ ...g, sifre: !g.sifre }))}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {goster.sifre ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        }
      />

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Şifre Tekrar</label>
        <div className="relative">
          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type={goster.tekrar ? 'text' : 'password'}
            name="sifre_tekrar" value={form.sifre_tekrar} onChange={degisti}
            placeholder="Şifrenizi tekrar girin" autoComplete="new-password"
            className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm placeholder-gray-400
              focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
          />
          <button type="button" onClick={() => setGoster(g => ({ ...g, tekrar: !g.tekrar }))}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {goster.tekrar ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {form.sifre_tekrar && form.sifre !== form.sifre_tekrar && (
          <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle size={11} /> Şifreler eşleşmiyor</p>
        )}
        {form.sifre_tekrar && form.sifre === form.sifre_tekrar && form.sifre.length >= 6 && (
          <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1"><CheckCircle2 size={11} /> Şifreler eşleşiyor</p>
        )}
      </div>

      <button type="submit" disabled={yukleniyor || basarili}
        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed
          text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md mt-2">
        {yukleniyor ? <><Loader2 size={17} className="animate-spin" /> Kayıt Yapılıyor…</> : 'Ücretsiz Kayıt Ol'}
      </button>
    </form>
  );
};

// ════════════════════════════════════════════════════════════════
// KURUMSAL FORM
// ════════════════════════════════════════════════════════════════
const KurumsalForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    dukkan_adi: '', sehir: '', ilce: '', vergi_no: '', yetki_belge_no: '',
    ad_soyad: '', eposta: '', sifre: '', sifre_tekrar: '',
  });
  const [goster, setGoster]     = useState({ sifre: false, tekrar: false });
  const [yukleniyor, setYukl]   = useState(false);
  const [hata, setHata]         = useState(null);
  const [basarili, setBasarili] = useState(false);

  const degisti = e => {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      [name]: value,
      ...(name === 'sehir' ? { ilce: '' } : {}),
    }));
    setHata(null);
  };

  const ilceler = form.sehir ? (ILCELER[form.sehir] || []) : [];

  const gonder = async (e) => {
    e.preventDefault();
    const { dukkan_adi, sehir, ilce, vergi_no, yetki_belge_no, ad_soyad, eposta, sifre, sifre_tekrar } = form;
    if (!dukkan_adi || !sehir || !ilce || !vergi_no || !yetki_belge_no || !ad_soyad || !eposta || !sifre || !sifre_tekrar)
      return setHata('Tüm alanları doldurunuz.');
    if (sifre !== sifre_tekrar)
      return setHata('Şifreler eşleşmiyor.');
    if (sifre.length < 6)
      return setHata('Şifre en az 6 karakter olmalıdır.');
    try {
      setYukl(true); setHata(null);
      await kurumsalKayitOl({ dukkan_adi, sehir, ilce, vergi_no, yetki_belge_no, ad_soyad, eposta, sifre });
      setBasarili(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setHata(err.response?.data?.mesaj || 'Kayıt sırasında bir hata oluştu.');
    } finally {
      setYukl(false);
    }
  };

  const txt = (name) => ({
    name,
    value: form[name],
    onChange: degisti,
  });

  return (
    <form onSubmit={gonder} className="space-y-5">
      {basarili && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
          <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
          <p className="text-green-700 text-sm font-medium">
            Kurumsal hesabınız oluşturuldu! Giriş sayfasına yönlendiriliyorsunuz…
          </p>
        </div>
      )}
      {hata && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
          <p className="text-red-700 text-sm">{hata}</p>
        </div>
      )}

      {/* ── Ofis Bilgileri ─────────────────────────────────────── */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
          Ofis Bilgileri
        </h3>
        <div className="space-y-3">

          {/* Ofis Adı */}
          <GirisAlani icon={Building2} label="Ofis / Firma Adı" placeholder="ABC Gayrimenkul"
            autoComplete="organization" {...txt('dukkan_adi')} />

          {/* Şehir + İlçe yan yana */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Şehir</label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" />
                <AramaDropdown
                  label="Şehir"
                  value={form.sehir}
                  secenekler={ILLER}
                  onSec={v => setForm(f => ({ ...f, sehir: v, ilce: '' }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">İlçe</label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" />
                <AramaDropdown
                  label="İlçe"
                  value={form.ilce}
                  secenekler={ilceler}
                  onSec={v => setForm(f => ({ ...f, ilce: v }))}
                  disabled={!form.sehir}
                />
              </div>
            </div>
          </div>

          {/* Vergi No */}
          <GirisAlani icon={Hash} label="Vergi Numarası" placeholder="1234567890"
            autoComplete="off" {...txt('vergi_no')} />

          {/* Yetki Belge No */}
          <GirisAlani icon={FileText} label="Yetki Belge No" placeholder="YB-2024-XXXXX"
            autoComplete="off" {...txt('yetki_belge_no')} />
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* ── Hesap Bilgileri ────────────────────────────────────── */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
          Yetkili Kişi Bilgileri
        </h3>
        <div className="space-y-3">
          <GirisAlani icon={User} label="Ad Soyad" placeholder="Adınız Soyadınız"
            autoComplete="name" {...txt('ad_soyad')} />
          <GirisAlani icon={Mail} label="E-posta" placeholder="ornek@firma.com"
            autoComplete="email" {...txt('eposta')} />

          <GirisAlani
            icon={Lock} label="Şifre" name="sifre" type={goster.sifre ? 'text' : 'password'}
            value={form.sifre} onChange={degisti} placeholder="En az 6 karakter" autoComplete="new-password"
            sag={
              <button type="button" onClick={() => setGoster(g => ({ ...g, sifre: !g.sifre }))}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {goster.sifre ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Şifre Tekrar</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={goster.tekrar ? 'text' : 'password'}
                name="sifre_tekrar" value={form.sifre_tekrar} onChange={degisti}
                placeholder="Şifrenizi tekrar girin" autoComplete="new-password"
                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm placeholder-gray-400
                  focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
              />
              <button type="button" onClick={() => setGoster(g => ({ ...g, tekrar: !g.tekrar }))}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {goster.tekrar ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {form.sifre_tekrar && form.sifre !== form.sifre_tekrar && (
              <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle size={11} /> Şifreler eşleşmiyor</p>
            )}
            {form.sifre_tekrar && form.sifre === form.sifre_tekrar && form.sifre.length >= 6 && (
              <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1"><CheckCircle2 size={11} /> Şifreler eşleşiyor</p>
            )}
          </div>
        </div>
      </div>

      <button type="submit" disabled={yukleniyor || basarili}
        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed
          text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md">
        {yukleniyor
          ? <><Loader2 size={17} className="animate-spin" /> Hesap Oluşturuluyor…</>
          : <><Building2 size={16} /> Kurumsal Hesap Oluştur</>
        }
      </button>
    </form>
  );
};

// ════════════════════════════════════════════════════════════════
// ANA SAYFA
// ════════════════════════════════════════════════════════════════
const Register = () => {
  const [aktifTab, setAktifTab] = useState('bireysel');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex flex-col">

      {/* Logo */}
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <div className="bg-green-600 text-white p-1.5 rounded-lg">
            <Home size={20} />
          </div>
          <span className="text-xl font-extrabold text-white tracking-tight">
            Emlak<span className="text-green-500">Node</span>
          </span>
        </Link>
      </div>

      {/* Kart */}
      <div className="flex-1 flex items-start justify-center px-4 pb-12 pt-2">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">

          {/* Başlık */}
          <div className="text-center pt-8 pb-4 px-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-2xl mb-4">
              {aktifTab === 'kurumsal'
                ? <Building2 size={26} className="text-green-600" />
                : <User      size={26} className="text-green-600" />
              }
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">Hesap Oluştur</h1>
            <p className="text-gray-400 text-sm mt-1">
              {aktifTab === 'kurumsal'
                ? 'Emlak ofisinizi platforma kaydedin'
                : 'Ücretsiz kayıt ol, ilan ver'
              }
            </p>
          </div>

          {/* Tab seçici */}
          <div className="flex mx-8 mb-6 bg-gray-100 rounded-2xl p-1 gap-1">
            <button
              type="button"
              onClick={() => setAktifTab('bireysel')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                aktifTab === 'bireysel'
                  ? 'bg-white text-green-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <User size={15} /> Bireysel
            </button>
            <button
              type="button"
              onClick={() => setAktifTab('kurumsal')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                aktifTab === 'kurumsal'
                  ? 'bg-white text-green-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Building2 size={15} /> Kurumsal
            </button>
          </div>

          {/* Form alanı */}
          <div className="px-8 pb-8">
            {aktifTab === 'bireysel' ? <BireyselForm /> : <KurumsalForm />}

            {/* Giriş linki */}
            <div className="mt-6 text-center text-sm text-gray-500">
              Zaten hesabın var mı?{' '}
              <Link to="/login" className="text-green-600 font-semibold hover:underline">
                Giriş Yap
              </Link>
            </div>

            {/* Kurumsal tab'da bilgi notu */}
            {aktifTab === 'kurumsal' && (
              <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3.5 text-xs text-blue-700 leading-relaxed">
                <strong>Kurumsal hesap</strong> açtığınızda sistem otomatik olarak emlak ofisinizi kaydeder
                ve sizi <strong>patron</strong> rolüyle ofise atar. Danışman eklemek için giriş yaptıktan
                sonra panelinizi kullanabilirsiniz.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
