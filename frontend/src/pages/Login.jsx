import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home, Mail, Lock, Eye, EyeOff, Loader2,
  AlertCircle, CheckCircle2, User, Building2,
} from 'lucide-react';
import { girisYap } from '../services/api';

const Login = () => {
  const navigate = useNavigate();

  const [aktifTab, setAktifTab]     = useState('bireysel');
  const [form, setForm]             = useState({ eposta: '', sifre: '' });
  const [sifreGoster, setSifreGoster] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata]             = useState(null);
  const [basarili, setBasarili]     = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setHata(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.eposta || !form.sifre) {
      setHata('E-posta ve şifre alanları zorunludur.');
      return;
    }
    try {
      setYukleniyor(true);
      setHata(null);
      const yanit = await girisYap({ eposta: form.eposta, sifre: form.sifre });
      localStorage.setItem('token', yanit.data.token);
      localStorage.setItem('kullanici', JSON.stringify(yanit.data.kullanici));
      setBasarili(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      const mesaj = err.response?.data?.mesaj || 'Giriş yapılırken bir hata oluştu.';
      setHata(mesaj);
    } finally {
      setYukleniyor(false);
    }
  };

  const kurumsal = aktifTab === 'kurumsal';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-green-900 flex flex-col">

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
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

          {/* Başlık */}
          <div className="text-center pt-8 pb-4 px-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-2xl mb-4">
              {kurumsal
                ? <Building2 size={26} className="text-green-600" />
                : <User      size={26} className="text-green-600" />
              }
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              {kurumsal ? 'Kurumsal Giriş' : 'Tekrar Hoşgeldin'}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {kurumsal
                ? 'Emlak ofisi hesabınızla giriş yapın'
                : 'Hesabına giriş yap ve devam et'
              }
            </p>
          </div>

          {/* Tab seçici */}
          <div className="flex mx-8 mb-6 bg-gray-100 rounded-2xl p-1 gap-1">
            <button
              type="button"
              onClick={() => { setAktifTab('bireysel'); setHata(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                !kurumsal
                  ? 'bg-white text-green-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <User size={15} /> Bireysel
            </button>
            <button
              type="button"
              onClick={() => { setAktifTab('kurumsal'); setHata(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                kurumsal
                  ? 'bg-white text-green-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Building2 size={15} /> Kurumsal
            </button>
          </div>

          {/* Form */}
          <div className="px-8 pb-8">

            {/* Kurumsal bilgi notu */}
            {kurumsal && (
              <div className="mb-5 bg-blue-50 border border-blue-100 rounded-xl p-3.5 text-xs text-blue-700 leading-relaxed">
                Emlak ofisi kaydınız sırasında belirlediğiniz{' '}
                <strong>e-posta ve şifrenizle</strong> giriş yapabilirsiniz.
                Patron veya danışman hesabınız için geçerlidir.
              </div>
            )}

            {/* Başarı */}
            {basarili && (
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-5">
                <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
                <p className="text-green-700 text-sm font-medium">
                  Giriş başarılı! Ana sayfaya yönlendiriliyorsun…
                </p>
              </div>
            )}

            {/* Hata */}
            {hata && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
                <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
                <p className="text-red-700 text-sm">{hata}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* E-posta */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {kurumsal ? 'Kurumsal E-posta' : 'E-posta Adresi'}
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="eposta"
                    value={form.eposta}
                    onChange={handleChange}
                    placeholder={kurumsal ? 'ofis@firma.com' : 'ornek@email.com'}
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400
                      focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                  />
                </div>
              </div>

              {/* Şifre */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold text-gray-700">Şifre</label>
                  <button type="button" className="text-xs text-green-600 hover:underline font-medium">
                    Şifremi Unuttum
                  </button>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={sifreGoster ? 'text' : 'password'}
                    name="sifre"
                    value={form.sifre}
                    onChange={handleChange}
                    placeholder="Şifrenizi girin"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400
                      focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setSifreGoster(!sifreGoster)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {sifreGoster ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Giriş Butonu */}
              <button
                type="submit"
                disabled={yukleniyor || basarili}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed
                  text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg mt-2"
              >
                {yukleniyor
                  ? <><Loader2 size={17} className="animate-spin" /> Giriş Yapılıyor…</>
                  : kurumsal
                    ? <><Building2 size={16} /> Kurumsal Giriş Yap</>
                    : 'Giriş Yap'
                }
              </button>
            </form>

            {/* Alt linkler */}
            <div className="mt-6 text-center text-sm text-gray-500">
              Hesabın yok mu?{' '}
              <Link
                to="/kayit"
                state={{ tab: aktifTab }}
                className="text-green-600 font-semibold hover:underline"
              >
                {kurumsal ? 'Kurumsal Kayıt Ol' : 'Kayıt Ol'}
              </Link>
            </div>

            {/* Demo bilgisi */}
            {!kurumsal && (
              <div className="mt-5 pt-5 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400">
                  Test hesabı:{' '}
                  <span className="font-mono font-semibold text-gray-600">ahmet@emlak.com</span>
                  {' / '}
                  <span className="font-mono font-semibold text-gray-600">Gizli1234</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
