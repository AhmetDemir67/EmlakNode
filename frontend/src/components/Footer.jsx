import { Home, Phone, Mail, MapPin, Globe, MessageCircle, Send, Video } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-gray-900 text-gray-300 mt-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b border-gray-800">

        {/* Marka */}
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Home size={18} className="text-white" />
            </div>
            <span className="text-white text-xl font-black">
              Emlak<span className="text-blue-400">Node</span>
            </span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed mb-5">
            Türkiye'nin yükselen emlak platformu. Satılık ve kiralık ilanlar, güvenilir danışmanlar.
          </p>
          <div className="flex items-center gap-2.5">
            {[Globe, MessageCircle, Send, Video].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-8 h-8 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <Icon size={15} className="text-gray-300" />
              </a>
            ))}
          </div>
        </div>

        {/* Hızlı Erişim */}
        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Hızlı Erişim</h4>
          <ul className="space-y-2.5">
            {[
              { label: 'Satılık İlanlar', to: '/?tip=Sat%C4%B1l%C4%B1k' },
              { label: 'Kiralık İlanlar', to: '/?tip=Kiral%C4%B1k' },
              { label: 'Tüm İlanlar',     to: '/ilanlar' },
              { label: 'Giriş Yap',       to: '/login' },
              { label: 'Kayıt Ol',        to: '/kayit' },
            ].map(l => (
              <li key={l.label}>
                <Link to={l.to} className="text-sm text-gray-400 hover:text-blue-400 transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Kategoriler */}
        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Kategoriler</h4>
          <ul className="space-y-2.5">
            {['Daire', 'Villa', 'Arsa', 'İşyeri', 'Bina', 'Depo'].map(k => (
              <li key={k}>
                <Link
                  to={`/?emlak_turu=${encodeURIComponent(k)}`}
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
                >
                  {k}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* İletişim */}
        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">İletişim</h4>
          <ul className="space-y-3.5">
            <li className="flex items-start gap-3 text-sm text-gray-400">
              <MapPin size={15} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <span>Merkez Mah. Dijital Sk. No:1<br />İstanbul, Türkiye</span>
            </li>
            <li className="flex items-center gap-3 text-sm text-gray-400">
              <Phone size={15} className="text-blue-400 flex-shrink-0" />
              <span>+90 555 123 45 67</span>
            </li>
            <li className="flex items-center gap-3 text-sm text-gray-400">
              <Mail size={15} className="text-blue-400 flex-shrink-0" />
              <span>info@emlaknode.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Alt Bar */}
      <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-gray-500">© 2024 EmlakNode. Tüm hakları saklıdır.</p>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <a href="#" className="hover:text-blue-400 transition-colors">Gizlilik Politikası</a>
          <span>·</span>
          <a href="#" className="hover:text-blue-400 transition-colors">Kullanım Koşulları</a>
          <span>·</span>
          <a href="#" className="hover:text-blue-400 transition-colors">KVKK</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
