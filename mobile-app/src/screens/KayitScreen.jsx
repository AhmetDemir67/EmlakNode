import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { kayitOl, girisYap } from '../services/api';

export default function KayitScreen({ navigation }) {
  const [form, setForm]           = useState({ ad_soyad: '', eposta: '', sifre: '', sifreTekrar: '' });
  const [gizle, setGizle]         = useState(true);
  const [yukleniyor, setYukleniyor] = useState(false);

  const kayit = async () => {
    if (!form.ad_soyad || !form.eposta || !form.sifre) {
      Alert.alert('Eksik Alan', 'Tüm alanları doldurun.'); return;
    }
    if (form.sifre !== form.sifreTekrar) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.'); return;
    }
    if (form.sifre.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.'); return;
    }
    setYukleniyor(true);
    try {
      await kayitOl({ ad_soyad: form.ad_soyad, eposta: form.eposta, sifre: form.sifre });
      const r = await girisYap({ eposta: form.eposta, sifre: form.sifre });
      await AsyncStorage.setItem('token', r.data.token);
      await AsyncStorage.setItem('kullanici', JSON.stringify(r.data.kullanici));
      navigation.reset({ index: 0, routes: [{ name: 'Ana' }] });
    } catch (err) {
      Alert.alert('Kayıt Başarısız', err.response?.data?.mesaj || 'Bir hata oluştu.');
    } finally { setYukleniyor(false); }
  };

  const alan = (key, placeholder, opts = {}) => (
    <View style={s.inputWrap}>
      <Ionicons name={opts.icon || 'person-outline'} size={18} color="#9ca3af" style={s.inputIkon} />
      <TextInput
        style={s.input}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        value={form[key]}
        onChangeText={v => setForm(f => ({ ...f, [key]: v }))}
        keyboardType={opts.keyboard || 'default'}
        autoCapitalize={opts.cap || 'sentences'}
        secureTextEntry={opts.sifre ? gizle : false}
      />
      {opts.sifre && (
        <TouchableOpacity onPress={() => setGizle(!gizle)} style={{ padding: 4 }}>
          <Ionicons name={gizle ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9ca3af" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={s.logo}>
          <View style={s.logoIkon}><Ionicons name="home" size={28} color="#fff" /></View>
          <Text style={s.logoText}>Emlak<Text style={{ color: '#16a34a' }}>Node</Text></Text>
        </View>
        <Text style={s.altBaslik}>Yeni hesap oluşturun</Text>

        <View style={s.form}>
          {alan('ad_soyad', 'Ad Soyad', { icon: 'person-outline' })}
          {alan('eposta', 'E-posta adresiniz', { icon: 'mail-outline', keyboard: 'email-address', cap: 'none' })}
          {alan('sifre', 'Şifreniz (min. 6 karakter)', { icon: 'lock-closed-outline', sifre: true, cap: 'none' })}
          {alan('sifreTekrar', 'Şifrenizi tekrar girin', { icon: 'lock-closed-outline', cap: 'none' })}

          <TouchableOpacity style={s.btn} onPress={kayit} disabled={yukleniyor}>
            {yukleniyor
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnText}>Kayıt Ol</Text>
            }
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Giris')} style={s.girisLink}>
          <Text style={s.girisText}>
            Zaten hesabın var mı?{'  '}<Text style={{ color: '#16a34a', fontWeight: '700' }}>Giriş Yap</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container:  { flexGrow: 1, justifyContent: 'center', padding: 28, backgroundColor: '#fff' },
  logo:       { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  logoIkon:   { width: 52, height: 52, backgroundColor: '#16a34a', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  logoText:   { fontSize: 32, fontWeight: '900', color: '#111827' },
  altBaslik:  { fontSize: 15, color: '#6b7280', marginBottom: 32 },
  form:       { gap: 14 },
  inputWrap:  { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 4, backgroundColor: '#fafafa' },
  inputIkon:  { marginRight: 10 },
  input:      { flex: 1, fontSize: 15, color: '#111827', paddingVertical: 12 },
  btn:        { backgroundColor: '#16a34a', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 6 },
  btnText:    { color: '#fff', fontSize: 16, fontWeight: '800' },
  girisLink:  { alignItems: 'center', marginTop: 24 },
  girisText:  { fontSize: 14, color: '#6b7280' },
});
