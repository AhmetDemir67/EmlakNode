import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { ilanDetayGetir } from '../services/api';

const GORSEL_FALLBACK = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80';
const fiyatFormat = (f) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(f);

const OzellikSatir = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <View style={s.ozellikSatir}>
      <View style={s.ozellikIkon}>
        <Ionicons name={icon} size={16} color="#16a34a" />
      </View>
      <Text style={s.ozellikLabel}>{label}</Text>
      <Text style={s.ozellikValue}>{value}</Text>
    </View>
  );
};

export default function IlanDetayScreen({ route, navigation }) {
  const { id } = route.params;
  const [ilan, setIlan] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    ilanDetayGetir(id)
      .then(r => setIlan(r.data.ilan || r.data))
      .catch(() => setIlan(null))
      .finally(() => setYukleniyor(false));
  }, [id]);

  if (yukleniyor) {
    return (
      <View style={s.merkez}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  if (!ilan) {
    return (
      <View style={s.merkez}>
        <Ionicons name="alert-circle-outline" size={48} color="#d1d5db" />
        <Text style={s.bosText}>İlan bulunamadı</Text>
        <TouchableOpacity style={s.geriBtn} onPress={() => navigation.goBack()}>
          <Text style={s.geriBtnText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const konum = [ilan.mahalle, ilan.ilce, ilan.sehir].filter(Boolean).join(', ');

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
        {/* Görsel */}
        <View style={s.gorselWrap}>
          <Image
            source={{ uri: ilan.gorsel || GORSEL_FALLBACK }}
            style={s.gorsel}
            resizeMode="cover"
          />
          <TouchableOpacity style={s.geriIkon} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </TouchableOpacity>
          <View style={[s.tipBadge, { backgroundColor: ilan.tip === 'Kiralık' ? '#3b82f6' : '#16a34a' }]}>
            <Text style={s.tipText}>{ilan.tip || 'Satılık'}</Text>
          </View>
        </View>

        <View style={s.icerik}>
          {/* Fiyat & Başlık */}
          <Text style={s.fiyat}>{fiyatFormat(ilan.fiyat)}</Text>
          <Text style={s.baslik}>{ilan.baslik}</Text>

          {/* Konum */}
          {konum ? (
            <View style={s.konumRow}>
              <Ionicons name="location-outline" size={15} color="#6b7280" />
              <Text style={s.konumText}>{konum}</Text>
            </View>
          ) : null}


          {/* Özellikler */}
          <View style={s.kart}>
            <Text style={s.kartBaslik}>Genel Bilgiler</Text>
            <OzellikSatir icon="home-outline"    label="Emlak Türü"   value={ilan.emlak_turu} />
            <OzellikSatir icon="resize-outline"  label="Metrekare"    value={ilan.metrekare ? `${ilan.metrekare} m²` : null} />
            <OzellikSatir icon="bed-outline"     label="Oda Sayısı"   value={ilan.oda_sayisi} />
            <OzellikSatir icon="layers-outline"  label="Kat"          value={ilan.kat ? `${ilan.kat}. Kat` : null} />
            <OzellikSatir icon="calendar-outline" label="Bina Yaşı"   value={ilan.bina_yasi ? `${ilan.bina_yasi} yıl` : null} />
          </View>

          {/* Açıklama */}
          {ilan.aciklama ? (
            <View style={s.kart}>
              <Text style={s.kartBaslik}>Açıklama</Text>
              <Text style={s.aciklama}>{ilan.aciklama}</Text>
            </View>
          ) : null}

          {/* Konum Haritası */}
          {ilan.enlem && ilan.boylam ? (
            <View style={s.kart}>
              <Text style={s.kartBaslik}>Konum</Text>
              <View style={s.haritaWrap}>
                <WebView
                  style={s.harita}
                  javaScriptEnabled
                  source={{ html: `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><style>*{margin:0;padding:0}html,body,#map{width:100%;height:100%}</style></head><body><div id="map"></div><script>var map=L.map('map',{zoomControl:false}).setView([${parseFloat(ilan.enlem)},${parseFloat(ilan.boylam)}],15);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);L.marker([${parseFloat(ilan.enlem)},${parseFloat(ilan.boylam)}]).addTo(map);</script></body></html>` }}
                />
              </View>
            </View>
          ) : null}

          {/* İlan Sahibi */}
          {ilan.dukkan_adi ? (
            <View style={[s.kart, s.ofisKart]}>
              <View style={s.ofisIkon}>
                <Ionicons name="business-outline" size={22} color="#16a34a" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.ofisAd}>{ilan.dukkan_adi}</Text>
                <Text style={s.ofisAlt}>Yetkili Emlak Ofisi</Text>
              </View>
            </View>
          ) : null}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* İletişim Butonu */}
      <View style={s.altBar}>
        <TouchableOpacity
          style={s.iletisimBtn}
          onPress={() => Linking.openURL('tel:05001234567')}
        >
          <Ionicons name="call-outline" size={20} color="#fff" />
          <Text style={s.iletisimBtnText}>İletişime Geç</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#f9fafb' },
  merkez:         { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  bosText:        { fontSize: 16, color: '#6b7280', fontWeight: '600' },
  geriBtn:        { backgroundColor: '#16a34a', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12 },
  geriBtnText:    { color: '#fff', fontWeight: '700' },
  gorselWrap:     { position: 'relative' },
  gorsel:         { width: '100%', height: 280 },
  geriIkon:       { position: 'absolute', top: 48, left: 16, backgroundColor: '#fff', borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 },
  tipBadge:       { position: 'absolute', top: 48, right: 16, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  tipText:        { color: '#fff', fontSize: 12, fontWeight: '700' },
  icerik:         { padding: 16 },
  fiyat:          { fontSize: 26, fontWeight: '900', color: '#16a34a', marginBottom: 6 },
  baslik:         { fontSize: 18, fontWeight: '700', color: '#111827', lineHeight: 26 },
  konumRow:       { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, marginBottom: 4 },
  konumText:      { fontSize: 13, color: '#6b7280' },
  kart:           { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginTop: 12, borderWidth: 1, borderColor: '#f3f4f6' },
  kartBaslik:     { fontSize: 13, fontWeight: '800', color: '#374151', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  ozellikSatir:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  ozellikIkon:    { width: 30, height: 30, backgroundColor: '#f0fdf4', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  ozellikLabel:   { flex: 1, fontSize: 13, color: '#6b7280' },
  ozellikValue:   { fontSize: 13, fontWeight: '700', color: '#111827' },
  aciklama:       { fontSize: 14, color: '#374151', lineHeight: 22 },
  ofisKart:       { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ofisIkon:       { width: 48, height: 48, backgroundColor: '#f0fdf4', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  ofisAd:         { fontSize: 15, fontWeight: '700', color: '#111827' },
  ofisAlt:        { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  haritaWrap:     { height: 200, borderRadius: 12, overflow: 'hidden', marginTop: 4 },
  harita:         { flex: 1 },
  altBar:         { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 16, paddingBottom: 28, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  iletisimBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#16a34a', paddingVertical: 15, borderRadius: 14 },
  iletisimBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
