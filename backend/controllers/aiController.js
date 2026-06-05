'use strict';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const aciklamaUret = async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(503).json({ basarili: false, mesaj: 'AI servisi yapılandırılmamış. .env dosyasına GEMINI_API_KEY ekleyin.' });
  }

  const {
    tip, emlak_turu, baslik, metrekare, oda_sayisi, kat, toplam_kat,
    bina_yasi, isinma_tipi, banyo_sayisi, sehir, ilce, mahalle,
    balkon, asansor, otopark, esyali, site_icerisinde, krediye_uygunluk,
  } = req.body;

  const ozellikler = [
    balkon          && 'Balkon',
    asansor         && 'Asansör',
    otopark         && 'Otopark',
    esyali          && 'Eşyalı',
    site_icerisinde && 'Site içinde',
    krediye_uygunluk && 'Krediye uygun',
  ].filter(Boolean).join(', ');

  const konum = [mahalle, ilce, sehir].filter(Boolean).join(', ') || 'Belirtilmemiş';

  const prompt = `Sen profesyonel bir Türk emlak danışmanısın. Aşağıdaki bilgilere göre Türkçe, akıcı, çekici ve satış odaklı bir ilan açıklaması yaz. 3-4 paragraf olsun, abartısız ama ikna edici olsun.

İlan Bilgileri:
- Tip: ${tip || 'Satılık'}
- Emlak Türü: ${emlak_turu || 'Daire'}
- Başlık: ${baslik || ''}
- Konum: ${konum}
- Metrekare: ${metrekare ? metrekare + ' m²' : 'Belirtilmemiş'}
- Oda Sayısı: ${oda_sayisi || 'Belirtilmemiş'}
- Kat: ${kat != null ? kat + '. kat / ' + (toplam_kat || '?') + ' katlı bina' : 'Belirtilmemiş'}
- Bina Yaşı: ${bina_yasi != null ? (bina_yasi === 0 ? 'Sıfır bina' : bina_yasi + ' yıl') : 'Belirtilmemiş'}
- Isıtma: ${isinma_tipi || 'Belirtilmemiş'}
- Banyo: ${banyo_sayisi ? banyo_sayisi + ' banyo' : 'Belirtilmemiş'}
- Özellikler: ${ozellikler || 'Belirtilmemiş'}

KONUM BAĞLAMI: Konum "${konum}" olan bu bölge için açıklamaya şunları dahil et:
- Mahallenin/ilçenin genel karakteri ve yaşam kalitesi
- Yakın çevredeki ulaşım olanakları (metro, metrobüs, otobüs, ana yollar)
- Çevresindeki önemli noktalar (okullar, hastaneler, AVM, park, sahil, orman vb.)
- Bölgenin gelişim durumu ve yatırım değeri
Bilmediğin detayları uydurmadan genel bölge bilgisiyle yaz.

Sadece ilan açıklaması metnini yaz. Başlık, madde işareti veya ekstra açıklama ekleme.`;

  try {
    const yanit = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.75, maxOutputTokens: 8192 },
      }),
    });

    if (!yanit.ok) {
      const hata = await yanit.json();
      console.error('Gemini API hatası:', hata);
      return res.status(502).json({ basarili: false, mesaj: 'AI servisi hata verdi.', detay: hata?.error?.message });
    }

    const veri    = await yanit.json();
    const aciklama = veri.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    if (!aciklama) {
      return res.status(502).json({ basarili: false, mesaj: 'AI boş yanıt döndürdü.' });
    }

    res.json({ basarili: true, aciklama });
  } catch (hata) {
    console.error('AI controller hata:', hata.message);
    res.status(500).json({ basarili: false, mesaj: 'AI açıklama üretilemedi.' });
  }
};

// ----------------------------------------------------------------
// Mülk Değerleme
// ----------------------------------------------------------------
const mulkDegerle = async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(503).json({ basarili: false, mesaj: 'AI servisi yapılandırılmamış.' });
  }

  const { tip, emlak_turu, sehir, ilce, mahalle, metrekare, oda_sayisi, kat, bina_yasi, balkon, asansor, otopark, esyali, site_icerisinde, referans_nokta } = req.body;

  const ozellikler = [
    balkon && 'Balkon', asansor && 'Asansör', otopark && 'Otopark',
    esyali && 'Eşyalı', site_icerisinde && 'Site içinde',
  ].filter(Boolean).join(', ');

  const konumDegerleme = [mahalle, ilce, sehir].filter(Boolean).join(', ') || 'Belirtilmemiş';

  const referansBlok = referans_nokta
    ? `\nREFERANS NOKTA ANALİZİ:
Kullanıcının referans noktası: "${referans_nokta}"
- "${konumDegerleme}" konumundan "${referans_nokta}" noktasına tahmini mesafeyi ve ulaşım süresini belirt (km ve dakika)
- Toplu taşıma ile mi yoksa araçla mı daha pratik?
- Bu yakınlık/uzaklık mülkün değerini nasıl etkiliyor?
Bu bilgiyi "referansUzakligi" alanına yaz.`
    : '';

  const referansJsonAlani = referans_nokta
    ? ',\n  "referansUzakligi": "Yaklaşık X km, araçla Y dk / toplu taşımayla Z dk"'
    : '';

  const prompt = `Sen Türkiye emlak piyasasında uzman bir değerleme uzmanısın. Aşağıdaki mülk bilgileri için gerçekçi bir piyasa değeri tahmini yap.

Mülk Bilgileri:
- İşlem Tipi: ${tip || 'Satılık'}
- Emlak Türü: ${emlak_turu || 'Daire'}
- Konum: ${konumDegerleme}
- Metrekare: ${metrekare ? metrekare + ' m²' : 'Belirtilmemiş'}
- Oda Sayısı: ${oda_sayisi || 'Belirtilmemiş'}
- Kat: ${kat != null ? kat + '. kat' : 'Belirtilmemiş'}
- Bina Yaşı: ${bina_yasi != null ? (bina_yasi === 0 ? 'Sıfır' : bina_yasi + ' yıl') : 'Belirtilmemiş'}
- Özellikler: ${ozellikler || 'Yok'}

KONUM ANALİZİ İÇİN DİKKAT ET:
"${konumDegerleme}" bölgesinin şu faktörlerini fiyatlamaya yansıt:
- Ulaşım erişimi (metro/metrobüs/otoyol yakınlığı fiyatı artırır)
- Çevresindeki okullar, hastaneler, AVM, yeşil alan varlığı
- Bölgenin sosyoekonomik profili (üst/orta/alt gelir bölgesi)
- Kentsel dönüşüm veya yatırım potansiyeli
- Sahil, orman, tarihi merkez gibi coğrafi avantajlar
Bu faktörleri gerçekçi biçimde değerlendirerek fiyat aralığını belirle.
${referansBlok}
Yanıtını SADECE aşağıdaki JSON formatında ver, başka hiçbir şey yazma:
{
  "minFiyat": 2500000,
  "maxFiyat": 3200000,
  "tahminiOrtalama": 2850000,
  "m2Fiyat": 23750,
  "piyasaDurumu": "Alıcı pazarı / Satıcı pazarı / Dengeli pazar",
  "fiyatTrendi": "Yükseliyor / Sabit / Düşüyor",
  "ozet": "Bu bölgenin özelliklerini ve fiyatı etkileyen faktörleri açıklayan 2-3 cümle",
  "tavsiye": "Bu konuma özel alıcı veya satıcıya 1 cümle tavsiye"${referansJsonAlani}
}`;

  try {
    const yanit = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 8192 },
      }),
    });

    if (!yanit.ok) {
      const hata = await yanit.json();
      return res.status(502).json({ basarili: false, mesaj: 'AI servisi hata verdi.', detay: hata?.error?.message });
    }

    const veri = await yanit.json();
    let metin = veri.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    // Markdown kod bloğunu temizle
    metin = metin.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

    // Sadece JSON kısmını bul ({...} bloğu)
    const jsonBaslangic = metin.indexOf('{');
    const jsonBitis     = metin.lastIndexOf('}');
    if (jsonBaslangic === -1 || jsonBitis === -1) {
      console.error('JSON bulunamadı, gelen metin:', metin);
      return res.status(502).json({ basarili: false, mesaj: 'AI geçerli bir değerleme döndürmedi.' });
    }
    metin = metin.slice(jsonBaslangic, jsonBitis + 1);

    const sonuc = JSON.parse(metin);
    res.json({ basarili: true, degerleme: sonuc });
  } catch (hata) {
    console.error('Değerleme controller hata:', hata.message);
    res.status(500).json({ basarili: false, mesaj: 'Değerleme yapılamadı.' });
  }
};

// ----------------------------------------------------------------
// Chatbot
// ----------------------------------------------------------------
const chatbot = async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(503).json({ basarili: false, mesaj: 'AI servisi yapılandırılmamış.' });
  }

  const { mesaj, gecmis = [] } = req.body;
  if (!mesaj) return res.status(400).json({ basarili: false, mesaj: 'Mesaj boş olamaz.' });

  const sistemPrompt = `Sen EmlakAI adında EmlakNode platformunun yapay zeka asistanısın.

EMLAKNode UYGULAMA SAYFALARIM:
- Ana Sayfa (/): Arama çubuğu, öne çıkan ilanlar
- İlanlar (/ilanlar): Tüm ilanlar, filtre paneli (şehir, ilçe, tip, fiyat, oda), harita görünümü
- İlan Detay (/ilan/:id): Galeri, özellikler, AI ulaşım analizi, mesajlaşma
- Değerleme (/degerleme): AI ile mülk değerleme — mülk bilgisi gir, fiyat tahmini al
- Panel (/panel): Kullanıcı paneli — sekmeler: yeni (ilan ver), ilanlar, mesajlar, bildirimler, favoriler, aramalar, uyelik
- Giriş (/login) | Kayıt (/kayit)

UYGULAMA YARDIM ÖRNEKLERİ:
- "İlan nasıl veririm?" → /panel?sekme=yeni
- "İlanlarımı nerede görürüm?" → /panel?sekme=ilanlar
- "Mesajlarım nerede?" → /panel?sekme=mesajlar
- "Favorilerime nasıl bakarım?" → /panel?sekme=favoriler
- "Kayıtlı aramalarım?" → /panel?sekme=aramalar
- "Değerleme nedir?" → /degerleme
- "Profil/üyelik bilgileri?" → /panel?sekme=uyelik
- "Haritada ara?" → /ilanlar (sağ üst Harita butonuna tıkla)

YANIT FORMAT — SADECE GEÇERLİ JSON DÖNDÜR, başka hiçbir şey yazma:
{
  "intent": "normal" | "ilan_listele" | "sayfaya_git",
  "cevap": "Türkçe kısa yanıt (max 4 cümle)",
  "filtreler": { "sehir": "", "ilce": "", "tip": "", "emlak_turu": "", "min_fiyat": "", "max_fiyat": "", "oda_sayisi": "" },
  "url": "",
  "url_baslik": ""
}

KURALLAR:
- intent=ilan_listele: kullanıcı ilan aramak/listelemek istiyorsa → filtreler doldur (boş bırakma)
- intent=sayfaya_git: kullanıcı bir sayfaya gitmek veya bir özelliği kullanmak istiyorsa → url ve url_baslik doldur
- intent=normal: genel emlak sorusu veya bilgi → sadece cevap doldur
- filtreler.tip sadece "Satılık" veya "Kiralık" olabilir
- Emlak dışı konularda: "Ben emlak ve EmlakNode konusunda yardımcı olabilirim" de`;

  const contents = [
    ...gecmis.map(m => ({ role: m.rol, parts: [{ text: m.metin }] })),
    { role: 'user', parts: [{ text: mesaj }] },
  ];

  try {
    const yanit = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: sistemPrompt }] },
        contents,
        generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
      }),
    });

    if (!yanit.ok) {
      return res.status(502).json({ basarili: false, mesaj: 'AI servisi hata verdi.' });
    }

    const veri = await yanit.json();
    let metin = veri.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    metin = metin.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    const start = metin.indexOf('{');
    const end   = metin.lastIndexOf('}');

    let sonuc;
    try {
      sonuc = JSON.parse(metin.slice(start, end + 1));
    } catch {
      sonuc = { intent: 'normal', cevap: metin || 'Üzgünüm, yanıt oluşturulamadı.' };
    }

    res.json({ basarili: true, ...sonuc });
  } catch (hata) {
    console.error('Chatbot controller hata:', hata.message);
    res.status(500).json({ basarili: false, mesaj: 'Chatbot yanıt veremedi.' });
  }
};

// ----------------------------------------------------------------
// Ulaşım Analizi
// ----------------------------------------------------------------
const ulasimAnalizi = async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(503).json({ basarili: false, mesaj: 'AI servisi yapılandırılmamış.' });
  }

  const { sehir, ilce, mahalle } = req.body;
  if (!sehir) return res.status(400).json({ basarili: false, mesaj: 'Şehir bilgisi gerekli.' });

  const konum = [mahalle, ilce, sehir].filter(Boolean).join(', ');

  const prompt = `Sen Türkiye ulaşım altyapısını iyi bilen bir emlak danışmanısın. "${konum}" konumundaki bir mülk için ulaşım bilgilerini analiz et.

Bu bölge için şunları belirle:
- En yakın metro/metrobüs/tramvay istasyonları ve yürüyüş mesafesi/süresi
- Yakın çevredeki otobüs/dolmuş hatları ve durak uzaklığı
- Önemli noktalara (havalimanı, şehir merkezi, E-5/TEM gibi ana yollar) araç ile tahmini süre
- Bölgeye özel ulaşım avantajları veya dezavantajları

Yanıtını SADECE aşağıdaki JSON formatında ver, başka hiçbir şey yazma:
{
  "metro": "En yakın metro/metrobüs/tramvay bilgisi veya null",
  "otobus": "Otobüs/dolmuş hat ve durak bilgisi",
  "araba": "Araçla önemli noktalara süreler",
  "yuruyus": "Yürüyerek ulaşılabilir önemli noktalar",
  "ozet": "Bölgenin ulaşım açısından 1-2 cümle özeti",
  "puan": 8
}
Not: "puan" 1-10 arası ulaşım kolaylığı puanı (10 = mükemmel erişim).`;

  try {
    const yanit = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 8192 },
      }),
    });

    if (!yanit.ok) {
      const hata = await yanit.json();
      return res.status(502).json({ basarili: false, mesaj: 'AI servisi hata verdi.', detay: hata?.error?.message });
    }

    const veri = await yanit.json();
    let metin = veri.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    metin = metin.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    const jsonBaslangic = metin.indexOf('{');
    const jsonBitis     = metin.lastIndexOf('}');
    if (jsonBaslangic === -1 || jsonBitis === -1) {
      return res.status(502).json({ basarili: false, mesaj: 'AI geçerli bir yanıt döndürmedi.' });
    }
    metin = metin.slice(jsonBaslangic, jsonBitis + 1);

    const sonuc = JSON.parse(metin);
    res.json({ basarili: true, ulasim: sonuc });
  } catch (hata) {
    console.error('Ulaşım analizi controller hata:', hata.message);
    res.status(500).json({ basarili: false, mesaj: 'Ulaşım analizi yapılamadı.' });
  }
};

module.exports = { aciklamaUret, mulkDegerle, chatbot, ulasimAnalizi };
