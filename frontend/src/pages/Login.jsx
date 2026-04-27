import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { girisYap } from '../services/api';

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm]             = useState({ eposta: '', sifre: '' });
  const [sifreGoster, setSifreGoster] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata]             = useState(null);
  const [basarili, setBasarili]     = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setHata(null); // Yazınca hatayı temizle
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basit doğrulama
    if (!form.eposta || !form.sifre) {
      setHata('E-posta ve şifre alanları zorunludur.');
      return;
    }

    try {
      setYukleniyor(true);
      setHata(null);

      const yanit = await girisYap({ eposta: form.eposta, sifre: form.sifre });

      // Token'ı ve kullanıcı bilgisini localStorage'a kaydet
      localStorage.setItem('token', yanit.data.token);
      localStorage.setItem('kullanici', JSON.stringify(yanit.data.kullanici));

      setBasarili(true);

      // 1.5sn sonra ana sayfaya yönlendir
      setTimeout(() => navigate('/'), 1500);

    } catch (err) {
      const mesaj = err.response?.data?.mesaj || 'Giriş yapılırken bir hata oluştu.';
      setHata(mesaj);
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-green-900 flex flex-col">
      {/* Üst Logo Çubuğu */}
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <div className="bg-green-600 text-white p-1.5 rounded-lg">
            <Home size={20} />
          </div>
          <span className="text-xl font-bold text-white">
            Emlak<span className="text-green-500">Node</span>
          </span>
        </Link>
      </div>

      {/* Login Kartı */}
      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">

          {/* Başlık */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-2xl mb-4">
              <Home size={26} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Tekrar Hoşgeldin</h1>
            <p className="text-gray-500 text-sm mt-1">Hesabına giriş yap ve devam et</p>
          </div>

          {/* Başarı Mesajı */}
          {basarili && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />
              <p className="text-green-700 text-sm font-medium">Giriş başarılı! Ana sayfaya yönlendiriliyorsun...</p>
            </div>
          )}

          {/* Hata Mesajı */}
          {hata && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
              <p className="text-red-700 text-sm">{hata}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* E-posta */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                E-posta Adresi
              </label>
              <div className="relative">
                <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="eposta"
                  value={form.eposta}
                  onChange={handleChange}
                  placeholder="ornek@email.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
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
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={sifreGoster ? 'text' : 'password'}
                  name="sifre"
                  value={form.sifre}
                  onChange={handleChange}
                  placeholder="Şifrenizi girin"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setSifreGoster(!sifreGoster)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {sifreGoster ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Giriş Butonu */}
            <button
              type="submit"
              disabled={yukleniyor || basarili}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg mt-2"
            >
              {yukleniyor
                ? <><Loader2 size={18} className="animate-spin" /> Giriş Yapılıyor...</>
                : 'Giriş Yap'
              }
            </button>
          </form>

          {/* Alt Link */}
          <div className="mt-6 text-center text-sm text-gray-500">
            Hesabın yok mu?{' '}
            <Link to="/kayit" className="text-green-600 font-semibold hover:underline">
              Kayıt Ol
            </Link>
          </div>

          {/* Ayırıcı + Demo Bilgisi */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              Test hesabı:{' '}
              <span className="font-mono font-semibold text-gray-600">ahmet@emlak.com</span>
              {' / '}
              <span className="font-mono font-semibold text-gray-600">Gizli1234</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
