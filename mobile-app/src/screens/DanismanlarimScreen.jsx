import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { danismanlarGetir, danismanEkle, danismanCikar } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const ROL_RENK = {
  patron:   { bg: '#fef9c3', text: '#854d0e', darkBg: '#422006', darkText: '#fde68a', label: 'Patron' },
  danisman: { bg: '#dbeafe', text: '#1e40af', darkBg: '#1e3a5f', darkText: '#93c5fd', label: 'Danışman' },
  admin:    { bg: '#fce7f3', text: '#9d174d', darkBg: '#4a0d2a', darkText: '#f9a8d4', label: 'Admin' },
};

const bas = (str = '') =>
  str.split(' ').map(w => w.charAt(0).toUpperCase()).slice(0, 2).join('');

export default function DanismanlarimScreen({ navigation }) {
  const { colors, tema } = useTheme();
  const [danismanlar, setDanismanlar]   = useState([]);
  const [yukleniyor, setYukleniyor]     = useState(true);
  const [dukkanId, setDukkanId]         = useState(null);
  const [benimId, setBenimId]           = useState(null);
  const [modalAcik, setModalAcik]       = useState(false);
  const [eposta, setEposta]             = useState('');
  const [ekleniyor, setEkleniyor]       = useState(false);

  useFocusEffect(
    useCallback(() => {
      const yukle = async () => {
        setYukleniyor(true);
        try {
          const v = await AsyncStorage.getItem('kullanici');
          if (!v) return;
          const k = JSON.parse(v);
          setDukkanId(k.dukkan_id);
          setBenimId(k.id);
          const r = await danismanlarGetir(k.dukkan_id);
          setDanismanlar(r.data.danismanlar || []);
        } catch {
          Alert.alert('Hata', 'Danışmanlar yüklenemedi.');
        } finally {
          setYukleniyor(false);
        }
      };
      yukle();
    }, [])
  );

  const danismanEkleSubmit = async () => {
    if (!eposta.trim()) { Alert.alert('Hata', 'E-posta adresi zorunludur.'); return; }
    setEkleniyor(true);
    try {
      await danismanEkle(dukkanId, { eposta: eposta.trim() });
      setModalAcik(false);
      setEposta('');
      // Listeyi yenile
      const r = await danismanlarGetir(dukkanId);
      setDanismanlar(r.data.danismanlar || []);
      Alert.alert('Başarılı', 'Danışman ekibinize eklendi.');
    } catch (err) {
      Alert.alert('Hata', err.response?.data?.mesaj || 'Danışman eklenemedi.');
    } finally {
      setEkleniyor(false);
    }
  };

  const danismanCikarOnay = (item) => {
    Alert.alert(
      'Danışmanı Çıkar',
      `${item.ad_soyad} ekipten çıkarılsın mı?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkar', style: 'destructive', onPress: async () => {
            try {
              await danismanCikar(dukkanId, item.id);
              setDanismanlar(prev => prev.filter(d => d.id !== item.id));
            } catch (err) {
              Alert.alert('Hata', err.response?.data?.mesaj || 'İşlem başarısız.');
            }
          },
        },
      ]
    );
  };

  if (yukleniyor) {
    return (
      <View style={[s.merkez, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={[s.container, { backgroundColor: colors.bg }]}>
      {/* Banner */}
      <LinearGradient colors={['#1e3a8a', '#2563eb']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.banner}>
        {[
          { sayi: danismanlar.length, label: 'Toplam Ekip' },
          { sayi: danismanlar.filter(d => d.rol === 'patron').length, label: 'Patron' },
          { sayi: danismanlar.filter(d => d.rol === 'danisman').length, label: 'Danışman' },
          { sayi: danismanlar.reduce((t, d) => t + (d.ilan_sayisi || 0), 0), label: 'Toplam İlan' },
        ].map((b, i, arr) => (
          <React.Fragment key={b.label}>
            <View style={s.bannerKart}>
              <Text style={s.bannerSayi}>{b.sayi}</Text>
              <Text style={s.bannerLabel}>{b.label}</Text>
            </View>
            {i < arr.length - 1 && <View style={s.bannerAyrac} />}
          </React.Fragment>
        ))}
      </LinearGradient>

      <FlatList
        data={danismanlar}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        renderItem={({ item }) => {
          const rol = ROL_RENK[item.rol] || ROL_RENK.danisman;
          const rolBg   = tema === 'dark' ? rol.darkBg   : rol.bg;
          const rolText = tema === 'dark' ? rol.darkText  : rol.text;
          const tarih = new Date(item.olusturulma_tarihi).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' });
          const benimHesabim = parseInt(item.id) === parseInt(benimId);
          return (
            <View style={[s.kart, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[s.avatar, { backgroundColor: '#3b82f6' }]}>
                <Text style={s.avatarText}>{bas(item.ad_soyad)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={s.ustSatir}>
                  <Text style={[s.ad, { color: colors.text }]}>{item.ad_soyad}</Text>
                  <View style={[s.rolBadge, { backgroundColor: rolBg }]}>
                    <Text style={[s.rolText, { color: rolText }]}>{rol.label}</Text>
                  </View>
                </View>
                <Text style={[s.eposta, { color: colors.textMuted }]}>{item.eposta}</Text>
                <View style={s.altSatir}>
                  <View style={[s.ilanChip, { backgroundColor: colors.badge }]}>
                    <Ionicons name="home-outline" size={12} color={colors.badgeText} />
                    <Text style={[s.ilanText, { color: colors.badgeText }]}>{item.ilan_sayisi} ilan</Text>
                  </View>
                  <Text style={[s.tarih, { color: colors.textMuted }]}>{tarih}'den beri</Text>
                </View>
              </View>
              {!benimHesabim && item.rol !== 'patron' && (
                <TouchableOpacity onPress={() => danismanCikarOnay(item)} style={s.cikarBtn}>
                  <Ionicons name="person-remove-outline" size={18} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={s.bos}>
            <Ionicons name="people-outline" size={56} color={colors.textMuted} />
            <Text style={[s.bosBaslik, { color: colors.text }]}>Henüz danışman yok</Text>
            <Text style={[s.bosAlt, { color: colors.textMuted }]}>Aşağıdaki butona basarak ekibinize danışman ekleyebilirsiniz.</Text>
          </View>
        }
        ListFooterComponent={
          <TouchableOpacity
            style={[s.davetBtn, { borderColor: colors.borderStrong, backgroundColor: tema === 'dark' ? '#1e3a5f' : '#eff6ff' }]}
            onPress={() => setModalAcik(true)}
          >
            <Ionicons name="person-add-outline" size={18} color="#3b82f6" />
            <Text style={s.davetBtnText}>Danışman Ekle</Text>
          </TouchableOpacity>
        }
      />

      {/* Danışman Ekle Modalı */}
      <Modal visible={modalAcik} transparent animationType="slide" onRequestClose={() => setModalAcik(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableOpacity style={s.modalArka} activeOpacity={1} onPress={() => setModalAcik(false)} />
          <View style={[s.modalKutu, { backgroundColor: colors.card }]}>
            <View style={[s.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[s.modalBaslikText, { color: colors.text }]}>Danışman Ekle</Text>
              <TouchableOpacity onPress={() => setModalAcik(false)}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={[s.modalAlt, { color: colors.textSecondary }]}>
              Ekibinize katmak istediğiniz kişinin EmlakNode hesap e-postasını girin.
            </Text>
            <View style={[s.inputWrap, { backgroundColor: colors.input, borderColor: colors.inputBorder }]}>
              <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={{ marginRight: 10 }} />
              <TextInput
                style={[s.input, { color: colors.text }]}
                placeholder="E-posta adresi"
                placeholderTextColor={colors.textMuted}
                value={eposta}
                onChangeText={setEposta}
                keyboardType="email-address"
                autoCapitalize="none"
                autoFocus
              />
            </View>
            <TouchableOpacity
              style={[s.ekleBtn, ekleniyor && { opacity: 0.7 }]}
              onPress={danismanEkleSubmit}
              disabled={ekleniyor}
            >
              {ekleniyor
                ? <ActivityIndicator color="#fff" size="small" />
                : <><Ionicons name="person-add" size={18} color="#fff" /><Text style={s.ekleBtnText}>Ekibime Ekle</Text></>
              }
            </TouchableOpacity>
            <View style={{ height: Platform.OS === 'ios' ? 0 : 16 }} />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1 },
  merkez:         { flex: 1, justifyContent: 'center', alignItems: 'center' },
  banner:         { flexDirection: 'row', paddingVertical: 18, paddingHorizontal: 8 },
  bannerKart:     { flex: 1, alignItems: 'center', gap: 4 },
  bannerSayi:     { fontSize: 22, fontWeight: '900', color: '#fff' },
  bannerLabel:    { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },
  bannerAyrac:    { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.25)', alignSelf: 'center' },
  kart:           { borderRadius: 16, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'center', borderWidth: 1 },
  avatar:         { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  avatarText:     { color: '#fff', fontSize: 18, fontWeight: '900' },
  ustSatir:       { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  ad:             { fontSize: 15, fontWeight: '800', flex: 1 },
  rolBadge:       { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  rolText:        { fontSize: 10, fontWeight: '800' },
  eposta:         { fontSize: 12, marginBottom: 6 },
  altSatir:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ilanChip:       { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  ilanText:       { fontSize: 11, fontWeight: '700' },
  tarih:          { fontSize: 11 },
  cikarBtn:       { padding: 8 },
  bos:            { alignItems: 'center', paddingTop: 60, gap: 10 },
  bosBaslik:      { fontSize: 16, fontWeight: '700' },
  bosAlt:         { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  davetBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5 },
  davetBtnText:   { fontSize: 14, fontWeight: '700', color: '#3b82f6' },
  modalArka:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalKutu:      { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  modalHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 14, marginBottom: 4, borderBottomWidth: 1 },
  modalBaslikText:{ fontSize: 17, fontWeight: '800' },
  modalAlt:       { fontSize: 13, lineHeight: 20, marginBottom: 16 },
  inputWrap:      { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 4, marginBottom: 14 },
  input:          { flex: 1, fontSize: 15, paddingVertical: 12 },
  ekleBtn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#2563eb', paddingVertical: 15, borderRadius: 14 },
  ekleBtnText:    { color: '#fff', fontWeight: '800', fontSize: 15 },
});
