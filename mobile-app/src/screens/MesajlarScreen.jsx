import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { konusmalariGetir } from '../services/api';

const tarihKisa = (t) => {
  if (!t) return '';
  const d   = new Date(t);
  const now = new Date();
  const fark = Math.floor((now - d) / 1000);
  if (fark < 60)    return 'az önce';
  if (fark < 3600)  return `${Math.floor(fark / 60)} dk`;
  if (fark < 86400) return `${Math.floor(fark / 3600)} sa`;
  if (fark < 604800) return `${Math.floor(fark / 86400)} gün`;
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
};

const bas = (str = '') =>
  str.split(' ').map(w => w.charAt(0).toUpperCase()).slice(0, 2).join('');

export default function MesajlarScreen({ navigation }) {
  const [konusmalar, setKonusmalar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [giris, setGiris]           = useState(false);

  useFocusEffect(
    useCallback(() => {
      const yukle = async () => {
        setYukleniyor(true);
        const token = await AsyncStorage.getItem('token');
        if (!token) { setGiris(false); setYukleniyor(false); return; }
        setGiris(true);
        try {
          const r = await konusmalariGetir();
          setKonusmalar(r.data.konusmalar || []);
        } catch {
          setKonusmalar([]);
        } finally {
          setYukleniyor(false);
        }
      };
      yukle();
    }, [])
  );

  if (!giris) {
    return (
      <View style={s.merkez}>
        <Ionicons name="chatbubbles-outline" size={56} color="#d1d5db" />
        <Text style={s.bosBaslik}>Mesajlarınıza erişmek için giriş yapın</Text>
        <TouchableOpacity style={s.btn} onPress={() => navigation.navigate('Giris')}>
          <Text style={s.btnText}>Giriş Yap</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (yukleniyor) {
    return <View style={s.merkez}><ActivityIndicator size="large" color="#16a34a" /></View>;
  }

  return (
    <View style={s.container}>
      {konusmalar.length > 0 && (
        <View style={s.topBant}>
          <Ionicons name="chatbubbles" size={14} color="#16a34a" />
          <Text style={s.topBantText}>{konusmalar.length} aktif konuşma</Text>
        </View>
      )}
      <FlatList
        data={konusmalar}
        keyExtractor={i => String(i.id)}
        ItemSeparatorComponent={() => <View style={s.ayrac} />}
        ListEmptyComponent={
          <View style={s.bos}>
            <Ionicons name="chatbubble-outline" size={56} color="#d1d5db" />
            <Text style={s.bosBaslik}>Henüz mesajınız yok</Text>
            <Text style={s.bosAlt}>İlan sahipleriyle ilgili ilan sayfasından iletişime geçebilirsiniz.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const okunmamis = parseInt(item.okunmamis) > 0;
          return (
            <TouchableOpacity
              style={s.konusma}
              onPress={() => navigation.navigate('Konusma', {
                konusmaId: item.id,
                karsiAd: item.karsi_ad,
                ilanBaslik: item.ilan_baslik,
                karsiId: item.karsi_id,
              })}
              activeOpacity={0.8}
            >
              <View style={[s.avatar, okunmamis && s.avatarAktif]}>
                <Text style={[s.avatarText, okunmamis && { color: '#16a34a' }]}>
                  {bas(item.karsi_ad)}
                </Text>
              </View>
              <View style={s.icerik}>
                <View style={s.icerikUst}>
                  <Text style={[s.karsiAd, okunmamis && { fontWeight: '800' }]} numberOfLines={1}>
                    {item.karsi_ad || 'Kullanıcı'}
                  </Text>
                  <Text style={s.tarih}>{tarihKisa(item.son_tarih)}</Text>
                </View>
                {item.ilan_baslik ? (
                  <Text style={s.ilanBaslik} numberOfLines={1}>🏠 {item.ilan_baslik}</Text>
                ) : null}
                <View style={s.sonMesajRow}>
                  <Text
                    style={[s.sonMesaj, okunmamis && { color: '#111827', fontWeight: '700' }]}
                    numberOfLines={1}
                  >
                    {item.son_mesaj || 'Konuşma başlatıldı'}
                  </Text>
                  {okunmamis ? (
                    <View style={s.okunmamisBadge}>
                      <Text style={s.okunmamisText}>{item.okunmamis}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#fff' },
  topBant:        { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f0fdf4', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#dcfce7' },
  topBantText:    { fontSize: 13, fontWeight: '600', color: '#16a34a' },
  merkez:         { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14, padding: 40 },
  bos:            { alignItems: 'center', paddingTop: 80, gap: 12, paddingHorizontal: 40 },
  bosBaslik:      { fontSize: 16, fontWeight: '700', color: '#374151', textAlign: 'center' },
  bosAlt:         { fontSize: 13, color: '#9ca3af', textAlign: 'center', lineHeight: 20 },
  btn:            { backgroundColor: '#16a34a', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12 },
  btnText:        { color: '#fff', fontWeight: '700', fontSize: 14 },
  ayrac:          { height: 1, backgroundColor: '#f5f5f5', marginLeft: 80 },
  konusma:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 14 },
  avatar:         { width: 52, height: 52, borderRadius: 26, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  avatarAktif:    { backgroundColor: '#f0fdf4' },
  avatarText:     { fontSize: 18, fontWeight: '900', color: '#6b7280' },
  icerik:         { flex: 1, gap: 3 },
  icerikUst:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  karsiAd:        { fontSize: 15, fontWeight: '600', color: '#111827', flex: 1 },
  tarih:          { fontSize: 12, color: '#9ca3af', marginLeft: 8 },
  ilanBaslik:     { fontSize: 12, color: '#9ca3af' },
  sonMesajRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sonMesaj:       { fontSize: 13, color: '#6b7280', flex: 1 },
  okunmamisBadge: { backgroundColor: '#16a34a', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5, marginLeft: 6 },
  okunmamisText:  { fontSize: 11, fontWeight: '800', color: '#fff' },
});
