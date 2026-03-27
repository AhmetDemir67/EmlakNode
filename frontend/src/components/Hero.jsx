import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';

const Hero = () => {
  const [aktifTab, setAktifTab] = useState('satilik');
  const [aramaMetni, setAramaMetni] = useState('');

  const tabs = [
    { id: 'satilik', label: 'Satılık' },
    { id: 'kiralik', label: 'Kiralık' },
    { id: 'gunluk', label: 'Günlük Kiralık' },
  ];

  const populerSehirler = ['İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa'];

  return (
    <section className="relative min-h-[540px] flex items-center justify-center overflow-hidden">
      {/* Arka Plan Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-orange-900" />

      {/* Overlay Desen */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 text-center">
        {/* Başlık */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 leading-tight">
          Hayalindeki Evi <span className="text-orange-400">Bul</span>
        </h1>
        <p className="text-slate-300 text-lg mb-8">
          Türkiye'nin en büyük emlak platformunda 500.000+ ilan arasından seç
        </p>

        {/* Arama Kutusu */}
        <div className="bg-white rounded-2xl shadow-2xl p-2 max-w-3xl mx-auto">
          {/* Tab'lar */}
          <div className="flex gap-1 mb-2 px-1 pt-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setAktifTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  aktifTab === tab.id
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Arama Satırı */}
          <div className="flex gap-2 p-1">
            <div className="flex-1 flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
              <MapPin size={18} className="text-orange-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Şehir, ilçe veya mahalle ara..."
                value={aramaMetni}
                onChange={(e) => setAramaMetni(e.target.value)}
                className="flex-1 bg-transparent outline-none text-gray-800 text-sm placeholder-gray-400"
              />
            </div>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-colors shadow-md whitespace-nowrap">
              <Search size={18} />
              <span className="hidden sm:inline">Ara</span>
            </button>
          </div>
        </div>

        {/* Popüler Şehirler */}
        <div className="flex items-center justify-center gap-2 mt-5 flex-wrap">
          <span className="text-slate-400 text-sm">Popüler:</span>
          {populerSehirler.map((sehir) => (
            <button
              key={sehir}
              className="text-sm text-slate-200 hover:text-orange-400 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-all border border-white/20"
            >
              {sehir}
            </button>
          ))}
        </div>

        {/* Küçük İstatistikler */}
        <div className="flex justify-center gap-8 mt-10">
          {[
            { sayi: '500K+', label: 'Aktif İlan' },
            { sayi: '81', label: 'İl' },
            { sayi: '12K+', label: 'Emlak Ofisi' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-2xl font-bold text-white">{item.sayi}</div>
              <div className="text-slate-400 text-xs mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
