import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Image, ActivityIndicator, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { ilanlarGetir, fiyatiDusenIlanlar } from '../services/api';

const { width } = Dimensions.get('window');
const GORSEL_FALLBACK = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80';
const fiyatFormat = (f) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(f);

const KATEGORILER = [
  { key: 'daire',   label: 'Daire',   emoji: '🏢', params: { emlak_turu: 'Daire' } },
  { key: 'villa',   label: 'Villa',   emoji: '🏡', params: { emlak_turu: 'Villa' } },
  { key: 'arsa',    label: 'Arsa',    emoji: '🌱', params: { emlak_turu: 'Arsa' } },
  { key: 'isyeri',  label: 'İşyeri',  emoji: '🏪', params: { emlak_turu: 'İşyeri' } },
  { key: 'kiralik', label: 'Kiralık', emoji: '🔑', params: { tip: 'Kiralık' } },
  { key: 'satilik', label: 'Satılık', emoji: '🏠', params: { tip: 'Satılık' } },
];

const COZUMLER = [
  { id: '1', baslik: 'Emlak Değerleme', alt: 'Gerçek Değeri Öğrenin', icon: 'stats-chart-outline' },
  { id: '2', baslik: 'Arsa Dünyası',   alt: 'Arsa Alım Satım',       icon: 'map-outline' },
];


const IlanKarti = ({ ilan, onPress }) => (
  <TouchableOpacity style={s.ilanKart} onPress={onPress} activeOpacity={0.85}>
    <Image source={{ uri: ilan.gorsel || GORSEL_FALLBACK }} style={s.ilanGorsel} resizeMode="cover" />
    <View style={[s.tipBadge, { backgroundColor: ilan.tip === 'Kiralık' ? '#3b82f6' : '#16a34a' }]}>
      <Text style={s.tipText}>{ilan.tip || 'Satılık'}</Text>
    </View>
    <View style={s.ilanBilgi}>
      <Text style={s.ilanFiyat}>{fiyatFormat(ilan.fiyat)}</Text>
      {ilan.onceki_fiyat ? (
        <View style={s.dususBadge}>
          <Ionicons name="trending-down" size={10} color="#16a34a" />
          <Text style={s.dususBadgeText}>{fiyatFormat(ilan.onceki_fiyat)} → {fiyatFormat(ilan.fiyat)}</Text>
        </View>
      ) : null}
      <Text style={s.ilanBaslik} numberOfLines={1}>{ilan.baslik}</Text>
      <View style={s.ilanAlt}>
        <Ionicons name="location-outline" size={11} color="#9ca3af" />
        <Text style={s.ilanKonum} numberOfLines={1}>
          {[ilan.ilce, ilan.sehir].filter(Boolean).join(', ') || '—'}
        </Text>
      </View>
      <View style={s.ilanChipler}>
        {ilan.oda_sayisi ? <Text style={s.chip}>{ilan.oda_sayisi}</Text> : null}
        {ilan.metrekare  ? <Text style={s.chip}>{ilan.metrekare} m²</Text> : null}
        {ilan.emlak_turu ? <Text style={s.chip}>{ilan.emlak_turu}</Text> : null}
      </View>
    </View>
  </TouchableOpacity>
);

export default function KesifScreen({ navigation }) {
  const [satiliklar, setSatiliklar]   = useState([]);
  const [kiraliklar, setKiraliklar]   = useState([]);
  const [sonIlanlar, setSonIlanlar]   = useState([]);
  const [yukleniyor, setYukleniyor]   = useState(true);
  const [arama, setArama]             = useState('');
  const [aktifTab, setAktifTab]       = useState('satilik');

  useFocusEffect(
    useCallback(() => {
      setYukleniyor(true);
      Promise.all([
        fiyatiDusenIlanlar('Satılık'),
        fiyatiDusenIlanlar('Kiralık'),
        ilanlarGetir({ limit: 6 }),
      ]).then(([s, k, son]) => {
        setSatiliklar(s.data.ilanlar || []);
        setKiraliklar(k.data.ilanlar || []);
        setSonIlanlar(son.data.ilanlar || []);
      }).catch(() => {}).finally(() => setYukleniyor(false));
    }, [])
  );

  const aramaYap = () => {
    if (arama.trim()) navigation.navigate('IlanAra', { arama: arama.trim() });
  };

  const goruntelenecek = aktifTab === 'satilik' ? satiliklar : kiraliklar;

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>

      {/* Gradient Header */}
      <LinearGradient
        colors={['#14532d', '#16a34a', '#22c55e']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.gradientHeader}
      >
        <View style={s.gradientHeaderTop}>
          <View>
            <Text style={s.gradientLogo}>Emlak<Text style={{ color: '#bbf7d0' }}>Node</Text></Text>
            <Text style={s.gradientAlt}>Hayalindeki evi bul</Text>
          </View>
          <TouchableOpacity style={s.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={s.aramaWrap}>
          <Ionicons name="search-outline" size={18} color="#9ca3af" style={{ marginRight: 8 }} />
          <TextInput
            style={s.aramaInput}
            placeholder="İl, ilçe, mahalle veya ilan ara..."
            placeholderTextColor="#9ca3af"
            value={arama}
            onChangeText={setArama}
            onSubmitEditing={aramaYap}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {arama.length > 0 ? (
            <TouchableOpacity onPress={() => setArama('')}>
              <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </TouchableOpacity>
          ) : null}
        </View>
      </LinearGradient>

      {/* Category Shortcuts */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.kategoriBar}
        style={s.kategoriScroll}
      >
        {KATEGORILER.map(k => (
          <TouchableOpacity
            key={k.key}
            style={s.kategoriBtn}
            onPress={() => navigation.navigate('TumIlanlar', { ...k.params, baslik: k.label })}
          >
            <Text style={s.kategoriBtnEmoji}>{k.emoji}</Text>
            <Text style={s.kategoriBtnText}>{k.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Gayrimenkul Çözümleri */}
      <Text style={s.bolumBaslik}>GAYRİMENKUL ÇÖZÜMLERİ</Text>
      <View style={s.cozumlerGrid}>
        {COZUMLER.map(c => (
          <TouchableOpacity
            key={c.id}
            style={[s.cozumKart, c.yeni && s.cozumKartYeni]}
            onPress={() => {
              if (c.id === '1') navigation.navigate('EmlakDegerleme');
              if (c.id === '2') navigation.navigate('TumIlanlar', { emlak_turu: 'Arsa', baslik: 'Arsa Dünyası' });
            }}
          >
            {c.yeni ? (
              <View style={s.yeniBadge}>
                <Text style={s.yeniText}>•YENİ</Text>
              </View>
            ) : null}
            <Text style={s.cozumBaslik}>{c.baslik}</Text>
            <Text style={s.cozumAlt}>{c.alt}</Text>
            <View style={s.cozumAltRow}>
              <Ionicons name={c.icon} size={32} color={c.yeni ? '#16a34a' : '#374151'} />
              <View style={s.cozumOk}>
                <Ionicons name="chevron-forward" size={16} color="#374151" />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Fiyatı Düşen Bölümü */}
      <View style={s.bolumHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="trending-down" size={18} color="#16a34a" />
          <Text style={s.bolumBaslikKucuk}>FİYATI DÜŞEN İLANLAR</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('TumIlanlar', {
          fiyat_dustu: true,
          tip: aktifTab === 'satilik' ? 'Satılık' : 'Kiralık',
          baslik: aktifTab === 'satilik' ? 'Fiyatı Düşen Satılıklar' : 'Fiyatı Düşen Kiralıklar',
        })}>
          <Text style={s.tumunuGor}>Tümünü Gör</Text>
        </TouchableOpacity>
      </View>

      {/* Satılık / Kiralık tab */}
      <View style={s.tabRow}>
        {[{ key: 'satilik', label: 'Satılık' }, { key: 'kiralik', label: 'Kiralık' }].map(t => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setAktifTab(t.key)}
            style={[s.tabBtn, aktifTab === t.key && s.tabBtnAktif]}
          >
            <Text style={[s.tabText, aktifTab === t.key && s.tabTextAktif]}>
              {t.key === 'satilik' ? 'Fiyatı Düşen Satılıklar' : 'Fiyatı Düşen Kiralıklar'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* İlan Carousel */}
      {yukleniyor ? (
        <ActivityIndicator size="large" color="#16a34a" style={{ marginTop: 32, marginBottom: 32 }} />
      ) : goruntelenecek.length === 0 ? (
        <View style={s.bosKarti}>
          <Ionicons name="trending-down-outline" size={36} color="#d1d5db" />
          <Text style={s.bosKartiText}>Henüz fiyatı düşen ilan yok</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.ilanlarCarousel}>
          {goruntelenecek.map(ilan => (
            <IlanKarti
              key={ilan.id}
              ilan={ilan}
              onPress={() => navigation.navigate('IlanDetay', { id: ilan.id })}
            />
          ))}
        </ScrollView>
      )}

      {/* Son İlanlar */}
      <View style={s.evBolumu}>
        <View style={s.evBolumIcerik}>
          <Ionicons name="home" size={20} color="#16a34a" />
          <Text style={s.evBolumBaslik}>Ev mi arıyorsun?</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('TumIlanlar', {})}>
          <Text style={s.tumunuGor}>Tümünü Gör</Text>
        </TouchableOpacity>
      </View>

      {/* İlginizi Çekebilecek İlanlar */}
      <View style={s.bolumHeader}>
        <Text style={s.bolumBaslikKucuk}>İLGİNİZİ ÇEKEBİLECEK İLANLAR</Text>
        <TouchableOpacity onPress={() => navigation.navigate('TumIlanlar', {})}>
          <Text style={s.tumunuGor}>Tümünü Gör</Text>
        </TouchableOpacity>
      </View>

      {yukleniyor ? null : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.ilanlarCarousel}>
          {sonIlanlar.map(ilan => (
            <IlanKarti
              key={`ilginc-${ilan.id}`}
              ilan={ilan}
              onPress={() => navigation.navigate('IlanDetay', { id: ilan.id })}
            />
          ))}
        </ScrollView>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#f5f5f5' },
  // Gradient Header
  gradientHeader:    { paddingTop: 52, paddingHorizontal: 16, paddingBottom: 20 },
  gradientHeaderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  gradientLogo:      { fontSize: 26, fontWeight: '900', color: '#fff' },
  gradientAlt:       { fontSize: 13, color: '#bbf7d0', marginTop: 3 },
  notifBtn:          { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  aramaWrap:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  aramaInput:        { flex: 1, fontSize: 14, color: '#111827' },
  // Category shortcuts
  kategoriScroll:    { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  kategoriBar:       { paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  kategoriBtn:       { alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: '#e5e7eb', minWidth: 68, gap: 4 },
  kategoriBtnEmoji:  { fontSize: 20 },
  kategoriBtnText:   { fontSize: 11, fontWeight: '700', color: '#374151' },
  // Sections
  bolumBaslik:       { fontSize: 11, fontWeight: '700', color: '#9ca3af', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10, letterSpacing: 0.8 },
  bolumHeader:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10 },
  bolumBaslikKucuk:  { fontSize: 13, fontWeight: '800', color: '#111827', letterSpacing: 0.4 },
  tumunuGor:         { fontSize: 13, fontWeight: '700', color: '#16a34a' },
  cozumlerGrid:      { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10 },
  cozumKart:         { width: (width - 34) / 2, backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#f0f0f0', minHeight: 130 },
  cozumKartYeni:     { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  yeniBadge:         { alignSelf: 'flex-end' },
  yeniText:          { fontSize: 11, fontWeight: '800', color: '#16a34a' },
  cozumBaslik:       { fontSize: 14, fontWeight: '800', color: '#111827', marginTop: 4 },
  cozumAlt:          { fontSize: 11, color: '#6b7280', marginTop: 4, lineHeight: 16 },
  cozumAltRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 12 },
  cozumOk:           { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center' },
  tabRow:            { flexDirection: 'row', marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 12, padding: 4, gap: 4, borderWidth: 1, borderColor: '#f0f0f0' },
  tabBtn:            { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center' },
  tabBtnAktif:       { backgroundColor: '#f0fdf4' },
  tabText:           { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  tabTextAktif:      { color: '#16a34a' },
  ilanlarCarousel:   { paddingHorizontal: 16, gap: 12, marginTop: 12, paddingBottom: 4 },
  ilanKart:          { width: 168, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#f0f0f0' },
  evBolumu:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginTop: 20, marginBottom: 4, backgroundColor: '#f0fdf4', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#bbf7d0' },
  evBolumIcerik:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  evBolumBaslik:     { fontSize: 16, fontWeight: '900', color: '#111827', letterSpacing: 0.3 },
  ilanGorsel:        { width: '100%', height: 130 },
  tipBadge:          { position: 'absolute', top: 8, left: 8, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  tipText:           { color: '#fff', fontSize: 10, fontWeight: '700' },
  ilanBilgi:         { padding: 10 },
  ilanFiyat:         { fontSize: 14, fontWeight: '900', color: '#16a34a' },
  ilanBaslik:        { fontSize: 12, fontWeight: '600', color: '#111827', marginTop: 2 },
  ilanAlt:           { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  ilanKonum:         { fontSize: 11, color: '#9ca3af', flex: 1 },
  ilanChipler:       { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  chip:              { fontSize: 10, backgroundColor: '#f3f4f6', color: '#6b7280', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, fontWeight: '600' },
  dususBadge:        { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#f0fdf4', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3, marginTop: 3, alignSelf: 'flex-start' },
  dususBadgeText:    { fontSize: 9, fontWeight: '700', color: '#16a34a' },
  bosKarti:          { alignItems: 'center', paddingVertical: 32, gap: 8, marginHorizontal: 16 },
  bosKartiText:      { fontSize: 13, color: '#9ca3af', fontWeight: '600' },
});
