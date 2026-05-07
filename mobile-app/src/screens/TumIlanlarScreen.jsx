import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, Modal, ScrollView, Linking,
  TextInput, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ilanlarGetir, kayitliAramaEkle } from '../services/api';

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

const IlanKarti = ({ item, onPress }) => (
  <TouchableOpacity style={s.kart} onPress={onPress} activeOpacity={0.9}>
    <View style={s.gorselWrap}>
      <Image source={{ uri: item.gorsel || GORSEL_FALLBACK }} style={s.gorsel} resizeMode="cover" />
      <View style={s.badgeRow}>
        <View style={[s.tipBadge, { backgroundColor: item.tip === 'Kiralık' ? '#3b82f6' : '#16a34a' }]}>
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
          <Text style={s.baslik} numberOfLines={2}>{item.baslik}</Text>
          <Text style={s.fiyat}>{fiyatFormat(item.fiyat)}</Text>
          {item.onceki_fiyat ? (
            <View style={s.dususBadge}>
              <Ionicons name="trending-down" size={12} color="#16a34a" />
              <Text style={s.dususText}>{fiyatFormat(item.onceki_fiyat)} → {fiyatFormat(item.fiyat)}</Text>
            </View>
          ) : null}
          <View style={s.ozellikRow}>
            {item.oda_sayisi ? <Text style={s.ozellik}>{item.oda_sayisi}</Text> : null}
            {item.oda_sayisi && item.kat ? <Text style={s.ozellikAyrac}>|</Text> : null}
            {item.kat ? <Text style={s.ozellik}>{item.kat}. Kat</Text> : null}
            {item.metrekare ? (
              <>
                {(item.oda_sayisi || item.kat) ? <Text style={s.ozellikAyrac}>|</Text> : null}
                <Text style={s.ozellik}>{item.metrekare} m²</Text>
              </>
            ) : null}
          </View>
          <View style={s.konumRow}>
            <Ionicons name="location-outline" size={12} color="#9ca3af" />
            <Text style={s.konum} numberOfLines={1}>
              {[item.ilce, item.sehir].filter(Boolean).join(' - ') || '—'}
            </Text>
          </View>
          {item.dukkan_adi ? (
            <Text style={s.dukkan} numberOfLines={1}>{item.dukkan_adi}</Text>
          ) : null}
        </View>
        <TouchableOpacity
          style={s.telefonBtn}
          onPress={(e) => { e.stopPropagation(); Linking.openURL('tel:05001234567'); }}
        >
          <Ionicons name="call" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
);

export default function TumIlanlarScreen({ route, navigation }) {
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
  const [siralaMod, setSiralaMod]         = useState(false);
  const [filtreMod, setFiltreMod]         = useState(false);
  const [kaydetMod, setKaydetMod]         = useState(false);
  const [aramaAdi, setAramaAdi]           = useState('');

  const getir = useCallback(async () => {
    setYukleniyor(true);
    try {
      const params = { limit: 100 };
      if (filtreTip !== 'Tümü') params.tip        = filtreTip;
      if (filtreTur !== 'Tümü') params.emlak_turu = filtreTur;
      if (filtreFiyatDustu)     params.fiyat_dustu = true;
      if (baslangicQ)           params.arama       = baslangicQ;
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
  }, [filtreTip, filtreTur, filtreFiyatDustu, baslangicQ, sirala]);

  useFocusEffect(useCallback(() => { getir(); }, [getir]));

  const aktifSirala = SIRALA_SECENEKLER.find(s => s.key === sirala)?.label || 'Sırala';
  const filtreAktif = filtreTip !== 'Tümü' || filtreTur !== 'Tümü';

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
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.geriBtn}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerBaslik}>{sayfaBasligi}</Text>
          {!yukleniyor ? (
            <Text style={s.headerAlt}>{ilanlar.length} ilan</Text>
          ) : null}
        </View>
        <TouchableOpacity style={s.geriBtn} onPress={aramaKaydet}>
          <Ionicons name="bookmark-outline" size={20} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Filtrele / Sırala / Harita */}
      <View style={s.araçlar}>
        <TouchableOpacity
          style={[s.aracBtn, filtreAktif && s.aracBtnAktif]}
          onPress={() => setFiltreMod(true)}
        >
          <Ionicons name="options-outline" size={15} color={filtreAktif ? '#16a34a' : '#374151'} />
          <Text style={[s.aracText, filtreAktif && s.aracTextAktif]}>Filtrele</Text>
          {filtreAktif ? <View style={s.filtreDot} /> : null}
        </TouchableOpacity>

        <TouchableOpacity style={s.aracBtn} onPress={() => setSiralaMod(true)}>
          <Ionicons name="swap-vertical-outline" size={15} color="#374151" />
          <Text style={s.aracText}>Sırala</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.aracBtn}
          onPress={() => navigation.navigate('Harita', { ilanlar })}
        >
          <Ionicons name="map-outline" size={15} color="#374151" />
          <Text style={s.aracText}>Harita</Text>
        </TouchableOpacity>
      </View>

      {/* Liste */}
      {yukleniyor ? (
        <ActivityIndicator size="large" color="#16a34a" style={{ marginTop: 60 }} />
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
              <Ionicons name="home-outline" size={56} color="#d1d5db" />
              <Text style={s.bosText}>İlan bulunamadı</Text>
            </View>
          }
        />
      )}

      {/* Arama Kaydet Modalı */}
      <Modal visible={kaydetMod} transparent animationType="slide" onRequestClose={() => setKaydetMod(false)}>
        <TouchableOpacity style={s.modalArka} activeOpacity={1} onPress={() => setKaydetMod(false)} />
        <View style={[s.modalKutu, { paddingBottom: 32 }]}>
          <View style={s.modalBaslik}>
            <Text style={s.modalBaslikText}>Aramayı Kaydet</Text>
            <TouchableOpacity onPress={() => setKaydetMod(false)}>
              <Ionicons name="close" size={22} color="#374151" />
            </TouchableOpacity>
          </View>
          <Text style={[s.filtreGrupBaslik, { marginBottom: 8 }]}>Arama Adı</Text>
          <TextInput
            style={s.aramaAdiInput}
            value={aramaAdi}
            onChangeText={setAramaAdi}
            placeholder="Aramaya bir isim ver..."
            placeholderTextColor="#9ca3af"
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
        <View style={s.modalKutu}>
          <View style={s.modalBaslik}>
            <Text style={s.modalBaslikText}>Sıralama</Text>
            <TouchableOpacity onPress={() => setSiralaMod(false)}>
              <Ionicons name="close" size={22} color="#374151" />
            </TouchableOpacity>
          </View>
          {SIRALA_SECENEKLER.map(o => (
            <TouchableOpacity
              key={o.key}
              style={s.modalSecim}
              onPress={() => { setSirala(o.key); setSiralaMod(false); }}
            >
              <Text style={[s.modalSecimText, sirala === o.key && { color: '#16a34a', fontWeight: '700' }]}>
                {o.label}
              </Text>
              {sirala === o.key ? <Ionicons name="checkmark" size={18} color="#16a34a" /> : null}
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      {/* Filtre Modalı */}
      <Modal visible={filtreMod} transparent animationType="slide" onRequestClose={() => setFiltreMod(false)}>
        <TouchableOpacity style={s.modalArka} activeOpacity={1} onPress={() => setFiltreMod(false)} />
        <View style={[s.modalKutu, { paddingBottom: 32 }]}>
          <View style={s.modalBaslik}>
            <Text style={s.modalBaslikText}>Filtrele</Text>
            <TouchableOpacity onPress={() => setFiltreMod(false)}>
              <Ionicons name="close" size={22} color="#374151" />
            </TouchableOpacity>
          </View>

          <Text style={s.filtreGrupBaslik}>İlan Tipi</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 2 }}>
            {TIPLER.map(t => (
              <TouchableOpacity
                key={t}
                onPress={() => setFiltreTip(t)}
                style={[s.filtreChip, filtreTip === t && s.filtreChipAktif]}
              >
                <Text style={[s.filtreChipText, filtreTip === t && s.filtreChipTextAktif]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[s.filtreGrupBaslik, { marginTop: 16 }]}>Emlak Türü</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 2 }}>
            {TURLER.map(t => (
              <TouchableOpacity
                key={t}
                onPress={() => setFiltreTur(t)}
                style={[s.filtreChip, filtreTur === t && s.filtreChipAktif]}
              >
                <Text style={[s.filtreChipText, filtreTur === t && s.filtreChipTextAktif]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={s.filtreUygula}
            onPress={() => { setFiltreMod(false); getir(); }}
          >
            <Text style={s.filtreUygulaText}>Uygula</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.filtreTemizle}
            onPress={() => { setFiltreTip('Tümü'); setFiltreTur('Tümü'); setFiltreMod(false); }}
          >
            <Text style={s.filtreTemizleText}>Filtreleri Temizle</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#f5f5f5' },
  header:             { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', gap: 12 },
  geriBtn:            { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerBaslik:       { fontSize: 17, fontWeight: '800', color: '#111827' },
  headerAlt:          { fontSize: 12, color: '#9ca3af', marginTop: 1 },
  araçlar:            { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, gap: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  aracBtn:            { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 9, borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fafafa' },
  aracBtnAktif:       { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  aracText:           { fontSize: 13, fontWeight: '600', color: '#374151' },
  aracTextAktif:      { color: '#16a34a' },
  filtreDot:          { width: 6, height: 6, borderRadius: 3, backgroundColor: '#16a34a' },
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
  telefonBtn:         { width: 46, height: 46, borderRadius: 12, backgroundColor: '#16a34a', justifyContent: 'center', alignItems: 'center', marginTop: 4 },
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
  filtreChipAktif:    { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  filtreChipText:     { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  filtreChipTextAktif: { color: '#16a34a' },
  filtreUygula:       { backgroundColor: '#16a34a', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 24 },
  filtreUygulaText:   { color: '#fff', fontSize: 15, fontWeight: '800' },
  filtreTemizle:      { paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  filtreTemizleText:  { fontSize: 14, color: '#9ca3af', fontWeight: '600' },
  aramaAdiInput:      { borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#111827', marginBottom: 16 },
  dususBadge:         { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f0fdf4', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginBottom: 6, alignSelf: 'flex-start' },
  dususText:          { fontSize: 11, fontWeight: '700', color: '#16a34a' },
});
