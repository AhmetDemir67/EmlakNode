import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { ilanlarGetir } from '../services/api';

const fiyatFormat = (f) =>
  new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(f) + ' TL';

const SEHIR_KOORD = {
  istanbul: [41.0082, 28.9784], ankara: [39.9334, 32.8597],
  izmir: [38.4192, 27.1287],    bursa: [40.1826, 29.0665],
  antalya: [36.8969, 30.7133],  adana: [37.0000, 35.3213],
  konya: [37.8714, 32.4846],    gaziantep: [37.0662, 37.3833],
  kocaeli: [40.7654, 29.9408],  mersin: [36.8000, 34.6333],
  diyarbakir: [37.9144, 40.2306], kayseri: [38.7312, 35.4787],
  samsun: [41.2867, 36.33],     trabzon: [41.005, 39.7178],
  malatya: [38.3552, 38.3095],  elazig: [38.6748, 39.2225],
  erzurum: [39.9208, 41.2674],  van: [38.4942, 43.38],
  eskisehir: [39.7767, 30.5206], sakarya: [40.7569, 30.4187],
  denizli: [37.7765, 29.0864],  mugla: [37.2153, 28.3636],
  aydin: [37.8444, 27.8458],    manisa: [38.6191, 27.4289],
  balikesir: [39.6484, 27.8826], tekirdag: [40.9833, 27.5167],
  hatay: [36.4018, 36.3498],    urfa: [37.1591, 38.7969],
  canakkale: [40.1553, 26.4142], edirne: [41.6818, 26.5623],
  bolu: [40.7390, 31.6061],     yalova: [40.6550, 29.2760],
  kutahya: [39.4242, 29.9836],  isparta: [37.7648, 30.5566],
  burdur: [37.7215, 30.2890],   rize: [41.0201, 40.5234],
  giresun: [40.9128, 38.3895],  ordu: [40.9862, 37.8797],
};

const normalizeStr = (s) =>
  (s || '').toLowerCase()
    .replace(/ş/g,'s').replace(/ç/g,'c').replace(/ğ/g,'g')
    .replace(/ü/g,'u').replace(/ö/g,'o').replace(/ı/g,'i');

const sehirKoordBul = (sehir, ilce) => {
  for (const kaynak of [ilce, sehir]) {
    if (!kaynak) continue;
    const n = normalizeStr(kaynak);
    for (const [k, v] of Object.entries(SEHIR_KOORD)) {
      if (n.includes(k) || k.includes(n)) return v;
    }
  }
  return null;
};

const koordinatVer = async (ilan) => {
  if (ilan.enlem && ilan.boylam) return ilan;
  if (ilan.sehir || ilan.ilce || ilan.mahalle) {
    try {
      const adres = [ilan.mahalle, ilan.ilce, ilan.sehir, 'Türkiye'].filter(Boolean).join(', ');
      const sonuc = await Location.geocodeAsync(adres);
      if (sonuc && sonuc.length > 0)
        return { ...ilan, enlem: sonuc[0].latitude, boylam: sonuc[0].longitude };
    } catch {}
    const yedek = sehirKoordBul(ilan.sehir, ilan.ilce);
    if (yedek) return { ...ilan, enlem: yedek[0], boylam: yedek[1] };
  }
  return ilan;
};

const haritaHTML = (ilanlar, merkez, zoom) => {
  const markers = ilanlar
    .filter(i => i.enlem && i.boylam)
    .map(i => ({
      id: i.id,
      lat: parseFloat(i.enlem),
      lng: parseFloat(i.boylam),
      fiyat: fiyatFormat(i.fiyat),
      baslik: (i.baslik || '').replace(/'/g, "\\'").substring(0, 60),
      tip: i.tip || 'Satılık',
      konum: [i.ilce, i.sehir].filter(Boolean).join(', '),
    }));

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"/>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.css"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body,#map { width:100%; height:100%; }
  .fiyat-marker {
    background: #2563eb; color:#fff; font-weight:700; font-size:12px;
    padding:4px 8px; border-radius:8px; white-space:nowrap;
    box-shadow:0 2px 6px rgba(0,0,0,0.3); cursor:pointer;
  }
  .fiyat-marker.kiralik { background:#3b82f6; }
  .popup-baslik { font-weight:700; font-size:13px; margin-bottom:4px; color:#111; }
  .popup-fiyat  { font-weight:900; font-size:15px; color:#2563eb; margin-bottom:3px; }
  .popup-konum  { font-size:11px; color:#6b7280; margin-bottom:8px; }
  .popup-btn    { background:#2563eb; color:#fff; border:none; border-radius:8px;
                  padding:6px 14px; font-weight:700; font-size:13px; cursor:pointer; width:100%; }
</style>
</head>
<body>
<div id="map"></div>
<script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.js"></script>
<script>
var ilanlar = ${JSON.stringify(markers)};
var merkez = [${merkez[0]},${merkez[1]}];
var zoom = ${zoom};

function initMap() {
  var map = L.map('map', { zoomControl:true }).setView(merkez, zoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:'© OpenStreetMap', maxZoom:19
  }).addTo(map);
  ilanlar.forEach(function(ilan) {
    var icon = L.divIcon({
      className:'',
      html:'<div class="fiyat-marker' + (ilan.tip==='Kiralık'?' kiralik':'') + '">' + ilan.fiyat + '</div>',
      iconAnchor:[0,0]
    });
    var marker = L.marker([ilan.lat, ilan.lng], { icon: icon }).addTo(map);
    var popup = L.popup({ maxWidth:220 }).setContent(
      '<div class="popup-baslik">' + ilan.baslik + '</div>' +
      '<div class="popup-fiyat">' + ilan.fiyat + '</div>' +
      '<div class="popup-konum">' + ilan.konum + '</div>' +
      '<button class="popup-btn" onclick="detayGit(' + ilan.id + ')">Detayı Gör →</button>'
    );
    marker.bindPopup(popup);
  });
}

function detayGit(id) {
  window.ReactNativeWebView.postMessage(JSON.stringify({ tip:'detay', id:id }));
}

if (typeof L !== 'undefined') {
  initMap();
} else {
  document.addEventListener('DOMContentLoaded', function() {
    if (typeof L !== 'undefined') initMap();
  });
}
</script>
</body>
</html>`;
};

export default function HaritaScreen({ route, navigation }) {
  const webRef = useRef(null);
  const [ilanlar, setIlanlar]       = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [haritaHazir, setHaritaHazir] = useState(false);
  const haritaHazirRef = useRef(false);

  useEffect(() => {
    const yukle = async () => {
      try {
        let liste = route.params?.ilanlar || [];
        if (liste.length === 0) {
          const r = await ilanlarGetir({ limit: 100 });
          liste = r.data.ilanlar || [];
        }
        try { await Location.requestForegroundPermissionsAsync(); } catch {}
        const koordinatli = await Promise.all(liste.map(koordinatVer));
        setIlanlar(koordinatli);
      } catch {}
      setYukleniyor(false);
      // Harita onLoadEnd gelmezse 5 saniye sonra zorla göster
      setTimeout(() => {
        if (!haritaHazirRef.current) setHaritaHazir(true);
      }, 5000);
    };
    yukle();
  }, []);

  const ilanlarKonumlu = ilanlar.filter(i => i.enlem && i.boylam);
  const ilkIlan = ilanlarKonumlu[0];

  const merkez = ilkIlan
    ? [parseFloat(ilkIlan.enlem), parseFloat(ilkIlan.boylam)]
    : [39.0, 35.0];
  const zoom = ilanlarKonumlu.length === 1 ? 15 : 6;

  const onMessage = (e) => {
    try {
      const data = JSON.parse(e.nativeEvent.data);
      if (data.tip === 'detay') navigation.navigate('IlanDetay', { id: data.id });
    } catch {}
  };

  return (
    <View style={s.container}>
      {(yukleniyor || !haritaHazir) && (
        <View style={s.yukleniyor}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={s.yukleniyorText}>Harita yükleniyor...</Text>
        </View>
      )}

      {!yukleniyor && (
        <WebView
          ref={webRef}
          style={[s.harita, !haritaHazir && { opacity: 0 }]}
          source={{ html: haritaHTML(ilanlarKonumlu, merkez, zoom) }}
          onLoadEnd={() => { haritaHazirRef.current = true; setHaritaHazir(true); }}
          onMessage={onMessage}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={['*']}
        />
      )}

      <TouchableOpacity style={s.geriBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={22} color="#111827" />
      </TouchableOpacity>

      {haritaHazir && (
        <View style={s.sayacBant}>
          <Ionicons name="location" size={14} color="#2563eb" />
          <Text style={s.sayacText}>
            {ilanlarKonumlu.length} ilan haritada
            {ilanlar.length - ilanlarKonumlu.length > 0
              ? ` · ${ilanlar.length - ilanlarKonumlu.length} konum bulunamadı`
              : ''}
          </Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#fff' },
  harita:         { flex: 1 },
  yukleniyor:     { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', gap: 12, backgroundColor: '#fff', zIndex: 10 },
  yukleniyorText: { fontSize: 14, color: '#6b7280' },
  geriBtn:        { position: 'absolute', top: 48, left: 16, backgroundColor: '#fff', borderRadius: 20,
                    width: 40, height: 40, justifyContent: 'center', alignItems: 'center',
                    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, elevation: 6 },
  sayacBant:      { position: 'absolute', bottom: 36, left: 16, right: 16, flexDirection: 'row',
                    alignItems: 'center', gap: 6, backgroundColor: '#fff', borderRadius: 12,
                    paddingHorizontal: 14, paddingVertical: 10,
                    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 },
  sayacText:      { fontSize: 12, fontWeight: '600', color: '#374151', flex: 1 },
});
