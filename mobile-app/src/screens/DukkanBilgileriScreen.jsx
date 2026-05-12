import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { dukkanGetir, dukkanGuncelle } from '../services/api';

const Alan = ({ label, value, onChangeText, editable, placeholder, keyboard }) => (
  <View style={s.alanWrap}>
    <Text style={s.alanLabel}>{label}</Text>
    <TextInput
      style={[s.alanInput, !editable && s.alanReadonly]}
      value={value}
      onChangeText={onChangeText}
      editable={editable}
      placeholder={placeholder || label}
      placeholderTextColor="#9ca3af"
      keyboardType={keyboard || 'default'}
    />
  </View>
);

export default function DukkanBilgileriScreen() {
  const [dukkan, setDukkan]         = useState(null);
  const [form, setForm]             = useState({ dukkan_adi: '', sehir: '', ilce: '' });
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydediyor, setKaydediyor] = useState(false);
  const [duzenleMod, setDuzenleMod] = useState(false);
  const [dukkanId, setDukkanId]     = useState(null);

  useFocusEffect(
    useCallback(() => {
      const yukle = async () => {
        setYukleniyor(true);
        try {
          const v = await AsyncStorage.getItem('kullanici');
          if (!v) return;
          const k = JSON.parse(v);
          setDukkanId(k.dukkan_id);
          const r = await dukkanGetir(k.dukkan_id);
          const d = r.data.dukkan;
          setDukkan(d);
          setForm({ dukkan_adi: d.dukkan_adi || '', sehir: d.sehir || '', ilce: d.ilce || '' });
        } catch {
          Alert.alert('Hata', 'Dükkan bilgileri yüklenemedi.');
        } finally {
          setYukleniyor(false);
        }
      };
      yukle();
    }, [])
  );

  const kaydet = async () => {
    if (!form.dukkan_adi.trim()) {
      Alert.alert('Hata', 'Dükkan adı zorunludur.'); return;
    }
    setKaydediyor(true);
    try {
      const r = await dukkanGuncelle(dukkanId, {
        dukkan_adi: form.dukkan_adi.trim(),
        sehir: form.sehir.trim() || undefined,
        ilce: form.ilce.trim() || undefined,
      });
      setDukkan(r.data.dukkan);
      setDuzenleMod(false);
      Alert.alert('Kaydedildi', 'Dükkan bilgileri güncellendi.');
    } catch (e) {
      Alert.alert('Hata', e?.response?.data?.mesaj || 'Güncellenemedi.');
    } finally {
      setKaydediyor(false);
    }
  };

  if (yukleniyor) {
    return (
      <View style={s.merkez}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  if (!dukkan) {
    return (
      <View style={s.merkez}>
        <Text style={s.bosText}>Dükkan bulunamadı.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>

      {/* Dükkan Kartı */}
      <LinearGradient colors={['#1e3a8a', '#3b82f6', '#60a5fa']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.dukkanKart}>
        <View style={s.dukkanIkon}>
          <Ionicons name="business" size={32} color="#3b82f6" />
        </View>
        <Text style={s.dukkanAd}>{dukkan.dukkan_adi}</Text>
        <Text style={s.dukkanKonum}>
          {[dukkan.ilce, dukkan.sehir].filter(Boolean).join(', ') || 'Konum belirtilmemiş'}
        </Text>
      </LinearGradient>

      {/* Düzenlenemez Bilgiler */}
      <View style={s.kart}>
        <Text style={s.kartBaslik}>LİSANS BİLGİLERİ</Text>
        <View style={s.bilgiSatir}>
          <Ionicons name="document-text-outline" size={16} color="#6b7280" />
          <Text style={s.bilgiLabel}>Vergi No</Text>
          <Text style={s.bilgiDeger}>{dukkan.vergi_no || '—'}</Text>
        </View>
        <View style={s.bilgiSatir}>
          <Ionicons name="ribbon-outline" size={16} color="#6b7280" />
          <Text style={s.bilgiLabel}>Yetki Belge No</Text>
          <Text style={s.bilgiDeger}>{dukkan.yetki_belge_no || '—'}</Text>
        </View>
        <Text style={s.bilgiNot}>* Bu bilgiler değiştirilemez.</Text>
      </View>

      {/* Düzenlenebilir Bilgiler */}
      <View style={s.kart}>
        <View style={s.kartHeader}>
          <Text style={s.kartBaslik}>OFİS BİLGİLERİ</Text>
          {!duzenleMod && (
            <TouchableOpacity onPress={() => setDuzenleMod(true)} style={s.duzenleBtn}>
              <Ionicons name="pencil-outline" size={16} color="#3b82f6" />
              <Text style={s.duzenleBtnText}>Düzenle</Text>
            </TouchableOpacity>
          )}
        </View>

        {duzenleMod ? (
          <>
            <Alan
              label="Dükkan / Ofis Adı *"
              value={form.dukkan_adi}
              onChangeText={v => setForm(f => ({ ...f, dukkan_adi: v }))}
              editable
            />
            <Alan
              label="Şehir"
              value={form.sehir}
              onChangeText={v => setForm(f => ({ ...f, sehir: v }))}
              editable
              placeholder="İstanbul"
            />
            <Alan
              label="İlçe"
              value={form.ilce}
              onChangeText={v => setForm(f => ({ ...f, ilce: v }))}
              editable
              placeholder="Kadıköy"
            />
            <View style={s.butonRow}>
              <TouchableOpacity
                style={s.iptalBtn}
                onPress={() => {
                  setForm({ dukkan_adi: dukkan.dukkan_adi || '', sehir: dukkan.sehir || '', ilce: dukkan.ilce || '' });
                  setDuzenleMod(false);
                }}
              >
                <Text style={s.iptalBtnText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.kaydetBtn} onPress={kaydet} disabled={kaydediyor}>
                {kaydediyor
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={s.kaydetBtnText}>Kaydet</Text>
                }
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={s.bilgiSatir}>
              <Ionicons name="storefront-outline" size={16} color="#6b7280" />
              <Text style={s.bilgiLabel}>Dükkan Adı</Text>
              <Text style={s.bilgiDeger}>{dukkan.dukkan_adi}</Text>
            </View>
            <View style={s.bilgiSatir}>
              <Ionicons name="map-outline" size={16} color="#6b7280" />
              <Text style={s.bilgiLabel}>Şehir</Text>
              <Text style={s.bilgiDeger}>{dukkan.sehir || '—'}</Text>
            </View>
            <View style={s.bilgiSatir}>
              <Ionicons name="location-outline" size={16} color="#6b7280" />
              <Text style={s.bilgiLabel}>İlçe</Text>
              <Text style={s.bilgiDeger}>{dukkan.ilce || '—'}</Text>
            </View>
          </>
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#f5f5f5' },
  merkez:         { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bosText:        { fontSize: 15, color: '#9ca3af' },

  dukkanKart:     { margin: 16, borderRadius: 20, padding: 24, alignItems: 'center', gap: 8 },
  dukkanIkon:     { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  dukkanAd:       { fontSize: 20, fontWeight: '900', color: '#fff', textAlign: 'center' },
  dukkanKonum:    { fontSize: 13, color: 'rgba(255,255,255,0.8)' },

  kart:           { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 16 },
  kartHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  kartBaslik:     { fontSize: 11, fontWeight: '800', color: '#9ca3af', letterSpacing: 1, marginBottom: 12 },
  bilgiSatir:     { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  bilgiLabel:     { fontSize: 13, color: '#6b7280', flex: 1 },
  bilgiDeger:     { fontSize: 14, fontWeight: '700', color: '#111827' },
  bilgiNot:       { fontSize: 11, color: '#9ca3af', marginTop: 10 },

  duzenleBtn:     { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#bfdbfe', backgroundColor: '#eff6ff' },
  duzenleBtnText: { fontSize: 13, fontWeight: '700', color: '#3b82f6' },

  alanWrap:       { marginBottom: 12 },
  alanLabel:      { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 6 },
  alanInput:      { borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: '#111827', backgroundColor: '#fafafa' },
  alanReadonly:   { backgroundColor: '#f3f4f6', color: '#6b7280' },

  butonRow:       { flexDirection: 'row', gap: 10, marginTop: 8 },
  iptalBtn:       { flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center', borderWidth: 1.5, borderColor: '#e5e7eb' },
  iptalBtnText:   { fontSize: 14, fontWeight: '700', color: '#6b7280' },
  kaydetBtn:      { flex: 2, paddingVertical: 13, borderRadius: 12, alignItems: 'center', backgroundColor: '#3b82f6' },
  kaydetBtnText:  { fontSize: 14, fontWeight: '800', color: '#fff' },
});
