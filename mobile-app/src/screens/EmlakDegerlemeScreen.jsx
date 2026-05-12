import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const SEHIR_M2_FIYAT = {
  istanbul:  85000,
  ankara:    35000,
  izmir:     55000,
  bursa:     30000,
  antalya:   45000,
  adana:     20000,
  konya:     18000,
  diger:     15000,
};

const TUR_KATSAYI = {
  'Daire':        1.0,
  'Villa':        1.4,
  'Müstakil Ev':  1.2,
  'Arsa':         0.4,
  'İşyeri':       1.1,
  'Depo':         0.6,
};

const TURLER    = ['Daire', 'Villa', 'Müstakil Ev', 'Arsa', 'İşyeri', 'Depo'];
const TIP_LIST  = ['Satılık', 'Kiralık'];
const ODA_LIST  = ['1+1', '2+1', '3+1', '4+1', '5+1 ve üzeri'];

const fiyatFormat = (f) =>
  new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(f) + ' TL';

export default function EmlakDegerlemeScreen({ navigation }) {
  const [tip, setTip]             = useState('Satılık');
  const [tur, setTur]             = useState('Daire');
  const [sehir, setSehir]         = useState('');
  const [metrekare, setMetrekare] = useState('');
  const [odaSayisi, setOdaSayisi] = useState('');
  const [binaYasi, setBinaYasi]   = useState('');
  const [sonuc, setSonuc]         = useState(null);

  const hesapla = () => {
    if (!sehir.trim() || !metrekare.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen şehir ve metrekare bilgisini girin.');
      return;
    }
    const m2 = parseFloat(metrekare);
    if (isNaN(m2) || m2 <= 0) { Alert.alert('Hata', 'Geçerli bir metrekare giriniz.'); return; }

    const sehirKey  = sehir.toLowerCase().replace(/\s+/g, '');
    const baseM2    = SEHIR_M2_FIYAT[sehirKey] || SEHIR_M2_FIYAT.diger;
    const turKat    = TUR_KATSAYI[tur] || 1.0;
    const yasKat    = binaYasi ? Math.max(0.5, 1 - parseInt(binaYasi) * 0.015) : 1.0;
    const odaKat    = odaSayisi ? (1 + (ODA_LIST.indexOf(odaSayisi) * 0.04)) : 1.0;

    let temelFiyat  = baseM2 * m2 * turKat * yasKat * odaKat;

    if (tip === 'Kiralık') temelFiyat = temelFiyat * 0.004;

    const altSinir  = Math.round(temelFiyat * 0.85);
    const ustSinir  = Math.round(temelFiyat * 1.15);

    setSonuc({ alt: altSinir, ust: ustSinir, m2Fiyat: Math.round(temelFiyat / m2) });
  };

  const temizle = () => {
    setSehir(''); setMetrekare(''); setOdaSayisi('');
    setBinaYasi(''); setSonuc(null);
    setTip('Satılık'); setTur('Daire');
  };

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <LinearGradient colors={['#14532d', '#16a34a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.header}>
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
        <Ionicons name="information-circle-outline" size={20} color="#3b82f6" />
        <Text style={s.bilgiText}>
          Bu araç, piyasa verilerine dayalı tahmini bir değer aralığı sunar. Kesin değer için
          lisanslı bir gayrimenkul değerleme uzmanına başvurunuz.
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
          <View style={[s.inputWrap, { borderTopWidth: 1, borderTopColor: '#f5f5f5' }]}>
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
            <View style={[s.inputWrap, { borderTopWidth: 1, borderTopColor: '#f5f5f5' }]}>
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
          <View style={[s.inputWrap, { borderTopWidth: 1, borderTopColor: '#f5f5f5' }]}>
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

      {/* Hesapla butonu */}
      <TouchableOpacity style={s.hesaplaBtn} onPress={hesapla}>
        <Ionicons name="calculator-outline" size={20} color="#fff" />
        <Text style={s.hesaplaBtnText}>Tahmini Değeri Hesapla</Text>
      </TouchableOpacity>

      {/* Sonuç */}
      {sonuc && (
        <View style={s.sonucKart}>
          <View style={s.sonucBaslikRow}>
            <Ionicons name="stats-chart" size={24} color="#16a34a" />
            <Text style={s.sonucBaslik}>Tahmini Değer Aralığı</Text>
          </View>
          <View style={s.sonucFiyatRow}>
            <View style={s.sonucFiyatKutu}>
              <Text style={s.sonucEtiket}>Alt Sınır</Text>
              <Text style={s.sonucFiyat}>{fiyatFormat(sonuc.alt)}</Text>
            </View>
            <Ionicons name="remove-outline" size={20} color="#9ca3af" />
            <View style={s.sonucFiyatKutu}>
              <Text style={s.sonucEtiket}>Üst Sınır</Text>
              <Text style={s.sonucFiyat}>{fiyatFormat(sonuc.ust)}</Text>
            </View>
          </View>
          <View style={s.m2Fiyat}>
            <Text style={s.m2FiyatText}>Tahmini m² fiyatı:</Text>
            <Text style={s.m2FiyatDeger}>{fiyatFormat(sonuc.m2Fiyat)} / m²</Text>
          </View>
          <Text style={s.sonucUyari}>
            * Tahmin, şehir ortalamaları ve genel piyasa verilerine dayanmaktadır.
          </Text>
        </View>
      )}

      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#f5f5f5' },

  header:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingTop: 48, paddingBottom: 14 },
  geriBtn:       { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerBaslik:  { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800', color: '#fff' },

  bilgiKart:     { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#eff6ff', marginHorizontal: 16, marginTop: 16, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#bfdbfe' },
  bilgiText:     { flex: 1, fontSize: 12, color: '#1d4ed8', lineHeight: 18 },

  grup:          { marginTop: 20 },
  grupBaslik:    { fontSize: 11, fontWeight: '700', color: '#9ca3af', paddingHorizontal: 20, paddingBottom: 8, letterSpacing: 0.8 },
  chipRow:       { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8 },
  chip:          { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: '#fff' },
  chipAktif:     { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  chipText:      { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  chipTextAktif: { color: '#16a34a' },

  formKutu:      { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#f0f0f0' },
  inputWrap:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, minHeight: 56 },
  inputLabel:    { width: 100, fontSize: 14, color: '#6b7280', fontWeight: '600' },
  input:         { flex: 1, fontSize: 14, color: '#111827', fontWeight: '600' },

  odaChip:       { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: '#fafafa' },
  odaChipAktif:  { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  odaChipText:   { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  odaChipTextAktif: { color: '#16a34a' },

  hesaplaBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#16a34a', marginHorizontal: 16, marginTop: 24, paddingVertical: 16, borderRadius: 16 },
  hesaplaBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },

  sonucKart:     { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 20, borderRadius: 20, padding: 20, borderWidth: 2, borderColor: '#bbf7d0' },
  sonucBaslikRow:{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sonucBaslik:   { fontSize: 16, fontWeight: '800', color: '#111827' },
  sonucFiyatRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: '#f0fdf4', borderRadius: 16, padding: 16, gap: 8 },
  sonucFiyatKutu:{ alignItems: 'center', gap: 4 },
  sonucEtiket:   { fontSize: 12, color: '#6b7280', fontWeight: '600' },
  sonucFiyat:    { fontSize: 18, fontWeight: '900', color: '#16a34a' },
  m2Fiyat:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  m2FiyatText:   { fontSize: 13, color: '#6b7280' },
  m2FiyatDeger:  { fontSize: 14, fontWeight: '800', color: '#374151' },
  sonucUyari:    { fontSize: 11, color: '#9ca3af', marginTop: 12, lineHeight: 16 },
});
