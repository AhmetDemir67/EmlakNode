import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { danismanlarGetir } from '../services/api';

const ROL_RENK = {
  patron:   { bg: '#fef9c3', text: '#854d0e', label: 'Patron' },
  danisman: { bg: '#dbeafe', text: '#1e40af', label: 'Danışman' },
  admin:    { bg: '#fce7f3', text: '#9d174d', label: 'Admin' },
};

const bas = (str = '') =>
  str.split(' ').map(w => w.charAt(0).toUpperCase()).slice(0, 2).join('');

const DanismanKarti = ({ item }) => {
  const rol = ROL_RENK[item.rol] || ROL_RENK.danisman;
  const tarih = new Date(item.olusturulma_tarihi).toLocaleDateString('tr-TR', {
    year: 'numeric', month: 'long',
  });

  return (
    <View style={s.kart}>
      <View style={s.avatar}>
        <Text style={s.avatarText}>{bas(item.ad_soyad)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={s.ustSatir}>
          <Text style={s.ad}>{item.ad_soyad}</Text>
          <View style={[s.rolBadge, { backgroundColor: rol.bg }]}>
            <Text style={[s.rolText, { color: rol.text }]}>{rol.label}</Text>
          </View>
        </View>
        <Text style={s.eposta}>{item.eposta}</Text>
        <View style={s.altSatir}>
          <View style={s.ilanChip}>
            <Ionicons name="home-outline" size={12} color="#6b7280" />
            <Text style={s.ilanText}>{item.ilan_sayisi} ilan</Text>
          </View>
          <Text style={s.tarih}>{tarih}'den beri</Text>
        </View>
      </View>
    </View>
  );
};

export default function DanismanlarimScreen() {
  const [danismanlar, setDanismanlar] = useState([]);
  const [yukleniyor, setYukleniyor]   = useState(true);

  useFocusEffect(
    useCallback(() => {
      const yukle = async () => {
        setYukleniyor(true);
        try {
          const v = await AsyncStorage.getItem('kullanici');
          if (!v) return;
          const k = JSON.parse(v);
          const r = await danismanlarGetir(k.dukkan_id);
          setDanismanlar(r.data.danismanlar || []);
        } catch {
          Alert.alert('Hata', 'Danışmanlar yüklenemedi.');
        } finally {
          setYukleniyor(false);
        }
      };
      yukle();
    }, [])
  );

  if (yukleniyor) {
    return (
      <View style={s.merkez}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <View style={s.container}>
      {/* Özet Banner */}
      <LinearGradient colors={['#14532d', '#16a34a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.banner}>
        <View style={s.bannerKart}>
          <Text style={s.bannerSayi}>{danismanlar.length}</Text>
          <Text style={s.bannerLabel}>Toplam Ekip</Text>
        </View>
        <View style={s.bannerAyrac} />
        <View style={s.bannerKart}>
          <Text style={s.bannerSayi}>{danismanlar.filter(d => d.rol === 'patron').length}</Text>
          <Text style={s.bannerLabel}>Patron</Text>
        </View>
        <View style={s.bannerAyrac} />
        <View style={s.bannerKart}>
          <Text style={s.bannerSayi}>{danismanlar.filter(d => d.rol === 'danisman').length}</Text>
          <Text style={s.bannerLabel}>Danışman</Text>
        </View>
        <View style={s.bannerAyrac} />
        <View style={s.bannerKart}>
          <Text style={s.bannerSayi}>{danismanlar.reduce((t, d) => t + (d.ilan_sayisi || 0), 0)}</Text>
          <Text style={s.bannerLabel}>Toplam İlan</Text>
        </View>
      </LinearGradient>

      <FlatList
        data={danismanlar}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        renderItem={({ item }) => <DanismanKarti item={item} />}
        ListEmptyComponent={
          <View style={s.bos}>
            <Ionicons name="people-outline" size={56} color="#d1d5db" />
            <Text style={s.bosBaslik}>Henüz danışman yok</Text>
            <Text style={s.bosAlt}>Ekibinize danışman ekleyebilirsiniz.</Text>
          </View>
        }
        ListFooterComponent={
          <TouchableOpacity
            style={s.davetBtn}
            onPress={() => Alert.alert('Danışman Ekle', 'Bu özellik yakında eklenecek.')}
          >
            <Ionicons name="person-add-outline" size={18} color="#3b82f6" />
            <Text style={s.davetBtnText}>Danışman Davet Et</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f5f5f5' },
  merkez:       { flex: 1, justifyContent: 'center', alignItems: 'center' },

  banner:       { flexDirection: 'row', paddingVertical: 18, paddingHorizontal: 8 },
  bannerKart:   { flex: 1, alignItems: 'center', gap: 4 },
  bannerSayi:   { fontSize: 22, fontWeight: '900', color: '#fff' },
  bannerLabel:  { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },
  bannerAyrac:  { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.25)', alignSelf: 'center' },

  kart:         { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'center', borderWidth: 1, borderColor: '#f0f0f0' },
  avatar:       { width: 52, height: 52, borderRadius: 26, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center' },
  avatarText:   { color: '#fff', fontSize: 18, fontWeight: '900' },

  ustSatir:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  ad:           { fontSize: 15, fontWeight: '800', color: '#111827', flex: 1 },
  rolBadge:     { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  rolText:      { fontSize: 10, fontWeight: '800' },
  eposta:       { fontSize: 12, color: '#6b7280', marginBottom: 6 },

  altSatir:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ilanChip:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  ilanText:     { fontSize: 11, fontWeight: '700', color: '#16a34a' },
  tarih:        { fontSize: 11, color: '#9ca3af' },

  bos:          { alignItems: 'center', paddingTop: 60, gap: 10 },
  bosBaslik:    { fontSize: 16, fontWeight: '700', color: '#374151' },
  bosAlt:       { fontSize: 13, color: '#9ca3af' },

  davetBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#bfdbfe', backgroundColor: '#eff6ff' },
  davetBtnText: { fontSize: 14, fontWeight: '700', color: '#3b82f6' },
});
