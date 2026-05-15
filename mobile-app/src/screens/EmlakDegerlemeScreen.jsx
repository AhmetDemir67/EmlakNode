import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { aiMulkDegerle } from '../services/api';

const TURLER   = ['Daire', 'Villa', 'Müstakil Ev', 'Arsa', 'İşyeri', 'Depo'];
const TIP_LIST = ['Satılık', 'Kiralık'];
const ODA_LIST = ['1+1', '2+1', '3+1', '4+1', '5+1 ve üzeri'];

const fiyatFormat = (f) =>
  f >= 1_000_000
    ? (f / 1_000_000).toFixed(2) + ' Milyon ₺'
    : new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(f) + ' ₺';

export default function EmlakDegerlemeScreen({ navigation }) {
  const [tip, setTip]             = useState('Satılık');
  const [tur, setTur]             = useState('Daire');
  const [sehir, setSehir]         = useState('');
  const [ilce, setIlce]           = useState('');
  const [mahalle, setMahalle]     = useState('');
  const [metrekare, setMetrekare] = useState('');
  const [odaSayisi, setOdaSayisi] = useState('');
  const [binaYasi, setBinaYasi]   = useState('');
  const [referansNokta, setReferansNokta] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [sonuc, setSonuc]         = useState(null);

  const hesapla = async () => {
    if (!sehir.trim() || !metrekare.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen şehir ve metrekare bilgisini girin.');
      return;
    }
    setYukleniyor(true);
    setSonuc(null);
    try {
      const r = await aiMulkDegerle({
        tip, emlak_turu: tur, sehir, ilce, mahalle,
        metrekare, oda_sayisi: odaSayisi, bina_yasi: binaYasi,
        referans_nokta: referansNokta.trim() || undefined,
      });
      setSonuc(r.data.degerleme);
    } catch {
      Alert.alert('Hata', 'Değerleme yapılamadı. Lütfen internet bağlantınızı kontrol edin.');
    } finally {
      setYukleniyor(false);
    }
  };

  const temizle = () => {
    setSehir(''); setIlce(''); setMahalle('');
    setMetrekare(''); setOdaSayisi('');
    setBinaYasi(''); setReferansNokta(''); setSonuc(null);
    setTip('Satılık'); setTur('Daire');
  };

  const trendIkon = (trend) => {
    if (!trend) return null;
    if (trend.includes('Yüksel')) return { name: 'trending-up', color: '#16a34a' };
    if (trend.includes('Düşüyor')) return { name: 'trending-down', color: '#dc2626' };
    return { name: 'remove-outline', color: '#9ca3af' };
  };

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <LinearGradient colors={['#1e3a8a', '#2563eb']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.header}>
        <TouchableOpacity style={s.geriBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerBaslik}>Emlak Değerleme</Text>
        <TouchableOpacity style={s.geriBtn} onPress={temizle}>
          <Ionicons name="refresh-outline" size={22} color="rgba(255,255,255,0.85)" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Bilgi kartı */}
      <View style={s.bilgiKart}>
        <Ionicons name="sparkles-outline" size={20} color="#3b82f6" />
        <Text style={s.bilgiText}>
          AI destekli değerleme; konum, ulaşım, çevre olanakları ve piyasa trendlerini
          analiz ederek size gerçekçi bir fiyat aralığı sunar.
        </Text>
      </View>

      {/* Tip seçimi */}
      <View style={s.grup}>
        <Text style={s.grupBaslik}>İŞLEM TİPİ</Text>
        <View style={s.chipRow}>
          {TIP_LIST.map(t => (
            <TouchableOpacity
              key={t}
              style={[s.chip, tip === t && s.chipAktif]}
              onPress={() => { setTip(t); setSonuc(null); }}
            >
              <Text style={[s.chipText, tip === t && s.chipTextAktif]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Emlak türü */}
      <View style={s.grup}>
        <Text style={s.grupBaslik}>EMLAK TÜRÜ</Text>
        <View style={s.chipRow}>
          {TURLER.map(t => (
            <TouchableOpacity
              key={t}
              style={[s.chip, tur === t && s.chipAktif]}
              onPress={() => { setTur(t); setSonuc(null); }}
            >
              <Text style={[s.chipText, tur === t && s.chipTextAktif]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Form alanları */}
      <View style={s.grup}>
        <Text style={s.grupBaslik}>KONUM VE ÖZELLİKLER</Text>
        <View style={s.formKutu}>
          <View style={s.inputWrap}>
            <Text style={s.inputLabel}>Şehir *</Text>
            <TextInput
              style={s.input}
              placeholder="İstanbul, Ankara, İzmir..."
              placeholderTextColor="#9ca3af"
              value={sehir}
              onChangeText={v => { setSehir(v); setSonuc(null); }}
              autoCapitalize="words"
            />
          </View>
          <View style={[s.inputWrap, s.ayrac]}>
            <Text style={s.inputLabel}>İlçe</Text>
            <TextInput
              style={s.input}
              placeholder="Kadıköy, Çankaya..."
              placeholderTextColor="#9ca3af"
              value={ilce}
              onChangeText={v => { setIlce(v); setSonuc(null); }}
              autoCapitalize="words"
            />
          </View>
          <View style={[s.inputWrap, s.ayrac]}>
            <Text style={s.inputLabel}>Mahalle</Text>
            <TextInput
              style={s.input}
              placeholder="Moda, Bağcılar..."
              placeholderTextColor="#9ca3af"
              value={mahalle}
              onChangeText={v => { setMahalle(v); setSonuc(null); }}
              autoCapitalize="words"
            />
          </View>
          <View style={[s.inputWrap, s.ayrac]}>
            <Text style={s.inputLabel}>Metrekare *</Text>
            <TextInput
              style={s.input}
              placeholder="Brüt m²"
              placeholderTextColor="#9ca3af"
              value={metrekare}
              onChangeText={v => { setMetrekare(v); setSonuc(null); }}
              keyboardType="numeric"
            />
          </View>
          {tur !== 'Arsa' && tur !== 'Depo' && (
            <View style={[s.inputWrap, s.ayrac]}>
              <Text style={s.inputLabel}>Oda Sayısı</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', gap: 6, paddingVertical: 8, paddingRight: 4 }}>
                  {ODA_LIST.map(o => (
                    <TouchableOpacity
                      key={o}
                      style={[s.odaChip, odaSayisi === o && s.odaChipAktif]}
                      onPress={() => { setOdaSayisi(odaSayisi === o ? '' : o); setSonuc(null); }}
                    >
                      <Text style={[s.odaChipText, odaSayisi === o && s.odaChipTextAktif]}>{o}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
          <View style={[s.inputWrap, s.ayrac]}>
            <Text style={s.inputLabel}>Bina Yaşı</Text>
            <TextInput
              style={s.input}
              placeholder="Yıl (0 = sıfır bina)"
              placeholderTextColor="#9ca3af"
              value={binaYasi}
              onChangeText={v => { setBinaYasi(v); setSonuc(null); }}
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>

      {/* Referans nokta */}
      <View style={s.grup}>
        <Text style={s.grupBaslik}>REFERANS NOKTA (OPSİYONEL)</Text>
        <View style={s.formKutu}>
          <View style={s.inputWrap}>
            <Ionicons name="navigate-outline" size={18} color="#9ca3af" style={{ marginRight: 10 }} />
            <TextInput
              style={[s.input, { flex: 1 }]}
              placeholder="İşyeri, okul, hastane... (örn: Levent Metro)"
              placeholderTextColor="#9ca3af"
              value={referansNokta}
              onChangeText={v => { setReferansNokta(v); setSonuc(null); }}
              autoCapitalize="words"
            />
          </View>
        </View>
        <Text style={s.referansAciklama}>
          Girdiğiniz noktaya yakınlık AI tarafından analiz edilip fiyatlamaya yansıtılır.
        </Text>
      </View>

      {/* Hesapla butonu */}
      <TouchableOpacity
        style={[s.hesaplaBtn, yukleniyor && { opacity: 0.7 }]}
        onPress={hesapla}
        disabled={yukleniyor}
      >
        {yukleniyor
          ? <ActivityIndicator size={18} color="#fff" />
          : <Ionicons name="sparkles" size={18} color="#fff" />
        }
        <Text style={s.hesaplaBtnText}>
          {yukleniyor ? 'AI Analiz Yapıyor...' : 'AI ile Değer Hesapla'}
        </Text>
      </TouchableOpacity>

      {/* Sonuç */}
      {sonuc && (
        <View style={s.sonucKart}>
          {/* Başlık */}
          <View style={s.sonucBaslikRow}>
            <Ionicons name="stats-chart" size={22} color="#2563eb" />
            <Text style={s.sonucBaslik}>AI Değerleme Sonucu</Text>
            {sonuc.fiyatTrendi && (() => {
              const ikon = trendIkon(sonuc.fiyatTrendi);
              return ikon ? (
                <View style={[s.trendBadge, { backgroundColor: ikon.color + '18' }]}>
                  <Ionicons name={ikon.name} size={13} color={ikon.color} />
                  <Text style={[s.trendText, { color: ikon.color }]}>{sonuc.fiyatTrendi}</Text>
                </View>
              ) : null;
            })()}
          </View>

          {/* Fiyat aralığı */}
          <View style={s.fiyatRow}>
            <View style={s.fiyatKutu}>
              <Text style={s.fiyatEtiket}>Alt Sınır</Text>
              <Text style={s.fiyatDeger}>{fiyatFormat(sonuc.minFiyat)}</Text>
            </View>
            <Ionicons name="swap-horizontal-outline" size={18} color="#9ca3af" />
            <View style={s.fiyatKutu}>
              <Text style={s.fiyatEtiket}>Üst Sınır</Text>
              <Text style={s.fiyatDeger}>{fiyatFormat(sonuc.maxFiyat)}</Text>
            </View>
          </View>

          {/* Ortalama ve m² */}
          <View style={s.istatRow}>
            <View style={s.istatKutu}>
              <Text style={s.istatEtiket}>Tahmini Ortalama</Text>
              <Text style={s.istatDeger}>{fiyatFormat(sonuc.tahminiOrtalama)}</Text>
            </View>
            <View style={[s.istatKutu, s.istatSag]}>
              <Text style={s.istatEtiket}>m² Fiyatı</Text>
              <Text style={s.istatDeger}>{fiyatFormat(sonuc.m2Fiyat)}/m²</Text>
            </View>
          </View>

          {/* Piyasa durumu */}
          {sonuc.piyasaDurumu && (
            <View style={s.piyasaRow}>
              <Ionicons name="pulse-outline" size={14} color="#7c3aed" />
              <Text style={s.piyasaText}>{sonuc.piyasaDurumu}</Text>
            </View>
          )}

          {/* Özet */}
          {sonuc.ozet && (
            <View style={s.ozetKutu}>
              <Text style={s.ozetBaslik}>Bölge Analizi</Text>
              <Text style={s.ozetMetin}>{sonuc.ozet}</Text>
            </View>
          )}

          {/* Referans nokta uzaklığı */}
          {sonuc.referansUzakligi && (
            <View style={s.uzaklikKutu}>
              <View style={s.uzaklikBaslikRow}>
                <Ionicons name="navigate-circle-outline" size={16} color="#2563eb" />
                <Text style={s.uzaklikBaslik}>"{referansNokta}" Uzaklığı</Text>
              </View>
              <Text style={s.uzaklikMetin}>{sonuc.referansUzakligi}</Text>
            </View>
          )}

          {/* Tavsiye */}
          {sonuc.tavsiye && (
            <View style={s.tavsiyeKutu}>
              <Ionicons name="bulb-outline" size={15} color="#d97706" />
              <Text style={s.tavsiyeMetin}>{sonuc.tavsiye}</Text>
            </View>
          )}

          <Text style={s.sonucUyari}>
            * Tahmin, bölge piyasa verileri ve AI analizine dayanmaktadır. Kesin değer için
            lisanslı bir gayrimenkul değerleme uzmanına başvurunuz.
          </Text>
        </View>
      )}

      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#f5f5f5' },

  header:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingTop: 48, paddingBottom: 14 },
  geriBtn:        { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerBaslik:   { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800', color: '#fff' },

  bilgiKart:      { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#eff6ff', marginHorizontal: 16, marginTop: 16, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#bfdbfe' },
  bilgiText:      { flex: 1, fontSize: 12, color: '#1d4ed8', lineHeight: 18 },

  grup:           { marginTop: 20 },
  grupBaslik:     { fontSize: 11, fontWeight: '700', color: '#9ca3af', paddingHorizontal: 20, paddingBottom: 8, letterSpacing: 0.8 },
  chipRow:        { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8 },
  chip:           { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: '#fff' },
  chipAktif:      { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  chipText:       { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  chipTextAktif:  { color: '#2563eb' },

  formKutu:       { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#f0f0f0' },
  inputWrap:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, minHeight: 56 },
  ayrac:          { borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  inputLabel:     { width: 100, fontSize: 14, color: '#6b7280', fontWeight: '600' },
  input:          { flex: 1, fontSize: 14, color: '#111827', fontWeight: '600' },

  odaChip:        { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: '#fafafa' },
  odaChipAktif:   { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  odaChipText:    { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  odaChipTextAktif: { color: '#2563eb' },

  hesaplaBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#2563eb', marginHorizontal: 16, marginTop: 24, paddingVertical: 16, borderRadius: 16 },
  hesaplaBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },

  // Sonuç kartı
  sonucKart:      { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 20, borderRadius: 20, padding: 18, borderWidth: 2, borderColor: '#bfdbfe' },

  sonucBaslikRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sonucBaslik:    { flex: 1, fontSize: 15, fontWeight: '800', color: '#111827' },
  trendBadge:     { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  trendText:      { fontSize: 11, fontWeight: '700' },

  fiyatRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: '#eff6ff', borderRadius: 14, padding: 14, gap: 8 },
  fiyatKutu:      { alignItems: 'center', gap: 4 },
  fiyatEtiket:    { fontSize: 11, color: '#6b7280', fontWeight: '600' },
  fiyatDeger:     { fontSize: 17, fontWeight: '900', color: '#2563eb' },

  istatRow:       { flexDirection: 'row', marginTop: 12 },
  istatKutu:      { flex: 1, padding: 12, backgroundColor: '#f8fafc', borderRadius: 12 },
  istatSag:       { marginLeft: 8 },
  istatEtiket:    { fontSize: 11, color: '#9ca3af', fontWeight: '600', marginBottom: 4 },
  istatDeger:     { fontSize: 14, fontWeight: '800', color: '#374151' },

  piyasaRow:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#f5f3ff', borderRadius: 10 },
  piyasaText:     { fontSize: 13, fontWeight: '700', color: '#7c3aed' },

  ozetKutu:       { marginTop: 12, padding: 12, backgroundColor: '#f8fafc', borderRadius: 12 },
  ozetBaslik:     { fontSize: 11, fontWeight: '700', color: '#9ca3af', marginBottom: 6, letterSpacing: 0.5 },
  ozetMetin:      { fontSize: 13, color: '#374151', lineHeight: 20 },

  tavsiyeKutu:    { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 10, padding: 12, backgroundColor: '#fffbeb', borderRadius: 12, borderWidth: 1, borderColor: '#fde68a' },
  tavsiyeMetin:   { flex: 1, fontSize: 13, color: '#92400e', lineHeight: 19, fontWeight: '500' },

  referansAciklama: { fontSize: 11, color: '#9ca3af', paddingHorizontal: 20, paddingTop: 6, lineHeight: 16 },

  uzaklikKutu:    { marginTop: 10, padding: 12, backgroundColor: '#eff6ff', borderRadius: 12, borderWidth: 1, borderColor: '#bfdbfe' },
  uzaklikBaslikRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  uzaklikBaslik:  { fontSize: 12, fontWeight: '700', color: '#2563eb' },
  uzaklikMetin:   { fontSize: 13, color: '#1e40af', lineHeight: 20 },

  sonucUyari:     { fontSize: 11, color: '#9ca3af', marginTop: 12, lineHeight: 16 },
});
