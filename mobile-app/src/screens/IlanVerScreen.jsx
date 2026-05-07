import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Alert, ActivityIndicator, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import api, { fotografYukleAPI } from '../services/api';

const TIPLER      = ['Satılık', 'Kiralık'];
const TURLER      = ['Daire', 'Villa', 'Müstakil Ev', 'Arsa', 'İşyeri', 'Depo'];
const ISINMA      = ['Kombi', 'Doğalgaz', 'Merkezi', 'Klima', 'Soba', 'Yok'];
const ODA_SECENEKLERI = ['Stüdyo', '1+1', '2+1', '3+1', '4+1', '5+1', '6+1', '7+'];

const Alan = ({ label, value, onChangeText, placeholder, keyboardType = 'default', zorunlu }) => (
  <View style={s.alanWrap}>
    <Text style={s.alanLabel}>{label}{zorunlu && <Text style={{ color: '#ef4444' }}> *</Text>}</Text>
    <TextInput
      style={s.alanInput}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9ca3af"
      keyboardType={keyboardType}
      autoCorrect={false}
      autoCapitalize="none"
    />
  </View>
);

export default function IlanVerScreen({ navigation }) {
  const [kullanici, setKullanici] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [konumAlinıyor, setKonumAlıniyor] = useState(false);
  const [secilenGorseller, setSecilenGorseller] = useState([]);
  const [form, setForm] = useState({
    tip: 'Satılık', emlak_turu: 'Daire',
    baslik: '', aciklama: '', fiyat: '', metrekare: '',
    oda_sayisi: '', bina_yasi: '', kat: '', toplam_kat: '',
    banyo_sayisi: '', isinma_tipi: '',
    balkon: false, asansor: false, otopark: false,
    esyali: false, site_icerisinde: false,
    krediye_uygunluk: false, takas: false,
    sehir: '', ilce: '', mahalle: '', gorsel: '',
    enlem: '', boylam: '',
  });

  useEffect(() => {
    AsyncStorage.getItem('kullanici').then(v => { if (v) setKullanici(JSON.parse(v)); });
  }, []);

  const fotografSec = async (kaynak) => {
    try {
      let izin;
      if (kaynak === 'kamera') {
        izin = await ImagePicker.requestCameraPermissionsAsync();
      } else {
        izin = await ImagePicker.requestMediaLibraryPermissionsAsync();
      }

      if (!izin.granted) {
        Alert.alert('İzin Gerekli', kaynak === 'kamera' ? 'Kamera erişimi verilmedi.' : 'Galeri erişimi verilmedi.');
        return;
      }

      const sonuc = kaynak === 'kamera'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, allowsEditing: true, aspect: [16, 9] })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, allowsMultipleSelection: true });

      if (!sonuc.canceled && sonuc.assets && sonuc.assets.length > 0) {
        const yeniUrilar = sonuc.assets.map(a => a.uri);
        setSecilenGorseller(prev => [...prev, ...yeniUrilar]);
        Alert.alert('✓ Fotoğraf Eklendi', `${yeniUrilar.length} fotoğraf eklendi.`);
      } else if (sonuc.canceled) {
        // kullanıcı iptal etti, normal
      } else {
        Alert.alert('Uyarı', 'Fotoğraf seçilemedi, tekrar dene.');
      }
    } catch (err) {
      Alert.alert('Hata', String(err));
    }
  };

  const fotografSecModal = () => {
    Alert.alert('Fotoğraf Ekle', 'Nereden eklemek istersiniz?', [
      { text: 'Kamera', onPress: () => fotografSec('kamera') },
      { text: 'Galeri', onPress: () => fotografSec('galeri') },
      { text: 'İptal', style: 'cancel' },
    ]);
  };

  const adrestenGeocode = async (sehir, ilce, mahalle) => {
    const adres = [mahalle, ilce, sehir, 'Türkiye'].filter(Boolean).join(', ');
    try {
      const sonuc = await Location.geocodeAsync(adres);
      if (sonuc && sonuc.length > 0) {
        return { enlem: String(sonuc[0].latitude), boylam: String(sonuc[0].longitude) };
      }
    } catch {}
    return null;
  };

  const konumAl = async () => {
    setKonumAlıniyor(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Konum erişimi verilmedi.'); return;
      }
      const konum = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = konum.coords;

      const adres = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (adres.length > 0) {
        const a = adres[0];
        setForm(f => ({
          ...f,
          enlem: String(latitude),
          boylam: String(longitude),
          sehir:   a.city    || a.region  || f.sehir,
          ilce:    a.district || a.subregion || f.ilce,
          mahalle: a.street  || a.name    || f.mahalle,
        }));
      } else {
        setForm(f => ({ ...f, enlem: String(latitude), boylam: String(longitude) }));
      }
      Alert.alert('Konum Alındı', 'Adres bilgileri otomatik dolduruldu.');
    } catch {
      Alert.alert('Hata', 'Konum alınamadı, tekrar deneyin.');
    } finally {
      setKonumAlıniyor(false);
    }
  };

  const gonder = async () => {
    if (!form.baslik || !form.fiyat || !form.metrekare) {
      Alert.alert('Eksik Alan', 'Başlık, fiyat ve metrekare zorunludur.'); return;
    }
    setYukleniyor(true);
    try {
      // Koordinat yoksa adresten otomatik geocode yap
      let enlem = form.enlem;
      let boylam = form.boylam;
      if (!enlem && !boylam && (form.sehir || form.ilce || form.mahalle)) {
        const koords = await adrestenGeocode(form.sehir, form.ilce, form.mahalle);
        if (koords) {
          enlem = koords.enlem;
          boylam = koords.boylam;
        }
      }

      // Seçilen fotoğrafları önce sunucuya yükle, URL'leri al
      let fotografUrls = [];
      if (secilenGorseller.length > 0) {
        const formData = new FormData();
        secilenGorseller.forEach((uri, i) => {
          const filename = uri.split('/').pop() || `foto_${i}.jpg`;
          const ext = filename.split('.').pop().toLowerCase();
          const type = (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg' : `image/${ext || 'jpeg'}`;
          formData.append('fotograflar', { uri, name: filename, type });
        });
        const uploadResp = await fotografYukleAPI(formData);
        fotografUrls = uploadResp.data.urls || [];
      }

      await api.post('/ilanlar', {
        ...form,
        fiyat:             parseFloat(form.fiyat),
        metrekare:         parseFloat(form.metrekare),
        bina_yasi:         form.bina_yasi    ? parseInt(form.bina_yasi)    : undefined,
        kat:               form.kat          ? parseInt(form.kat)          : undefined,
        toplam_kat:        form.toplam_kat   ? parseInt(form.toplam_kat)   : undefined,
        banyo_sayisi:      form.banyo_sayisi ? parseInt(form.banyo_sayisi) : undefined,
        gorsel:            fotografUrls[0] || form.gorsel || undefined,
        fotograflar:       fotografUrls.length > 0 ? fotografUrls : undefined,
        enlem:             enlem ? parseFloat(enlem) : undefined,
        boylam:            boylam ? parseFloat(boylam) : undefined,
      });
      Alert.alert('Başarılı!', 'İlanınız yayınlandı.', [
        { text: 'Tamam', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      const mesaj = err.response?.data?.mesaj || 'Bir hata oluştu.';
      const limitAsimi = err.response?.data?.limit_asimi;
      Alert.alert(
        limitAsimi ? 'İlan Limiti' : 'Hata',
        limitAsimi ? 'Bireysel hesaplar en fazla 3 ilan ekleyebilir. Kurumsal hesap açmanız gerekmektedir.' : mesaj,
      );
    } finally { setYukleniyor(false); }
  };

  if (!kullanici) {
    return (
      <View style={s.girisGerekli}>
        <Ionicons name="lock-closed-outline" size={64} color="#d1d5db" />
        <Text style={s.girisBaslik}>Giriş Yapmanız Gerekiyor</Text>
        <TouchableOpacity style={s.girisBtn} onPress={() => navigation.navigate('Giris')}>
          <Text style={s.girisBtnText}>Giriş Yap</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={s.icerik}>

        {/* İlan Tipi */}
        <Text style={s.grupBaslik}>İlan Tipi</Text>
        <View style={s.secimRow}>
          {TIPLER.map(t => (
            <TouchableOpacity key={t} onPress={() => setForm(f => ({ ...f, tip: t }))}
              style={[s.secimBtn, form.tip === t && s.secimBtnAktif]}>
              <Text style={[s.secimText, form.tip === t && s.secimTextAktif]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Emlak Türü */}
        <Text style={s.grupBaslik}>Emlak Türü</Text>
        <View style={s.secimGrid}>
          {TURLER.map(t => (
            <TouchableOpacity key={t} onPress={() => setForm(f => ({ ...f, emlak_turu: t }))}
              style={[s.turBtn, form.emlak_turu === t && s.turBtnAktif]}>
              <Text style={[s.turText, form.emlak_turu === t && s.turTextAktif]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Fotoğraf */}
        <Text style={s.grupBaslik}>Fotoğraf ({secilenGorseller.length} seçildi)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ height: 100 }} contentContainerStyle={{ gap: 10, alignItems: 'center' }}>
          {secilenGorseller.map((uri, idx) => (
            <View key={idx} style={s.fotografKucuk}>
              <Image source={{ uri }} style={s.fotografKucukGorsel} resizeMode="cover" />
              <TouchableOpacity
                style={s.fotografKucukSil}
                onPress={() => setSecilenGorseller(prev => prev.filter((_, i) => i !== idx))}
              >
                <Ionicons name="close-circle" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={s.fotografEkleBtn} onPress={fotografSecModal}>
            <Ionicons name="camera-outline" size={28} color="#9ca3af" />
            <Text style={s.fotografEkleBtnText}>Ekle</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Temel Bilgiler */}
        <Text style={s.grupBaslik}>İlan Bilgileri</Text>
        <Alan label="İlan Başlığı" value={form.baslik} onChangeText={v => setForm(f => ({ ...f, baslik: v }))} placeholder="Örn: Kadıköy 3+1 Daire" zorunlu />
        <View style={s.alanWrap}>
          <Text style={s.alanLabel}>Açıklama</Text>
          <TextInput style={[s.alanInput, { height: 90, textAlignVertical: 'top' }]}
            value={form.aciklama} onChangeText={v => setForm(f => ({ ...f, aciklama: v }))}
            placeholder="İlan detayları..." placeholderTextColor="#9ca3af" multiline
            autoCorrect={false} autoCapitalize="none" />
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Alan label="Fiyat (₺)" value={form.fiyat} onChangeText={v => setForm(f => ({ ...f, fiyat: v }))} placeholder="4500000" keyboardType="numeric" zorunlu />
          </View>
          <View style={{ flex: 1 }}>
            <Alan label="Metrekare (m²)" value={form.metrekare} onChangeText={v => setForm(f => ({ ...f, metrekare: v }))} placeholder="120" keyboardType="numeric" zorunlu />
          </View>
        </View>

        {/* Oda Sayısı Seçici */}
        <View style={s.alanWrap}>
          <Text style={s.alanLabel}>Oda Sayısı</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {ODA_SECENEKLERI.map(o => (
              <TouchableOpacity
                key={o}
                onPress={() => setForm(f => ({ ...f, oda_sayisi: f.oda_sayisi === o ? '' : o }))}
                style={[s.chipBtn, form.oda_sayisi === o && s.chipBtnAktif]}
              >
                <Text style={[s.chipBtnText, form.oda_sayisi === o && s.chipBtnTextAktif]}>{o}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Alan label="Bulunduğu Kat" value={form.kat} onChangeText={v => setForm(f => ({ ...f, kat: v }))} placeholder="3" keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
            <Alan label="Toplam Kat" value={form.toplam_kat} onChangeText={v => setForm(f => ({ ...f, toplam_kat: v }))} placeholder="8" keyboardType="numeric" />
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Alan label="Banyo Sayısı" value={form.banyo_sayisi} onChangeText={v => setForm(f => ({ ...f, banyo_sayisi: v }))} placeholder="1" keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
            <Alan label="Bina Yaşı" value={form.bina_yasi} onChangeText={v => setForm(f => ({ ...f, bina_yasi: v }))} placeholder="0=sıfır" keyboardType="numeric" />
          </View>
        </View>

        {/* Isıtma Tipi */}
        <View style={s.alanWrap}>
          <Text style={s.alanLabel}>Isıtma Tipi</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {ISINMA.map(i => (
              <TouchableOpacity
                key={i}
                onPress={() => setForm(f => ({ ...f, isinma_tipi: f.isinma_tipi === i ? '' : i }))}
                style={[s.chipBtn, form.isinma_tipi === i && s.chipBtnAktif]}
              >
                <Text style={[s.chipBtnText, form.isinma_tipi === i && s.chipBtnTextAktif]}>{i}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Özellikler */}
        <Text style={s.grupBaslik}>Özellikler</Text>
        <View style={s.toggleGrid}>
          {[
            ['balkon',           'Balkon'],
            ['asansor',          'Asansör'],
            ['otopark',          'Otopark'],
            ['esyali',           'Eşyalı'],
            ['site_icerisinde',  'Site İçi'],
            ['krediye_uygunluk', 'Krediye Uygun'],
            ['takas',            'Takas'],
          ].map(([key, label]) => (
            <TouchableOpacity
              key={key}
              onPress={() => setForm(f => ({ ...f, [key]: !f[key] }))}
              style={[s.toggleBtn, form[key] && s.toggleBtnAktif]}
            >
              <Ionicons
                name={form[key] ? 'checkmark-circle' : 'ellipse-outline'}
                size={16}
                color={form[key] ? '#fff' : '#9ca3af'}
              />
              <Text style={[s.toggleText, form[key] && s.toggleTextAktif]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Konum */}
        <Text style={s.grupBaslik}>Konum</Text>
        <TouchableOpacity style={s.gpsBtn} onPress={konumAl} disabled={konumAlinıyor}>
          {konumAlinıyor ? (
            <ActivityIndicator size="small" color="#16a34a" />
          ) : (
            <Ionicons name="locate-outline" size={18} color="#16a34a" />
          )}
          <Text style={s.gpsBtnText}>
            {konumAlinıyor ? 'Konum alınıyor...' : 'GPS ile Konum Al'}
          </Text>
          {form.enlem ? <Ionicons name="checkmark-circle" size={16} color="#16a34a" /> : null}
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Alan label="Şehir" value={form.sehir} onChangeText={v => setForm(f => ({ ...f, sehir: v }))} placeholder="İstanbul" />
          </View>
          <View style={{ flex: 1 }}>
            <Alan label="İlçe" value={form.ilce} onChangeText={v => setForm(f => ({ ...f, ilce: v }))} placeholder="Kadıköy" />
          </View>
        </View>
        <Alan label="Mahalle" value={form.mahalle} onChangeText={v => setForm(f => ({ ...f, mahalle: v }))} placeholder="Moda Mah." />

        {/* Gönder */}
        <TouchableOpacity style={s.gondBtn} onPress={gonder} disabled={yukleniyor}>
          {yukleniyor
            ? <ActivityIndicator color="#fff" />
            : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={s.gondBtnText}>İlanı Yayınla</Text>
              </View>
            )
          }
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:               { flex: 1, backgroundColor: '#f9fafb' },
  icerik:                  { padding: 16 },
  grupBaslik:              { fontSize: 12, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 20, marginBottom: 10 },
  secimRow:                { flexDirection: 'row', gap: 10 },
  secimBtn:                { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 2, borderColor: '#e5e7eb', alignItems: 'center' },
  secimBtnAktif:           { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  secimText:               { fontSize: 14, fontWeight: '700', color: '#6b7280' },
  secimTextAktif:          { color: '#16a34a' },
  secimGrid:               { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  turBtn:                  { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, borderWidth: 2, borderColor: '#e5e7eb' },
  turBtnAktif:             { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  turText:                 { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  turTextAktif:            { color: '#16a34a' },
  fotografBtn:             { borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: '#e5e7eb', borderStyle: 'dashed', minHeight: 160 },
  fotografPlaceholder:     { flex: 1, minHeight: 160, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb', gap: 6 },
  fotografPlaceholderText: { fontSize: 14, fontWeight: '700', color: '#6b7280' },
  fotografPlaceholderAlt:  { fontSize: 12, color: '#9ca3af' },
  onizleme:                { width: '100%', height: 200 },
  fotografKaldir:          { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, alignSelf: 'flex-end' },
  fotografKaldirText:      { fontSize: 12, color: '#ef4444', fontWeight: '600' },
  gpsBtn:                  { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#86efac', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12 },
  gpsBtnText:              { flex: 1, fontSize: 14, fontWeight: '600', color: '#16a34a' },
  alanWrap:                { marginBottom: 12 },
  alanLabel:               { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 6 },
  alanInput:               { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: '#111827' },
  chipBtn:                 { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: '#fafafa' },
  chipBtnAktif:            { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  chipBtnText:             { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  chipBtnTextAktif:        { color: '#16a34a' },
  toggleGrid:              { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  toggleBtn:               { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 20, borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: '#fafafa' },
  toggleBtnAktif:          { borderColor: '#16a34a', backgroundColor: '#16a34a' },
  toggleText:              { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  toggleTextAktif:         { color: '#fff' },
  gondBtn:                 { alignItems: 'center', justifyContent: 'center', backgroundColor: '#16a34a', paddingVertical: 16, borderRadius: 16, marginTop: 24 },
  gondBtnText:             { color: '#fff', fontSize: 16, fontWeight: '800' },
  fotografKucuk:           { width: 90, height: 90, borderRadius: 10, overflow: 'hidden', position: 'relative' },
  fotografKucukGorsel:     { width: 90, height: 90 },
  fotografKucukSil:        { position: 'absolute', top: 2, right: 2, backgroundColor: '#fff', borderRadius: 10 },
  fotografEkleBtn:         { width: 90, height: 90, borderRadius: 10, borderWidth: 2, borderColor: '#e5e7eb', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', gap: 4, backgroundColor: '#fafafa' },
  fotografEkleBtnText:     { fontSize: 11, fontWeight: '600', color: '#9ca3af' },
  girisGerekli:            { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, padding: 40, backgroundColor: '#f9fafb' },
  girisBaslik:             { fontSize: 18, fontWeight: '800', color: '#111827' },
  girisBtn:                { backgroundColor: '#16a34a', paddingHorizontal: 40, paddingVertical: 14, borderRadius: 14 },
  girisBtnText:            { color: '#fff', fontSize: 15, fontWeight: '800' },
});
