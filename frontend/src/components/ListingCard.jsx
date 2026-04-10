import { Heart, MapPin, BedDouble, Square, Building2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const ListingCard = ({ ilan }) => {
  const [begendim, setBegendim] = useState(false);

  const fiyatFormatla = (fiyat) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(fiyat);

  return (
    <Link to={`/ilan/${ilan.id}`} className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group cursor-pointer">
      {/* Görsel */}
      <div className="relative overflow-hidden">
        <img
          src={ilan.gorsel}
          alt={ilan.baslik}
          className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Tip Etiketi */}
        <span className={`absolute top-3 left-3 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm ${
          ilan.tip === 'Satılık'
            ? 'bg-orange-500 text-white'
            : 'bg-blue-500 text-white'
        }`}>
          {ilan.tip}
        </span>
        {/* Favori Butonu */}
        <button
          onClick={(e) => { e.stopPropagation(); setBegendim(!begendim); }}
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:scale-110 transition-transform"
        >
          <Heart
            size={16}
            className={begendim ? 'fill-red-500 text-red-500' : 'text-gray-400'}
          />
        </button>
        {/* Öne Çıkan Etiketi */}
        {ilan.oneCikan && (
          <span className="absolute bottom-3 left-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-full">
            ⭐ Öne Çıkan
          </span>
        )}
      </div>

      {/* İçerik */}
      <div className="p-4">
        {/* Fiyat */}
        <div className="text-2xl font-bold text-orange-500 mb-1">
          {fiyatFormatla(ilan.fiyat)}
        </div>

        {/* Başlık */}
        <h3 className="font-semibold text-gray-800 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-orange-500 transition-colors">
          {ilan.baslik}
        </h3>

        {/* Konum */}
        <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
          <MapPin size={13} className="text-orange-400 flex-shrink-0" />
          <span>{ilan.ilce}, {ilan.sehir}</span>
        </div>

        {/* Özellikler */}
        <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-gray-600 text-xs">
            <BedDouble size={14} className="text-gray-400" />
            <span>{ilan.oda_sayisi}</span>
          </div>
          <div className="w-px h-3 bg-gray-200" />
          <div className="flex items-center gap-1 text-gray-600 text-xs">
            <Square size={14} className="text-gray-400" />
            <span>{ilan.metrekare} m²</span>
          </div>
          <div className="w-px h-3 bg-gray-200" />
          <div className="flex items-center gap-1 text-gray-600 text-xs">
            <Building2 size={14} className="text-gray-400" />
            <span>{ilan.bina_yasi === 0 ? 'Sıfır' : `${ilan.bina_yasi} Yaşında`}</span>
          </div>
        </div>

        {/* Ofis Bilgisi */}
        <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-400">{ilan.ofis}</span>
          <button className="text-xs text-orange-500 font-semibold hover:underline">
            İncele →
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
