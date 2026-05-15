import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { kayitOl, girisYap, kurumsalKayitOl } from '../services/api';

const InputAlan = ({ icon, placeholder, value, onChangeText, keyboard, cap, sifre, gizle, onGizleToggle }) => (
  <View style={s.inputWrap}>
    <Ionicons name={icon || 'person-outline'} size={18} color="#9ca3af" style={s.inputIkon} />
    <TextInput
      style={s.input}
      placeholder={placeholder}
      placeholderTextColor="#9ca3af"
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboard || 'default'}
      autoCapitalize={cap || 'sentences'}
      secureTextEntry={sifre ? gizle : false}
    />
    {sifre && (
      <TouchableOpacity onPress={onGizleToggle} style={{ padding: 4 }}>
        <Ionicons name={gizle ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9ca3af" />
      </TouchableOpacity>
    )}
  </View>
);

export default function KayitScreen({ navigation }) {
  const [tip, setTip] = useState('bireysel');
  const [bireysel, setBireysel] = useState({ ad_soyad: '', eposta: '', sifre: '', sifreTekrar: '' });
  const [kurumsal, setKurumsal] = useState({
    ad_soyad: '', eposta: '', sifre: '', sifreTekrar: '',
    dukkan_adi: '', sehir: '', ilce: '', vergi_no: '', yetki_belge_no: '',
  });
  const [gizle, setGizle]           = useState(true);
  const [yukleniyor, setYukleniyor] = useState(false);

  const oturumAc = async (eposta, sifre) => {
    const r = await girisYap({ eposta, sifre });
    await AsyncStorage.setItem('token', r.data.token);
    await AsyncStorage.setItem('kullanici', JSON.stringify(r.data.kullanici));
    navigation.reset({ index: 0, routes: [{ name: 'Ana' }] });
  };

  const bireyselKayit = async () => {
    const { ad_soyad, eposta, sifre, sifreTekrar } = bireysel;
    if (!ad_soyad || !eposta || !sifre) { Alert.alert('Eksik Alan', 'Tüm alanları doldurun.'); return; }
    if (sifre.length < 6) { Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.'); return; }
    if (sifre !== sifreTekrar) { Alert.alert('Hata', 'Şifreler eşleşmiyor.'); return; }
    setYukleniyor(true);
    try {
      await kayitOl({ ad_soyad, eposta, sifre });
      await oturumAc(eposta, sifre);
    } catch (err) {
      Alert.alert('Kayıt Başarısız', err.response?.data?.mesaj || 'Bir hata oluştu.');
    } finally { setYukleniyor(false); }
  };

  const kurumsalKayit = async () => {
    const { ad_soyad, eposta, sifre, sifreTekrar, dukkan_adi, sehir, ilce, vergi_no, yetki_belge_no } = kurumsal;
    if (!ad_soyad || !eposta || !sifre || !dukkan_adi || !sehir || !ilce) {
      Alert.alert('Eksik Alan', 'Tüm zorunlu alanları doldurun.'); return;
    }
    if (sifre.length < 6) { Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.'); return; }
    if (sifre !== sifreTekrar) { Alert.alert('Hata', 'Şifreler eşleşmiyor.'); return; }
    setYukleniyor(true);
    try {
      await kurumsalKayitOl({ ad_soyad, eposta, sifre, dukkan_adi, sehir, ilce, vergi_no, yetki_belge_no });
      await oturumAc(eposta, sifre);
    } catch (err) {
      Alert.alert('Kayıt Başarısız', err.response?.data?.mesaj || 'Bir hata oluştu.');
    } finally { setYukleniyor(false); }
  };

  const bSet = (key) => (v) => setBireysel(f => ({ ...f, [key]: v }));
  const kSet = (key) => (v) => setKurumsal(f => ({ ...f, [key]: v }));

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Gradient Header */}
        <LinearGradient
          colors={['#1e3a8a', '#2563eb', '#3b82f6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.gradientHeader}
        >
          <View style={s.logoWrap}>
            <View style={s.logoIkon}>
              <Ionicons name="home" size={26} color="#fff" />
            </View>
            <Text style={s.logoText}>Emlak<Text style={{ color: '#bfdbfe' }}>Node</Text></Text>
          </View>
          <Text style={s.slogan}>Hesap oluştur, ilan ver</Text>
        </LinearGradient>

        {/* Beyaz Form Kartı */}
        <View style={s.kart}>

          {/* Hesap tipi seçimi */}
          <View style={s.tipSatir}>
            <TouchableOpacity
              style={[s.tipKart, tip === 'bireysel' && s.tipKartSecili]}
              onPress={() => setTip('bireysel')}
              activeOpacity={0.8}
            >
              <Ionicons name="person-outline" size={26} color={tip === 'bireysel' ? '#2563eb' : '#9ca3af'} />
              <Text style={[s.tipLabel, tip === 'bireysel' && s.tipLabelSecili]}>Bireysel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.tipKart, tip === 'kurumsal' && s.tipKartSecili]}
              onPress={() => setTip('kurumsal')}
              activeOpacity={0.8}
            >
              <Ionicons name="business-outline" size={26} color={tip === 'kurumsal' ? '#2563eb' : '#9ca3af'} />
              <Text style={[s.tipLabel, tip === 'kurumsal' && s.tipLabelSecili]}>Emlak Ofisi</Text>
            </TouchableOpacity>
          </View>

          {/* BİREYSEL FORM */}
          {tip === 'bireysel' && (
            <View style={s.form}>
              <InputAlan icon="person-outline" placeholder="Ad Soyad"
                value={bireysel.ad_soyad} onChangeText={bSet('ad_soyad')} />
              <InputAlan icon="mail-outline" placeholder="E-posta adresiniz"
                value={bireysel.eposta} onChangeText={bSet('eposta')} keyboard="email-address" cap="none" />
              <InputAlan icon="lock-closed-outline" placeholder="Şifreniz (min. 6 karakter)"
                value={bireysel.sifre} onChangeText={bSet('sifre')} cap="none"
                sifre gizle={gizle} onGizleToggle={() => setGizle(g => !g)} />
              <InputAlan icon="lock-closed-outline" placeholder="Şifrenizi tekrar girin"
                value={bireysel.sifreTekrar} onChangeText={bSet('sifreTekrar')} cap="none"
                sifre gizle={gizle} onGizleToggle={() => setGizle(g => !g)} />
              <TouchableOpacity style={s.btn} onPress={bireyselKayit} disabled={yukleniyor}>
                {yukleniyor ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Kayıt Ol</Text>}
              </TouchableOpacity>
            </View>
          )}

          {/* KURUMSAL FORM */}
          {tip === 'kurumsal' && (
            <View style={s.form}>
              <InputAlan icon="person-outline" placeholder="Yetkili Adı Soyadı"
                value={kurumsal.ad_soyad} onChangeText={kSet('ad_soyad')} />
              <InputAlan icon="mail-outline" placeholder="E-posta adresiniz"
                value={kurumsal.eposta} onChangeText={kSet('eposta')} keyboard="email-address" cap="none" />
              <InputAlan icon="lock-closed-outline" placeholder="Şifreniz (min. 6 karakter)"
                value={kurumsal.sifre} onChangeText={kSet('sifre')} cap="none"
                sifre gizle={gizle} onGizleToggle={() => setGizle(g => !g)} />
              <InputAlan icon="lock-closed-outline" placeholder="Şifrenizi tekrar girin"
                value={kurumsal.sifreTekrar} onChangeText={kSet('sifreTekrar')} cap="none"
                sifre gizle={gizle} onGizleToggle={() => setGizle(g => !g)} />

              <View style={s.bolumBaslikWrap}>
                <View style={s.bolumCizgi} />
                <Text style={s.bolumBaslik}>Ofis Bilgileri</Text>
                <View style={s.bolumCizgi} />
              </View>

              <InputAlan icon="storefront-outline" placeholder="Ofis / Dükkan Adı"
                value={kurumsal.dukkan_adi} onChangeText={kSet('dukkan_adi')} />
              <InputAlan icon="map-outline" placeholder="Şehir"
                value={kurumsal.sehir} onChangeText={kSet('sehir')} />
              <InputAlan icon="location-outline" placeholder="İlçe"
                value={kurumsal.ilce} onChangeText={kSet('ilce')} />
              <InputAlan icon="document-text-outline" placeholder="Vergi No"
                value={kurumsal.vergi_no} onChangeText={kSet('vergi_no')} keyboard="numeric" cap="none" />
              <InputAlan icon="ribbon-outline" placeholder="Yetki Belge No"
                value={kurumsal.yetki_belge_no} onChangeText={kSet('yetki_belge_no')} cap="none" />

              <TouchableOpacity style={s.btn} onPress={kurumsalKayit} disabled={yukleniyor}>
                {yukleniyor ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Kayıt Ol</Text>}
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity onPress={() => navigation.navigate('Giris')} style={s.girisLink}>
            <Text style={s.girisText}>
              Zaten hesabın var mı?{'  '}
              <Text style={{ color: '#2563eb', fontWeight: '700' }}>Giriş Yap</Text>
            </Text>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  gradientHeader:   { paddingTop: 52, paddingBottom: 32, paddingHorizontal: 28, alignItems: 'center' },
  logoWrap:         { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  logoIkon:         { width: 52, height: 52, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  logoText:         { fontSize: 30, fontWeight: '900', color: '#fff' },
  slogan:           { fontSize: 14, color: '#bfdbfe', fontWeight: '600' },
  kart:             { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -20, paddingHorizontal: 24, paddingTop: 28 },
  tipSatir:         { flexDirection: 'row', gap: 12, marginBottom: 24 },
  tipKart:          { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 18, borderRadius: 16, borderWidth: 2, borderColor: '#e5e7eb', backgroundColor: '#fafafa' },
  tipKartSecili:    { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  tipLabel:         { fontSize: 13, fontWeight: '700', color: '#9ca3af' },
  tipLabelSecili:   { color: '#2563eb' },
  form:             { gap: 12 },
  inputWrap:        { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 4, backgroundColor: '#fafafa' },
  inputIkon:        { marginRight: 10 },
  input:            { flex: 1, fontSize: 15, color: '#111827', paddingVertical: 12 },
  bolumBaslikWrap:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 },
  bolumCizgi:       { flex: 1, height: 1, backgroundColor: '#e5e7eb' },
  bolumBaslik:      { fontSize: 11, fontWeight: '700', color: '#9ca3af', letterSpacing: 0.5 },
  btn:              { backgroundColor: '#2563eb', paddingVertical: 15, borderRadius: 14, alignItems: 'center', marginTop: 6 },
  btnText:          { color: '#fff', fontSize: 16, fontWeight: '800' },
  girisLink:        { alignItems: 'center', marginTop: 24 },
  girisText:        { fontSize: 14, color: '#6b7280' },
});
