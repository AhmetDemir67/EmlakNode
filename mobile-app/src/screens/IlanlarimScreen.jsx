import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Image, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { kullaniciilanlarim } from '../services/api';

const GORSEL_FALLBACK = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80';
const fiyatFormat = (f) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(f);

export default function IlanlarimScreen({ navigation }) {
  const [ilanlar, setIlanlar]   = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kullanici, setKullanici]   = useState(null);

  useFocusEffect(
    useCallback(() => {
      const yukle = async () => {
        setYukleniyor(true);
        try {
          const v = await AsyncStorage.getItem('kullanici');
          if (!v) { setKullanici(null); setYukleniyor(false); return; }
          const k = JSON.parse(v);
          setKullanici(k);
          const r = await kullaniciilanlarim(k.id);
          setIlanlar(r.data.ilanlar || []);
        } catch {
          setIlanlar([]);
        } finally {
          setYukleniyor(false);
        }
      };
      yukle();
    }, [])
  );

  if (!kullanici) {
    return (
      <View style={s.merkez}>
        <Ionicons name="lock-closed-outline" size={56} color="#d1d5db" />
        <Text style={s.bosBaslik}>Giriş Yapmanız Gerekiyor</Text>
        <TouchableOpacity style={s.btn} onPress={() => navigation.navigate('Giris')}>
          <Text style={s.btnText}>Giriş Yap</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (yukleniyor) {
    return (
      <View style={s.merkez}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <FlatList
        data={ilanlar}
        keyExtractor={i => String(i.id)}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={
          <View style={s.bos}>
            <Ionicons name="home-outline" size={56} color="#d1d5db" />
            <Text style={s.bosBaslik}>Henüz ilanınız yok</Text>
            <TouchableOpacity style={s.btn} onPress={() => navigation.navigate('IlanVer')}>
              <Text style={s.btnText}>İlan Ver</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.kart}
            onPress={() => navigation.navigate('IlanDetay', { id: item.id })}
          >
            <Image source={{ uri: item.gorsel || GORSEL_FALLBACK }} style={s.gorsel} resizeMode="cover" />
            <View style={[s.durum, { backgroundColor: item.durum === 'pasif' ? '#ef4444' : '#16a34a' }]}>
              <Text style={s.durumText}>{item.durum === 'pasif' ? 'Pasif' : 'Aktif'}</Text>
            </View>
            <View style={s.bilgi}>
              <Text style={s.fiyat}>{fiyatFormat(item.fiyat)}</Text>
              <Text style={s.baslik} numberOfLines={1}>{item.baslik}</Text>
              <View style={s.altRow}>
                <Ionicons name="location-outline" size={12} color="#9ca3af" />
                <Text style={s.konum}>{[item.ilce, item.sehir].filter(Boolean).join(', ') || '—'}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#f9fafb' },
  merkez:      { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14, padding: 40 },
  bos:         { alignItems: 'center', paddingTop: 80, gap: 14 },
  bosBaslik:   { fontSize: 16, fontWeight: '700', color: '#374151' },
  btn:         { backgroundColor: '#16a34a', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12 },
  btnText:     { color: '#fff', fontWeight: '700', fontSize: 14 },
  kart:        { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#f3f4f6' },
  gorsel:      { width: '100%', height: 160 },
  durum:       { position: 'absolute', top: 10, right: 10, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  durumText:   { color: '#fff', fontSize: 10, fontWeight: '700' },
  bilgi:       { padding: 12 },
  fiyat:       { fontSize: 17, fontWeight: '800', color: '#16a34a' },
  baslik:      { fontSize: 14, fontWeight: '600', color: '#111827', marginTop: 2 },
  altRow:      { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  konum:       { fontSize: 12, color: '#9ca3af' },
});
