import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mesajlariGetir, mesajGonder } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const tarihFormat = (t) => {
  if (!t) return '';
  const d = new Date(t);
  return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
};

const gunFormat = (t) => {
  if (!t) return '';
  const d   = new Date(t);
  const now = new Date();
  const fark = Math.floor((now - d) / 86400000);
  if (fark === 0) return 'Bugün';
  if (fark === 1) return 'Dün';
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
};

export default function KonusmaScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { konusmaId, karsiAd, ilanBaslik } = route.params;
  const [mesajlar, setMesajlar]       = useState([]);
  const [metin, setMetin]             = useState('');
  const [yukleniyor, setYukleniyor]   = useState(true);
  const [gonderiliyor, setGond]       = useState(false);
  const [benimId, setBenimId]         = useState(null);
  const listRef = useRef(null);

  useEffect(() => {
    AsyncStorage.getItem('kullanici').then(v => {
      if (v) setBenimId(JSON.parse(v).id);
    });

    mesajlariGetir(konusmaId)
      .then(r => setMesajlar(r.data.mesajlar || []))
      .catch(() => {})
      .finally(() => setYukleniyor(false));

    // Yeni mesajlar için 5 saniyede bir polling
    const interval = setInterval(() => {
      mesajlariGetir(konusmaId)
        .then(r => {
          const yeni = r.data.mesajlar || [];
          setMesajlar(prev => {
            if (yeni.length > prev.length) {
              setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
            }
            return yeni;
          });
        })
        .catch(() => {});
    }, 5000);

    return () => clearInterval(interval);
  }, [konusmaId]);

  const gonder = async () => {
    const t = metin.trim();
    if (!t || gonderiliyor) return;
    setGond(true);
    setMetin('');
    try {
      const r = await mesajGonder({ konusma_id: konusmaId, metin: t, alici_id: route.params.karsiId });
      setMesajlar(prev => [...prev, r.data.mesaj]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch {
      setMetin(t);
    } finally {
      setGond(false);
    }
  };

  // Mesajları gün gruplarına ayır
  const mesajlarGruplu = mesajlar.reduce((acc, m) => {
    const gun = new Date(m.olusturulma).toDateString();
    if (!acc.length || acc[acc.length - 1].gun !== gun) {
      acc.push({ gun, gunLabel: gunFormat(m.olusturulma), mesajlar: [m] });
    } else {
      acc[acc.length - 1].mesajlar.push(m);
    }
    return acc;
  }, []);

  const duzItems = mesajlarGruplu.flatMap(g => [
    { type: 'gun', key: `gun-${g.gun}`, label: g.gunLabel },
    ...g.mesajlar.map(m => ({ type: 'mesaj', key: String(m.id), ...m })),
  ]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Header */}
      <LinearGradient colors={['#1e3a8a', '#2563eb']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.headerGrad}>
        <SafeAreaView>
          <View style={s.header}>
            <TouchableOpacity style={s.geriBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={26} color="#fff" />
            </TouchableOpacity>
            <View style={s.headerAvatar}>
              <Text style={s.headerAvatarText}>{(karsiAd || 'K').charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.headerAd} numberOfLines={1}>{karsiAd || 'Kullanıcı'}</Text>
              {ilanBaslik ? (
                <Text style={s.headerIlan} numberOfLines={1}>🏠 {ilanBaslik}</Text>
              ) : null}
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Mesajlar */}
      {yukleniyor ? (
        <View style={[s.merkez, { backgroundColor: colors.bg }]}><ActivityIndicator size="large" color="#2563eb" /></View>
      ) : (
        <FlatList
          ref={listRef}
          data={duzItems}
          style={{ backgroundColor: colors.bg }}
          keyExtractor={i => i.key}
          contentContainerStyle={s.liste}
          onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => {
            if (item.type === 'gun') {
              return (
                <View style={[s.gunSatir, { backgroundColor: colors.border }]}>
                  <Text style={[s.gunText, { color: colors.textSecondary }]}>{item.label}</Text>
                </View>
              );
            }
            const benden = parseInt(item.gonderen_id) === parseInt(benimId);
            return (
              <View style={[s.mesajWrap, benden ? s.mesajWrapSag : s.mesajWrapSol]}>
                <View style={[s.mesajKutu,
                  benden ? s.mesajKutuSag : [s.mesajKutuSol, { backgroundColor: colors.card, borderColor: colors.border }]
                ]}>
                  <Text style={[s.mesajMetin, benden ? s.mesajMetinSag : { color: colors.text }]}>
                    {item.metin}
                  </Text>
                  <Text style={[s.mesajSaat, { color: colors.textMuted }, benden && { color: 'rgba(255,255,255,0.7)' }]}>
                    {tarihFormat(item.olusturulma)}
                    {benden && (item.okundu
                      ? <Text>  ✓✓</Text>
                      : <Text>  ✓</Text>
                    )}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Yazma alanı */}
      <View style={[s.yazmaAlan, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TextInput
          style={[s.input, { backgroundColor: colors.input, color: colors.text }]}
          placeholder="Mesajınızı yazın..."
          placeholderTextColor={colors.textMuted}
          value={metin}
          onChangeText={setMetin}
          multiline
          maxLength={1000}
          onSubmitEditing={gonder}
        />
        <TouchableOpacity
          style={[s.gonderBtn, (!metin.trim() || gonderiliyor) && s.gonderBtnPasif]}
          onPress={gonder}
          disabled={!metin.trim() || gonderiliyor}
        >
          {gonderiliyor
            ? <ActivityIndicator size="small" color="#fff" />
            : <Ionicons name="send" size={20} color="#fff" />
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  headerGrad:    { paddingTop: 44 },
  header:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 12, gap: 8 },
  geriBtn:       { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerAvatar:  { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center' },
  headerAvatarText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  headerAd:      { fontSize: 16, fontWeight: '800', color: '#fff' },
  headerIlan:    { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 1 },

  merkez:        { flex: 1, justifyContent: 'center', alignItems: 'center' },
  liste:         { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 8, gap: 4 },

  gunSatir:      { alignSelf: 'center', backgroundColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4, marginVertical: 8 },
  gunText:       { fontSize: 12, color: '#6b7280', fontWeight: '600' },

  mesajWrap:     { flexDirection: 'row', marginVertical: 2 },
  mesajWrapSag:  { justifyContent: 'flex-end' },
  mesajWrapSol:  { justifyContent: 'flex-start' },
  mesajKutu:     { maxWidth: '78%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, gap: 4 },
  mesajKutuSag:  { backgroundColor: '#2563eb', borderBottomRightRadius: 4 },
  mesajKutuSol:  { backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#f0f0f0' },
  mesajMetin:    { fontSize: 15, lineHeight: 22 },
  mesajMetinSag: { color: '#fff' },
  mesajMetinSol: { color: '#111827' },
  mesajSaat:     { fontSize: 11, color: '#9ca3af', alignSelf: 'flex-end' },

  yazmaAlan:     { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0', gap: 10 },
  input:         { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: '#111827', maxHeight: 120 },
  gonderBtn:     { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center' },
  gonderBtnPasif:{ backgroundColor: '#d1d5db' },
});
