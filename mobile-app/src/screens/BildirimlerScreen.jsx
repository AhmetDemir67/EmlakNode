import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { bildirimleriGetir, bildirimOku, hepsiniOku } from '../services/api';
import { useTheme } from '../context/ThemeContext';

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

const TIPLER = {
  mesaj:  { icon: 'chatbubble',        renk: '#2563eb' },
  favori: { icon: 'heart',             renk: '#ef4444' },
  ilan:   { icon: 'home',              renk: '#10b981' },
  sistem: { icon: 'information-circle', renk: '#f59e0b' },
};

export default function BildirimlerScreen({ navigation }) {
  const { colors, tema } = useTheme();
  const [bildirimler, setBildirimler] = useState([]);
  const [yukleniyor, setYukleniyor]   = useState(true);
  const [giris, setGiris]             = useState(false);

  useFocusEffect(
    useCallback(() => {
      const yukle = async () => {
        setYukleniyor(true);
        const token = await AsyncStorage.getItem('token');
        if (!token) { setGiris(false); setYukleniyor(false); return; }
        setGiris(true);
        try {
          const r = await bildirimleriGetir();
          setBildirimler(r.data.bildirimler || []);
        } catch {
          setBildirimler([]);
        } finally {
          setYukleniyor(false);
        }
      };
      yukle();
    }, [])
  );

  const tekOku = async (id) => {
    setBildirimler(prev => prev.map(b => b.id === id ? { ...b, okundu: true } : b));
    try { await bildirimOku(id); } catch {}
  };

  const tumunuOku = async () => {
    setBildirimler(prev => prev.map(b => ({ ...b, okundu: true })));
    try { await hepsiniOku(); } catch {}
  };

  const bildirimTikla = async (item) => {
    await tekOku(item.id);
    if (item.tip === 'mesaj' && item.konusma_id) {
      navigation.navigate('Konusma', { konusmaId: item.konusma_id, karsiAd: item.baslik?.replace('Yeni Mesaj', '').trim() || 'Kullanıcı', ilanBaslik: item.ilan_baslik });
    } else if (item.ilan_id) {
      navigation.navigate('IlanDetay', { id: item.ilan_id });
    }
  };

  const okunmamisVar = bildirimler.some(b => !b.okundu);

  if (!giris) {
    return (
      <View style={[s.merkez, { backgroundColor: colors.bg }]}>
        <Ionicons name="notifications-outline" size={56} color={colors.textMuted} />
        <Text style={[s.bosBaslik, { color: colors.text }]}>Bildirimleri görmek için giriş yapın</Text>
        <TouchableOpacity style={s.btn} onPress={() => navigation.navigate('Giris')}>
          <Text style={s.btnText}>Giriş Yap</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[s.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={s.geriBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[s.headerBaslik, { color: colors.text }]}>Bildirimler</Text>
        {okunmamisVar ? (
          <TouchableOpacity onPress={tumunuOku} style={s.tumunuOkuBtn}>
            <Text style={s.tumunuOkuText}>Tümünü Oku</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 80 }} />
        )}
      </View>

      {yukleniyor ? (
        <View style={s.merkez}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={bildirimler}
          keyExtractor={i => String(i.id)}
          ItemSeparatorComponent={() => <View style={[s.ayrac, { backgroundColor: colors.border }]} />}
          ListEmptyComponent={
            <View style={s.bos}>
              <Ionicons name="notifications-off-outline" size={56} color={colors.textMuted} />
              <Text style={[s.bosBaslik, { color: colors.text }]}>Bildirim yok</Text>
              <Text style={[s.bosAlt, { color: colors.textMuted }]}>Yeni bildirimler burada görünecek.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const tip = TIPLER[item.tip] || TIPLER.sistem;
            return (
              <TouchableOpacity
                style={[
                  s.satir,
                  { backgroundColor: item.okundu ? colors.card : (tema === 'dark' ? '#1e3a5f' : '#eff6ff') },
                ]}
                onPress={() => bildirimTikla(item)}
                activeOpacity={0.8}
              >
                <View style={[s.ikonKap, { backgroundColor: tip.renk + '20' }]}>
                  <Ionicons name={tip.icon} size={22} color={tip.renk} />
                </View>
                <View style={s.icerik}>
                  <View style={s.icerikUst}>
                    <Text style={[s.baslik, { color: colors.text }, !item.okundu && { fontWeight: '800' }]} numberOfLines={1}>
                      {item.baslik}
                    </Text>
                    <Text style={[s.tarih, { color: colors.textMuted }]}>{tarihKisa(item.olusturulma)}</Text>
                  </View>
                  <Text style={[s.icerikText, { color: colors.textSecondary }]} numberOfLines={2}>
                    {item.icerik}
                  </Text>
                  {item.ilan_baslik ? (
                    <Text style={[s.ilanAlt, { color: colors.textMuted }]} numberOfLines={1}>
                      🏠 {item.ilan_baslik}
                    </Text>
                  ) : null}
                </View>
                {!item.okundu && <View style={s.okunmamisNokta} />}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container:     { flex: 1 },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                   paddingTop: 52, paddingHorizontal: 8, paddingBottom: 12, borderBottomWidth: 1 },
  geriBtn:       { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerBaslik:  { fontSize: 17, fontWeight: '800' },
  tumunuOkuBtn:  { paddingHorizontal: 12, paddingVertical: 8 },
  tumunuOkuText: { fontSize: 13, fontWeight: '700', color: '#2563eb' },
  merkez:        { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14, padding: 40 },
  bos:           { alignItems: 'center', paddingTop: 80, gap: 12, paddingHorizontal: 40 },
  bosBaslik:     { fontSize: 16, fontWeight: '700', textAlign: 'center' },
  bosAlt:        { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  btn:           { backgroundColor: '#2563eb', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12 },
  btnText:       { color: '#fff', fontWeight: '700', fontSize: 14 },
  ayrac:         { height: 1 },
  satir:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 14 },
  ikonKap:       { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  icerik:        { flex: 1, gap: 3 },
  icerikUst:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  baslik:        { fontSize: 14, fontWeight: '600', flex: 1 },
  tarih:         { fontSize: 12, marginLeft: 8 },
  icerikText:    { fontSize: 13, lineHeight: 18 },
  ilanAlt:       { fontSize: 12, marginTop: 2 },
  okunmamisNokta:{ width: 9, height: 9, borderRadius: 5, backgroundColor: '#2563eb', alignSelf: 'center', flexShrink: 0 },
});
