import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { ilanlarGetir } from '../services/api';

const fiyatFormat = (f) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(f);

export default function HaritaScreen({ route, navigation }) {
  const [ilanlar, setIlanlar]       = useState(route.params?.ilanlar || []);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [kulKonum, setKulKonum]     = useState(null);
  const [haritaHazir, setHaritaHazir] = useState(false);

  useEffect(() => {
    const yukle = async () => {
      let liste = ilanlar;
      if (liste.length === 0) {
        setYukleniyor(true);
        try {
          const r = await ilanlarGetir({ limit: 100 });
          liste = r.data.ilanlar || [];
          setIlanlar(liste);
        } catch {} finally { setYukleniyor(false); }
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const k = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setKulKonum({ lat: k.coords.latitude, lng: k.coords.longitude });
      }
    };
    yukle();
  }, []);

  const ilanlarKonumlu = ilanlar.filter(i => i.enlem && i.boylam);

  const htmlOlustur = () => {
    const merkezLat = kulKonum?.lat || 39.0;
    const merkezLng = kulKonum?.lng || 35.0;
    const zoom      = kulKonum ? 12 : 6;

    const markerler = ilanlarKonumlu.map(ilan => `
      L.marker([${parseFloat(ilan.enlem)}, ${parseFloat(ilan.boylam)}], {
        icon: L.divIcon({
          className: '',
          html: '<div style="background:${ilan.tip === 'Kiralık' ? '#3b82f6' : '#16a34a'};color:#fff;padding:4px 8px;border-radius:8px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${fiyatFormat(ilan.fiyat)}</div>',
          iconAnchor: [0, 0]
        })
      }).addTo(map)
       .bindPopup('<b>${(ilan.baslik || '').replace(/'/g, "\\'")})</b><br>${[ilan.ilce, ilan.sehir].filter(Boolean).join(', ')}<br><a href="#" onclick="window.ReactNativeWebView.postMessage(\'${ilan.id}\');return false;">Detay Gör →</a>');
    `).join('\n');

    const kulMarker = kulKonum ? `
      L.circleMarker([${kulKonum.lat}, ${kulKonum.lng}], {
        radius: 10, fillColor: '#3b82f6', color: '#fff', weight: 3, fillOpacity: 1
      }).addTo(map).bindPopup('Konumunuz');
    ` : '';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map').setView([${merkezLat}, ${merkezLng}], ${zoom});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);
    ${markerler}
    ${kulMarker}
    window.ReactNativeWebView && window.ReactNativeWebView.postMessage('HAZIR');
  </script>
</body>
</html>`;
  };

  return (
    <View style={s.container}>
      {yukleniyor && (
        <View style={s.yukleniyor}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={s.yukleniyorText}>Harita yükleniyor...</Text>
        </View>
      )}

      <WebView
        source={{ html: htmlOlustur() }}
        style={s.harita}
        javaScriptEnabled
        onMessage={(e) => {
          const id = e.nativeEvent.data;
          if (id !== 'HAZIR' && id) {
            navigation.navigate('IlanDetay', { id: parseInt(id) });
          }
        }}
        onLoadEnd={() => setHaritaHazir(true)}
      />

      <TouchableOpacity style={s.geriBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={22} color="#111827" />
      </TouchableOpacity>

      <View style={s.sayacBant}>
        <Ionicons name="location" size={14} color="#16a34a" />
        <Text style={s.sayacText}>
          {ilanlarKonumlu.length} ilan haritada · {ilanlar.length - ilanlarKonumlu.length} konumsuz
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1 },
  harita:         { flex: 1 },
  yukleniyor:     { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 10, backgroundColor: 'rgba(255,255,255,0.9)', gap: 12 },
  yukleniyorText: { fontSize: 14, color: '#6b7280' },
  geriBtn:        { position: 'absolute', top: 48, left: 16, backgroundColor: '#fff', borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, elevation: 4 },
  sayacBant:      { position: 'absolute', bottom: 36, left: 16, right: 16, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 },
  sayacText:      { fontSize: 12, fontWeight: '600', color: '#374151', flex: 1 },
});
