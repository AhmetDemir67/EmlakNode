import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { kayitliAramalarGetir, kayitliAramaSil } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const tarihFormat = (t) => {
  if (!t) return '';
  const d = new Date(t);
  return `${d.getDate().toString().padStart(2,'0')}.${(d.getMonth()+1).toString().padStart(2,'0')}.${d.getFullYear()}`;
};

const filtreleOzetle = (filtreler = {}) => {
  const parcalar = [];
  if (filtreler.tip)          parcalar.push(filtreler.tip);
  if (filtreler.emlak_turu)   parcalar.push(filtreler.emlak_turu);
  if (filtreler.sehir)        parcalar.push(filtreler.sehir);
  if (filtreler.fiyat_min || filtreler.fiyat_max) {
    const min = filtreler.fiyat_min ? `${Number(filtreler.fiyat_min).toLocaleString('tr-TR')} ₺` : '';
    const max = filtreler.fiyat_max ? `${Number(filtreler.fiyat_max).toLocaleString('tr-TR')} ₺` : '';
    parcalar.push([min, max].filter(Boolean).join(' - '));
  }
  if (filtreler.oda_sayisi)   parcalar.push(filtreler.oda_sayisi);
  return parcalar.join(' · ') || 'Tüm ilanlar';
};

export default function KayitliAramalarScreen({ navigation }) {
  const { colors } = useTheme();
  const [aramalar, setAramalar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setYukleniyor(true);
      kayitliAramalarGetir()
        .then(r => setAramalar(r.data.aramalar || []))
        .catch(() => setAramalar([]))
        .finally(() => setYukleniyor(false));
    }, [])
  );

  const sil = (id, baslik) => {
    Alert.alert('Aramayı Sil', `"${baslik}" silinsin mi?`, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil', style: 'destructive', onPress: async () => {
          await kayitliAramaSil(id).catch(() => {});
          setAramalar(prev => prev.filter(a => a.id !== id));
        },
      },
    ]);
  };

  const aramaUygula = (filtreler) => {
    const params = {};
    if (filtreler.tip)        params.tip        = filtreler.tip;
    if (filtreler.emlak_turu) params.emlak_turu = filtreler.emlak_turu;
    if (filtreler.sehir)      params.sehir      = filtreler.sehir;
    if (filtreler.ilce)       params.ilce       = filtreler.ilce;
    if (filtreler.min_fiyat || filtreler.fiyat_min) params.min_fiyat = filtreler.min_fiyat || filtreler.fiyat_min;
    if (filtreler.max_fiyat || filtreler.fiyat_max) params.max_fiyat = filtreler.max_fiyat || filtreler.fiyat_max;
    params.baslik = filtreler.tip || filtreler.sehir || 'Kayıtlı Arama';
    navigation.navigate('TumIlanlar', params);
  };

  if (yukleniyor) {
    return <View style={[s.merkez, { backgroundColor: colors.bg }]}><ActivityIndicator size="large" color="#2563eb" /></View>;
  }

  if (aramalar.length === 0) {
    return (
      <View style={[s.merkez, { backgroundColor: colors.bg }]}>
        <Ionicons name="search-outline" size={56} color={colors.textMuted} />
        <Text style={[s.bosBaslik, { color: colors.text }]}>Kayıtlı arama yok</Text>
        <Text style={[s.bosAlt, { color: colors.textSecondary }]}>İlan Ara ekranında arama yapıp kaydet butonuna basarak aramalarını buraya ekleyebilirsin.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={aramalar}
      keyExtractor={item => String(item.id)}
      contentContainerStyle={[s.liste, { backgroundColor: colors.bg }]}
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: colors.bg }}
      renderItem={({ item }) => {
        const filtreler = typeof item.filtreler === 'string'
          ? JSON.parse(item.filtreler)
          : item.filtreler || {};
        return (
          <TouchableOpacity style={[s.kart, { backgroundColor: colors.card }]} activeOpacity={0.85} onPress={() => aramaUygula(filtreler)}>
            <View style={[s.ikonWrap, { backgroundColor: colors.badge }]}>
              <Ionicons name="search" size={20} color="#2563eb" />
            </View>
            <View style={s.icerik}>
              <Text style={[s.baslik, { color: colors.text }]}>{item.baslik}</Text>
              <Text style={[s.filtreler, { color: colors.textSecondary }]}>{filtreleOzetle(filtreler)}</Text>
              <Text style={[s.tarih, { color: colors.textMuted }]}>{tarihFormat(item.olusturulma_tarihi)}</Text>
            </View>
            <TouchableOpacity style={s.silBtn} onPress={() => sil(item.id, item.baslik)}>
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
            </TouchableOpacity>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const s = StyleSheet.create({
  merkez:     { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 32, backgroundColor: '#f9fafb' },
  bosBaslik:  { fontSize: 18, fontWeight: '800', color: '#111827', marginTop: 8 },
  bosAlt:     { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 22 },

  liste:      { padding: 16, gap: 10, backgroundColor: '#f5f5f5' },
  kart:       { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  ikonWrap:   { width: 44, height: 44, borderRadius: 12, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
  icerik:     { flex: 1, gap: 3 },
  baslik:     { fontSize: 15, fontWeight: '700', color: '#111827' },
  filtreler:  { fontSize: 12, color: '#6b7280' },
  tarih:      { fontSize: 11, color: '#d1d5db', marginTop: 2 },
  silBtn:     { padding: 8 },
});
