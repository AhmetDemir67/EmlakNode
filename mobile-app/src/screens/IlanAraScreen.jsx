import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, Image, ActivityIndicator, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ilanlarGetir } from '../services/api';

const GORSEL_FALLBACK = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80';
const fiyatFormat = (f) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(f);

const TIP_SECENEKLER = ['Tümü', 'Satılık', 'Kiralık'];
const TUR_SECENEKLER = ['Tümü', 'Daire', 'Villa', 'Arsa', 'İşyeri', 'Müstakil Ev'];

export default function IlanAraScreen({ navigation, route }) {
  const [ilanlar, setIlanlar]       = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [arama, setArama]           = useState(route.params?.arama || '');
  const [secTip, setSecTip]         = useState(route.params?.tip || 'Tümü');
  const [secTur, setSecTur]         = useState('Tümü');

  const getir = useCallback(async () => {
    setYukleniyor(true);
    try {
      const params = { limit: 50 };
      if (arama)            params.arama    = arama;
      if (secTip !== 'Tümü') params.tip     = secTip;
      if (secTur !== 'Tümü') params.emlak_turu = secTur;
      const r = await ilanlarGetir(params);
      setIlanlar(r.data.ilanlar || []);
    } catch {
      setIlanlar([]);
    } finally {
      setYukleniyor(false);
    }
  }, [arama, secTip, secTur]);

  useEffect(() => { getir(); }, [secTip, secTur]);

  const IlanKarti = ({ item }) => (
    <TouchableOpacity
      style={s.kart}
      onPress={() => navigation.navigate('IlanDetay', { id: item.id })}
    >
      <Image source={{ uri: item.gorsel || GORSEL_FALLBACK }} style={s.gorsel} resizeMode="cover" />
      <View style={[s.tipBadge, { backgroundColor: item.tip === 'Kiralık' ? '#3b82f6' : '#16a34a' }]}>
        <Text style={s.tipText}>{item.tip || 'Satılık'}</Text>
      </View>
      <View style={s.bilgi}>
        <Text style={s.fiyat}>{fiyatFormat(item.fiyat)}</Text>
        <Text style={s.baslik} numberOfLines={2}>{item.baslik}</Text>
        <View style={s.konum}>
          <Ionicons name="location-outline" size={12} color="#9ca3af" />
          <Text style={s.konumText}>{[item.ilce, item.sehir].filter(Boolean).join(', ') || '—'}</Text>
        </View>
        <View style={s.ozellikler}>
          {item.oda_sayisi && <View style={s.chip}><Ionicons name="bed-outline" size={11} color="#16a34a" /><Text style={s.chipText}>{item.oda_sayisi}</Text></View>}
          {item.metrekare  && <View style={s.chip}><Ionicons name="resize-outline" size={11} color="#16a34a" /><Text style={s.chipText}>{item.metrekare} m²</Text></View>}
          {item.kat        && <View style={s.chip}><Ionicons name="layers-outline" size={11} color="#16a34a" /><Text style={s.chipText}>{item.kat}. Kat</Text></View>}
        </View>
        {item.dukkan_adi && (
          <View style={s.ofisRow}>
            <Ionicons name="business-outline" size={11} color="#9ca3af" />
            <Text style={s.ofis}>{item.dukkan_adi}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={s.container}>
      {/* Arama kutusu */}
      <View style={s.aramaWrap}>
        <Ionicons name="search-outline" size={18} color="#9ca3af" style={{ marginRight: 8 }} />
        <TextInput
          style={s.aramaInput}
          placeholder="Kelime, il, ilçe, mahalle..."
          placeholderTextColor="#9ca3af"
          value={arama}
          onChangeText={setArama}
          onSubmitEditing={getir}
          returnKeyType="search"
        />
        {arama.length > 0 && (
          <TouchableOpacity onPress={() => { setArama(''); }}>
            <Ionicons name="close-circle" size={18} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {/* Tip filtresi */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {TIP_SECENEKLER.map(t => (
          <TouchableOpacity key={t} onPress={() => setSecTip(t)}
            style={[s.filterBtn, secTip === t && s.filterBtnAktif]}>
            <Text style={[s.filterText, secTip === t && s.filterTextAktif]}>{t}</Text>
          </TouchableOpacity>
        ))}
        <View style={{ width: 1, backgroundColor: '#e5e7eb', marginHorizontal: 4 }} />
        {TUR_SECENEKLER.map(t => (
          <TouchableOpacity key={t} onPress={() => setSecTur(t)}
            style={[s.filterBtn, secTur === t && s.filterBtnAktif]}>
            <Text style={[s.filterText, secTur === t && s.filterTextAktif]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sonuç sayısı */}
      {!yukleniyor && (
        <Text style={s.sonucSayi}>{ilanlar.length} ilan bulundu</Text>
      )}

      {/* Liste */}
      {yukleniyor ? (
        <ActivityIndicator size="large" color="#16a34a" style={{ marginTop: 48 }} />
      ) : (
        <FlatList
          data={ilanlar}
          keyExtractor={i => String(i.id)}
          renderItem={({ item }) => <IlanKarti item={item} />}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          ListEmptyComponent={
            <View style={s.bos}>
              <Ionicons name="search-outline" size={48} color="#d1d5db" />
              <Text style={s.bosText}>Uygun ilan bulunamadı</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#f9fafb' },
  aramaWrap:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 12, borderRadius: 14, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 14, paddingVertical: 10 },
  aramaInput:      { flex: 1, fontSize: 14, color: '#111827' },
  filterScroll:    { maxHeight: 44, marginBottom: 4 },
  filterBtn:       { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb' },
  filterBtnAktif:  { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  filterText:      { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  filterTextAktif: { color: '#fff' },
  sonucSayi:       { fontSize: 12, color: '#9ca3af', paddingHorizontal: 16, paddingBottom: 4 },
  kart:            { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#f3f4f6' },
  gorsel:          { width: '100%', height: 180 },
  tipBadge:        { position: 'absolute', top: 10, left: 10, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tipText:         { color: '#fff', fontSize: 10, fontWeight: '700' },
  bilgi:           { padding: 12 },
  fiyat:           { fontSize: 18, fontWeight: '800', color: '#16a34a' },
  baslik:          { fontSize: 14, fontWeight: '600', color: '#111827', marginTop: 4, lineHeight: 20 },
  konum:           { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  konumText:       { fontSize: 12, color: '#9ca3af' },
  ozellikler:      { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  chip:            { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  chipText:        { fontSize: 11, color: '#166534', fontWeight: '600' },
  ofisRow:         { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  ofis:            { fontSize: 11, color: '#9ca3af' },
  bos:             { alignItems: 'center', paddingTop: 80, gap: 12 },
  bosText:         { fontSize: 15, color: '#9ca3af', fontWeight: '600' },
});
