import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const KATEGORILER = [
  {
    id: 'satilik',
    baslik: 'Satılık',
    alt: 'Konut, İş yeri, Arsa, Depo',
    icon: 'key-outline',
    tip: 'Satılık',
    turler: ['Tümü', 'Daire', 'Villa', 'Müstakil Ev', 'Arsa', 'İşyeri', 'Depo'],
  },
  {
    id: 'kiralik',
    baslik: 'Kiralık',
    alt: 'Konut, İş yeri, Arsa, Depo',
    icon: 'home-outline',
    tip: 'Kiralık',
    turler: ['Tümü', 'Daire', 'Villa', 'Müstakil Ev', 'Arsa', 'İşyeri', 'Depo'],
  },
  {
    id: 'projeler',
    baslik: 'Projeler',
    alt: 'Konut, İş yeri',
    icon: 'business-outline',
    tip: null,
    turler: ['Tümü', 'Daire', 'İşyeri'],
  },
];

export default function IlanAraScreen({ navigation }) {
  const [arama, setArama] = useState('');
  const [acikKategori, setAcikKategori] = useState(null);

  const aramaYap = () => {
    if (arama.trim()) {
      navigation.navigate('TumIlanlar', { arama: arama.trim(), baslik: `"${arama.trim()}"` });
    }
  };

  const kategoriTikla = (katId) => {
    setAcikKategori(prev => (prev === katId ? null : katId));
  };

  const altKategoriTikla = (kat, turAdi) => {
    const params = {};
    if (kat.tip) params.tip = kat.tip;
    if (turAdi !== 'Tümü') params.emlak_turu = turAdi;
    params.baslik = turAdi === 'Tümü'
      ? kat.baslik
      : `${kat.baslik} - ${turAdi}`;
    navigation.navigate('TumIlanlar', params);
  };

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={s.header}>
        <Text style={s.logo}>Emlak<Text style={{ color: '#2563eb' }}>Node</Text></Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Hero */}
      <View style={s.hero}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={s.heroBaslik}>Hayalindeki Evi{'\n'}EmlakNode'le Bul!</Text>
        </View>
        <View style={s.heroBina}>
          <Ionicons name="business" size={72} color="#2563eb" style={{ opacity: 0.18 }} />
        </View>
      </View>

      {/* Arama */}
      <View style={s.aramaWrap}>
        <Ionicons name="search-outline" size={18} color="#2563eb" style={{ marginRight: 10 }} />
        <TextInput
          style={s.aramaInput}
          placeholder="Kelime, ilan no, il, ilçe, mahalle..."
          placeholderTextColor="#9ca3af"
          value={arama}
          onChangeText={setArama}
          onSubmitEditing={aramaYap}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {arama.length > 0 ? (
          <TouchableOpacity onPress={() => setArama('')}>
            <Ionicons name="close-circle" size={18} color="#9ca3af" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Kategori Listesi */}
      <View style={s.kategorilerKutu}>
        {KATEGORILER.map((kat, idx) => (
          <View key={kat.id}>
            <TouchableOpacity
              style={[
                s.kategoriRow,
                idx < KATEGORILER.length - 1 && s.kategoriRowBorder,
              ]}
              onPress={() => kategoriTikla(kat.id)}
              activeOpacity={0.7}
            >
              <View style={s.kategoriIkon}>
                <Ionicons name={kat.icon} size={26} color="#2563eb" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.kategoriBaslik}>{kat.baslik}</Text>
                <Text style={s.kategoriAlt}>{kat.alt}</Text>
              </View>
              <Ionicons
                name={acikKategori === kat.id ? 'chevron-up' : 'chevron-forward'}
                size={18}
                color="#9ca3af"
              />
            </TouchableOpacity>

            {acikKategori === kat.id ? (
              <View style={s.altKatWrap}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.altKatScroll}
                >
                  {kat.turler.map(tur => (
                    <TouchableOpacity
                      key={tur}
                      style={s.altKatChip}
                      onPress={() => altKategoriTikla(kat, tur)}
                    >
                      <Text style={s.altKatChipText}>{tur}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : null}
          </View>
        ))}
      </View>

      {/* EmlakNode Seçimleri */}
      <Text style={s.secimlerBaslik}>EmlakNode Seçimleri</Text>
      <View style={s.secimlerGrid}>
        <TouchableOpacity
          style={s.secimKart}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('TumIlanlar', {
            tip: 'Satılık', fiyat_dustu: true, baslik: 'Fiyatı Düşen Satılıklar',
          })}
        >
          <Text style={s.secimBaslik}>Fiyatı Düşen{'\n'}Satılıklar</Text>
          <Text style={s.secimAlt}>Fiyatı düşen satılıkları gözden geçir.</Text>
          <View style={s.secimIkonWrap}>
            <Ionicons name="trending-down-outline" size={28} color="#2563eb" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.secimKart}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('TumIlanlar', {
            tip: 'Kiralık', fiyat_dustu: true, baslik: 'Fiyatı Düşen Kiralıklar',
          })}
        >
          <Text style={s.secimBaslik}>Fiyatı Düşen{'\n'}Kiralıklar</Text>
          <Text style={s.secimAlt}>Hesabını bilene fiyatı düşen kiralıklar burada.</Text>
          <View style={s.secimIkonWrap}>
            <Ionicons name="trending-down-outline" size={28} color="#3b82f6" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#eff6ff' },
  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, backgroundColor: '#eff6ff' },
  logo:            { fontSize: 22, fontWeight: '900', color: '#111827' },
  hero:            { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20, backgroundColor: '#eff6ff' },
  heroBaslik:      { fontSize: 26, fontWeight: '900', color: '#111827', lineHeight: 34 },
  heroBina:        { width: 80, height: 80, justifyContent: 'center', alignItems: 'center' },
  aramaWrap:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 16, borderRadius: 28, borderWidth: 1.5, borderColor: '#93c5fd', paddingHorizontal: 16, paddingVertical: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  aramaInput:      { flex: 1, fontSize: 14, color: '#111827' },
  kategorilerKutu: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: '#f0f0f0', elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4 },
  kategoriRow:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, gap: 14, backgroundColor: '#fff' },
  kategoriRowBorder: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  kategoriIkon:    { width: 46, height: 46, borderRadius: 12, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
  kategoriBaslik:  { fontSize: 15, fontWeight: '800', color: '#111827' },
  kategoriAlt:     { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  altKatWrap:      { backgroundColor: '#f9fafb', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingVertical: 12 },
  altKatScroll:    { paddingHorizontal: 16, gap: 8 },
  altKatChip:      { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#2563eb' },
  altKatChipText:  { fontSize: 13, fontWeight: '700', color: '#2563eb' },
  secimlerBaslik:  { fontSize: 17, fontWeight: '900', color: '#111827', paddingHorizontal: 20, marginTop: 24, marginBottom: 12 },
  secimlerGrid:    { flexDirection: 'row', paddingHorizontal: 16, gap: 12 },
  secimKart:       { flex: 1, backgroundColor: '#fff', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#f0f0f0', elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, minHeight: 150 },
  secimBaslik:     { fontSize: 15, fontWeight: '900', color: '#111827', lineHeight: 22 },
  secimAlt:        { fontSize: 12, color: '#6b7280', marginTop: 8, lineHeight: 18, flex: 1 },
  secimIkonWrap:   { marginTop: 12 },
});
