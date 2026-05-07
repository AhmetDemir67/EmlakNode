import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Modal, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { kayitliAdreslerGetir, kayitliAdresSil, kayitliAdresEkle } from '../services/api';

export default function KayitliAdreslerScreen({ navigation }) {
  const [adresler, setAdresler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [eklemeMod, setEklemeMod] = useState(false);
  const [yeniBaslik, setYeniBaslik] = useState('');
  const [yeniSehir, setYeniSehir] = useState('');
  const [yeniIlce, setYeniIlce] = useState('');

  useFocusEffect(
    useCallback(() => {
      setYukleniyor(true);
      kayitliAdreslerGetir()
        .then(r => setAdresler(r.data.adresler || []))
        .catch(() => setAdresler([]))
        .finally(() => setYukleniyor(false));
    }, [])
  );

  const sil = (id, baslik) => {
    Alert.alert('Adresi Sil', `"${baslik}" silinsin mi?`, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil', style: 'destructive', onPress: async () => {
          await kayitliAdresSil(id).catch(() => {});
          setAdresler(prev => prev.filter(a => a.id !== id));
        },
      },
    ]);
  };

  const adresEkle = async () => {
    if (!yeniBaslik.trim()) return;
    try {
      const r = await kayitliAdresEkle({ baslik: yeniBaslik.trim(), sehir: yeniSehir.trim(), ilce: yeniIlce.trim() });
      setAdresler(prev => [r.data.adres, ...prev]);
      setEklemeMod(false);
      setYeniBaslik(''); setYeniSehir(''); setYeniIlce('');
    } catch {
      Alert.alert('Hata', 'Adres eklenemedi.');
    }
  };

  const haritadaGor = (item) => {
    if (!item.enlem || !item.boylam) return;
    navigation.navigate('Harita', {
      ilanlar: [],
      merkez: { lat: parseFloat(item.enlem), lng: parseFloat(item.boylam) },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>

      <Modal visible={eklemeMod} transparent animationType="slide" onRequestClose={() => setEklemeMod(false)}>
        <TouchableOpacity style={s.modalArka} activeOpacity={1} onPress={() => setEklemeMod(false)} />
        <View style={s.modalKutu}>
          <View style={s.modalUst}>
            <Text style={s.modalBaslik}>Adres Ekle</Text>
            <TouchableOpacity onPress={() => setEklemeMod(false)}>
              <Ionicons name="close" size={22} color="#374151" />
            </TouchableOpacity>
          </View>
          <TextInput style={s.input} placeholder="Başlık (örn. Ev, İş Yeri)" value={yeniBaslik} onChangeText={setYeniBaslik} placeholderTextColor="#9ca3af" />
          <TextInput style={s.input} placeholder="Şehir" value={yeniSehir} onChangeText={setYeniSehir} placeholderTextColor="#9ca3af" />
          <TextInput style={s.input} placeholder="İlçe" value={yeniIlce} onChangeText={setYeniIlce} placeholderTextColor="#9ca3af" />
          <TouchableOpacity style={s.kaydetBtn} onPress={adresEkle}>
            <Text style={s.kaydetBtnText}>Kaydet</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {yukleniyor ? (
        <View style={s.merkez}><ActivityIndicator size="large" color="#16a34a" /></View>
      ) : adresler.length === 0 ? (
        <View style={s.merkez}>
          <Ionicons name="location-outline" size={56} color="#d1d5db" />
          <Text style={s.bosBaslik}>Kayıtlı adres yok</Text>
          <Text style={s.bosAlt}>Sağ alttaki + butonuna basarak adres ekleyebilirsin.</Text>
        </View>
      ) : (
        <FlatList
          data={adresler}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={s.liste}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const altText = [item.adres, item.ilce, item.sehir].filter(Boolean).join(', ');
            const koordinat = item.enlem && item.boylam;
            return (
              <View style={s.kart}>
                <View style={s.ikonWrap}>
                  <Ionicons name="location" size={20} color="#16a34a" />
                </View>
                <View style={s.icerik}>
                  <Text style={s.baslik}>{item.baslik}</Text>
                  {altText ? <Text style={s.altText}>{altText}</Text> : null}
                  {koordinat ? (
                    <TouchableOpacity onPress={() => haritadaGor(item)}>
                      <Text style={s.haritaLink}>Haritada Gör</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
                <TouchableOpacity style={s.silBtn} onPress={() => sil(item.id, item.baslik)}>
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}

      <TouchableOpacity style={s.fab} onPress={() => setEklemeMod(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

    </View>
  );
}

const s = StyleSheet.create({
  merkez:     { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 32, backgroundColor: '#f9fafb' },
  bosBaslik:  { fontSize: 18, fontWeight: '800', color: '#111827', marginTop: 8 },
  bosAlt:     { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 22 },

  liste:      { padding: 16, gap: 10, backgroundColor: '#f5f5f5' },
  kart:       { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  ikonWrap:   { width: 44, height: 44, borderRadius: 12, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center' },
  icerik:     { flex: 1, gap: 3 },
  baslik:     { fontSize: 15, fontWeight: '700', color: '#111827' },
  altText:    { fontSize: 12, color: '#6b7280' },
  haritaLink: { fontSize: 12, fontWeight: '700', color: '#16a34a', marginTop: 4 },
  silBtn:     { padding: 8 },
  fab:        { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#16a34a', justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#16a34a', shadowOpacity: 0.4, shadowRadius: 8 },
  modalArka:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalKutu:  { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40, gap: 12 },
  modalUst:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  modalBaslik:{ fontSize: 17, fontWeight: '800', color: '#111827' },
  input:      { borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#111827' },
  kaydetBtn:  { backgroundColor: '#16a34a', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 4 },
  kaydetBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
