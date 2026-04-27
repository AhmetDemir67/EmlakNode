import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home, Mail, Lock, Eye, EyeOff, User,
  Loader2, AlertCircle, CheckCircle2,
} from 'lucide-react';
import { kayitOl } from '../services/api';

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({ ad_soyad: '', eposta: '', sifre: '', sifre_tekrar: '' });
  const [sifreGoster, setSifreGoster]         = useState(false);
  const [sifreTekrarGoster, setSifreTekrarGoster] = useState(false);
  const [yukleniyor, setYukleniyor]           = useState(false);
  const [hata, setHata]                       = useState(null);
  const [basarili, setBasarili]               = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setHata(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.ad_soyad || !form.eposta || !form.sifre || !form.sifre_tekrar) {
      setHata('Tüm alanları doldurunuz.');
      return;
    }
    if (form.sifre !== form.sifre_tekrar) {
      setHata('Şifreler eşleşmiyor.');
      return;
    }
    if (form.sifre.length < 6) {
      setHata('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    try {
      setYukleniyor(true);
      setHata(null);
      await kayitOl({ ad_soyad: form.ad_soyad, eposta: form.eposta, sifre: form.sifre });
      setBasarili(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setHata(err.response?.data?.mesaj || 'Kayıt sırasında bir hata oluştu.');
    } finally {
      setYukleniyor(false);
    }
  };

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
      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">

          {/* Başlık */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-2xl mb-4">
              <User size={26} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">Hesap Oluştur</h1>
            <p className="text-gray-400 text-sm mt-1">Ücretsiz kayıt ol, ilan ver</p>
          </div>

          {basarili && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />
              <p className="text-green-700 text-sm font-medium">
                Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz…
              </p>
            </div>
          )}

          {hata && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
              <p className="text-red-700 text-sm">{hata}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Ad Soyad */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ad Soyad</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="ad_soyad"
                  value={form.ad_soyad}
                  onChange={handleChange}
                  placeholder="Adınız Soyadınız"
                  autoComplete="name"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                />
              </div>
            </div>

            {/* E-posta */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">E-posta</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="eposta"
                  value={form.eposta}
                  onChange={handleChange}
                  placeholder="ornek@email.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                />
              </div>
            </div>

            {/* Şifre */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Şifre</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={sifreGoster ? 'text' : 'password'}
                  name="sifre"
                  value={form.sifre}
                  onChange={handleChange}
                  placeholder="En az 6 karakter"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setSifreGoster(!sifreGoster)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {sifreGoster ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Şifre Tekrar */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Şifre Tekrar</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={sifreTekrarGoster ? 'text' : 'password'}
                  name="sifre_tekrar"
                  value={form.sifre_tekrar}
                  onChange={handleChange}
                  placeholder="Şifrenizi tekrar girin"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setSifreTekrarGoster(!sifreTekrarGoster)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {sifreTekrarGoster ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.sifre_tekrar && form.sifre !== form.sifre_tekrar && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle size={11} /> Şifreler eşleşmiyor
                </p>
              )}
              {form.sifre_tekrar && form.sifre === form.sifre_tekrar && form.sifre.length >= 6 && (
                <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                  <CheckCircle2 size={11} /> Şifreler eşleşiyor
                </p>
              )}
            </div>

            {/* Gizlilik notu */}
            <p className="text-xs text-gray-400 leading-relaxed">
              Kayıt olarak{' '}
              <span className="text-green-600 font-medium cursor-pointer hover:underline">Kullanım Şartları</span>
              {' '}ve{' '}
              <span className="text-green-600 font-medium cursor-pointer hover:underline">Gizlilik Politikası</span>
              'nı kabul etmiş olursunuz.
            </p>

            <button
              type="submit"
              disabled={yukleniyor || basarili}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg mt-2"
            >
              {yukleniyor
                ? <><Loader2 size={18} className="animate-spin" /> Kayıt Yapılıyor…</>
                : 'Ücretsiz Kayıt Ol'
              }
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Zaten hesabın var mı?{' '}
            <Link to="/login" className="text-green-600 font-semibold hover:underline">
              Giriş Yap
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
