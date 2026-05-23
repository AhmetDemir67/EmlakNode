import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Image, ActivityIndicator, Alert, Modal, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { kullaniciilanlarim, ilanSil, ilanDurumGuncelle } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const GORSEL_FALLBACK = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80';
const fiyatFormat = (f) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(f);

const DURUM_RENK = {
  aktif:     '#2563eb',
  pasif:     '#f97316',
  satildi:   '#8b5cf6',
  kiralandı: '#3b82f6',
};
const DURUM_ETIKET = {
  aktif:     'Aktif',
  pasif:     'Pasif',
  satildi:   'Satıldı',
  kiralandı: 'Kiralandı',
};
const DURUM_SECENEKLER = ['aktif', 'pasif', 'satildi', 'kiralandı'];

export default function IlanlarimScreen({ navigation }) {
  const { colors } = useTheme();
  const [ilanlar, setIlanlar]           = useState([]);
  const [yukleniyor, setYukleniyor]     = useState(true);
  const [kullanici, setKullanici]       = useState(null);
  const [silinenId, setSilinenId]       = useState(null);
  const [durumMod, setDurumMod]         = useState(false);
  const [seciliIlan, setSeciliIlan]     = useState(null);
  const [durumYukleniyor, setDurumYuk]  = useState(false);

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

  const durumDegistir = async (yeniDurum) => {
    if (!seciliIlan) return;
    setDurumYuk(true);
    try {
      await ilanDurumGuncelle(seciliIlan.id, yeniDurum);
      setIlanlar(prev => prev.map(i => i.id === seciliIlan.id ? { ...i, durum: yeniDurum } : i));
      setDurumMod(false);
    } catch {
      Alert.alert('Hata', 'Durum güncellenemedi.');
    } finally {
      setDurumYuk(false);
    }
  };

  const kurumsal = kullanici?.dukkan_id;
  const maxIlan  = 3;
  const kullanilanHak = !kurumsal ? ilanlar.length : null;

  if (!kullanici) {
    return (
      <View style={[s.merkez, { backgroundColor: colors.bg }]}>
        <Ionicons name="lock-closed-outline" size={56} color={colors.textMuted} />
        <Text style={[s.bosBaslik, { color: colors.text }]}>Giriş Yapmanız Gerekiyor</Text>
        <TouchableOpacity style={s.btn} onPress={() => navigation.navigate('Giris')}>
          <Text style={s.btnText}>Giriş Yap</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (yukleniyor) {
    return (
      <View style={[s.merkez, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const aktifSayi   = ilanlar.filter(i => i.durum === 'aktif').length;
  const pasifSayi   = ilanlar.filter(i => i.durum === 'pasif').length;
  const satildiSayi = ilanlar.filter(i => i.durum === 'satildi' || i.durum === 'kiralandı').length;

  return (
    <View style={[s.container, { backgroundColor: colors.bg }]}>
      <LinearGradient colors={['#1e3a8a', '#2563eb']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.banner}>
        <View style={s.bannerKart}>
          <Text style={s.bannerSayi}>{ilanlar.length}</Text>
          <Text style={s.bannerLabel}>Toplam</Text>
        </View>
        <View style={s.bannerAyrac} />
        <View style={s.bannerKart}>
          <Text style={s.bannerSayi}>{aktifSayi}</Text>
          <Text style={s.bannerLabel}>Aktif</Text>
        </View>
        <View style={s.bannerAyrac} />
        <View style={s.bannerKart}>
          <Text style={s.bannerSayi}>{pasifSayi}</Text>
          <Text style={s.bannerLabel}>Pasif</Text>
        </View>
        <View style={s.bannerAyrac} />
        <View style={s.bannerKart}>
          <Text style={s.bannerSayi}>{satildiSayi}</Text>
          <Text style={s.bannerLabel}>Kapandı</Text>
        </View>
      </LinearGradient>
      {/* Bireysel limit göstergesi */}
      {!kurumsal && (
        <View style={[s.limitBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={s.limitSol}>
            <Ionicons name="home-outline" size={16} color={colors.text} />
            <Text style={[s.limitText, { color: colors.text }]}>
              <Text style={{ fontWeight: '900', color: kullanilanHak >= maxIlan ? '#ef4444' : '#2563eb' }}>
                {kullanilanHak}/{maxIlan}
              </Text>
              {' '}ilan hakkı kullanıldı
            </Text>
          </View>
          {kullanilanHak < maxIlan ? (
            <TouchableOpacity onPress={() => navigation.navigate('IlanVer')}>
              <Text style={s.limitEkle}>+ İlan Ver</Text>
            </TouchableOpacity>
          ) : (
            <Text style={s.limitDolu}>Limit doldu</Text>
          )}
        </View>
      )}

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
        renderItem={({ item }) => {
          const durumRenk  = DURUM_RENK[item.durum]  || '#2563eb';
          const durumEtiket = DURUM_ETIKET[item.durum] || 'Aktif';
          return (
            <TouchableOpacity
              style={[s.kart, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => navigation.navigate('IlanDetay', { id: item.id })}
            >
              <Image source={{ uri: item.gorsel || GORSEL_FALLBACK }} style={s.gorsel} resizeMode="cover" />
              <TouchableOpacity
                style={[s.durum, { backgroundColor: durumRenk }]}
                onPress={(e) => { e.stopPropagation(); setSeciliIlan(item); setDurumMod(true); }}
              >
                <Text style={s.durumText}>{durumEtiket}</Text>
                <Ionicons name="chevron-down" size={10} color="#fff" style={{ marginLeft: 2 }} />
              </TouchableOpacity>
              <View style={s.bilgi}>
                <Text style={s.fiyat}>{fiyatFormat(item.fiyat)}</Text>
                <Text style={[s.baslik, { color: colors.text }]} numberOfLines={1}>{item.baslik}</Text>
                <View style={s.altRow}>
                  <Ionicons name="location-outline" size={12} color="#9ca3af" />
                  <Text style={s.konum}>{[item.ilce, item.sehir].filter(Boolean).join(', ') || '—'}</Text>
                </View>
                <View style={s.aksiyonRow}>
                  <TouchableOpacity
                    style={s.duzenleBtn}
                    onPress={() => navigation.navigate('IlanDuzenle', { ilan: item })}
                  >
                    <Ionicons name="pencil-outline" size={14} color="#2563eb" />
                    <Text style={s.duzenleBtnText}>Düzenle</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={s.durumBtn}
                    onPress={() => { setSeciliIlan(item); setDurumMod(true); }}
                  >
                    <Ionicons name="swap-horizontal-outline" size={14} color="#6b7280" />
                    <Text style={s.durumBtnText}>Durum</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={s.silBtn}
                    disabled={silinenId === item.id}
                    onPress={() => {
                      Alert.alert('İlanı Sil', 'Bu ilanı silmek istediğinize emin misiniz?', [
                        { text: 'İptal', style: 'cancel' },
                        {
                          text: 'Sil', style: 'destructive', onPress: async () => {
                            setSilinenId(item.id);
                            try {
                              await ilanSil(item.id);
                              setIlanlar(prev => prev.filter(i => i.id !== item.id));
                            } catch (err) {
                              Alert.alert('Hata', err.response?.data?.mesaj || 'İlan silinemedi.');
                            } finally {
                              setSilinenId(null);
                            }
                          },
                        },
                      ]);
                    }}
                  >
                    {silinenId === item.id
                      ? <ActivityIndicator size="small" color="#ef4444" />
                      : <>
                          <Ionicons name="trash-outline" size={14} color="#ef4444" />
                          <Text style={s.silBtnText}>Sil</Text>
                        </>
                    }
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Durum Değiştir Modalı */}
      <Modal visible={durumMod} transparent animationType="slide" onRequestClose={() => setDurumMod(false)}>
        <TouchableOpacity style={s.modalArka} activeOpacity={1} onPress={() => setDurumMod(false)} />
        <View style={[s.modalKutu, { backgroundColor: colors.card }]}>
          <View style={s.modalBaslik}>
            <Text style={[s.modalBaslikText, { color: colors.text }]}>Durum Değiştir</Text>
            <TouchableOpacity onPress={() => setDurumMod(false)}>
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>
          {seciliIlan ? (
            <Text style={[s.modalAlt, { color: colors.textMuted }]} numberOfLines={1}>{seciliIlan.baslik}</Text>
          ) : null}
          {durumYukleniyor ? (
            <ActivityIndicator size="large" color="#2563eb" style={{ marginVertical: 24 }} />
          ) : (
            DURUM_SECENEKLER.map(d => (
              <TouchableOpacity
                key={d}
                style={[s.durumSecim, seciliIlan?.durum === d && s.durumSecimAktif]}
                onPress={() => durumDegistir(d)}
              >
                <View style={[s.durumNokta, { backgroundColor: DURUM_RENK[d] }]} />
                <Text style={[s.durumSecimText, seciliIlan?.durum === d && { color: '#2563eb', fontWeight: '700' }]}>
                  {DURUM_ETIKET[d]}
                </Text>
                {seciliIlan?.durum === d ? <Ionicons name="checkmark" size={18} color="#2563eb" /> : null}
              </TouchableOpacity>
            ))
          )}
          <View style={{ height: 8 }} />
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1 },
  banner:       { flexDirection: 'row', paddingVertical: 16, paddingHorizontal: 8 },
  bannerKart:   { flex: 1, alignItems: 'center', gap: 3 },
  bannerSayi:   { fontSize: 22, fontWeight: '900', color: '#fff' },
  bannerLabel:  { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  bannerAyrac:  { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.25)', alignSelf: 'center' },
  merkez:       { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14, padding: 40 },
  bos:          { alignItems: 'center', paddingTop: 80, gap: 14 },
  bosBaslik:    { fontSize: 16, fontWeight: '700', color: '#374151' },
  btn:          { backgroundColor: '#2563eb', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12 },
  btnText:      { color: '#fff', fontWeight: '700', fontSize: 14 },

  limitBar:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  limitSol:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  limitText:    { fontSize: 13, color: '#374151' },
  limitEkle:    { fontSize: 13, fontWeight: '700', color: '#2563eb' },
  limitDolu:    { fontSize: 12, fontWeight: '700', color: '#ef4444' },

  kart:         { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#f3f4f6' },
  gorsel:       { width: '100%', height: 160 },
  durum:        { position: 'absolute', top: 10, right: 10, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, flexDirection: 'row', alignItems: 'center' },
  durumText:    { color: '#fff', fontSize: 10, fontWeight: '700' },
  bilgi:        { padding: 12 },
  fiyat:        { fontSize: 17, fontWeight: '800', color: '#2563eb' },
  baslik:       { fontSize: 14, fontWeight: '600', color: '#111827', marginTop: 2 },
  altRow:       { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  konum:        { fontSize: 12, color: '#9ca3af' },
  aksiyonRow:   { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 10 },
  duzenleBtn:   { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#bfdbfe', backgroundColor: '#eff6ff' },
  duzenleBtnText: { fontSize: 12, fontWeight: '700', color: '#2563eb' },
  durumBtn:     { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#f9fafb' },
  durumBtnText: { fontSize: 12, fontWeight: '700', color: '#6b7280' },
  silBtn:       { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#fecaca', backgroundColor: '#fff5f5' },
  silBtnText:   { fontSize: 12, fontWeight: '700', color: '#ef4444' },

  modalArka:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalKutu:    { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  modalBaslik:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  modalBaslikText: { fontSize: 17, fontWeight: '800', color: '#111827' },
  modalAlt:     { fontSize: 13, color: '#9ca3af', marginBottom: 16 },
  durumSecim:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f5f5f5', gap: 12 },
  durumSecimAktif: { backgroundColor: '#eff6ff', marginHorizontal: -20, paddingHorizontal: 20, borderRadius: 0 },
  durumSecimText: { flex: 1, fontSize: 15, color: '#374151' },
  durumNokta:   { width: 12, height: 12, borderRadius: 6 },
});
