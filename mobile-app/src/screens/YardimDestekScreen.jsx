import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Alert, LayoutAnimation,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const SSS = [
  { soru: 'İlan nasıl yayınlarım?', cevap: 'Alt menüdeki "+" butonuna tıklayarak İlan Ver sayfasına gidebilirsiniz. Fotoğraf, açıklama ve fiyat bilgilerini girerek ilanınızı yayına alabilirsiniz.' },
  { soru: 'Bireysel hesapla kaç ilan verebilirim?', cevap: 'Bireysel hesaplar maksimum 3 aktif ilan yayınlayabilir. Daha fazla ilan için kurumsal hesaba geçiş yapabilirsiniz.' },
  { soru: 'Favorilere ekleme nasıl yapılır?', cevap: 'İlan detay sayfasında sağ üstteki kalp ikonuna tıklayarak ilanı favorilerinize ekleyebilirsiniz.' },
  { soru: 'Şifremi unuttum, ne yapmalıyım?', cevap: 'Giriş sayfasından "Şifremi Unuttum" seçeneğini kullanarak e-posta adresinize sıfırlama bağlantısı gönderebilirsiniz.' },
  { soru: 'İlanımı nasıl düzenlerim?', cevap: 'Hesabım > İlanlarım sayfasından ilgili ilanın "Düzenle" butonuna basarak değişiklik yapabilirsiniz.' },
  { soru: 'Mesaj nasıl gönderebilirim?', cevap: 'İlan detay sayfasında "Mesaj Gönder" butonuna tıklayarak ilan sahibiyle iletişime geçebilirsiniz. Mesajlarınızı alt menüdeki Mesajlarım sekmesinden takip edebilirsiniz.' },
  { soru: 'Emlak değerleme nasıl çalışır?', cevap: 'Yapay zeka destekli emlak değerleme aracı, konum ve özellik bilgilerine göre tahmini piyasa değeri hesaplar. Keşfet sayfasındaki "Emlak Değerleme" kartından erişebilirsiniz.' },
];

const SSSItem = ({ soru, cevap, colors }) => {
  const [acik, setAcik] = useState(false);
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAcik(v => !v);
  };
  return (
    <TouchableOpacity
      style={[s.sssItem, { borderBottomColor: colors.border }]}
      onPress={toggle}
      activeOpacity={0.7}
    >
      <View style={s.sssUst}>
        <Text style={[s.sssSoru, { color: colors.text }]}>{soru}</Text>
        <Ionicons name={acik ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
      </View>
      {acik && <Text style={[s.sssCevap, { color: colors.textSecondary }]}>{cevap}</Text>}
    </TouchableOpacity>
  );
};

export default function YardimDestekScreen({ navigation }) {
  const { colors } = useTheme();

  return (
    <View style={[s.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={s.geriBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[s.headerBaslik, { color: colors.text }]}>Yardım & Destek</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* İletişim Kartları */}
        <Text style={[s.grupBaslik, { color: colors.grupBaslik }]}>BİZE ULAŞIN</Text>
        <View style={s.iletisimGrid}>
          <TouchableOpacity
            style={[s.iletisimKart, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Linking.openURL('mailto:destek@emlaknode.com')}
          >
            <View style={[s.iletisimIkon, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="mail" size={24} color="#2563eb" />
            </View>
            <Text style={[s.iletisimBaslik, { color: colors.text }]}>E-posta</Text>
            <Text style={[s.iletisimAlt, { color: colors.textMuted }]}>destek@emlaknode.com</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.iletisimKart, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Linking.openURL('tel:+908501234567')}
          >
            <View style={[s.iletisimIkon, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="call" size={24} color="#16a34a" />
            </View>
            <Text style={[s.iletisimBaslik, { color: colors.text }]}>Telefon</Text>
            <Text style={[s.iletisimAlt, { color: colors.textMuted }]}>0850 123 45 67</Text>
          </TouchableOpacity>
        </View>

        {/* Çalışma Saatleri */}
        <View style={[s.saatKart, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="time-outline" size={18} color="#f59e0b" />
          <View style={{ flex: 1 }}>
            <Text style={[s.saatBaslik, { color: colors.text }]}>Destek Saatleri</Text>
            <Text style={[s.saatAlt, { color: colors.textMuted }]}>Hafta içi 09:00 - 18:00</Text>
          </View>
        </View>

        {/* SSS */}
        <Text style={[s.grupBaslik, { color: colors.grupBaslik }]}>SIK SORULAN SORULAR</Text>
        <View style={[s.sssKutu, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {SSS.map((item, i) => (
            <SSSItem
              key={i}
              soru={item.soru}
              cevap={item.cevap}
              colors={colors}
            />
          ))}
        </View>

        {/* Uygulama Bilgisi */}
        <Text style={[s.grupBaslik, { color: colors.grupBaslik }]}>UYGULAMA</Text>
        <View style={[s.sssKutu, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[s.satirInfo, { borderBottomColor: colors.border }]}>
            <Text style={[s.satirLabel, { color: colors.textSecondary }]}>Sürüm</Text>
            <Text style={[s.satirDeger, { color: colors.text }]}>1.0.0</Text>
          </View>
          <View style={[s.satirInfo, { borderBottomColor: colors.border }]}>
            <Text style={[s.satirLabel, { color: colors.textSecondary }]}>Geliştirici</Text>
            <Text style={[s.satirDeger, { color: colors.text }]}>EmlakNode Ekibi</Text>
          </View>
          <View style={s.satirInfo}>
            <Text style={[s.satirLabel, { color: colors.textSecondary }]}>Platform</Text>
            <Text style={[s.satirDeger, { color: colors.text }]}>iOS & Android</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1 },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    paddingTop: 52, paddingHorizontal: 8, paddingBottom: 12, borderBottomWidth: 1 },
  geriBtn:        { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerBaslik:   { fontSize: 17, fontWeight: '800' },
  grupBaslik:     { fontSize: 11, fontWeight: '700', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8, letterSpacing: 0.8 },
  iletisimGrid:   { flexDirection: 'row', paddingHorizontal: 16, gap: 12 },
  iletisimKart:   { flex: 1, alignItems: 'center', padding: 18, borderRadius: 16, borderWidth: 1, gap: 8 },
  iletisimIkon:   { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  iletisimBaslik: { fontSize: 14, fontWeight: '800' },
  iletisimAlt:    { fontSize: 11, textAlign: 'center' },
  saatKart:       { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, marginTop: 12,
                    padding: 14, borderRadius: 14, borderWidth: 1 },
  saatBaslik:     { fontSize: 14, fontWeight: '700' },
  saatAlt:        { fontSize: 12, marginTop: 1 },
  sssKutu:        { marginHorizontal: 16, borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
  sssItem:        { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  sssUst:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  sssSoru:        { fontSize: 14, fontWeight: '700', flex: 1, lineHeight: 20 },
  sssCevap:       { fontSize: 13, lineHeight: 20, marginTop: 10 },
  satirInfo:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  satirLabel:     { fontSize: 14 },
  satirDeger:     { fontSize: 14, fontWeight: '700' },
});
