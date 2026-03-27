import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, X, Home, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const [menuAcik, setMenuAcik] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="bg-orange-500 text-white p-1.5 rounded-lg">
              <Home size={20} />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Emlak<span className="text-orange-500">Node</span>
            </span>
          </div>

          {/* Desktop Menü */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-gray-600 hover:text-orange-500 font-medium text-sm transition-colors">Kiralık</a>
            <a href="#" className="text-gray-600 hover:text-orange-500 font-medium text-sm transition-colors">Satılık</a>
            <div className="flex items-center gap-1 text-gray-600 hover:text-orange-500 font-medium text-sm cursor-pointer transition-colors">
              Projeler <ChevronDown size={14} />
            </div>
            <a href="#" className="text-gray-600 hover:text-orange-500 font-medium text-sm transition-colors">Değerleme</a>
          </div>

          {/* Sağ Butonlar */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-gray-700 hover:text-orange-500 font-medium text-sm transition-colors px-3 py-2">
              Giriş Yap
            </Link>
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-5 py-2 rounded-lg transition-colors shadow-sm">
              İlan Ver
            </button>
          </div>

          {/* Mobil Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMenuAcik(!menuAcik)}
          >
            {menuAcik ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobil Menü */}
      {menuAcik && (
        <div className="md:hidden px-4 pb-4 bg-white border-t border-gray-100 flex flex-col gap-3 pt-3">
          <a href="#" className="text-gray-700 font-medium py-2 border-b border-gray-50">Kiralık</a>
          <a href="#" className="text-gray-700 font-medium py-2 border-b border-gray-50">Satılık</a>
          <a href="#" className="text-gray-700 font-medium py-2 border-b border-gray-50">Projeler</a>
          <a href="#" className="text-gray-700 font-medium py-2 border-b border-gray-50">Değerleme</a>
          <div className="flex gap-3 pt-2">
            <Link to="/login" className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium text-sm text-center">Giriş Yap</Link>
            <button className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-semibold text-sm">İlan Ver</button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
