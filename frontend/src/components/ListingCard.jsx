import { Heart, MapPin, BedDouble, Square, TrendingDown, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const ListingCard = ({ ilan }) => {
  const [begendim, setBegendim] = useState(false);

  const fiyatFormatla = (fiyat) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(fiyat);

  const fiyatDustu = ilan.onceki_fiyat && parseFloat(ilan.onceki_fiyat) > parseFloat(ilan.fiyat);
  const dususPct   = fiyatDustu
    ? Math.round((1 - parseFloat(ilan.fiyat) / parseFloat(ilan.onceki_fiyat)) * 100)
    : 0;
  const yeni = ilan.olusturulma_tarihi
    ? Date.now() - new Date(ilan.olusturulma_tarihi).getTime() < 86400000 * 2
    : false;

  return (
    <Link
      to={`/ilan/${ilan.id}`}
      className="block bg-white dark:bg-gray-800/80 dark:backdrop-blur-sm rounded-2xl overflow-hidden shadow-sm hover:shadow-xl dark:hover:shadow-blue-950/40 transition-all duration-300 border border-gray-100 dark:border-gray-700/60 group cursor-pointer hover:-translate-y-1"
    >
      {/* Görsel */}
      <div className="relative overflow-hidden">
        <img
          src={ilan.gorsel}
          alt={ilan.baslik}
          className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Tip + yeni badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-sm ${
            ilan.tip === 'Satılık'
              ? 'bg-blue-600 text-white'
              : 'bg-violet-600 text-white'
          }`}>
            {ilan.tip}
          </span>
          {yeni && (
            <span className="flex items-center gap-1 bg-amber-400 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              <Sparkles size={10} /> YENİ
            </span>
          )}
        </div>
        {/* Favori butonu */}
        <button
          onClick={(e) => { e.stopPropagation(); setBegendim(!begendim); }}
          className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm p-2 rounded-full shadow-md hover:scale-110 transition-transform border border-white/10"
        >
          <Heart size={16} className={begendim ? 'fill-red-500 text-red-500' : 'text-white/70'} />
        </button>
        {/* Fiyat düştü bandı */}
        {fiyatDustu && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-rose-600 to-rose-500 px-3 py-1.5 flex items-center gap-1.5">
            <TrendingDown size={13} className="text-white flex-shrink-0" />
            <span className="text-white text-xs font-bold">FİYAT DÜŞTÜ %{dususPct}</span>
            <span className="text-rose-200 text-xs ml-auto line-through">{fiyatFormatla(ilan.onceki_fiyat)}</span>
          </div>
        )}
      </div>

      {/* İçerik */}
      <div className="p-4">
        {/* Fiyat */}
        <div className="text-2xl font-black text-amber-500 dark:text-amber-400 mb-1 tracking-tight">
          {fiyatFormatla(ilan.fiyat)}
        </div>

        {/* Başlık */}
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-amber-400 transition-colors">
          {ilan.baslik}
        </h3>

        {/* Konum */}
        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs mb-3">
          <MapPin size={13} className="text-blue-500 flex-shrink-0" />
          <span>{[ilan.ilce, ilan.sehir].filter(Boolean).join(', ') || '—'}</span>
        </div>

        {/* Özellikler */}
        <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-700/60">
          {ilan.oda_sayisi && (
            <>
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300 text-xs">
                <BedDouble size={14} className="text-gray-400 dark:text-gray-500" />
                <span>{ilan.oda_sayisi}</span>
              </div>
              <div className="w-px h-3 bg-gray-200 dark:bg-gray-600" />
            </>
          )}
          {ilan.metrekare && (
            <>
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300 text-xs">
                <Square size={14} className="text-gray-400 dark:text-gray-500" />
                <span>{ilan.metrekare} m²</span>
              </div>
              <div className="w-px h-3 bg-gray-200 dark:bg-gray-600" />
            </>
          )}
          {ilan.emlak_turu && (
            <span className="text-xs bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 font-semibold px-2 py-0.5 rounded-full">
              {ilan.emlak_turu}
            </span>
          )}
        </div>

        {/* Ofis Bilgisi */}
        <div className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-700/50 flex items-center justify-between">
          <span className="text-xs text-gray-400 truncate max-w-[60%]">{ilan.ofis}</span>
          <span className="text-xs text-blue-600 dark:text-amber-400 font-bold group-hover:underline">İncele →</span>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
