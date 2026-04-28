import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MenuItem = ({ icon, label, onPress, badge }) => (
  <TouchableOpacity style={s.menuItem} onPress={onPress}>
    <View style={s.menuSol}>
      <Ionicons name={icon} size={20} color="#374151" style={{ marginRight: 14 }} />
      <Text style={s.menuLabel}>{label}</Text>
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {badge && <View style={s.badge}><Text style={s.badgeText}>{badge}</Text></View>}
      <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
    </View>
  </TouchableOpacity>
);

const Bolum = ({ baslik, children }) => (
  <View style={s.bolum}>
    <Text style={s.bolumBaslik}>{baslik}</Text>
    <View style={s.bolumIcerik}>{children}</View>
  </View>
);

export default function HesabimScreen({ navigation }) {
  const [kullanici, setKullanici] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('kullanici').then(v => {
      if (v) setKullanici(JSON.parse(v));
    });
  }, []);

  const cikis = async () => {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkmak istiyor musunuz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkış Yap', style: 'destructive', onPress: async () => {
          await AsyncStorage.multiRemove(['token', 'kullanici']);
          navigation.reset({ index: 0, routes: [{ name: 'Giris' }] });
        },
      },
    ]);
  };

  const basTurkce = (str = '') =>
    str.split(' ').map(s => s.charAt(0).toUpperCase()).slice(0, 2).join('');

  if (!kullanici) {
    return (
      <View style={s.girisGerekli}>
        <Ionicons name="person-circle-outline" size={72} color="#d1d5db" />
        <Text style={s.girisBaslik}>Hesabınıza Giriş Yapın</Text>
        <Text style={s.girisAlt}>İlanlarınızı yönetmek için giriş yapın.</Text>
        <TouchableOpacity style={s.girisBtn} onPress={() => navigation.navigate('Giris')}>
          <Text style={s.girisBtnText}>Giriş Yap</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Kayit')}>
          <Text style={s.kayitLink}>Hesabın yok mu? <Text style={{ color: '#16a34a', fontWeight: '700' }}>Kayıt Ol</Text></Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      {/* Profil */}
      <View style={s.profil}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{basTurkce(kullanici.ad_soyad)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.profilAd}>{kullanici.ad_soyad}</Text>
          <Text style={s.profilEposta}>{kullanici.eposta}</Text>
          <View style={s.rolBadge}>
            <Text style={s.rolText}>{kullanici.dukkan_id ? 'Kurumsal Hesap' : 'Bireysel Hesap'}</Text>
          </View>
        </View>
      </View>

      {/* Bildirim bandı */}
      <View style={s.bildirimBant}>
        <Ionicons name="notifications-outline" size={20} color="#16a34a" style={{ marginRight: 10 }} />
        <Text style={s.bildirimText}>
          <Text style={{ fontWeight: '700' }}>Favori ilanlarınızdan</Text> ve{' '}
          <Text style={{ fontWeight: '700' }}>size özel fırsatlardan</Text> haberdar olun!
        </Text>
      </View>

      {/* Üyelik */}
      <Bolum baslik="ÜYELİK">
        <MenuItem icon="person-outline" label="Üyelik Bilgilerim" onPress={() => {}} />
      </Bolum>

      {/* İlan Yönetimi */}
      <Bolum baslik="İLAN YÖNETİMİ">
        <MenuItem icon="list-outline"        label="İlanlarım"      onPress={() => navigation.navigate('Ilanlarim')} />
        <MenuItem icon="bar-chart-outline"   label="İlan Raporlarım" onPress={() => {}} />
        <MenuItem icon="add-circle-outline"  label="Yeni İlan Ver"  onPress={() => navigation.navigate('IlanVer')} badge="YENİ" />
      </Bolum>

      {/* Bana Özel */}
      <Bolum baslik="BANA ÖZEL">
        <MenuItem icon="heart-outline"       label="Favori Listelerim"      onPress={() => {}} />
        <MenuItem icon="bookmark-outline"    label="Kayıtlı Aramalarım"    onPress={() => {}} />
        <MenuItem icon="location-outline"    label="Kayıtlı Adreslerim"    onPress={() => {}} />
      </Bolum>

      {/* Çıkış */}
      <View style={s.bolum}>
        <View style={s.bolumIcerik}>
          <TouchableOpacity style={[s.menuItem, { borderBottomWidth: 0 }]} onPress={cikis}>
            <View style={s.menuSol}>
              <Ionicons name="log-out-outline" size={20} color="#ef4444" style={{ marginRight: 14 }} />
              <Text style={[s.menuLabel, { color: '#ef4444' }]}>Çıkış Yap</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#f3f4f6' },
  profil:        { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', padding: 20, marginBottom: 12 },
  avatar:        { width: 56, height: 56, borderRadius: 16, backgroundColor: '#16a34a', justifyContent: 'center', alignItems: 'center' },
  avatarText:    { color: '#fff', fontSize: 18, fontWeight: '900' },
  profilAd:      { fontSize: 17, fontWeight: '800', color: '#111827' },
  profilEposta:  { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  rolBadge:      { marginTop: 6, alignSelf: 'flex-start', backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  rolText:       { fontSize: 11, fontWeight: '700', color: '#16a34a' },
  bildirimBant:  { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#f0fdf4', marginHorizontal: 16, marginBottom: 12, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#bbf7d0' },
  bildirimText:  { flex: 1, fontSize: 13, color: '#374151', lineHeight: 20 },
  bolum:         { marginBottom: 12 },
  bolumBaslik:   { fontSize: 11, fontWeight: '700', color: '#9ca3af', paddingHorizontal: 20, paddingVertical: 8, letterSpacing: 0.8 },
  bolumIcerik:   { backgroundColor: '#fff' },
  menuItem:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  menuSol:       { flexDirection: 'row', alignItems: 'center' },
  menuLabel:     { fontSize: 15, color: '#111827', fontWeight: '500' },
  badge:         { backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeText:     { fontSize: 10, fontWeight: '800', color: '#16a34a' },
  girisGerekli:  { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 40, backgroundColor: '#f9fafb' },
  girisBaslik:   { fontSize: 20, fontWeight: '800', color: '#111827' },
  girisAlt:      { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  girisBtn:      { backgroundColor: '#16a34a', paddingHorizontal: 40, paddingVertical: 14, borderRadius: 14, marginTop: 8 },
  girisBtnText:  { color: '#fff', fontSize: 15, fontWeight: '800' },
  kayitLink:     { fontSize: 14, color: '#6b7280', marginTop: 4 },
});
