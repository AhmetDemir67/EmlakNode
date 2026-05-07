import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetToAna } from '../services/navigationRef';

const MenuItem = ({ icon, iconBg, label, alt, onPress, badge, danger }) => (
  <TouchableOpacity style={s.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={[s.menuIkon, { backgroundColor: iconBg || '#f3f4f6' }]}>
      <Ionicons name={icon} size={20} color={danger ? '#ef4444' : '#16a34a'} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={[s.menuLabel, danger && { color: '#ef4444' }]}>{label}</Text>
      {alt ? <Text style={s.menuAlt}>{alt}</Text> : null}
    </View>
    {badge ? (
      <View style={s.badge}><Text style={s.badgeText}>{badge}</Text></View>
    ) : null}
    {!danger ? <Ionicons name="chevron-forward" size={16} color="#d1d5db" /> : null}
  </TouchableOpacity>
);

const basTurkce = (str = '') =>
  str.split(' ').map(s => s.charAt(0).toUpperCase()).slice(0, 2).join('');

export default function HesabimScreen({ navigation }) {
  const [kullanici, setKullanici] = useState(null);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('kullanici').then(v => {
        setKullanici(v ? JSON.parse(v) : null);
      });
    }, [])
  );

  const cikis = () => {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkmak istiyor musunuz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkış Yap', style: 'destructive', onPress: async () => {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('kullanici');
          resetToAna();
        },
      },
    ]);
  };

  const yakinda = (ozellik) =>
    Alert.alert(ozellik, 'Bu özellik yakında eklenecek.');

  if (!kullanici) {
    return (
      <View style={s.girisGerekli}>
        <View style={s.avatarBuyuk}>
          <Ionicons name="person" size={44} color="#fff" />
        </View>
        <Text style={s.girisBaslik}>Hesabınıza Giriş Yapın</Text>
        <Text style={s.girisAlt}>İlanlarınızı yönetmek ve daha fazlası için giriş yapın.</Text>
        <TouchableOpacity style={s.girisBtn} onPress={() => navigation.navigate('Giris')}>
          <Text style={s.girisBtnText}>Giriş Yap</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.kayitBtn} onPress={() => navigation.navigate('Kayit')}>
          <Text style={s.kayitBtnText}>Hesabın yok mu? Kayıt Ol</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>

      {/* Profil Kartı */}
      <View style={s.profilKart}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{basTurkce(kullanici.ad_soyad)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.profilAd}>{kullanici.ad_soyad}</Text>
          <Text style={s.profilEposta}>{kullanici.eposta}</Text>
          <View style={s.rolBadge}>
            <Ionicons
              name={kullanici.dukkan_id ? 'business-outline' : 'person-outline'}
              size={11}
              color="#16a34a"
              style={{ marginRight: 4 }}
            />
            <Text style={s.rolText}>{kullanici.dukkan_id ? 'Kurumsal Hesap' : 'Bireysel Hesap'}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={s.duzenleBtn}
          onPress={() => yakinda('Profil Düzenle')}
        >
          <Ionicons name="pencil-outline" size={16} color="#16a34a" />
        </TouchableOpacity>
      </View>

      {/* İlan Yönetimi */}
      <View style={s.grup}>
        <Text style={s.grupBaslik}>İLAN YÖNETİMİ</Text>
        <View style={s.grupKutu}>
          <MenuItem
            icon="list-outline"
            iconBg="#f0fdf4"
            label="İlanlarım"
            alt="Aktif ve pasif ilanlarınız"
            onPress={() => navigation.navigate('Ilanlarim')}
          />
          <MenuItem
            icon="add-circle-outline"
            iconBg="#f0fdf4"
            label="Yeni İlan Ver"
            onPress={() => navigation.navigate('IlanVer')}
            badge="YENİ"
          />
        </View>
      </View>

      {/* Bana Özel */}
      <View style={s.grup}>
        <Text style={s.grupBaslik}>BANA ÖZEL</Text>
        <View style={s.grupKutu}>
          <MenuItem
            icon="heart-outline"
            iconBg="#fff1f2"
            label="Favorilerim"
            alt="Beğendiğin ilanlar"
            onPress={() => navigation.navigate('Favoriler')}
          />
          <MenuItem
            icon="search-outline"
            iconBg="#eff6ff"
            label="Kayıtlı Aramalarım"
            onPress={() => navigation.navigate('KayitliAramalar')}
          />
          <MenuItem
            icon="location-outline"
            iconBg="#faf5ff"
            label="Kayıtlı Adreslerim"
            onPress={() => navigation.navigate('KayitliAdresler')}
          />
        </View>
      </View>

      {/* Hesap */}
      <View style={s.grup}>
        <Text style={s.grupBaslik}>HESAP</Text>
        <View style={s.grupKutu}>
          <MenuItem
            icon="person-outline"
            iconBg="#f0fdf4"
            label="Üyelik Bilgilerim"
            alt="Ad, e-posta, telefon, şifre"
            onPress={() => navigation.navigate('ProfilDuzenle')}
          />
          <MenuItem
            icon="notifications-outline"
            iconBg="#fff7ed"
            label="Bildirim Ayarları"
            onPress={() => yakinda('Bildirim Ayarları')}
          />
          <MenuItem
            icon="shield-checkmark-outline"
            iconBg="#f0fdf4"
            label="Gizlilik ve Güvenlik"
            onPress={() => yakinda('Gizlilik')}
          />
        </View>
      </View>

      {/* Diğer */}
      <View style={s.grup}>
        <Text style={s.grupBaslik}>DİĞER</Text>
        <View style={s.grupKutu}>
          <MenuItem
            icon="help-circle-outline"
            iconBg="#f0f9ff"
            label="Yardım & Destek"
            onPress={() => yakinda('Yardım')}
          />
          <MenuItem
            icon="information-circle-outline"
            iconBg="#f5f3ff"
            label="Uygulama Hakkında"
            onPress={() => Alert.alert('EmlakNode', 'Sürüm 1.0.0\nGeliştirici: EmlakNode Ekibi')}
          />
          <MenuItem
            icon="log-out-outline"
            iconBg="#fff1f2"
            label="Çıkış Yap"
            onPress={cikis}
            danger
          />
        </View>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#f5f5f5' },

  profilKart:     { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', margin: 16, borderRadius: 20, padding: 18, elevation: 1, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  avatar:         { width: 60, height: 60, borderRadius: 30, backgroundColor: '#16a34a', justifyContent: 'center', alignItems: 'center' },
  avatarText:     { color: '#fff', fontSize: 20, fontWeight: '900' },
  profilAd:       { fontSize: 17, fontWeight: '800', color: '#111827' },
  profilEposta:   { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  rolBadge:       { flexDirection: 'row', alignItems: 'center', marginTop: 6, alignSelf: 'flex-start', backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: '#bbf7d0' },
  rolText:        { fontSize: 11, fontWeight: '700', color: '#16a34a' },
  duzenleBtn:     { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center' },

  grup:           { marginBottom: 4 },
  grupBaslik:     { fontSize: 11, fontWeight: '700', color: '#9ca3af', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, letterSpacing: 0.8 },
  grupKutu:       { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#f0f0f0' },

  menuItem:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, gap: 12, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  menuIkon:       { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuLabel:      { fontSize: 15, fontWeight: '600', color: '#111827' },
  menuAlt:        { fontSize: 12, color: '#9ca3af', marginTop: 1 },
  badge:          { backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginRight: 4 },
  badgeText:      { fontSize: 10, fontWeight: '800', color: '#16a34a' },

  girisGerekli:   { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 40, backgroundColor: '#f9fafb' },
  avatarBuyuk:    { width: 90, height: 90, borderRadius: 45, backgroundColor: '#d1d5db', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  girisBaslik:    { fontSize: 20, fontWeight: '800', color: '#111827' },
  girisAlt:       { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 22 },
  girisBtn:       { backgroundColor: '#16a34a', paddingHorizontal: 48, paddingVertical: 15, borderRadius: 14, marginTop: 8, width: '100%', alignItems: 'center' },
  girisBtnText:   { color: '#fff', fontSize: 16, fontWeight: '800' },
  kayitBtn:       { paddingVertical: 12 },
  kayitBtnText:   { fontSize: 14, color: '#16a34a', fontWeight: '700' },
});
