import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';

const NotFound = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center px-4 text-center">
    <div className="mb-6 select-none">
      <span className="text-[120px] font-black text-white/5 leading-none block">404</span>
      <div className="w-20 h-1 bg-green-600 rounded-full mx-auto -mt-4" />
    </div>

    <div className="bg-green-600 text-white p-3 rounded-2xl mb-5 shadow-lg shadow-green-900/40">
      <Home size={28} />
    </div>

    <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
      Sayfa Bulunamadı
    </h1>
    <p className="text-slate-400 text-sm sm:text-base max-w-sm mb-8">
      Aradığınız sayfa kaldırılmış, taşınmış ya da hiç olmamış olabilir.
    </p>

    <div className="flex flex-col sm:flex-row gap-3">
      <Link
        to="/"
        className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-md"
      >
        <Home size={16} />
        Ana Sayfaya Dön
      </Link>
      <button
        onClick={() => window.history.back()}
        className="flex items-center justify-center gap-2 border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white font-semibold px-6 py-3 rounded-xl transition-colors"
      >
        <ArrowLeft size={16} />
        Geri Git
      </button>
    </div>
  </div>
);

export default NotFound;
