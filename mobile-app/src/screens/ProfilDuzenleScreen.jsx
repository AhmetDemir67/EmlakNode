import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { profilGetir, profilGuncelle, sifreGuncelle } from '../services/api';

const Alan = ({ label, value, onChangeText, placeholder, keyboardType = 'default', secureTextEntry, autoCapitalize = 'words' }) => (
  <View style={s.alanWrap}>
    <Text style={s.alanLabel}>{label}</Text>
    <TextInput
      style={s.alanInput}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9ca3af"
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      autoCapitalize={autoCapitalize}
      autoCorrect={false}
    />
  </View>
);

export default function ProfilDuzenleScreen({ navigation }) {
  const [aktifTab, setAktifTab]   = useState('bilgi');
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydediyor, setKaydediyor] = useState(false);

  const [bilgi, setBilgi] = useState({
    ad_soyad: '', eposta: '', telefon: '',
    dogum_tarihi: '', il: '', ilce: '',
  });

  const [sifre, setSifre] = useState({
    eski_sifre: '', yeni_sifre: '', yeni_sifre_tekrar: '',
  });

  const [eski_goster, setEskiGoster]     = useState(false);
  const [yeni_goster, setYeniGoster]     = useState(false);
  const [tekrar_goster, setTekrarGoster] = useState(false);

  useEffect(() => {
    profilGetir()
      .then(r => {
        const k = r.data.kullanici;
        setBilgi({
          ad_soyad:     k.ad_soyad     || '',
          eposta:       k.eposta       || '',
          telefon:      k.telefon      || '',
          dogum_tarihi: k.dogum_tarihi ? k.dogum_tarihi.slice(0, 10) : '',
          il:           k.il           || '',
          ilce:         k.ilce         || '',
        });
      })
      .catch(() => Alert.alert('Hata', 'Profil bilgileri yüklenemedi.'))
      .finally(() => setYukleniyor(false));
  }, []);

  const bilgiKaydet = async () => {
    if (!bilgi.ad_soyad.trim()) {
      Alert.alert('Eksik Alan', 'Ad soyad zorunludur.'); return;
    }
    setKaydediyor(true);
    try {
      const r = await profilGuncelle({
        ad_soyad:     bilgi.ad_soyad.trim()    || undefined,
        eposta:       bilgi.eposta.trim()       || undefined,
        telefon:      bilgi.telefon.trim()      || undefined,
        dogum_tarihi: bilgi.dogum_tarihi.trim() || undefined,
        il:           bilgi.il.trim()           || undefined,
        ilce:         bilgi.ilce.trim()         || undefined,
      });
      // AsyncStorage'daki kullanıcı bilgisini güncelle
      const depoKullanici = await AsyncStorage.getItem('kullanici');
      if (depoKullanici) {
        const guncellenen = { ...JSON.parse(depoKullanici), ...r.data.kullanici };
        await AsyncStorage.setItem('kullanici', JSON.stringify(guncellenen));
      }
      Alert.alert('Başarılı', 'Bilgileriniz güncellendi.');
    } catch (err) {
      Alert.alert('Hata', err.response?.data?.mesaj || 'Güncelleme başarısız.');
    } finally {
      setKaydediyor(false);
    }
  };

  const sifreKaydet = async () => {
    if (!sifre.eski_sifre || !sifre.yeni_sifre || !sifre.yeni_sifre_tekrar) {
      Alert.alert('Eksik Alan', 'Tüm şifre alanlarını doldurun.'); return;
    }
    if (sifre.yeni_sifre.length < 6) {
      Alert.alert('Hata', 'Yeni şifre en az 6 karakter olmalıdır.'); return;
    }
    if (sifre.yeni_sifre !== sifre.yeni_sifre_tekrar) {
      Alert.alert('Hata', 'Yeni şifreler eşleşmiyor.'); return;
    }
    setKaydediyor(true);
    try {
      await sifreGuncelle({ eski_sifre: sifre.eski_sifre, yeni_sifre: sifre.yeni_sifre });
      setSifre({ eski_sifre: '', yeni_sifre: '', yeni_sifre_tekrar: '' });
      Alert.alert('Başarılı', 'Şifreniz güncellendi.');
    } catch (err) {
      Alert.alert('Hata', err.response?.data?.mesaj || 'Şifre güncellenemedi.');
    } finally {
      setKaydediyor(false);
    }
  };

  if (yukleniyor) {
    return <View style={s.merkez}><ActivityIndicator size="large" color="#2563eb" /></View>;
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.container}>

        {/* Header */}
        <LinearGradient colors={['#1e3a8a', '#2563eb']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.header}>
          <TouchableOpacity style={s.geriBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerBaslik}>Üyelik Bilgilerim</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        {/* Tab Seçici */}
        <View style={s.tabRow}>
          <TouchableOpacity
            style={[s.tab, aktifTab === 'bilgi' && s.tabAktif]}
            onPress={() => setAktifTab('bilgi')}
          >
            <Ionicons name="person-outline" size={16} color={aktifTab === 'bilgi' ? '#2563eb' : '#9ca3af'} />
            <Text style={[s.tabText, aktifTab === 'bilgi' && s.tabTextAktif]}>Bilgileri Güncelle</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.tab, aktifTab === 'sifre' && s.tabAktif]}
            onPress={() => setAktifTab('sifre')}
          >
            <Ionicons name="lock-closed-outline" size={16} color={aktifTab === 'sifre' ? '#2563eb' : '#9ca3af'} />
            <Text style={[s.tabText, aktifTab === 'sifre' && s.tabTextAktif]}>Şifre Güncelle</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={s.icerik}>

            {aktifTab === 'bilgi' ? (
              <>
                <Alan
                  label="Ad Soyad"
                  value={bilgi.ad_soyad}
                  onChangeText={v => setBilgi(b => ({ ...b, ad_soyad: v }))}
                  placeholder="Adınız Soyadınız"
                />
                <Alan
                  label="E-posta"
                  value={bilgi.eposta}
                  onChangeText={v => setBilgi(b => ({ ...b, eposta: v }))}
                  placeholder="ornek@mail.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Alan
                  label="Telefon"
                  value={bilgi.telefon}
                  onChangeText={v => setBilgi(b => ({ ...b, telefon: v }))}
                  placeholder="05XX XXX XX XX"
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />
                <Alan
                  label="Doğum Tarihi"
                  value={bilgi.dogum_tarihi}
                  onChangeText={v => setBilgi(b => ({ ...b, dogum_tarihi: v }))}
                  placeholder="YYYY-AA-GG"
                  keyboardType="numeric"
                  autoCapitalize="none"
                />
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Alan
                      label="İl"
                      value={bilgi.il}
                      onChangeText={v => setBilgi(b => ({ ...b, il: v }))}
                      placeholder="İstanbul"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Alan
                      label="İlçe"
                      value={bilgi.ilce}
                      onChangeText={v => setBilgi(b => ({ ...b, ilce: v }))}
                      placeholder="Kadıköy"
                    />
                  </View>
                </View>

                <TouchableOpacity style={s.kaydetBtn} onPress={bilgiKaydet} disabled={kaydediyor}>
                  {kaydediyor
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={s.kaydetBtnText}>Kaydet</Text>
                  }
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Eski Şifre */}
                <View style={s.alanWrap}>
                  <Text style={s.alanLabel}>Mevcut Şifre</Text>
                  <View style={s.sifreRow}>
                    <TextInput
                      style={[s.alanInput, { flex: 1, marginBottom: 0 }]}
                      value={sifre.eski_sifre}
                      onChangeText={v => setSifre(p => ({ ...p, eski_sifre: v }))}
                      placeholder="Mevcut şifreniz"
                      placeholderTextColor="#9ca3af"
                      secureTextEntry={!eski_goster}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity style={s.gozBtn} onPress={() => setEskiGoster(!eski_goster)}>
                      <Ionicons name={eski_goster ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9ca3af" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Yeni Şifre */}
                <View style={s.alanWrap}>
                  <Text style={s.alanLabel}>Yeni Şifre</Text>
                  <View style={s.sifreRow}>
                    <TextInput
                      style={[s.alanInput, { flex: 1, marginBottom: 0 }]}
                      value={sifre.yeni_sifre}
                      onChangeText={v => setSifre(p => ({ ...p, yeni_sifre: v }))}
                      placeholder="En az 6 karakter"
                      placeholderTextColor="#9ca3af"
                      secureTextEntry={!yeni_goster}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity style={s.gozBtn} onPress={() => setYeniGoster(!yeni_goster)}>
                      <Ionicons name={yeni_goster ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9ca3af" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Yeni Şifre Tekrar */}
                <View style={s.alanWrap}>
                  <Text style={s.alanLabel}>Yeni Şifre Tekrar</Text>
                  <View style={s.sifreRow}>
                    <TextInput
                      style={[s.alanInput, { flex: 1, marginBottom: 0 }]}
                      value={sifre.yeni_sifre_tekrar}
                      onChangeText={v => setSifre(p => ({ ...p, yeni_sifre_tekrar: v }))}
                      placeholder="Yeni şifrenizi tekrar girin"
                      placeholderTextColor="#9ca3af"
                      secureTextEntry={!tekrar_goster}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity style={s.gozBtn} onPress={() => setTekrarGoster(!tekrar_goster)}>
                      <Ionicons name={tekrar_goster ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9ca3af" />
                    </TouchableOpacity>
                  </View>
                </View>

                {sifre.yeni_sifre && sifre.yeni_sifre_tekrar && sifre.yeni_sifre !== sifre.yeni_sifre_tekrar && (
                  <View style={s.uyariRow}>
                    <Ionicons name="alert-circle-outline" size={14} color="#ef4444" />
                    <Text style={s.uyariText}>Şifreler eşleşmiyor</Text>
                  </View>
                )}

                <TouchableOpacity style={s.kaydetBtn} onPress={sifreKaydet} disabled={kaydediyor}>
                  {kaydediyor
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={s.kaydetBtnText}>Şifreyi Güncelle</Text>
                  }
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#f5f5f5' },
  merkez:         { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header:         { flexDirection: 'row', alignItems: 'center',
                    paddingHorizontal: 8, paddingVertical: 12, paddingTop: 48 },
  geriBtn:        { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerBaslik:   { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#fff' },

  tabRow:         { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16,
                    borderRadius: 14, padding: 4, gap: 4,
                    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  tab:            { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                    gap: 6, paddingVertical: 10, borderRadius: 10 },
  tabAktif:       { backgroundColor: '#eff6ff' },
  tabText:        { fontSize: 13, fontWeight: '600', color: '#9ca3af' },
  tabTextAktif:   { color: '#2563eb' },

  icerik:         { padding: 16, paddingTop: 12 },

  alanWrap:       { marginBottom: 14 },
  alanLabel:      { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 6 },
  alanInput:      { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb',
                    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
                    fontSize: 15, color: '#111827' },

  sifreRow:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
                    borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingRight: 4 },
  gozBtn:         { padding: 10 },

  uyariRow:       { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: -8, marginBottom: 8 },
  uyariText:      { fontSize: 12, color: '#ef4444', fontWeight: '600' },

  kaydetBtn:      { backgroundColor: '#2563eb', paddingVertical: 15, borderRadius: 14,
                    alignItems: 'center', marginTop: 8 },
  kaydetBtnText:  { color: '#fff', fontSize: 16, fontWeight: '800' },
});
