import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { favorilerGetir, favoriSil } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const FALLBACK = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=60';

const fiyatFormat = (f) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(f);

export default function FavorilerScreen({ navigation }) {
  const { colors } = useTheme();
  const [favoriler, setFavoriler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setYukleniyor(true);
      favorilerGetir()
        .then(r => setFavoriler(r.data.favoriler || []))
        .catch(() => setFavoriler([]))
        .finally(() => setYukleniyor(false));
    }, [])
  );

  const sil = (ilan_id, baslik) => {
    Alert.alert('Favorilerden Çıkar', `"${baslik}" favorilerden çıkarılsın mı?`, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkar', style: 'destructive', onPress: async () => {
          await favoriSil(ilan_id).catch(() => {});
          setFavoriler(prev => prev.filter(f => f.id !== ilan_id));
        },
      },
    ]);
  };

  if (yukleniyor) {
    return <View style={[s.merkez, { backgroundColor: colors.bg }]}><ActivityIndicator size="large" color="#2563eb" /></View>;
  }

  if (favoriler.length === 0) {
    return (
      <View style={[s.merkez, { backgroundColor: colors.bg }]}>
        <Ionicons name="heart-outline" size={56} color={colors.textMuted} />
        <Text style={[s.bosBaslik, { color: colors.text }]}>Henüz favori ilan yok</Text>
        <Text style={[s.bosAlt, { color: colors.textSecondary }]}>Beğendiğin ilanlardaki kalp ikonuna basarak buraya ekleyebilirsin.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={[s.topBant, { backgroundColor: colors.card, borderBottomColor: '#fecaca' }]}>
        <Ionicons name="heart" size={14} color="#ef4444" />
        <Text style={s.topBantText}>{favoriler.length} favori ilan</Text>
      </View>
      <FlatList
        data={favoriler}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={[s.liste, { backgroundColor: colors.bg }]}
        showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const gorsel = (Array.isArray(item.fotograflar) && item.fotograflar[0])
          || item.gorsel || FALLBACK;
        const konum = [item.ilce, item.sehir].filter(Boolean).join(' / ');
        return (
          <TouchableOpacity
            style={[s.kart, { backgroundColor: colors.card }]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('IlanDetay', { id: item.id })}
          >
            <Image source={{ uri: gorsel }} style={s.gorsel} resizeMode="cover" />
            <View style={[s.tipBadge, { backgroundColor: item.tip === 'Kiralık' ? '#3b82f6' : '#2563eb' }]}>
              <Text style={s.tipText}>{item.tip}</Text>
            </View>
            <View style={[s.icerik, { backgroundColor: colors.card }]}>
              <Text style={[s.baslik, { color: colors.text }]} numberOfLines={2}>{item.baslik}</Text>
              <Text style={s.fiyat}>{fiyatFormat(item.fiyat)}</Text>
              {konum ? (
                <View style={s.konumRow}>
                  <Ionicons name="location-outline" size={13} color="#9ca3af" />
                  <Text style={s.konumText}>{konum}</Text>
                </View>
              ) : null}
            </View>
            <TouchableOpacity style={s.kalp} onPress={() => sil(item.id, item.baslik)}>
              <Ionicons name="heart" size={22} color="#ef4444" />
            </TouchableOpacity>
          </TouchableOpacity>
        );
      }}
    />
    </View>
  );
}

const s = StyleSheet.create({
  merkez:     { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 32, backgroundColor: '#f9fafb' },
  bosBaslik:  { fontSize: 18, fontWeight: '800', color: '#111827', marginTop: 8 },
  bosAlt:     { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 22 },

  topBant:    { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff1f2', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#fecaca' },
  topBantText:{ fontSize: 13, fontWeight: '600', color: '#ef4444' },
  liste:      { padding: 16, gap: 12, backgroundColor: '#f5f5f5' },
  kart:       { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, flexDirection: 'row', alignItems: 'center' },
  gorsel:     { width: 110, height: 100 },
  tipBadge:   { position: 'absolute', top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tipText:    { color: '#fff', fontSize: 10, fontWeight: '700' },
  icerik:     { flex: 1, padding: 12, gap: 4 },
  baslik:     { fontSize: 13, fontWeight: '700', color: '#111827', lineHeight: 18 },
  fiyat:      { fontSize: 15, fontWeight: '900', color: '#f59e0b' },
  konumRow:   { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  konumText:  { fontSize: 12, color: '#9ca3af' },
  kalp:       { padding: 14 },
});
