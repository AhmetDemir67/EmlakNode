import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, User } from 'lucide-react';
import { aiChatbot } from '../services/api';

const RobotFace = ({ size = 40 }) => (
  <svg width={size} height={Math.round(size * 1.08)} viewBox="0 0 100 108" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Ana chat baloncuğu */}
    <circle cx="50" cy="47" r="43" fill="#1e3a8a"/>
    {/* Baloncuk kuyruğu */}
    <path d="M18 82 Q8 102 34 94 L36 80 Z" fill="#1e3a8a"/>
    {/* Sol kulak */}
    <circle cx="5" cy="47" r="12" fill="#1e3a8a"/>
    <circle cx="5" cy="47" r="7"  fill="#2563eb"/>
    {/* Sağ kulak */}
    <circle cx="95" cy="47" r="12" fill="#1e3a8a"/>
    <circle cx="95" cy="47" r="7"  fill="#2563eb"/>
    {/* Anten */}
    <line x1="50" y1="4" x2="50" y2="0" stroke="#93c5fd" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="50" cy="0" r="4.5" fill="#fbbf24"/>
    {/* İç yüz */}
    <circle cx="50" cy="50" r="30" fill="#1d4ed8"/>
    {/* Sol göz ^ */}
    <path d="M32 46 Q38 38 44 46" stroke="white" strokeWidth="3.8" strokeLinecap="round" fill="none"/>
    {/* Sağ göz ^ */}
    <path d="M56 46 Q62 38 68 46" stroke="white" strokeWidth="3.8" strokeLinecap="round" fill="none"/>
    {/* Yanaklar */}
    <ellipse cx="36" cy="58" rx="7" ry="4.5" fill="#60a5fa" opacity="0.5"/>
    <ellipse cx="64" cy="58" rx="7" ry="4.5" fill="#60a5fa" opacity="0.5"/>
    {/* Gülümseme */}
    <path d="M38 64 Q50 75 62 64" stroke="white" strokeWidth="3.2" strokeLinecap="round" fill="none"/>
  </svg>
);

const BASlANGIC_MESAJ = {
  rol: 'model',
  metin: 'Merhaba! Ben EmlakAI, yapay zeka destekli emlak danışmanınızım. 🏠\n\nSize emlak satın alma, kiralama, değerleme veya piyasa hakkında yardımcı olabilirim. Nasıl yardımcı olabilirim?',
};

export default function ChatbotWidget() {
  const [acik, setAcik] = useState(false);
  const [mesajlar, setMesajlar] = useState([BASlANGIC_MESAJ]);
  const [input, setInput] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const altRef = useRef(null);

  useEffect(() => {
    altRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mesajlar]);

  const gonder = async () => {
    const metin = input.trim();
    if (!metin || yukleniyor) return;

    const yeniMesajlar = [...mesajlar, { rol: 'user', metin }];
    setMesajlar(yeniMesajlar);
    setInput('');
    setYukleniyor(true);

    try {
      const gecmis = yeniMesajlar.slice(1); // başlangıç mesajını çıkar
      const r = await aiChatbot({ mesaj: metin, gecmis });
      setMesajlar(m => [...m, { rol: 'model', metin: r.data.cevap }]);
    } catch {
      setMesajlar(m => [...m, { rol: 'model', metin: 'Üzgünüm, şu an yanıt veremiyorum. Lütfen biraz sonra tekrar deneyin.' }]);
    } finally {
      setYukleniyor(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      gonder();
    }
  };

  const hizliSorular = [
    'Ev satın alırken nelere dikkat etmeliyim?',
    'Tapu harcı nasıl hesaplanır?',
    'Kira artış oranı nedir?',
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat penceresi */}
      {acik && (
        <div className="w-[360px] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
          style={{ height: '520px' }}>

          {/* Header */}
          <div className="bg-gradient-to-r from-violet-700 via-purple-700 to-blue-700 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <RobotFace size={40} />
              <div>
                <p className="text-white font-bold text-sm">EmlakAI</p>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
                  <p className="text-white/60 text-xs">Çevrimiçi</p>
                </div>
              </div>
            </div>
            <button onClick={() => setAcik(false)} className="text-white/60 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Mesajlar */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {mesajlar.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.rol === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="flex-shrink-0">
                  {m.rol === 'user'
                    ? <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center"><User size={13} className="text-white" /></div>
                    : <RobotFace size={28} />
                  }
                </div>
                <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  m.rol === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-sm'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm shadow-sm'}`}>
                  {m.metin}
                </div>
              </div>
            ))}
            {yukleniyor && (
              <div className="flex gap-2 items-center">
                <RobotFace size={28} />
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
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
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {hizliSorular.map((s) => (
                <button key={s} onClick={() => { setInput(s); }}
                  className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full hover:bg-blue-100 transition-all">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-gray-100 bg-white flex gap-2">
            <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="Mesajınızı yazın…" rows={1}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none transition-all"
              style={{ maxHeight: '80px' }} />
            <button onClick={gonder} disabled={!input.trim() || yukleniyor}
              className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all disabled:opacity-40 flex-shrink-0 self-end">
              {yukleniyor ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </div>
        </div>
      )}

      {/* Toggle butonu */}
      <button onClick={() => setAcik(a => !a)}
        className="w-16 h-16 rounded-2xl shadow-xl flex items-center justify-center hover:scale-105 transition-transform bg-violet-700">
        {acik ? <X size={24} className="text-white" /> : <RobotFace size={52} />}
      </button>
    </div>
  );
}
