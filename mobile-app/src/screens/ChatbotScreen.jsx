import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
  SafeAreaView, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { aiChatbot, ilanlarGetir } from '../services/api';
import RobotFace from '../components/RobotFace';
import { useTheme } from '../context/ThemeContext';

const GORSEL_FALLBACK = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=60';

const fiyatFormat = (f) => {
  if (!f) return '';
  const n = parseFloat(f);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M ₺`;
  if (n >= 1_000)     return `${Math.round(n / 1_000)}K ₺`;
  return `${n.toLocaleString('tr-TR')} ₺`;
};

const urlToNav = (url) => {
  if (!url) return null;
  if (url.startsWith('/ilan/')) {
    const id = parseInt(url.split('/')[2]);
    if (id) return { screen: 'IlanDetay', params: { id } };
  }
  if (url.startsWith('/ilanlar')) return { screen: 'TumIlanlar', params: {} };
  if (url === '/degerle')          return { screen: 'EmlakDegerleme', params: {} };
  if (url === '/mesajlar')         return { screen: 'Mesajlar', params: {} };
  if (url === '/hesabim')          return { screen: 'Hesabim', params: {} };
  if (url === '/ilanver' || url === '/ilan-ver') return { screen: 'IlanVer', params: {} };
  return null;
};

const ilanlarUrlToParams = (url) => {
  if (!url) return {};
  const qs = url.split('?')[1];
  if (!qs) return {};
  const params = {};
  qs.split('&').forEach(p => {
    const [k, v] = p.split('=');
    if (k && v) params[k] = decodeURIComponent(v);
  });
  return params;
};

const BASLANGIC = {
  rol: 'model',
  metin: 'Merhaba! Ben EmlakAI 🏠\n\nEmlak soruları, uygulama kullanımı veya ilan arama konularında yardımcı olabilirim.\n\nÖrnek: "Samsun kiralık 3+1 ilanları getir" veya "İlan nasıl veririm?"',
};

const HIZLI_SORULAR = [
  { etiket: '🏘️ İlan ara', mesaj: 'İstanbul Kadıköy satılık daire ilanları getir' },
  { etiket: '📝 İlan ver', mesaj: 'Nasıl ilan verebilirim?' },
  { etiket: '💰 Değerleme', mesaj: 'Değerleme nasıl kullanılır?' },
  { etiket: '💬 Mesajlar', mesaj: 'Mesajlarıma nasıl ulaşırım?' },
];

const MiniIlanKarti = ({ ilan, navigation, colors }) => (
  <TouchableOpacity
    style={[s.miniKart, { backgroundColor: colors.card, borderColor: colors.border }]}
    onPress={() => navigation.navigate('IlanDetay', { id: ilan.id })}
    activeOpacity={0.85}
  >
    <Image
      source={{ uri: ilan.gorsel || GORSEL_FALLBACK }}
      style={s.miniGorsel}
      resizeMode="cover"
    />
    <View style={s.miniSag}>
      <Text style={[s.miniBaslik, { color: colors.text }]} numberOfLines={1}>{ilan.baslik}</Text>
      <Text style={s.miniFiyat}>{fiyatFormat(ilan.fiyat)}</Text>
      {(ilan.ilce || ilan.sehir) ? (
        <Text style={[s.miniKonum, { color: colors.textMuted }]} numberOfLines={1}>
          📍 {[ilan.ilce, ilan.sehir].filter(Boolean).join(', ')}
        </Text>
      ) : null}
    </View>
    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
  </TouchableOpacity>
);

export default function ChatbotScreen({ navigation }) {
  const { colors } = useTheme();
  const [mesajlar, setMesajlar] = useState([BASLANGIC]);
  const [input, setInput]       = useState('');
  const [yukleniyor, setYuk]    = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (mesajlar.length > 1) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [mesajlar]);

  const gonder = async (metin = input.trim()) => {
    if (!metin || yukleniyor) return;
    const yeniMesajlar = [...mesajlar, { rol: 'user', metin }];
    setMesajlar(yeniMesajlar);
    setInput('');
    setYuk(true);
    try {
      const gecmis = yeniMesajlar.slice(1).map(m => ({ rol: m.rol, metin: m.metin || '' }));
      const r = await aiChatbot({ mesaj: metin, gecmis });
      const { intent, cevap, filtreler, url, url_baslik } = r.data;

      if (intent === 'ilan_listele' && filtreler) {
        const params = { limit: 100 };
        if (filtreler.sehir)      params.sehir      = filtreler.sehir;
        if (filtreler.ilce)       params.ilce       = filtreler.ilce;
        if (filtreler.tip)        params.tip        = filtreler.tip;
        if (filtreler.emlak_turu) params.emlak_turu = filtreler.emlak_turu;
        if (filtreler.min_fiyat)  params.min_fiyat  = filtreler.min_fiyat;
        if (filtreler.max_fiyat)  params.max_fiyat  = filtreler.max_fiyat;
        if (filtreler.oda_sayisi) params.oda_sayisi = filtreler.oda_sayisi;

        const ilanYanit = await ilanlarGetir(params);
        const tumIlanlar = ilanYanit.data.ilanlar || [];

        const qs = Object.entries(params)
          .filter(([k, v]) => v && k !== 'limit')
          .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
          .join('&');
        const ilanlarUrl = `/ilanlar${qs ? '?' + qs : ''}`;

        setMesajlar(m => [...m, {
          rol: 'model',
          metin: cevap || '',
          ilanlar: tumIlanlar.slice(0, 4),
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

  const renderMesaj = ({ item }) => {
    if (item.rol === 'user') {
      return (
        <View style={[s.mesajRow, s.mesajRowSag]}>
          <View style={s.kullaniciBaloncu}>
            <Text style={s.kullaniciText}>{item.metin}</Text>
          </View>
          <View style={s.userAvatar}>
            <Ionicons name="person" size={13} color="#fff" />
          </View>
        </View>
      );
    }

    return (
      <View style={s.mesajRow}>
        <RobotFace size={28} />
        <View style={s.botIcerik}>
          {item.metin ? (
            <View style={[s.botBaloncuk, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[s.baloncukText, { color: colors.text }]}>{item.metin}</Text>
            </View>
          ) : null}

          {item.url ? (() => {
            const nav = urlToNav(item.url);
            return nav ? (
              <TouchableOpacity
                style={s.navBtn}
                onPress={() => navigation.navigate(nav.screen, nav.params)}
                activeOpacity={0.85}
              >
                <Ionicons name="arrow-forward-circle" size={16} color="#fff" />
                <Text style={s.navBtnText}>{item.url_baslik || 'Sayfaya Git'}</Text>
              </TouchableOpacity>
            ) : null;
          })() : null}

          {item.ilanlar && item.ilanlar.length > 0 ? (
            <View style={s.ilanlarKutu}>
              {item.ilanlar.map(ilan => (
                <MiniIlanKarti key={ilan.id} ilan={ilan} navigation={navigation} colors={colors} />
              ))}
              {item.toplamIlan > item.ilanlar.length ? (
                <TouchableOpacity
                  style={s.tumunuGorBtn}
                  onPress={() => navigation.navigate('TumIlanlar', ilanlarUrlToParams(item.ilanlarUrl))}
                  activeOpacity={0.85}
                >
                  <Ionicons name="search-outline" size={13} color="#2563eb" />
                  <Text style={s.tumunuGorText}>{item.toplamIlan} ilanın tümünü gör</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}

          {item.ilanlar && item.ilanlar.length === 0 ? (
            <Text style={[s.ilanYokText, { color: colors.textMuted }]}>Bu kriterlerde ilan bulunamadı.</Text>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <LinearGradient
        colors={['#1e3a8a', '#1d4ed8', '#2563eb']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={s.header}
      >
        <TouchableOpacity style={s.geriBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <View style={s.headerOrta}>
          <RobotFace size={38} />
          <View>
            <Text style={s.headerBaslik}>EmlakAI</Text>
            <View style={s.onlineRow}>
              <View style={s.onlineDot} />
              <Text style={s.onlineText}>Çevrimiçi · Uygulama yardımı + ilan arama</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={s.geriBtn} onPress={() => { setMesajlar([BASLANGIC]); setInput(''); }}>
          <Ionicons name="refresh-outline" size={20} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={mesajlar}
          style={{ backgroundColor: colors.bg }}
          keyExtractor={(_, i) => String(i)}
          renderItem={renderMesaj}
          contentContainerStyle={s.liste}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            yukleniyor ? (
              <View style={s.mesajRow}>
                <RobotFace size={28} />
                <View style={[s.yaziyorKutu, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={s.noktaRow}>
                    {[0, 1, 2].map(i => <View key={i} style={s.nokta} />)}
                  </View>
                </View>
              </View>
            ) : null
          }
        />

        {mesajlar.length === 1 && !yukleniyor && (
          <View style={[s.hizliRow, { backgroundColor: colors.bg }]}>
            {HIZLI_SORULAR.map(q => (
              <TouchableOpacity key={q.etiket} style={s.hizliChip} onPress={() => gonder(q.mesaj)}>
                <Text style={s.hizliText} numberOfLines={1}>{q.etiket}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={[s.inputBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TextInput
            style={[s.input, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }]}
            value={input}
            onChangeText={setInput}
            placeholder="Mesajınızı yazın…"
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={500}
            onSubmitEditing={() => gonder()}
          />
          <TouchableOpacity
            style={[s.gonderBtn, (!input.trim() || yukleniyor) && { opacity: 0.4 }]}
            onPress={() => gonder()}
            disabled={!input.trim() || yukleniyor}
          >
            {yukleniyor
              ? <ActivityIndicator size={16} color="#fff" />
              : <Ionicons name="send" size={16} color="#fff" />
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, paddingTop: 10, paddingBottom: 12 },
  geriBtn:      { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerOrta:   { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerBaslik: { fontSize: 15, fontWeight: '800', color: '#fff' },
  onlineRow:    { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot:    { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fcd34d' },
  onlineText:   { fontSize: 10, color: 'rgba(255,255,255,0.6)' },

  liste:        { padding: 16, gap: 12, paddingBottom: 8 },

  mesajRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  mesajRowSag:  { flexDirection: 'row-reverse' },

  userAvatar:   { width: 28, height: 28, borderRadius: 14, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },

  kullaniciBaloncu: { maxWidth: '75%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, borderBottomRightRadius: 4, backgroundColor: '#2563eb' },
  kullaniciText:    { fontSize: 14, color: '#fff', lineHeight: 21 },

  botIcerik:    { flex: 1, gap: 8, maxWidth: '85%' },
  botBaloncuk:  { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, borderBottomLeftRadius: 4, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  baloncukText: { fontSize: 14, lineHeight: 21 },

  navBtn:       { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#2563eb', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, alignSelf: 'flex-start' },
  navBtnText:   { fontSize: 13, fontWeight: '700', color: '#fff' },

  ilanlarKutu:  { gap: 8 },
  miniKart:     { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, borderRadius: 12, borderWidth: 1 },
  miniGorsel:   { width: 60, height: 52, borderRadius: 8 },
  miniSag:      { flex: 1 },
  miniBaslik:   { fontSize: 12, fontWeight: '700', lineHeight: 16 },
  miniFiyat:    { fontSize: 12, fontWeight: '800', color: '#f59e0b', marginTop: 2 },
  miniKonum:    { fontSize: 10, marginTop: 2 },

  tumunuGorBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 10, backgroundColor: '#eff6ff' },
  tumunuGorText: { fontSize: 12, fontWeight: '700', color: '#2563eb' },
  ilanYokText:   { fontSize: 12, paddingLeft: 4 },

  yaziyorKutu:  { borderWidth: 1, borderRadius: 18, borderBottomLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 12 },
  noktaRow:     { flexDirection: 'row', gap: 4 },
  nokta:        { width: 8, height: 8, borderRadius: 4, backgroundColor: '#9ca3af', opacity: 0.5 },

  hizliRow:     { paddingHorizontal: 12, paddingBottom: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  hizliChip:    { paddingHorizontal: 12, paddingVertical: 7, backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 20 },
  hizliText:    { fontSize: 12, fontWeight: '600', color: '#2563eb', maxWidth: 160 },

  inputBar:     { flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: 12, borderTopWidth: 1 },
  input:        { flex: 1, fontSize: 14, borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, maxHeight: 100 },
  gonderBtn:    { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center' },
});
