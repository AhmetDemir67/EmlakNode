import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ilanGuncelle } from '../services/api';

const fiyatFormat = (f) =>
  new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(f) + ' TL';

const TIPLER    = ['Satılık', 'Kiralık'];
const ODA_TIPLER = ['Stüdyo', '1+1', '2+1', '3+1', '4+1', '5+1', '6+1'];
const ISINMA    = ['Kombi', 'Doğalgaz', 'Merkezi', 'Klima', 'Soba', 'Yok'];

export default function IlanDuzenleScreen({ route, navigation }) {
  const { ilan } = route.params;

  const [baslik, setBaslik]         = useState(ilan.baslik || '');
  const [fiyat, setFiyat]           = useState(String(ilan.fiyat || ''));
  const [aciklama, setAciklama]     = useState(ilan.aciklama || '');
  const [tip, setTip]               = useState(ilan.tip || 'Satılık');
  const [metrekare, setMetrekare]   = useState(String(ilan.metrekare || ''));
  const [odaSayisi, setOdaSayisi]   = useState(ilan.oda_sayisi || '');
  const [kat, setKat]               = useState(String(ilan.kat || ''));
  const [toplamKat, setToplamKat]   = useState(String(ilan.toplam_kat || ''));
  const [isinma, setIsinma]         = useState(ilan.isinma_tipi || '');
  const [sehir, setSehir]           = useState(ilan.sehir || '');
  const [ilce, setIlce]             = useState(ilan.ilce || '');
  const [mahalle, setMahalle]       = useState(ilan.mahalle || '');
  const [yukleniyor, setYukleniyor] = useState(false);

  const eskiFiyat = parseFloat(ilan.fiyat);
  const yeniFiyat = parseFloat(fiyat);
  const fiyatDustu = !isNaN(yeniFiyat) && !isNaN(eskiFiyat) && yeniFiyat < eskiFiyat;

  const kaydet = async () => {
    if (!baslik.trim()) return Alert.alert('Hata', 'Başlık zorunludur.');
    if (!fiyat || isNaN(parseFloat(fiyat))) return Alert.alert('Hata', 'Geçerli bir fiyat girin.');

    setYukleniyor(true);
    try {
      await ilanGuncelle(ilan.id, {
        baslik: baslik.trim(),
        fiyat: parseFloat(fiyat),
        aciklama: aciklama.trim() || undefined,
        tip,
        metrekare: metrekare ? parseFloat(metrekare) : undefined,
        oda_sayisi: odaSayisi || undefined,
        kat: kat ? parseInt(kat) : undefined,
        toplam_kat: toplamKat ? parseInt(toplamKat) : undefined,
        isinma_tipi: isinma || undefined,
        sehir: sehir.trim() || undefined,
        ilce: ilce.trim() || undefined,
        mahalle: mahalle.trim() || undefined,
      });
      Alert.alert('Kaydedildi', 'İlan başarıyla güncellendi.', [
        { text: 'Tamam', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Hata', e?.response?.data?.mesaj || 'İlan güncellenemedi.');
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>

      {/* Fiyat düşüş uyarısı */}
      {fiyatDustu ? (
        <View style={s.dususUyari}>
          <Ionicons name="trending-down" size={18} color="#16a34a" />
          <Text style={s.dususText}>
            {fiyatFormat(eskiFiyat)} → {fiyatFormat(yeniFiyat)} — Fiyat düşüşü kaydedilecek
          </Text>
        </View>
      ) : null}

      <View style={s.kart}>
        <Text style={s.bolumBaslik}>TEMEL BİLGİLER</Text>

        <Text style={s.etiket}>Başlık *</Text>
        <TextInput style={s.input} value={baslik} onChangeText={setBaslik} placeholder="İlan başlığı" />

        <Text style={s.etiket}>Fiyat (₺) *</Text>
        <TextInput
          style={s.input}
          value={fiyat}
          onChangeText={setFiyat}
          keyboardType="numeric"
          placeholder="Örn: 2500000"
        />
        {fiyatDustu ? (
          <Text style={s.dususHint}>↓ Eski fiyat: {fiyatFormat(eskiFiyat)}</Text>
        ) : null}

        <Text style={s.etiket}>İlan Tipi</Text>
        <View style={s.chipRow}>
          {TIPLER.map(t => (
            <TouchableOpacity
              key={t}
              style={[s.chip, tip === t && s.chipAktif]}
              onPress={() => setTip(t)}
            >
              <Text style={[s.chipText, tip === t && s.chipTextAktif]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={s.kart}>
        <Text style={s.bolumBaslik}>DETAYLAR</Text>

        <View style={s.ikilRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.etiket}>Metrekare (m²)</Text>
            <TextInput style={s.input} value={metrekare} onChangeText={setMetrekare} keyboardType="numeric" placeholder="120" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.etiket}>Bulunduğu Kat</Text>
            <TextInput style={s.input} value={kat} onChangeText={setKat} keyboardType="numeric" placeholder="3" />
          </View>
        </View>

        <Text style={s.etiket}>Oda Sayısı</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipScroll}>
          {ODA_TIPLER.map(o => (
            <TouchableOpacity
              key={o}
              style={[s.chip, odaSayisi === o && s.chipAktif]}
              onPress={() => setOdaSayisi(odaSayisi === o ? '' : o)}
            >
              <Text style={[s.chipText, odaSayisi === o && s.chipTextAktif]}>{o}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={s.etiket}>Isıtma Tipi</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipScroll}>
          {ISINMA.map(i => (
            <TouchableOpacity
              key={i}
              style={[s.chip, isinma === i && s.chipAktif]}
              onPress={() => setIsinma(isinma === i ? '' : i)}
            >
              <Text style={[s.chipText, isinma === i && s.chipTextAktif]}>{i}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={s.kart}>
        <Text style={s.bolumBaslik}>KONUM</Text>

        <Text style={s.etiket}>Şehir</Text>
        <TextInput style={s.input} value={sehir} onChangeText={setSehir} placeholder="İstanbul" />

        <Text style={s.etiket}>İlçe</Text>
        <TextInput style={s.input} value={ilce} onChangeText={setIlce} placeholder="Kadıköy" />

        <Text style={s.etiket}>Mahalle</Text>
        <TextInput style={s.input} value={mahalle} onChangeText={setMahalle} placeholder="Moda Mahallesi" />
      </View>

      <View style={s.kart}>
        <Text style={s.bolumBaslik}>AÇIKLAMA</Text>
        <TextInput
          style={[s.input, s.aciklamaInput]}
          value={aciklama}
          onChangeText={setAciklama}
          placeholder="İlan açıklaması..."
          multiline
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity style={s.kaydetBtn} onPress={kaydet} disabled={yukleniyor}>
        {yukleniyor
          ? <ActivityIndicator color="#fff" />
          : <Text style={s.kaydetBtnText}>Değişiklikleri Kaydet</Text>
        }
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#f5f5f5' },
  dususUyari:    { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#86efac', margin: 16, marginBottom: 0, padding: 12, borderRadius: 12 },
  dususText:     { flex: 1, fontSize: 13, fontWeight: '700', color: '#15803d' },
  kart:          { backgroundColor: '#fff', margin: 16, marginBottom: 0, borderRadius: 16, padding: 16, gap: 4 },
  bolumBaslik:   { fontSize: 11, fontWeight: '800', color: '#9ca3af', letterSpacing: 1, marginBottom: 8 },
  etiket:        { fontSize: 13, fontWeight: '600', color: '#374151', marginTop: 8, marginBottom: 4 },
  input:         { borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: '#111827', backgroundColor: '#fafafa' },
  aciklamaInput: { height: 100, paddingTop: 12 },
  ikilRow:       { flexDirection: 'row', gap: 12 },
  chipRow:       { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 4 },
  chipScroll:    { gap: 8, paddingVertical: 4 },
  chip:          { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: '#fafafa' },
  chipAktif:     { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  chipText:      { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  chipTextAktif: { color: '#16a34a' },
  dususHint:     { fontSize: 12, color: '#16a34a', fontWeight: '600', marginTop: 4 },
  kaydetBtn:     { margin: 16, backgroundColor: '#16a34a', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  kaydetBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
