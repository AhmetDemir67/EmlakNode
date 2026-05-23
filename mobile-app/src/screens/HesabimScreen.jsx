import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Switch, StatusBar, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetToAna } from '../services/navigationRef';
import { useTheme } from '../context/ThemeContext';

/* ─── Yardımcı bileşenler ─── */

const MenuItem = ({ icon, iconBg, iconColor, label, alt, onPress, badge, danger, son, colors }) => (
  <TouchableOpacity
    style={[{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, gap: 12, borderBottomWidth: son ? 0 : 1, borderBottomColor: colors.border }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[s.menuIkon, { backgroundColor: danger ? '#fff1f2' : (iconBg || colors.bg) }]}>
      <Ionicons name={icon} size={20} color={danger ? '#ef4444' : (iconColor || '#2563eb')} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={[s.menuLabel, { color: danger ? '#ef4444' : colors.text }]}>{label}</Text>
      {alt ? <Text style={[s.menuAlt, { color: colors.textMuted }]}>{alt}</Text> : null}
    </View>
    {badge ? <View style={[s.badge, { backgroundColor: colors.badge }]}><Text style={[s.badgeText, { color: colors.badgeText }]}>{badge}</Text></View> : null}
    {!danger && <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />}
  </TouchableOpacity>
);

const HizliKart = ({ icon, label, renk, onPress, colors }) => (
  <TouchableOpacity style={s.hizliKart} onPress={onPress} activeOpacity={0.8}>
    <View style={[s.hizliIkon, { backgroundColor: renk + '20' }]}>
      <Ionicons name={icon} size={22} color={renk} />
    </View>
    <Text style={[s.hizliLabel, { color: colors.text }]}>{label}</Text>
  </TouchableOpacity>
);

/* ─── İlk harfler ─── */
const bas = (str = '') =>
  str.split(' ').map(w => w.charAt(0).toUpperCase()).slice(0, 2).join('');

/* ─── Ana ekran ─── */
export default function HesabimScreen({ navigation }) {
  const [kullanici, setKullanici] = useState(null);
  const { tema, toggle, colors } = useTheme();

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('kullanici').then(v => {
        setKullanici(v ? JSON.parse(v) : null);
      });
    }, [])
  );

  const cikis = () =>
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

  /* ── Giriş yapılmamış ── */
  if (!kullanici) {
    return (
      <View style={[s.girisEkran, { backgroundColor: colors.card }]}>
        <StatusBar barStyle={tema === 'dark' ? 'light-content' : 'dark-content'} />
        <View style={[s.girisIkon, { backgroundColor: '#eff6ff' }]}>
          <Ionicons name="home" size={40} color="#2563eb" />
        </View>
        <Text style={[s.girisBaslik, { color: colors.text }]}>EmlakNode'a Hoş Geldiniz</Text>
        <Text style={[s.girisAlt, { color: colors.textSecondary }]}>
          İlanlarınızı yönetmek, favori ilanlarınızı kaydetmek ve daha fazlası için giriş yapın.
        </Text>
        <TouchableOpacity style={s.girisBtn} onPress={() => navigation.navigate('Giris')}>
          <Ionicons name="log-in-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={s.girisBtnText}>Giriş Yap</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.kayitBtn} onPress={() => navigation.navigate('Kayit')}>
          <Text style={[s.kayitBtnText, { color: colors.textSecondary }]}>Hesabın yok mu? <Text style={{ color: '#2563eb', fontWeight: '700' }}>Kayıt Ol</Text></Text>
        </TouchableOpacity>
      </View>
    );
  }

  const kurumsal = !!kullanici.dukkan_id;

  return (
    <ScrollView style={[s.container, { backgroundColor: colors.bg }]} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" />

      {/* ── YEŞİL HEADER BANNER ── */}
      <LinearGradient colors={['#1e3a8a', '#2563eb', '#3b82f6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.banner}>
        <TouchableOpacity
          style={s.duzenleBtn}
          onPress={() => navigation.navigate('ProfilDuzenle')}
        >
          <Ionicons name="pencil-outline" size={18} color="#fff" />
        </TouchableOpacity>

        <View style={s.avatarWrap}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{bas(kullanici.ad_soyad)}</Text>
          </View>
          {kurumsal && (
            <View style={s.kurumsalRozet}>
              <Ionicons name="business" size={12} color="#fff" />
            </View>
          )}
        </View>

        <Text style={s.bannerAd}>{kullanici.ad_soyad}</Text>
        <Text style={s.bannerEposta}>{kullanici.eposta}</Text>

        <View style={s.rolBadge}>
          <Ionicons
            name={kurumsal ? 'business-outline' : 'person-outline'}
            size={11} color="#fff" style={{ marginRight: 4 }}
          />
          <Text style={s.rolText}>{kurumsal ? 'Kurumsal Hesap' : 'Bireysel Hesap'}</Text>
        </View>
      </LinearGradient>

      {/* ── HIZLI AKSİYONLAR ── */}
      <View style={[s.hizliRow, { backgroundColor: colors.card }]}>
        <HizliKart icon="list-outline"  label="İlanlarım"   renk="#2563eb" onPress={() => navigation.navigate('Ilanlarim')} colors={colors} />
        <HizliKart icon="heart-outline" label="Favorilerim" renk="#ef4444" onPress={() => navigation.navigate('Favoriler')} colors={colors} />
        {kurumsal ? (
          <HizliKart icon="people-outline" label="Danışmanlar" renk="#3b82f6" onPress={() => navigation.navigate('Danismanlarim')} colors={colors} />
        ) : (
          <HizliKart icon="search-outline" label="Aramalarım" renk="#8b5cf6" onPress={() => navigation.navigate('KayitliAramalar')} colors={colors} />
        )}
      </View>

      {/* ── KURUMSAL: DÜKKAN PROFİLİ ── */}
      {kurumsal && (
        <View style={s.grup}>
          <Text style={[s.grupBaslik, { color: colors.grupBaslik }]}>DÜKKAN PROFİLİ</Text>
          <View style={[s.grupKutu, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <MenuItem icon="business-outline" iconBg="#eff6ff" iconColor="#3b82f6" label="Dükkan Bilgilerim" alt="Ofis adı, konum, lisans" onPress={() => navigation.navigate('DukkanBilgileri')} colors={colors} />
            <MenuItem icon="people-outline" iconBg="#eff6ff" iconColor="#3b82f6" label="Danışmanlarım" alt="Ekip yönetimi" onPress={() => navigation.navigate('Danismanlarim')} colors={colors} />
            <MenuItem icon="stats-chart-outline" iconBg="#eff6ff" iconColor="#3b82f6" label="İstatistikler" alt="Görüntülenme ve tıklanma verileri" onPress={() => navigation.navigate('Istatistikler')} son colors={colors} />
          </View>
        </View>
      )}

      {/* ── İLAN YÖNETİMİ ── */}
      <View style={s.grup}>
        <Text style={[s.grupBaslik, { color: colors.grupBaslik }]}>İLAN YÖNETİMİ</Text>
        <View style={[s.grupKutu, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MenuItem icon="home-outline" iconBg="#eff6ff" label="İlanlarım" alt="Aktif ve pasif ilanlarınız" onPress={() => navigation.navigate('Ilanlarim')} colors={colors} />
          <MenuItem icon="add-circle-outline" iconBg="#eff6ff" label="Yeni İlan Ver" alt={kurumsal ? 'Sınırsız ilan hakkı' : 'Bireysel hesap: 3 ilan hakkı'} onPress={() => navigation.navigate('IlanVer')} badge="YENİ" son colors={colors} />
        </View>
      </View>

      {/* ── BANA ÖZEL ── */}
      <View style={s.grup}>
        <Text style={[s.grupBaslik, { color: colors.grupBaslik }]}>BANA ÖZEL</Text>
        <View style={[s.grupKutu, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MenuItem icon="heart-outline" iconBg="#fff1f2" iconColor="#ef4444" label="Favorilerim" alt="Beğendiğin ilanlar" onPress={() => navigation.navigate('Favoriler')} colors={colors} />
          <MenuItem icon="bookmark-outline" iconBg="#eff6ff" iconColor="#3b82f6" label="Kayıtlı Aramalarım" alt="Kaydedilmiş filtreler" onPress={() => navigation.navigate('KayitliAramalar')} colors={colors} />
          <MenuItem icon="location-outline" iconBg="#faf5ff" iconColor="#8b5cf6" label="Kayıtlı Adreslerim" alt="Ev, iş, okul..." onPress={() => navigation.navigate('KayitliAdresler')} son colors={colors} />
        </View>
      </View>

      {/* ── HESAP ── */}
      <View style={s.grup}>
        <Text style={[s.grupBaslik, { color: colors.grupBaslik }]}>HESAP</Text>
        <View style={[s.grupKutu, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MenuItem icon="person-circle-outline" iconBg="#eff6ff" label="Üyelik Bilgilerim" alt="Ad, e-posta, telefon, şifre" onPress={() => navigation.navigate('ProfilDuzenle')} colors={colors} />
          <MenuItem icon="notifications-outline" iconBg="#fff7ed" iconColor="#f97316" label="Bildirim Ayarları" onPress={() => Linking.openSettings()} colors={colors} />
          <MenuItem icon="shield-checkmark-outline" iconBg="#eff6ff" label="Gizlilik ve Güvenlik" onPress={() => navigation.navigate('GizlilikGuvenlik')} son colors={colors} />
        </View>
      </View>

      {/* ── GÖRÜNÜM ── */}
      <View style={s.grup}>
        <Text style={[s.grupBaslik, { color: colors.grupBaslik }]}>GÖRÜNÜM</Text>
        <View style={[s.grupKutu, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, gap: 12 }]}>
            <View style={[s.menuIkon, { backgroundColor: tema === 'dark' ? '#1e293b' : '#f1f5f9' }]}>
              <Ionicons name={tema === 'dark' ? 'moon' : 'sunny-outline'} size={20} color={tema === 'dark' ? '#93c5fd' : '#f97316'} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.menuLabel, { color: colors.text }]}>Karanlık Mod</Text>
              <Text style={[s.menuAlt, { color: colors.textMuted }]}>{tema === 'dark' ? 'Açık' : 'Kapalı'}</Text>
            </View>
            <Switch
              value={tema === 'dark'}
              onValueChange={toggle}
              trackColor={{ false: '#e5e7eb', true: '#2563eb' }}
              thumbColor={tema === 'dark' ? '#fff' : '#f4f4f5'}
            />
          </View>
        </View>
      </View>

      {/* ── DİĞER ── */}
      <View style={s.grup}>
        <Text style={[s.grupBaslik, { color: colors.grupBaslik }]}>DİĞER</Text>
        <View style={[s.grupKutu, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MenuItem icon="help-circle-outline" iconBg="#f0f9ff" iconColor="#0ea5e9" label="Yardım & Destek" onPress={() => navigation.navigate('YardimDestek')} colors={colors} />
          <MenuItem icon="information-circle-outline" iconBg="#f5f3ff" iconColor="#8b5cf6" label="Uygulama Hakkında" onPress={() => Alert.alert('EmlakNode', 'Sürüm 1.0.0\nGeliştirici: EmlakNode Ekibi')} colors={colors} />
          <MenuItem icon="log-out-outline" iconBg="#fff1f2" label="Çıkış Yap" onPress={cikis} danger son colors={colors} />
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },

  /* ── Giriş ekranı ── */
  girisEkran:   { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 40 },
  girisIkon:    { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  girisBaslik:  { fontSize: 22, fontWeight: '900', textAlign: 'center' },
  girisAlt:     { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  girisBtn:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563eb', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 14, marginTop: 8, width: '100%', justifyContent: 'center' },
  girisBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  kayitBtn:     { paddingVertical: 12 },
  kayitBtnText: { fontSize: 14 },

  /* ── Banner ── */
  banner:       { paddingTop: 52, paddingBottom: 32, alignItems: 'center', gap: 6 },
  duzenleBtn:   { position: 'absolute', top: 52, right: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  avatarWrap:   { position: 'relative', marginBottom: 4 },
  avatar:       { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' },
  avatarText:   { fontSize: 28, fontWeight: '900', color: '#2563eb' },
  kurumsalRozet:{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#2563eb' },
  bannerAd:     { fontSize: 20, fontWeight: '900', color: '#fff' },
  bannerEposta: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  rolBadge:     { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  rolText:      { fontSize: 12, fontWeight: '700', color: '#fff' },

  /* ── Hızlı aksiyonlar ── */
  hizliRow:     { flexDirection: 'row', marginHorizontal: 16, marginTop: -16, borderRadius: 16, padding: 16, gap: 8, elevation: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  hizliKart:    { flex: 1, alignItems: 'center', gap: 8 },
  hizliIkon:    { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  hizliLabel:   { fontSize: 11, fontWeight: '700', textAlign: 'center' },

  /* ── Gruplar ── */
  grup:         { marginTop: 20 },
  grupBaslik:   { fontSize: 11, fontWeight: '700', paddingHorizontal: 20, paddingBottom: 8, letterSpacing: 0.8 },
  grupKutu:     { marginHorizontal: 16, borderRadius: 16, overflow: 'hidden', borderWidth: 1 },

  /* ── Menu item ── */
  menuIkon:     { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuLabel:    { fontSize: 15, fontWeight: '600' },
  menuAlt:      { fontSize: 12, marginTop: 1 },
  badge:        { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginRight: 4 },
  badgeText:    { fontSize: 10, fontWeight: '800' },
});
