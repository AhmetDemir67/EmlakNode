import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Image, ActivityIndicator, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ilanlarGetir, fiyatiDusenIlanlar, okunmamisBildirimSayisi } from '../services/api';
import { useTheme } from '../context/ThemeContext';

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

const IlanKarti = ({ ilan, onPress, colors }) => (
  <TouchableOpacity style={[s.ilanKart, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={onPress} activeOpacity={0.85}>
    <Image source={{ uri: ilan.gorsel || GORSEL_FALLBACK }} style={s.ilanGorsel} resizeMode="cover" />
    <View style={[s.tipBadge, { backgroundColor: ilan.tip === 'Kiralık' ? '#3b82f6' : '#2563eb' }]}>
      <Text style={s.tipText}>{ilan.tip || 'Satılık'}</Text>
    </View>
    <View style={s.ilanBilgi}>
      <Text style={[s.ilanFiyat, { color: '#2563eb' }]}>{fiyatFormat(ilan.fiyat)}</Text>
      {ilan.onceki_fiyat ? (
        <View style={s.dususBadge}>
          <Ionicons name="trending-down" size={10} color="#2563eb" />
          <Text style={s.dususBadgeText}>{fiyatFormat(ilan.onceki_fiyat)} → {fiyatFormat(ilan.fiyat)}</Text>
        </View>
      ) : null}
      <Text style={[s.ilanBaslik, { color: colors.text }]} numberOfLines={1}>{ilan.baslik}</Text>
      <View style={s.ilanAlt}>
        <Ionicons name="location-outline" size={11} color={colors.textMuted} />
        <Text style={[s.ilanKonum, { color: colors.textMuted }]} numberOfLines={1}>
          {[ilan.ilce, ilan.sehir].filter(Boolean).join(', ') || '—'}
        </Text>
      </View>
      <View style={s.ilanChipler}>
        {ilan.oda_sayisi ? <Text style={[s.chip, { backgroundColor: colors.bg, color: colors.textSecondary }]}>{ilan.oda_sayisi}</Text> : null}
        {ilan.metrekare  ? <Text style={[s.chip, { backgroundColor: colors.bg, color: colors.textSecondary }]}>{ilan.metrekare} m²</Text> : null}
        {ilan.emlak_turu ? <Text style={[s.chip, { backgroundColor: colors.bg, color: colors.textSecondary }]}>{ilan.emlak_turu}</Text> : null}
      </View>
    </View>
  </TouchableOpacity>
);

export default function KesifScreen({ navigation }) {
  const { colors, tema } = useTheme();
  const [satiliklar, setSatiliklar]     = useState([]);
  const [kiraliklar, setKiraliklar]     = useState([]);
  const [sonIlanlar, setSonIlanlar]     = useState([]);
  const [yukleniyor, setYukleniyor]     = useState(true);
  const [arama, setArama]               = useState('');
  const [aramaSonuclari, setAramaSonuclari]     = useState([]);
  const [aramaYukleniyor, setAramaYukleniyor]   = useState(false);
  const [bildirimSayisi, setBildirimSayisi]     = useState(null);
  const [aktifTab, setAktifTab]                 = useState('satilik');

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

      AsyncStorage.getItem('token').then(token => {
        if (!token) return;
        okunmamisBildirimSayisi()
          .then(r => setBildirimSayisi(r.data.sayi > 0 ? r.data.sayi : null))
          .catch(() => setBildirimSayisi(null));
      });
    }, [])
  );

  useEffect(() => {
    if (!arama.trim()) { setAramaSonuclari([]); return; }
    setAramaYukleniyor(true);
    const timer = setTimeout(async () => {
      try {
        const res = await ilanlarGetir({ arama: arama.trim(), limit: 20 });
        setAramaSonuclari(res.data.ilanlar || []);
      } catch {
        setAramaSonuclari([]);
      } finally {
        setAramaYukleniyor(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [arama]);

  const goruntelenecek = aktifTab === 'satilik' ? satiliklar : kiraliklar;

  return (
    <ScrollView style={[s.container, { backgroundColor: colors.bg }]} showsVerticalScrollIndicator={false}>

      {/* Gradient Header */}
      <LinearGradient
        colors={['#1e3a8a', '#2563eb', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.gradientHeader}
      >
        <View style={s.gradientHeaderTop}>
          <View>
            <Text style={s.gradientLogo}>Emlak<Text style={{ color: '#bfdbfe' }}>Node</Text></Text>
            <Text style={s.gradientAlt}>Hayalindeki evi bul</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity style={s.notifBtn} onPress={() => navigation.navigate('Harita')}>
              <Ionicons name="map-outline" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={s.notifBtn} onPress={() => navigation.navigate('Bildirimler')}>
              <Ionicons name="notifications-outline" size={22} color="#fff" />
              {bildirimSayisi ? (
                <View style={s.bildirimBadge}>
                  <Text style={s.bildirimBadgeText}>{bildirimSayisi > 9 ? '9+' : bildirimSayisi}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          </View>
        </View>
        <View style={s.aramaWrap}>
          <Ionicons name="search-outline" size={18} color="#9ca3af" style={{ marginRight: 8 }} />
          <TextInput
            style={[s.aramaInput, { color: '#111827' }]}
            placeholder="İl, ilçe, mahalle veya ilan ara..."
            placeholderTextColor="#9ca3af"
            value={arama}
            onChangeText={setArama}
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

      {/* ARAMA SONUÇLARI */}
      {arama.trim().length > 0 && (
        <View style={[s.aramaSonucKap, { backgroundColor: colors.bg }]}>
          {aramaYukleniyor ? (
            <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
          ) : aramaSonuclari.length === 0 ? (
            <View style={s.bosArama}>
              <Ionicons name="search-outline" size={42} color={colors.textMuted} />
              <Text style={[s.bosAramaText, { color: colors.textMuted }]}>Sonuç bulunamadı</Text>
              <Text style={[s.bosAramaAlt, { color: colors.textMuted }]}>"{arama}" için ilan yok</Text>
            </View>
          ) : (
            <View style={s.aramaSonucListe}>
              {aramaSonuclari.map(item => (
                <TouchableOpacity
                  key={String(item.id)}
                  style={[s.aramaSonucSatir, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => navigation.navigate('IlanDetay', { id: item.id })}
                  activeOpacity={0.85}
                >
                  <Image source={{ uri: item.gorsel || GORSEL_FALLBACK }} style={s.aramaSonucGorsel} resizeMode="cover" />
                  <View style={s.aramaSonucBilgi}>
                    <Text style={[s.aramaSonucBaslik, { color: colors.text }]} numberOfLines={2}>{item.baslik}</Text>
                    <Text style={[s.aramaSonucFiyat, { color: '#2563eb' }]}>{fiyatFormat(item.fiyat)}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <Ionicons name="location-outline" size={11} color={colors.textMuted} />
                      <Text style={[s.aramaSonucKonum, { color: colors.textMuted }]} numberOfLines={1}>
                        {[item.ilce, item.sehir].filter(Boolean).join(', ') || '—'}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                      {item.tip ? (
                        <View style={[s.aramaSonucBadge, { backgroundColor: item.tip === 'Kiralık' ? '#dbeafe' : '#eff6ff' }]}>
                          <Text style={{ fontSize: 10, fontWeight: '700', color: '#2563eb' }}>{item.tip}</Text>
                        </View>
                      ) : null}
                      {item.emlak_turu ? (
                        <View style={[s.aramaSonucBadge, { backgroundColor: colors.badge }]}>
                          <Text style={{ fontSize: 10, fontWeight: '600', color: colors.badgeText }}>{item.emlak_turu}</Text>
                        </View>
                      ) : null}
                      {item.metrekare ? (
                        <View style={[s.aramaSonucBadge, { backgroundColor: colors.badge }]}>
                          <Text style={{ fontSize: 10, fontWeight: '600', color: colors.badgeText }}>{item.metrekare} m²</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={{ alignSelf: 'center' }} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Normal İçerik — arama yokken göster */}
      {arama.trim().length === 0 && <>

      {/* Category Shortcuts */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.kategoriBar}
        style={[s.kategoriScroll, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
      >
        {KATEGORILER.map(k => (
          <TouchableOpacity
            key={k.key}
            style={[s.kategoriBtn, { backgroundColor: colors.bg, borderColor: colors.borderStrong }]}
            onPress={() => navigation.navigate('TumIlanlar', { ...k.params, baslik: k.label })}
          >
            <Text style={s.kategoriBtnEmoji}>{k.emoji}</Text>
            <Text style={[s.kategoriBtnText, { color: colors.text }]}>{k.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Gayrimenkul Çözümleri */}
      <Text style={[s.bolumBaslik, { color: colors.grupBaslik }]}>GAYRİMENKUL ÇÖZÜMLERİ</Text>
      <View style={s.cozumlerGrid}>
        {COZUMLER.map(c => (
          <TouchableOpacity
            key={c.id}
            style={[s.cozumKart, { backgroundColor: colors.card, borderColor: colors.border }, c.yeni && { backgroundColor: tema === 'dark' ? '#1e3a5f' : '#eff6ff', borderColor: tema === 'dark' ? '#1d4ed8' : '#bfdbfe' }]}
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
            <Text style={[s.cozumBaslik, { color: colors.text }]}>{c.baslik}</Text>
            <Text style={[s.cozumAlt, { color: colors.textSecondary }]}>{c.alt}</Text>
            <View style={s.cozumAltRow}>
              <Ionicons name={c.icon} size={32} color={c.yeni ? '#2563eb' : colors.textSecondary} />
              <View style={[s.cozumOk, { borderColor: colors.borderStrong }]}>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Fiyatı Düşen Bölümü */}
      <View style={s.bolumHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="trending-down" size={18} color="#2563eb" />
          <Text style={[s.bolumBaslikKucuk, { color: colors.text }]}>FİYATI DÜŞEN İLANLAR</Text>
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
      <View style={[s.tabRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {[{ key: 'satilik', label: 'Satılık' }, { key: 'kiralik', label: 'Kiralık' }].map(t => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setAktifTab(t.key)}
            style={[s.tabBtn, aktifTab === t.key && { backgroundColor: tema === 'dark' ? '#1e3a5f' : '#eff6ff' }]}
          >
            <Text style={[s.tabText, { color: colors.textSecondary }, aktifTab === t.key && { color: '#2563eb' }]}>
              {t.key === 'satilik' ? 'Fiyatı Düşen Satılıklar' : 'Fiyatı Düşen Kiralıklar'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* İlan Carousel */}
      {yukleniyor ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 32, marginBottom: 32 }} />
      ) : goruntelenecek.length === 0 ? (
        <View style={s.bosKarti}>
          <Ionicons name="trending-down-outline" size={36} color={colors.textMuted} />
          <Text style={[s.bosKartiText, { color: colors.textMuted }]}>Henüz fiyatı düşen ilan yok</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.ilanlarCarousel}>
          {goruntelenecek.map(ilan => (
            <IlanKarti
              key={ilan.id}
              ilan={ilan}
              colors={colors}
              onPress={() => navigation.navigate('IlanDetay', { id: ilan.id })}
            />
          ))}
        </ScrollView>
      )}

      {/* Son İlanlar */}
      <View style={[s.evBolumu, { backgroundColor: tema === 'dark' ? '#1e3a5f' : '#eff6ff', borderColor: tema === 'dark' ? '#1d4ed8' : '#bfdbfe' }]}>
        <View style={s.evBolumIcerik}>
          <Ionicons name="home" size={20} color="#2563eb" />
          <Text style={[s.evBolumBaslik, { color: colors.text }]}>Ev mi arıyorsun?</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('TumIlanlar', {})}>
          <Text style={s.tumunuGor}>Tümünü Gör</Text>
        </TouchableOpacity>
      </View>

      {/* İlginizi Çekebilecek İlanlar */}
      <View style={s.bolumHeader}>
        <Text style={[s.bolumBaslikKucuk, { color: colors.text }]}>İLGİNİZİ ÇEKEBİLECEK İLANLAR</Text>
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
              colors={colors}
              onPress={() => navigation.navigate('IlanDetay', { id: ilan.id })}
            />
          ))}
        </ScrollView>
      )}

      <View style={{ height: 32 }} />

      </> /* arama.trim().length === 0 */}

    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:         { flex: 1 },
  gradientHeader:    { paddingTop: 52, paddingHorizontal: 16, paddingBottom: 20 },
  gradientHeaderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  gradientLogo:      { fontSize: 26, fontWeight: '900', color: '#fff' },
  gradientAlt:       { fontSize: 13, color: '#bfdbfe', marginTop: 3 },
  notifBtn:          { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  bildirimBadge:     { position: 'absolute', top: -4, right: -4, backgroundColor: '#ef4444', borderRadius: 8, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3 },
  bildirimBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  aramaWrap:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  aramaInput:        { flex: 1, fontSize: 14 },
  kategoriScroll:    { borderBottomWidth: 1 },
  kategoriBar:       { paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  kategoriBtn:       { alignItems: 'center', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, minWidth: 68, gap: 4 },
  kategoriBtnEmoji:  { fontSize: 20 },
  kategoriBtnText:   { fontSize: 11, fontWeight: '700' },
  bolumBaslik:       { fontSize: 11, fontWeight: '700', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10, letterSpacing: 0.8 },
  bolumHeader:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10 },
  bolumBaslikKucuk:  { fontSize: 13, fontWeight: '800', letterSpacing: 0.4 },
  tumunuGor:         { fontSize: 13, fontWeight: '700', color: '#2563eb' },
  cozumlerGrid:      { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10 },
  cozumKart:         { width: (width - 34) / 2, borderRadius: 16, padding: 14, borderWidth: 1, minHeight: 130 },
  yeniBadge:         { alignSelf: 'flex-end' },
  yeniText:          { fontSize: 11, fontWeight: '800', color: '#2563eb' },
  cozumBaslik:       { fontSize: 14, fontWeight: '800', marginTop: 4 },
  cozumAlt:          { fontSize: 11, marginTop: 4, lineHeight: 16 },
  cozumAltRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 12 },
  cozumOk:           { width: 30, height: 30, borderRadius: 15, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  tabRow:            { flexDirection: 'row', marginHorizontal: 16, borderRadius: 12, padding: 4, gap: 4, borderWidth: 1 },
  tabBtn:            { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center' },
  tabText:           { fontSize: 12, fontWeight: '600' },
  ilanlarCarousel:   { paddingHorizontal: 16, gap: 12, marginTop: 12, paddingBottom: 4 },
  ilanKart:          { width: 168, borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
  evBolumu:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginTop: 20, marginBottom: 4, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1 },
  evBolumIcerik:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  evBolumBaslik:     { fontSize: 16, fontWeight: '900', letterSpacing: 0.3 },
  ilanGorsel:        { width: '100%', height: 130 },
  tipBadge:          { position: 'absolute', top: 8, left: 8, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  tipText:           { color: '#fff', fontSize: 10, fontWeight: '700' },
  ilanBilgi:         { padding: 10 },
  ilanFiyat:         { fontSize: 14, fontWeight: '900' },
  ilanBaslik:        { fontSize: 12, fontWeight: '600', marginTop: 2 },
  ilanAlt:           { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  ilanKonum:         { fontSize: 11, flex: 1 },
  ilanChipler:       { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  chip:              { fontSize: 10, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, fontWeight: '600' },
  dususBadge:        { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#eff6ff', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3, marginTop: 3, alignSelf: 'flex-start' },
  dususBadgeText:    { fontSize: 9, fontWeight: '700', color: '#2563eb' },
  bosKarti:          { alignItems: 'center', paddingVertical: 32, gap: 8, marginHorizontal: 16 },
  bosKartiText:      { fontSize: 13, fontWeight: '600' },
  aramaSonucKap:     { flex: 1, minHeight: 300 },
  aramaSonucListe:   { padding: 16, gap: 12 },
  aramaSonucSatir:   { flexDirection: 'row', borderRadius: 16, overflow: 'hidden', borderWidth: 1, gap: 0 },
  aramaSonucGorsel:  { width: 100, height: 100 },
  aramaSonucBilgi:   { flex: 1, padding: 12 },
  aramaSonucBaslik:  { fontSize: 13, fontWeight: '700', lineHeight: 18 },
  aramaSonucFiyat:   { fontSize: 14, fontWeight: '900', marginTop: 4 },
  aramaSonucKonum:   { fontSize: 11, flex: 1 },
  aramaSonucBadge:   { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  bosArama:          { alignItems: 'center', paddingVertical: 60, gap: 10 },
  bosAramaText:      { fontSize: 16, fontWeight: '700' },
  bosAramaAlt:       { fontSize: 13 },
});
