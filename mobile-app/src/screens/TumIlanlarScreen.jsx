import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, Modal, ScrollView, Linking,
  TextInput, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ilanlarGetir, kayitliAramaEkle } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const GORSEL_FALLBACK = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80';

const fiyatFormat = (f) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(f);

const SIRALA_SECENEKLER = [
  { key: 'yeni',       label: 'En Yeni' },
  { key: 'fiyat_asc',  label: 'Fiyat (Artan)' },
  { key: 'fiyat_desc', label: 'Fiyat (Azalan)' },
  { key: 'metrekare',  label: 'En Büyük m²' },
];

const TIPLER    = ['Tümü', 'Satılık', 'Kiralık'];
const TURLER    = ['Tümü', 'Daire', 'Villa', 'Arsa', 'İşyeri', 'Müstakil Ev'];

const IlanKarti = ({ item, onPress }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={[s.kart, { backgroundColor: colors.card }]} onPress={onPress} activeOpacity={0.9}>
      <View style={s.gorselWrap}>
        <Image source={{ uri: item.gorsel || GORSEL_FALLBACK }} style={s.gorsel} resizeMode="cover" />
        <View style={s.badgeRow}>
          <View style={[s.tipBadge, { backgroundColor: item.tip === 'Kiralık' ? '#3b82f6' : '#2563eb' }]}>
            <Text style={s.tipText}>{item.tip || 'Satılık'}</Text>
          </View>
          {item.emlak_turu ? (
            <View style={s.turBadge}>
              <Text style={s.turText}>{item.emlak_turu}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={s.bilgi}>
        <View style={s.bilgiUst}>
          <View style={{ flex: 1 }}>
            <Text style={[s.baslik, { color: colors.text }]} numberOfLines={2}>{item.baslik}</Text>
            <Text style={[s.fiyat, { color: colors.text }]}>{fiyatFormat(item.fiyat)}</Text>
            {item.onceki_fiyat ? (
              <View style={s.dususBadge}>
                <Ionicons name="trending-down" size={12} color="#2563eb" />
                <Text style={s.dususText}>{fiyatFormat(item.onceki_fiyat)} → {fiyatFormat(item.fiyat)}</Text>
              </View>
            ) : null}
            <View style={s.ozellikRow}>
              {item.oda_sayisi ? <Text style={[s.ozellik, { color: colors.textSecondary }]}>{item.oda_sayisi}</Text> : null}
              {item.oda_sayisi && item.kat ? <Text style={[s.ozellikAyrac, { color: colors.border }]}>|</Text> : null}
              {item.kat ? <Text style={[s.ozellik, { color: colors.textSecondary }]}>{item.kat}. Kat</Text> : null}
              {item.metrekare ? (
                <>
                  {(item.oda_sayisi || item.kat) ? <Text style={[s.ozellikAyrac, { color: colors.border }]}>|</Text> : null}
                  <Text style={[s.ozellik, { color: colors.textSecondary }]}>{item.metrekare} m²</Text>
                </>
              ) : null}
            </View>
            <View style={s.konumRow}>
              <Ionicons name="location-outline" size={12} color={colors.textMuted} />
              <Text style={[s.konum, { color: colors.textMuted }]} numberOfLines={1}>
                {[item.ilce, item.sehir].filter(Boolean).join(' - ') || '—'}
              </Text>
            </View>
            {item.dukkan_adi ? (
              <Text style={[s.dukkan, { color: colors.textMuted }]} numberOfLines={1}>{item.dukkan_adi}</Text>
            ) : null}
          </View>
          <TouchableOpacity
            style={s.telefonBtn}
            onPress={(e) => { e.stopPropagation(); Linking.openURL(`tel:${item.sahip_telefon || '05001234567'}`); }}
          >
            <Ionicons name="call" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function TumIlanlarScreen({ route, navigation }) {
  const { colors } = useTheme();
  const baslangicTip       = route.params?.tip        || 'Tümü';
  const baslangicTur       = route.params?.emlak_turu || 'Tümü';
  const baslangicFiyatDustu = route.params?.fiyat_dustu || false;
  const baslangicQ         = route.params?.arama       || '';
  const sayfaBasligi       = route.params?.baslik     || 'Tüm İlanlar';

  const [ilanlar, setIlanlar]             = useState([]);
  const [yukleniyor, setYukleniyor]       = useState(true);
  const [sirala, setSirala]               = useState('yeni');
  const [filtreTip, setFiltreTip]         = useState(baslangicTip);
  const [filtreTur, setFiltreTur]         = useState(baslangicTur);
  const [filtreFiyatDustu]               = useState(baslangicFiyatDustu);
  // Yazma sırasında güncellenen geçici değerler (API çağrısı tetiklemez)
  const [minFiyat, setMinFiyat]           = useState('');
  const [maxFiyat, setMaxFiyat]           = useState('');
  const [minMetrekare, setMinMetrekare]   = useState('');
  const [maxMetrekare, setMaxMetrekare]   = useState('');
  // Uygula butonuna basınca güncellenen değerler (bunlar API çağrısını tetikler)
  const [uygulanmis, setUygulanmis]       = useState({ minFiyat: '', maxFiyat: '', minMetrekare: '', maxMetrekare: '' });
  const [siralaMod, setSiralaMod]         = useState(false);
  const [filtreMod, setFiltreMod]         = useState(false);
  const [kaydetMod, setKaydetMod]         = useState(false);
  const [aramaAdi, setAramaAdi]           = useState('');

  const getir = useCallback(async () => {
    setYukleniyor(true);
    try {
      const params = { limit: 100 };
      if (filtreTip !== 'Tümü')        params.tip           = filtreTip;
      if (filtreTur !== 'Tümü')        params.emlak_turu    = filtreTur;
      if (filtreFiyatDustu)            params.fiyat_dustu   = true;
      if (baslangicQ)                  params.arama         = baslangicQ;
      if (uygulanmis.minFiyat)         params.min_fiyat     = uygulanmis.minFiyat;
      if (uygulanmis.maxFiyat)         params.max_fiyat     = uygulanmis.maxFiyat;
      if (uygulanmis.minMetrekare)     params.min_metrekare = uygulanmis.minMetrekare;
      if (uygulanmis.maxMetrekare)     params.max_metrekare = uygulanmis.maxMetrekare;
      const r = await ilanlarGetir(params);
      let liste = r.data.ilanlar || [];

      if (sirala === 'fiyat_asc')  liste = [...liste].sort((a, b) => a.fiyat - b.fiyat);
      if (sirala === 'fiyat_desc') liste = [...liste].sort((a, b) => b.fiyat - a.fiyat);
      if (sirala === 'metrekare')  liste = [...liste].sort((a, b) => (b.metrekare || 0) - (a.metrekare || 0));

      setIlanlar(liste);
    } catch {
      setIlanlar([]);
    } finally {
      setYukleniyor(false);
    }
  }, [filtreTip, filtreTur, filtreFiyatDustu, baslangicQ, sirala, uygulanmis]);

  useFocusEffect(useCallback(() => { getir(); }, [getir]));

  const aktifSirala = SIRALA_SECENEKLER.find(s => s.key === sirala)?.label || 'Sırala';
  const filtreAktif = filtreTip !== 'Tümü' || filtreTur !== 'Tümü' || !!uygulanmis.minFiyat || !!uygulanmis.maxFiyat || !!uygulanmis.minMetrekare || !!uygulanmis.maxMetrekare;

  const aramaKaydet = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) { Alert.alert('Giriş Gerekli', 'Aramayı kaydetmek için giriş yapmalısın.'); return; }
    const otomatikAd = [filtreTip !== 'Tümü' ? filtreTip : '', filtreTur !== 'Tümü' ? filtreTur : '', sayfaBasligi]
      .filter(Boolean).join(' - ');
    setAramaAdi(otomatikAd);
    setKaydetMod(true);
  };

  const aramaKaydetOnayla = async () => {
    if (!aramaAdi.trim()) return;
    const filtreler = {};
    if (filtreTip !== 'Tümü') filtreler.tip = filtreTip;
    if (filtreTur !== 'Tümü') filtreler.emlak_turu = filtreTur;
    if (baslangicQ) filtreler.arama = baslangicQ;
    try {
      await kayitliAramaEkle({ baslik: aramaAdi.trim(), filtreler });
      setKaydetMod(false);
      Alert.alert('Kaydedildi', 'Arama "Kayıtlı Aramalarım" bölümüne eklendi.');
    } catch {
      Alert.alert('Hata', 'Arama kaydedilemedi.');
    }
  };

  return (
    <View style={[s.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <LinearGradient colors={['#1e3a8a', '#2563eb']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.geriBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerBaslik}>{sayfaBasligi}</Text>
          {!yukleniyor ? (
            <Text style={s.headerAlt}>{ilanlar.length} ilan</Text>
          ) : null}
        </View>
        <TouchableOpacity style={s.geriBtn} onPress={aramaKaydet}>
          <Ionicons name="bookmark-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Filtrele / Sırala / Harita */}
      <View style={[s.araçlar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[s.aracBtn, { backgroundColor: colors.input, borderColor: colors.border }, filtreAktif && s.aracBtnAktif]}
          onPress={() => setFiltreMod(true)}
        >
          <Ionicons name="options-outline" size={15} color={filtreAktif ? '#2563eb' : colors.textSecondary} />
          <Text style={[s.aracText, { color: colors.textSecondary }, filtreAktif && s.aracTextAktif]}>Filtrele</Text>
          {filtreAktif ? <View style={s.filtreDot} /> : null}
        </TouchableOpacity>

        <TouchableOpacity style={[s.aracBtn, { backgroundColor: colors.input, borderColor: colors.border }]} onPress={() => setSiralaMod(true)}>
          <Ionicons name="swap-vertical-outline" size={15} color={colors.textSecondary} />
          <Text style={[s.aracText, { color: colors.textSecondary }]}>Sırala</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.aracBtn, { backgroundColor: colors.input, borderColor: colors.border }]}
          onPress={() => navigation.navigate('Harita', { ilanlar })}
        >
          <Ionicons name="map-outline" size={15} color={colors.textSecondary} />
          <Text style={[s.aracText, { color: colors.textSecondary }]}>Harita</Text>
        </TouchableOpacity>
      </View>

      {/* Liste */}
      {yukleniyor ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={ilanlar}
          keyExtractor={i => String(i.id)}
          renderItem={({ item }) => (
            <IlanKarti
              item={item}
              onPress={() => navigation.navigate('IlanDetay', { id: item.id })}
            />
          )}
          contentContainerStyle={{ paddingVertical: 8 }}
          ListEmptyComponent={
            <View style={s.bos}>
              <Ionicons name="home-outline" size={56} color={colors.border} />
              <Text style={[s.bosText, { color: colors.textMuted }]}>İlan bulunamadı</Text>
            </View>
          }
        />
      )}

      {/* Arama Kaydet Modalı */}
      <Modal visible={kaydetMod} transparent animationType="slide" onRequestClose={() => setKaydetMod(false)}>
        <TouchableOpacity style={s.modalArka} activeOpacity={1} onPress={() => setKaydetMod(false)} />
        <View style={[s.modalKutu, { paddingBottom: 32, backgroundColor: colors.card }]}>
          <View style={s.modalBaslik}>
            <Text style={[s.modalBaslikText, { color: colors.text }]}>Aramayı Kaydet</Text>
            <TouchableOpacity onPress={() => setKaydetMod(false)}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={[s.filtreGrupBaslik, { marginBottom: 8, color: colors.textSecondary }]}>Arama Adı</Text>
          <TextInput
            style={[s.aramaAdiInput, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }]}
            value={aramaAdi}
            onChangeText={setAramaAdi}
            placeholder="Aramaya bir isim ver..."
            placeholderTextColor={colors.textMuted}
            autoFocus
          />
          <TouchableOpacity style={s.filtreUygula} onPress={aramaKaydetOnayla}>
            <Text style={s.filtreUygulaText}>Kaydet</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Sıralama Modalı */}
      <Modal visible={siralaMod} transparent animationType="slide" onRequestClose={() => setSiralaMod(false)}>
        <TouchableOpacity style={s.modalArka} activeOpacity={1} onPress={() => setSiralaMod(false)} />
        <View style={[s.modalKutu, { backgroundColor: colors.card }]}>
          <View style={s.modalBaslik}>
            <Text style={[s.modalBaslikText, { color: colors.text }]}>Sıralama</Text>
            <TouchableOpacity onPress={() => setSiralaMod(false)}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          {SIRALA_SECENEKLER.map(o => (
            <TouchableOpacity
              key={o.key}
              style={[s.modalSecim, { borderBottomColor: colors.border }]}
              onPress={() => { setSirala(o.key); setSiralaMod(false); }}
            >
              <Text style={[s.modalSecimText, { color: colors.textSecondary }, sirala === o.key && { color: '#2563eb', fontWeight: '700' }]}>
                {o.label}
              </Text>
              {sirala === o.key ? <Ionicons name="checkmark" size={18} color="#2563eb" /> : null}
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      {/* Filtre Modalı */}
      <Modal visible={filtreMod} transparent animationType="slide" onRequestClose={() => setFiltreMod(false)}>
        <TouchableOpacity style={s.modalArka} activeOpacity={1} onPress={() => setFiltreMod(false)} />
        <View style={[s.modalKutu, { paddingBottom: 32, backgroundColor: colors.card }]}>
          <View style={s.modalBaslik}>
            <Text style={[s.modalBaslikText, { color: colors.text }]}>Filtrele</Text>
            <TouchableOpacity onPress={() => setFiltreMod(false)}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={[s.filtreGrupBaslik, { color: colors.textSecondary }]}>İlan Tipi</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 2 }}>
            {TIPLER.map(t => (
              <TouchableOpacity
                key={t}
                onPress={() => setFiltreTip(t)}
                style={[s.filtreChip, { backgroundColor: colors.input, borderColor: colors.border }, filtreTip === t && s.filtreChipAktif]}
              >
                <Text style={[s.filtreChipText, { color: colors.textSecondary }, filtreTip === t && s.filtreChipTextAktif]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[s.filtreGrupBaslik, { marginTop: 16, color: colors.textSecondary }]}>Emlak Türü</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 2 }}>
            {TURLER.map(t => (
              <TouchableOpacity
                key={t}
                onPress={() => setFiltreTur(t)}
                style={[s.filtreChip, { backgroundColor: colors.input, borderColor: colors.border }, filtreTur === t && s.filtreChipAktif]}
              >
                <Text style={[s.filtreChipText, { color: colors.textSecondary }, filtreTur === t && s.filtreChipTextAktif]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[s.filtreGrupBaslik, { marginTop: 16, color: colors.textSecondary }]}>Fiyat Aralığı (TL)</Text>
          <View style={s.aralikRow}>
            <TextInput
              style={[s.aralikInput, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }]}
              placeholder="Min fiyat"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={minFiyat}
              onChangeText={setMinFiyat}
            />
            <Text style={[s.aralikAyrac, { color: colors.textMuted }]}>—</Text>
            <TextInput
              style={[s.aralikInput, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }]}
              placeholder="Max fiyat"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={maxFiyat}
              onChangeText={setMaxFiyat}
            />
          </View>

          <Text style={[s.filtreGrupBaslik, { marginTop: 16, color: colors.textSecondary }]}>Metrekare Aralığı (m²)</Text>
          <View style={s.aralikRow}>
            <TextInput
              style={[s.aralikInput, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }]}
              placeholder="Min m²"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={minMetrekare}
              onChangeText={setMinMetrekare}
            />
            <Text style={[s.aralikAyrac, { color: colors.textMuted }]}>—</Text>
            <TextInput
              style={[s.aralikInput, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }]}
              placeholder="Max m²"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={maxMetrekare}
              onChangeText={setMaxMetrekare}
            />
          </View>

          <TouchableOpacity
            style={s.filtreUygula}
            onPress={() => {
              setUygulanmis({ minFiyat, maxFiyat, minMetrekare, maxMetrekare });
              setFiltreMod(false);
            }}
          >
            <Text style={s.filtreUygulaText}>Uygula</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.filtreTemizle}
            onPress={() => {
              setFiltreTip('Tümü'); setFiltreTur('Tümü');
              setMinFiyat(''); setMaxFiyat('');
              setMinMetrekare(''); setMaxMetrekare('');
              setUygulanmis({ minFiyat: '', maxFiyat: '', minMetrekare: '', maxMetrekare: '' });
              setFiltreMod(false);
            }}
          >
            <Text style={[s.filtreTemizleText, { color: colors.textMuted }]}>Filtreleri Temizle</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#f5f5f5' },
  header:             { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 12, gap: 12 },
  geriBtn:            { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerBaslik:       { fontSize: 17, fontWeight: '800', color: '#fff' },
  headerAlt:          { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  araçlar:            { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, gap: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  aracBtn:            { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 9, borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fafafa' },
  aracBtnAktif:       { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  aracText:           { fontSize: 13, fontWeight: '600', color: '#374151' },
  aracTextAktif:      { color: '#2563eb' },
  filtreDot:          { width: 6, height: 6, borderRadius: 3, backgroundColor: '#2563eb' },
  kart:               { backgroundColor: '#fff', marginHorizontal: 12, marginVertical: 5, borderRadius: 16, overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4 },
  gorselWrap:         { position: 'relative' },
  gorsel:             { width: '100%', height: 220 },
  badgeRow:           { position: 'absolute', top: 10, left: 10, flexDirection: 'row', gap: 6 },
  tipBadge:           { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tipText:            { color: '#fff', fontSize: 11, fontWeight: '700' },
  turBadge:           { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: 'rgba(0,0,0,0.5)' },
  turText:            { color: '#fff', fontSize: 11, fontWeight: '600' },
  bilgi:              { padding: 14 },
  bilgiUst:           { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  baslik:             { fontSize: 14, fontWeight: '700', color: '#111827', lineHeight: 20, marginBottom: 6 },
  fiyat:              { fontSize: 20, fontWeight: '900', color: '#111827', marginBottom: 6 },
  ozellikRow:         { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  ozellik:            { fontSize: 13, color: '#374151', fontWeight: '600' },
  ozellikAyrac:       { fontSize: 13, color: '#d1d5db' },
  konumRow:           { flexDirection: 'row', alignItems: 'center', gap: 4 },
  konum:              { fontSize: 12, color: '#9ca3af', flex: 1 },
  dukkan:             { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  telefonBtn:         { width: 46, height: 46, borderRadius: 12, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  bos:                { alignItems: 'center', paddingTop: 100, gap: 14 },
  bosText:            { fontSize: 16, color: '#9ca3af', fontWeight: '600' },
  modalArka:          { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalKutu:          { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  modalBaslik:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalBaslikText:    { fontSize: 17, fontWeight: '800', color: '#111827' },
  modalSecim:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  modalSecimText:     { fontSize: 15, color: '#374151' },
  filtreGrupBaslik:   { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 10 },
  filtreChip:         { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: '#fafafa' },
  filtreChipAktif:    { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  filtreChipText:     { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  filtreChipTextAktif: { color: '#2563eb' },
  filtreUygula:       { backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 24 },
  filtreUygulaText:   { color: '#fff', fontSize: 15, fontWeight: '800' },
  filtreTemizle:      { paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  filtreTemizleText:  { fontSize: 14, color: '#9ca3af', fontWeight: '600' },
  aramaAdiInput:      { borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#111827', marginBottom: 16 },
  aralikRow:          { flexDirection: 'row', alignItems: 'center', gap: 10 },
  aralikInput:        { flex: 1, borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#111827' },
  aralikAyrac:        { fontSize: 16, color: '#9ca3af', fontWeight: '700' },
  dususBadge:         { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#eff6ff', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginBottom: 6, alignSelf: 'flex-start' },
  dususText:          { fontSize: 11, fontWeight: '700', color: '#2563eb' },
});
