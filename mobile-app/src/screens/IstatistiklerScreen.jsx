import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { istatistiklerGetir } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const StatKart = ({ icon, label, sayi, renk, alt, colors }) => (
  <View style={[s.statKart, { borderLeftColor: renk, backgroundColor: colors.card }]}>
    <View style={[s.statIkon, { backgroundColor: renk + '18' }]}>
      <Ionicons name={icon} size={22} color={renk} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={[s.statSayi, { color: colors.text }]}>{sayi ?? 0}</Text>
      <Text style={[s.statLabel, { color: colors.textSecondary }]}>{label}</Text>
      {alt ? <Text style={[s.statAlt, { color: colors.textMuted }]}>{alt}</Text> : null}
    </View>
  </View>
);

const CubukGrafik = ({ label, sayi, toplam, renk, colors }) => {
  const oran = toplam > 0 ? (sayi / toplam) : 0;
  return (
    <View style={s.cubukWrap}>
      <View style={s.cubukUst}>
        <Text style={[s.cubukLabel, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[s.cubukSayi, { color: colors.text }]}>{sayi ?? 0}</Text>
      </View>
      <View style={[s.cubukArka, { backgroundColor: colors.border }]}>
        <View style={[s.cubukOn, { width: `${Math.round(oran * 100)}%`, backgroundColor: renk }]} />
      </View>
      <Text style={[s.cubukOran, { color: colors.textMuted }]}>{Math.round(oran * 100)}%</Text>
    </View>
  );
};

export default function IstatistiklerScreen() {
  const { colors } = useTheme();
  const [ist, setIst]               = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const yukle = async () => {
        setYukleniyor(true);
        try {
          const v = await AsyncStorage.getItem('kullanici');
          if (!v) return;
          const k = JSON.parse(v);
          const r = await istatistiklerGetir(k.dukkan_id);
          setIst(r.data.istatistikler);
        } catch {
          Alert.alert('Hata', 'İstatistikler yüklenemedi.');
        } finally {
          setYukleniyor(false);
        }
      };
      yukle();
    }, [])
  );

  if (yukleniyor) {
    return <View style={[s.merkez, { backgroundColor: colors.bg }]}><ActivityIndicator size="large" color="#2563eb" /></View>;
  }

  if (!ist) {
    return <View style={[s.merkez, { backgroundColor: colors.bg }]}><Text style={[s.bosText, { color: colors.textMuted }]}>Veri bulunamadı.</Text></View>;
  }

  return (
    <ScrollView style={[s.container, { backgroundColor: colors.bg }]} showsVerticalScrollIndicator={false}>

      {/* Toplam özet */}
      <LinearGradient colors={['#1e3a8a', '#2563eb', '#3b82f6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.toplamKart}>
        <View style={s.toplamIkon}>
          <Ionicons name="home" size={36} color="#fff" />
        </View>
        <View>
          <Text style={s.toplamSayi}>{ist.toplam}</Text>
          <Text style={s.toplamLabel}>Toplam İlan</Text>
        </View>
        <View style={s.toplamAyrac} />
        <View>
          <Text style={s.toplamSayi}>{ist.danismanlar}</Text>
          <Text style={s.toplamLabel}>Danışman</Text>
        </View>
      </LinearGradient>

      {/* Durum kartları */}
      <Text style={[s.bolumBaslik, { color: colors.grupBaslik }]}>İLAN DURUMLARI</Text>
      <View style={s.kartGrid}>
        <StatKart icon="checkmark-circle-outline" label="Aktif"   sayi={ist.aktif}        renk="#2563eb" colors={colors} />
        <StatKart icon="pause-circle-outline"     label="Pasif"   sayi={ist.pasif}        renk="#f97316" colors={colors} />
        <StatKart icon="flag-outline"             label="Satıldı" sayi={ist.satildi}      renk="#8b5cf6" colors={colors} />
        <StatKart icon="trending-down-outline"    label="Fiyatı Düştü" sayi={ist.fiyat_dustu} renk="#ef4444" alt="Güncellenen ilanlar" colors={colors} />
      </View>

      <Text style={[s.bolumBaslik, { color: colors.grupBaslik }]}>TİP DAĞILIMI</Text>
      <View style={[s.grafikKart, { backgroundColor: colors.card }]}>
        <CubukGrafik label="Satılık" sayi={ist.satilik} toplam={ist.toplam} renk="#2563eb" colors={colors} />
        <CubukGrafik label="Kiralık" sayi={ist.kiralik} toplam={ist.toplam} renk="#3b82f6" colors={colors} />
      </View>

      <Text style={[s.bolumBaslik, { color: colors.grupBaslik }]}>DURUM DAĞILIMI</Text>
      <View style={[s.grafikKart, { backgroundColor: colors.card }]}>
        <CubukGrafik label="Aktif"   sayi={ist.aktif}   toplam={ist.toplam} renk="#2563eb" colors={colors} />
        <CubukGrafik label="Pasif"   sayi={ist.pasif}   toplam={ist.toplam} renk="#f97316" colors={colors} />
        <CubukGrafik label="Satıldı" sayi={ist.satildi} toplam={ist.toplam} renk="#8b5cf6" colors={colors} />
      </View>

      {ist.fiyat_dustu > 0 && (
        <>
          <Text style={[s.bolumBaslik, { color: colors.grupBaslik }]}>FİYAT HAREKETLERİ</Text>
          <View style={[s.dususKart, { backgroundColor: colors.card }]}>
            <Ionicons name="trending-down" size={28} color="#ef4444" />
            <View style={{ flex: 1 }}>
              <Text style={[s.dususBaslik, { color: colors.text }]}>{ist.fiyat_dustu} ilan fiyatı düşürüldü</Text>
              <Text style={[s.dususAlt, { color: colors.textSecondary }]}>
                Aktif ilanların %{Math.round((ist.fiyat_dustu / (ist.toplam || 1)) * 100)}'inde fiyat indirimi var
              </Text>
            </View>
          </View>
        </>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f5f5f5' },
  merkez:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bosText:      { fontSize: 15, color: '#9ca3af' },

  toplamKart:   { flexDirection: 'row', alignItems: 'center', margin: 16, borderRadius: 20, padding: 20, gap: 16 },
  toplamIkon:   { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  toplamSayi:   { fontSize: 28, fontWeight: '900', color: '#fff' },
  toplamLabel:  { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  toplamAyrac:  { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.3)' },

  bolumBaslik:  { fontSize: 11, fontWeight: '800', color: '#9ca3af', letterSpacing: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },

  kartGrid:     { paddingHorizontal: 16, gap: 10 },
  statKart:     { backgroundColor: '#fff', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderLeftWidth: 4 },
  statIkon:     { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  statSayi:     { fontSize: 22, fontWeight: '900', color: '#111827' },
  statLabel:    { fontSize: 13, color: '#374151', fontWeight: '600' },
  statAlt:      { fontSize: 11, color: '#9ca3af', marginTop: 2 },

  grafikKart:   { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, padding: 16, gap: 16 },
  cubukWrap:    { gap: 6 },
  cubukUst:     { flexDirection: 'row', justifyContent: 'space-between' },
  cubukLabel:   { fontSize: 13, fontWeight: '600', color: '#374151' },
  cubukSayi:    { fontSize: 13, fontWeight: '800', color: '#111827' },
  cubukArka:    { height: 10, backgroundColor: '#f3f4f6', borderRadius: 6, overflow: 'hidden' },
  cubukOn:      { height: '100%', borderRadius: 6, minWidth: 4 },
  cubukOran:    { fontSize: 11, color: '#9ca3af', fontWeight: '600' },

  dususKart:    { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, padding: 16, borderLeftWidth: 4, borderLeftColor: '#ef4444' },
  dususBaslik:  { fontSize: 14, fontWeight: '800', color: '#111827' },
  dususAlt:     { fontSize: 12, color: '#6b7280', marginTop: 3 },
});
