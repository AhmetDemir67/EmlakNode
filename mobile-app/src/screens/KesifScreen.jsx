import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Image, FlatList, ActivityIndicator, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ilanlarGetir } from '../services/api';

const { width } = Dimensions.get('window');

const KATEGORILER = [
  { id: 'satilik', baslik: 'Satılık', alt: 'Konut, İşyeri, Arsa...', icon: 'key-outline', tip: 'Satılık' },
  { id: 'kiralik', baslik: 'Kiralık', alt: 'Konut, İşyeri, Arsa...', icon: 'home-outline', tip: 'Kiralık' },
];

const fiyatFormat = (f) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(f);

const GORSEL_FALLBACK = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80';

export default function KesifScreen({ navigation }) {
  const [ilanlar, setIlanlar]       = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [arama, setArama]           = useState('');

  useEffect(() => {
    ilanlarGetir({ limit: 10 })
      .then(r => setIlanlar(r.data.ilanlar || []))
      .catch(() => {})
      .finally(() => setYukleniyor(false));
  }, []);

  const aramaYap = () => {
    if (arama.trim()) navigation.navigate('IlanAra', { arama: arama.trim() });
  };

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerLogo}>Emlak<Text style={{ color: '#16a34a' }}>Node</Text></Text>
          <Text style={s.headerAlt}>Türkiye'nin Güncel Emlak Platformu</Text>
        </View>
        <Ionicons name="notifications-outline" size={24} color="#374151" />
      </View>

      {/* Arama */}
      <View style={s.aramaWrap}>
        <Ionicons name="search-outline" size={18} color="#9ca3af" style={{ marginRight: 8 }} />
        <TextInput
          style={s.aramaInput}
          placeholder="Kelime, il, ilçe, mahalle..."
          placeholderTextColor="#9ca3af"
          value={arama}
          onChangeText={setArama}
          onSubmitEditing={aramaYap}
          returnKeyType="search"
        />
        {arama.length > 0 && (
          <TouchableOpacity onPress={() => setArama('')}>
            <Ionicons name="close-circle" size={18} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {/* Kategoriler */}
      <View style={s.kategorilerWrap}>
        {KATEGORILER.map(k => (
          <TouchableOpacity
            key={k.id}
            style={s.kategoriKart}
            onPress={() => navigation.navigate('IlanAra', { tip: k.tip })}
          >
            <View style={s.kategoriIkon}>
              <Ionicons name={k.icon} size={28} color="#16a34a" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.kategoriBas}>{k.baslik}</Text>
              <Text style={s.kategoriAlt}>{k.alt}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Son İlanlar */}
      <View style={s.bolumHeader}>
        <Text style={s.bolumBaslik}>Son İlanlar</Text>
        <TouchableOpacity onPress={() => navigation.navigate('IlanAra', {})}>
          <Text style={s.tumunuGor}>Tümünü Gör</Text>
        </TouchableOpacity>
      </View>

      {yukleniyor ? (
        <ActivityIndicator size="large" color="#16a34a" style={{ marginTop: 32 }} />
      ) : (
        <View style={s.ilanlarGrid}>
          {ilanlar.map(ilan => (
            <TouchableOpacity
              key={ilan.id}
              style={s.ilanKart}
              onPress={() => navigation.navigate('IlanDetay', { id: ilan.id })}
            >
              <Image
                source={{ uri: ilan.gorsel || GORSEL_FALLBACK }}
                style={s.ilanGorsel}
                resizeMode="cover"
              />
              <View style={[s.tipBadge, { backgroundColor: ilan.tip === 'Kiralık' ? '#3b82f6' : '#16a34a' }]}>
                <Text style={s.tipText}>{ilan.tip || 'Satılık'}</Text>
              </View>
              <View style={s.ilanBilgi}>
                <Text style={s.ilanFiyat}>{fiyatFormat(ilan.fiyat)}</Text>
                <Text style={s.ilanBaslik} numberOfLines={1}>{ilan.baslik}</Text>
                <View style={s.ilanKonumRow}>
                  <Ionicons name="location-outline" size={11} color="#9ca3af" />
                  <Text style={s.ilanKonum} numberOfLines={1}>
                    {[ilan.ilce, ilan.sehir].filter(Boolean).join(', ') || '—'}
                  </Text>
                </View>
                <View style={s.ilanOzellikler}>
                  {ilan.oda_sayisi  && <Text style={s.chip}>{ilan.oda_sayisi}</Text>}
                  {ilan.metrekare   && <Text style={s.chip}>{ilan.metrekare} m²</Text>}
                  {ilan.emlak_turu  && <Text style={s.chip}>{ilan.emlak_turu}</Text>}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#f9fafb' },
  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, backgroundColor: '#fff' },
  headerLogo:      { fontSize: 22, fontWeight: '900', color: '#111827' },
  headerAlt:       { fontSize: 11, color: '#9ca3af', marginTop: 1 },
  aramaWrap:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 14, paddingVertical: 10 },
  aramaInput:      { flex: 1, fontSize: 14, color: '#111827' },
  kategorilerWrap: { marginHorizontal: 16, gap: 10 },
  kategoriKart:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#f3f4f6', gap: 12 },
  kategoriIkon:    { width: 48, height: 48, backgroundColor: '#f0fdf4', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  kategoriBas:     { fontSize: 15, fontWeight: '700', color: '#111827' },
  kategoriAlt:     { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  bolumHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 20, marginBottom: 10 },
  bolumBaslik:     { fontSize: 16, fontWeight: '800', color: '#111827' },
  tumunuGor:       { fontSize: 13, fontWeight: '600', color: '#16a34a' },
  ilanlarGrid:     { paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  ilanKart:        { width: (width - 44) / 2, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#f3f4f6' },
  ilanGorsel:      { width: '100%', height: 120 },
  tipBadge:        { position: 'absolute', top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tipText:         { color: '#fff', fontSize: 10, fontWeight: '700' },
  ilanBilgi:       { padding: 10 },
  ilanFiyat:       { fontSize: 14, fontWeight: '800', color: '#16a34a' },
  ilanBaslik:      { fontSize: 12, fontWeight: '600', color: '#111827', marginTop: 2 },
  ilanKonumRow:    { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  ilanKonum:       { fontSize: 11, color: '#9ca3af', flex: 1 },
  ilanOzellikler:  { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  chip:            { fontSize: 10, backgroundColor: '#f3f4f6', color: '#6b7280', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, fontWeight: '600' },
});
