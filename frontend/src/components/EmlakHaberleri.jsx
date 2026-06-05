import { ArrowRight, Calendar, Tag } from 'lucide-react';

const HABERLER = [
  {
    id: 1,
    baslik: '2025 Yılında Konut Fiyatları Ne Kadar Artacak?',
    ozet: 'Uzmanlar, büyükşehirlerde konut fiyatlarının bu yıl yüzde 15-20 oranında artış göstereceğini öngörüyor. Piyasa verileri neler söylüyor?',
    tarih: '28 Nisan 2025',
    gorsel: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&q=80',
    kategori: 'Piyasa',
  },
  {
    id: 2,
    baslik: "İstanbul'da En Çok Tercih Edilen İlçeler Açıklandı",
    ozet: "İstanbul'da 2025'in ilk çeyreğinde en fazla satış gerçekleşen ilçeler belli oldu. Beylikdüzü, Esenyurt ve Başakşehir ilk üç sıraya girdi.",
    tarih: '25 Nisan 2025',
    gorsel: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500&q=80',
    kategori: 'İstanbul',
  },
  {
    id: 3,
    baslik: 'Kira Artış Sınırlaması Uzatıldı: Yeni Düzenlemeler',
    ozet: 'Hükümet kira artış oranı sınırlamasını uzatan yeni düzenlemeyi hayata geçirdi. Kiracı ve ev sahiplerini doğrudan ilgilendiren maddeler...',
    tarih: '22 Nisan 2025',
    gorsel: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=500&q=80',
    kategori: 'Mevzuat',
  },
  {
    id: 4,
    baslik: 'Az Bütçeyle Gayrimenkul Yatırımı: Uzman Tavsiyeleri',
    ozet: 'Sınırlı bütçeyle doğru gayrimenkul yatırımı yapmak isteyenler için uzmanlardan pratik öneriler ve en karlı ürün türleri rehberi.',
    tarih: '20 Nisan 2025',
    gorsel: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&q=80',
    kategori: 'Yatırım',
  },
];

const KATEGORI_RENK = {
  Piyasa:   'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  İstanbul: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  Mevzuat:  'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  Yatırım:  'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
};

const HaberKarti = ({ haber }) => (
  <div className="flex bg-white dark:bg-gray-800/80 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700/60 shadow-sm hover:shadow-xl dark:hover:shadow-blue-950/20 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
    <div className="w-36 sm:w-44 flex-shrink-0 overflow-hidden">
      <img
        src={haber.gorsel}
        alt={haber.baslik}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        style={{ minHeight: '130px' }}
      />
    </div>

    <div className="flex flex-col justify-between py-3 px-4 flex-1 min-w-0">
      <div>
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${KATEGORI_RENK[haber.kategori] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
          <Tag size={9} /> {haber.kategori}
        </span>
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-1.5 mb-1 leading-snug line-clamp-2 group-hover:text-blue-700 dark:group-hover:text-amber-400 transition-colors">
          {haber.baslik}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{haber.ozet}</p>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500 mt-2">
        <Calendar size={11} />
        {haber.tarih}
      </div>
    </div>
  </div>
);

const EmlakHaberleri = () => (
  <section className="py-12 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      <div className="flex items-center justify-between mb-7">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
          Emlak <span className="bg-gradient-to-r from-blue-600 to-violet-500 bg-clip-text text-transparent">Haberleri</span>
        </h2>
        <span className="text-gray-300 dark:text-gray-600 text-sm font-semibold flex items-center gap-1 cursor-default select-none">
          Tüm Haberler <ArrowRight size={14} />
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {HABERLER.map(haber => <HaberKarti key={haber.id} haber={haber} />)}
      </div>

    </div>
  </section>
);

export default EmlakHaberleri;
