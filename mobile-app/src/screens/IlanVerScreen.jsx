import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const TIPLER = ['Satılık', 'Kiralık'];
const TURLER = ['Daire', 'Villa', 'Müstakil Ev', 'Arsa', 'İşyeri', 'Depo'];

const Alan = ({ label, value, onChangeText, placeholder, keyboardType = 'default', zorunlu }) => (
  <View style={s.alanWrap}>
    <Text style={s.alanLabel}>{label}{zorunlu && <Text style={{ color: '#ef4444' }}> *</Text>}</Text>
    <TextInput
      style={s.alanInput}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9ca3af"
      keyboardType={keyboardType}
    />
  </View>
);

export default function IlanVerScreen({ navigation }) {
  const [kullanici, setKullanici] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [form, setForm] = useState({
    tip: 'Satılık', emlak_turu: 'Daire',
    baslik: '', aciklama: '', fiyat: '', metrekare: '',
    oda_sayisi: '', bina_yasi: '', kat: '', sehir: '', ilce: '', mahalle: '', gorsel: '',
  });

  useEffect(() => {
    AsyncStorage.getItem('kullanici').then(v => { if (v) setKullanici(JSON.parse(v)); });
  }, []);

  const gonder = async () => {
    if (!form.baslik || !form.fiyat || !form.metrekare) {
      Alert.alert('Eksik Alan', 'Başlık, fiyat ve metrekare zorunludur.'); return;
    }
    setYukleniyor(true);
    try {
      await api.post('/ilanlar', {
        ...form,
        fiyat: parseFloat(form.fiyat),
        metrekare: parseFloat(form.metrekare),
      });
      Alert.alert('Başarılı!', 'İlanınız yayınlandı.', [
        { text: 'Tamam', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      const mesaj = err.response?.data?.mesaj || 'Bir hata oluştu.';
      const limitAsimi = err.response?.data?.limit_asimi;
      Alert.alert(
        limitAsimi ? 'İlan Limiti' : 'Hata',
        limitAsimi ? 'Bireysel hesaplar en fazla 3 ilan ekleyebilir. Kurumsal hesap açmanız gerekmektedir.' : mesaj,
      );
    } finally { setYukleniyor(false); }
  };

  if (!kullanici) {
    return (
      <View style={s.girisGerekli}>
        <Ionicons name="lock-closed-outline" size={64} color="#d1d5db" />
        <Text style={s.girisBaslik}>Giriş Yapmanız Gerekiyor</Text>
        <TouchableOpacity style={s.girisBtn} onPress={() => navigation.navigate('Giris')}>
          <Text style={s.girisBtnText}>Giriş Yap</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={s.icerik}>

        {/* İlan Tipi */}
        <Text style={s.grupBaslik}>İlan Tipi</Text>
        <View style={s.secimRow}>
          {TIPLER.map(t => (
            <TouchableOpacity key={t} onPress={() => setForm(f => ({ ...f, tip: t }))}
              style={[s.secimBtn, form.tip === t && s.secimBtnAktif]}>
              <Text style={[s.secimText, form.tip === t && s.secimTextAktif]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Emlak Türü */}
        <Text style={s.grupBaslik}>Emlak Türü</Text>
        <View style={s.secimGrid}>
          {TURLER.map(t => (
            <TouchableOpacity key={t} onPress={() => setForm(f => ({ ...f, emlak_turu: t }))}
              style={[s.turBtn, form.emlak_turu === t && s.turBtnAktif]}>
              <Text style={[s.turText, form.emlak_turu === t && s.turTextAktif]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Temel Bilgiler */}
        <Text style={s.grupBaslik}>İlan Bilgileri</Text>
        <Alan label="İlan Başlığı" value={form.baslik} onChangeText={v => setForm(f => ({ ...f, baslik: v }))} placeholder="Örn: Kadıköy 3+1 Daire" zorunlu />
        <View style={s.alanWrap}>
          <Text style={s.alanLabel}>Açıklama</Text>
          <TextInput style={[s.alanInput, { height: 90, textAlignVertical: 'top' }]}
            value={form.aciklama} onChangeText={v => setForm(f => ({ ...f, aciklama: v }))}
            placeholder="İlan detayları..." placeholderTextColor="#9ca3af" multiline />
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Alan label="Fiyat (₺)" value={form.fiyat} onChangeText={v => setForm(f => ({ ...f, fiyat: v }))} placeholder="4500000" keyboardType="numeric" zorunlu />
          </View>
          <View style={{ flex: 1 }}>
            <Alan label="Metrekare" value={form.metrekare} onChangeText={v => setForm(f => ({ ...f, metrekare: v }))} placeholder="120" keyboardType="numeric" zorunlu />
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Alan label="Oda Sayısı" value={form.oda_sayisi} onChangeText={v => setForm(f => ({ ...f, oda_sayisi: v }))} placeholder="3+1" />
          </View>
          <View style={{ flex: 1 }}>
            <Alan label="Kat" value={form.kat} onChangeText={v => setForm(f => ({ ...f, kat: v }))} placeholder="3" keyboardType="numeric" />
          </View>
        </View>

        {/* Konum */}
        <Text style={s.grupBaslik}>Konum</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Alan label="Şehir" value={form.sehir} onChangeText={v => setForm(f => ({ ...f, sehir: v }))} placeholder="İstanbul" />
          </View>
          <View style={{ flex: 1 }}>
            <Alan label="İlçe" value={form.ilce} onChangeText={v => setForm(f => ({ ...f, ilce: v }))} placeholder="Kadıköy" />
          </View>
        </View>
        <Alan label="Mahalle" value={form.mahalle} onChangeText={v => setForm(f => ({ ...f, mahalle: v }))} placeholder="Moda Mah." />
        <Alan label="Görsel URL" value={form.gorsel} onChangeText={v => setForm(f => ({ ...f, gorsel: v }))} placeholder="https://..." />

        {/* Gönder */}
        <TouchableOpacity style={s.gondBtn} onPress={gonder} disabled={yukleniyor}>
          {yukleniyor
            ? <ActivityIndicator color="#fff" />
            : <><Ionicons name="checkmark-circle-outline" size={20} color="#fff" /><Text style={s.gondBtnText}>İlanı Yayınla</Text></>
          }
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#f9fafb' },
  icerik:         { padding: 16 },
  grupBaslik:     { fontSize: 12, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 20, marginBottom: 10 },
  secimRow:       { flexDirection: 'row', gap: 10 },
  secimBtn:       { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 2, borderColor: '#e5e7eb', alignItems: 'center' },
  secimBtnAktif:  { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  secimText:      { fontSize: 14, fontWeight: '700', color: '#6b7280' },
  secimTextAktif: { color: '#16a34a' },
  secimGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  turBtn:         { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, borderWidth: 2, borderColor: '#e5e7eb' },
  turBtnAktif:    { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  turText:        { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  turTextAktif:   { color: '#16a34a' },
  alanWrap:       { marginBottom: 12 },
  alanLabel:      { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 6 },
  alanInput:      { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: '#111827' },
  gondBtn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#16a34a', paddingVertical: 16, borderRadius: 16, marginTop: 24 },
  gondBtnText:    { color: '#fff', fontSize: 16, fontWeight: '800' },
  girisGerekli:   { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, padding: 40, backgroundColor: '#f9fafb' },
  girisBaslik:    { fontSize: 18, fontWeight: '800', color: '#111827' },
  girisBtn:       { backgroundColor: '#16a34a', paddingHorizontal: 40, paddingVertical: 14, borderRadius: 14 },
  girisBtnText:   { color: '#fff', fontSize: 15, fontWeight: '800' },
});
