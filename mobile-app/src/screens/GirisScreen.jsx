import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { girisYap } from '../services/api';

export default function GirisScreen({ navigation }) {
  const [eposta, setEposta]         = useState('');
  const [sifre, setSifre]           = useState('');
  const [gizle, setGizle]           = useState(true);
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
    <View style={s.container}>
      <LinearGradient
        colors={['#1e3a8a', '#2563eb', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.ustKisim}
      >
        <View style={s.logoWrap}>
          <View style={s.logoIkon}>
            <Ionicons name="home" size={30} color="#fff" />
          </View>
          <Text style={s.logoText}>Emlak<Text style={{ color: '#bfdbfe' }}>Node</Text></Text>
        </View>
        <Text style={s.slogan}>Hayalindeki evi bul</Text>
        <Text style={s.altSlogan}>Binlerce ilan, güvenilir danışmanlar</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        style={s.altKisim}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={s.formBaslik}>Giriş Yapın</Text>

        <View style={s.form}>
          <View style={s.inputWrap}>
            <Ionicons name="mail-outline" size={18} color="#9ca3af" style={s.inputIkon} />
            <TextInput
              style={s.input}
              placeholder="E-posta adresiniz"
              placeholderTextColor="#9ca3af"
              value={eposta}
              onChangeText={setEposta}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={s.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color="#9ca3af" style={s.inputIkon} />
            <TextInput
              style={s.input}
              placeholder="Şifreniz"
              placeholderTextColor="#9ca3af"
              value={sifre}
              onChangeText={setSifre}
              secureTextEntry={gizle}
            />
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
            Hesabın yok mu?{'  '}
            <Text style={{ color: '#2563eb', fontWeight: '700' }}>Kayıt Ol</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#2563eb' },
  ustKisim:   { paddingTop: 64, paddingBottom: 52, paddingHorizontal: 28, alignItems: 'center' },
  logoWrap:   { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  logoIkon:   { width: 56, height: 56, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  logoText:   { fontSize: 32, fontWeight: '900', color: '#fff' },
  slogan:     { fontSize: 17, fontWeight: '700', color: '#fff', marginBottom: 6 },
  altSlogan:  { fontSize: 13, color: '#bfdbfe' },
  altKisim:   { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 28, paddingTop: 32, paddingBottom: 24 },
  formBaslik: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 24 },
  form:       { gap: 14 },
  inputWrap:  { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 4, backgroundColor: '#fafafa' },
  inputIkon:  { marginRight: 10 },
  input:      { flex: 1, fontSize: 15, color: '#111827', paddingVertical: 12 },
  btn:        { backgroundColor: '#2563eb', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 6 },
  btnText:    { color: '#fff', fontSize: 16, fontWeight: '800' },
  kayitLink:  { alignItems: 'center', marginTop: 24 },
  kayitText:  { fontSize: 14, color: '#6b7280' },
});
