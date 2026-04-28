import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { girisYap } from '../services/api';

export default function GirisScreen({ navigation }) {
  const [eposta, setEposta]       = useState('');
  const [sifre, setSifre]         = useState('');
  const [gizle, setGizle]         = useState(true);
  const [yukleniyor, setYukleniyor] = useState(false);

  const giris = async () => {
    if (!eposta || !sifre) { Alert.alert('Hata', 'E-posta ve şifre zorunludur.'); return; }
    setYukleniyor(true);
    try {
      const r = await girisYap({ eposta, sifre });
      await AsyncStorage.setItem('token', r.data.token);
      await AsyncStorage.setItem('kullanici', JSON.stringify(r.data.kullanici));
      navigation.reset({ index: 0, routes: [{ name: 'Ana' }] });
    } catch (err) {
      Alert.alert('Giriş Başarısız', err.response?.data?.mesaj || 'E-posta veya şifre hatalı.');
    } finally { setYukleniyor(false); }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.icerik}>
        {/* Logo */}
        <View style={s.logo}>
          <View style={s.logoIkon}><Ionicons name="home" size={28} color="#fff" /></View>
          <Text style={s.logoText}>Emlak<Text style={{ color: '#16a34a' }}>Node</Text></Text>
        </View>
        <Text style={s.altBaslik}>Hesabınıza giriş yapın</Text>

        {/* Form */}
        <View style={s.form}>
          <View style={s.inputWrap}>
            <Ionicons name="mail-outline" size={18} color="#9ca3af" style={s.inputIkon} />
            <TextInput style={s.input} placeholder="E-posta adresiniz" placeholderTextColor="#9ca3af"
              value={eposta} onChangeText={setEposta} keyboardType="email-address" autoCapitalize="none" />
          </View>

          <View style={s.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color="#9ca3af" style={s.inputIkon} />
            <TextInput style={s.input} placeholder="Şifreniz" placeholderTextColor="#9ca3af"
              value={sifre} onChangeText={setSifre} secureTextEntry={gizle} />
            <TouchableOpacity onPress={() => setGizle(!gizle)} style={{ padding: 4 }}>
              <Ionicons name={gizle ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={s.btn} onPress={giris} disabled={yukleniyor}>
            {yukleniyor
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnText}>Giriş Yap</Text>
            }
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Kayit')} style={s.kayitLink}>
          <Text style={s.kayitText}>
            Hesabın yok mu?{'  '}<Text style={{ color: '#16a34a', fontWeight: '700' }}>Kayıt Ol</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#fff' },
  icerik:     { flex: 1, justifyContent: 'center', padding: 28 },
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
  kayitLink:  { alignItems: 'center', marginTop: 24 },
  kayitText:  { fontSize: 14, color: '#6b7280' },
});
