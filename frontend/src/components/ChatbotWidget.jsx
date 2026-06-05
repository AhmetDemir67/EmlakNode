import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, User, MapPin, ExternalLink, Home, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { aiChatbot, ilanlarGetir } from '../services/api';

const RobotFace = ({ size = 40 }) => (
  <svg width={size} height={Math.round(size * 1.08)} viewBox="0 0 100 108" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="47" r="43" fill="#1e3a8a"/>
    <path d="M18 82 Q8 102 34 94 L36 80 Z" fill="#1e3a8a"/>
    <circle cx="5" cy="47" r="12" fill="#1e3a8a"/>
    <circle cx="5" cy="47" r="7"  fill="#2563eb"/>
    <circle cx="95" cy="47" r="12" fill="#1e3a8a"/>
    <circle cx="95" cy="47" r="7"  fill="#2563eb"/>
    <line x1="50" y1="4" x2="50" y2="0" stroke="#93c5fd" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="50" cy="0" r="4.5" fill="#fbbf24"/>
    <circle cx="50" cy="50" r="30" fill="#1d4ed8"/>
    <path d="M32 46 Q38 38 44 46" stroke="white" strokeWidth="3.8" strokeLinecap="round" fill="none"/>
    <path d="M56 46 Q62 38 68 46" stroke="white" strokeWidth="3.8" strokeLinecap="round" fill="none"/>
    <ellipse cx="36" cy="58" rx="7" ry="4.5" fill="#60a5fa" opacity="0.5"/>
    <ellipse cx="64" cy="58" rx="7" ry="4.5" fill="#60a5fa" opacity="0.5"/>
    <path d="M38 64 Q50 75 62 64" stroke="white" strokeWidth="3.2" strokeLinecap="round" fill="none"/>
  </svg>
);

const GORSEL_FALLBACK = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=60';

const fiyatFormat = (f) => {
  if (!f) return '';
  const n = parseFloat(f);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M ₺`;
  if (n >= 1_000)     return `${Math.round(n / 1_000)}K ₺`;
  return `${n.toLocaleString('tr-TR')} ₺`;
};

// ── Mini İlan Kartı (chatbot içi) ────────────────────────────────
const MiniIlanKarti = ({ ilan, onClick }) => (
  <div
    onClick={onClick}
    className="flex gap-2.5 p-2 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer transition-all group"
  >
    <img
      src={ilan.gorsel || GORSEL_FALLBACK}
      alt={ilan.baslik}
      onError={e => { e.currentTarget.src = GORSEL_FALLBACK; }}
      className="w-16 h-14 object-cover rounded-lg flex-shrink-0"
    />
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold text-gray-800 dark:text-gray-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {ilan.baslik}
      </p>
      <p className="text-[11px] text-amber-500 dark:text-amber-400 font-extrabold mt-0.5">
        {fiyatFormat(ilan.fiyat)}
      </p>
      <p className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-0.5 mt-0.5">
        <MapPin size={9} />
        {[ilan.ilce, ilan.sehir].filter(Boolean).join(', ') || '—'}
      </p>
    </div>
  </div>
);

// ── Mesaj bileşeni ───────────────────────────────────────────────
const Mesaj = ({ m, navigate }) => {
  if (m.rol === 'user') {
    return (
      <div className="flex gap-2 flex-row-reverse">
        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
          <User size={13} className="text-white" />
        </div>
        <div className="max-w-[75%] px-3.5 py-2.5 rounded-2xl rounded-tr-sm text-sm leading-relaxed bg-blue-600 text-white">
          {m.metin}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 flex-row">
      <RobotFace size={28} />
      <div className="max-w-[85%] space-y-2">
        {/* Metin yanıt */}
        {m.metin && (
          <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-sm text-sm leading-relaxed bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 shadow-sm whitespace-pre-wrap">
            {m.metin}
          </div>
        )}

        {/* Sayfa git butonu */}
        {m.url && (
          <button
            onClick={() => navigate(m.url)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
          >
            <ExternalLink size={13} />
            {m.url_baslik || 'Sayfaya Git'}
          </button>
        )}

        {/* İlan listesi */}
        {m.ilanlar && m.ilanlar.length > 0 && (
          <div className="space-y-1.5">
            {m.ilanlar.map(ilan => (
              <MiniIlanKarti
                key={ilan.id}
                ilan={ilan}
                onClick={() => navigate(`/ilan/${ilan.id}`)}
              />
            ))}
            {m.toplamIlan > m.ilanlar.length && (
              <button
                onClick={() => navigate(m.ilanlarUrl)}
                className="w-full text-xs text-blue-600 dark:text-blue-400 font-semibold py-1.5 border border-blue-200 dark:border-blue-700 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center gap-1"
              >
                <Search size={11} /> {m.toplamIlan} ilanın tümünü gör
              </button>
            )}
            {m.ilanlar.length === 0 && (
              <p className="text-xs text-gray-400 px-2">Bu kriterlerde ilan bulunamadı.</p>
            )}
          </div>
        )}
        {m.ilanlar && m.ilanlar.length === 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 px-1">Bu kriterlerde ilan bulunamadı.</p>
        )}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
const BASLANGIC_MESAJ = {
  rol: 'model',
  metin: 'Merhaba! Ben EmlakAI 🏠\n\nEmlak soruları, uygulama kullanımı veya ilan arama konularında yardımcı olabilirim.\n\nÖrnek: "Samsun kiralık 3+1 ilanları getir" veya "İlan nasıl veririm?"',
};

const HIZLI_SORULAR = [
  { etiket: '🏘️ İlan ara', mesaj: 'İstanbul Kadıköy satılık daire ilanları getir' },
  { etiket: '📝 İlan ver', mesaj: 'Nasıl ilan verebilirim?' },
  { etiket: '💰 Değerleme', mesaj: 'Değerleme nasıl kullanılır?' },
  { etiket: '💬 Mesajlar', mesaj: 'Mesajlarıma nasıl ulaşırım?' },
];

export default function ChatbotWidget() {
  const navigate = useNavigate();
  const [acik, setAcik]         = useState(false);
  const [mesajlar, setMesajlar] = useState([BASLANGIC_MESAJ]);
  const [input, setInput]       = useState('');
  const [yukleniyor, setYuk]    = useState(false);
  const altRef = useRef(null);

  useEffect(() => {
    altRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mesajlar]);

  const gonder = async (metin) => {
    const girdi = (metin || input).trim();
    if (!girdi || yukleniyor) return;

    const kullanici = { rol: 'user', metin: girdi };
    const yeniListe = [...mesajlar, kullanici];
    setMesajlar(yeniListe);
    setInput('');
    setYuk(true);

    try {
      const gecmis = yeniListe.slice(1).map(m => ({ rol: m.rol, metin: m.metin || '' }));
      const r = await aiChatbot({ mesaj: girdi, gecmis });
      const { intent, cevap, filtreler, url, url_baslik } = r.data;

      if (intent === 'ilan_listele' && filtreler) {
        // İlanları backend'den çek
        const params = { limit: 5 };
        if (filtreler.sehir)      params.sehir      = filtreler.sehir;
        if (filtreler.ilce)       params.ilce       = filtreler.ilce;
        if (filtreler.tip)        params.tip        = filtreler.tip;
        if (filtreler.emlak_turu) params.emlak_turu = filtreler.emlak_turu;
        if (filtreler.min_fiyat)  params.min_fiyat  = filtreler.min_fiyat;
        if (filtreler.max_fiyat)  params.max_fiyat  = filtreler.max_fiyat;
        if (filtreler.oda_sayisi) params.oda_sayisi = filtreler.oda_sayisi;

        const ilanYanit = await ilanlarGetir({ ...params, limit: 100 });
        const tumIlanlar = ilanYanit.data.ilanlar || [];

        const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([k, v]) => v && k !== 'limit')));
        const ilanlarUrl = `/ilanlar${qs.toString() ? '?' + qs.toString() : ''}`;

        setMesajlar(m => [...m, {
          rol: 'model',
          metin: cevap || '',
          ilanlar: tumIlanlar.slice(0, 4).map(i => ({
            ...i,
            gorsel: i.gorsel || GORSEL_FALLBACK,
          })),
          toplamIlan: tumIlanlar.length,
          ilanlarUrl,
        }]);
      } else if (intent === 'sayfaya_git' && url) {
        setMesajlar(m => [...m, { rol: 'model', metin: cevap || '', url, url_baslik: url_baslik || 'Sayfaya Git' }]);
      } else {
        setMesajlar(m => [...m, { rol: 'model', metin: cevap || 'Üzgünüm, yanıt oluşturulamadı.' }]);
      }
    } catch {
      setMesajlar(m => [...m, { rol: 'model', metin: 'Üzgünüm, şu an yanıt veremiyorum. Lütfen tekrar deneyin.' }]);
    } finally {
      setYuk(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); gonder(); }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {acik && (
        <div className="w-[370px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-gray-700 flex flex-col overflow-hidden"
          style={{ height: '560px' }}>

          {/* Header */}
          <div className="bg-gradient-to-r from-violet-700 via-purple-700 to-blue-700 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <RobotFace size={38} />
              <div>
                <p className="text-white font-bold text-sm">EmlakAI</p>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
                  <p className="text-white/60 text-xs">Çevrimiçi · Uygulama yardımı + ilan arama</p>
                </div>
              </div>
            </div>
            <button onClick={() => setAcik(false)} className="text-white/60 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Mesajlar */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50 dark:bg-gray-950">
            {mesajlar.map((m, i) => (
              <Mesaj key={i} m={m} navigate={navigate} />
            ))}
            {yukleniyor && (
              <div className="flex gap-2 items-center">
                <RobotFace size={28} />
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={altRef} />
          </div>

          {/* Hızlı sorular — sadece başlangıçta */}
          {mesajlar.length === 1 && !yukleniyor && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5 bg-slate-50 dark:bg-gray-950 flex-shrink-0">
              {HIZLI_SORULAR.map(s => (
                <button key={s.etiket}
                  onClick={() => gonder(s.mesaj)}
                  className="text-xs px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all">
                  {s.etiket}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 flex gap-2 flex-shrink-0">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Mesajınızı yazın… (örn: Ankara kiralık daire)"
              rows={1}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:border-blue-500 resize-none transition-all"
              style={{ maxHeight: '80px' }}
            />
            <button
              onClick={() => gonder()}
              disabled={!input.trim() || yukleniyor}
              className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all disabled:opacity-40 flex-shrink-0 self-end"
            >
              {yukleniyor ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </div>
        </div>
      )}

      {/* Toggle butonu */}
      <button
        onClick={() => setAcik(a => !a)}
        className="w-16 h-16 rounded-2xl shadow-xl flex items-center justify-center hover:scale-105 transition-transform bg-violet-700"
      >
        {acik ? <X size={24} className="text-white" /> : <RobotFace size={52} />}
      </button>
    </div>
  );
}
