import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MesajlarScreen() {
  return (
    <View style={s.container}>
      <View style={s.icerik}>
        <View style={s.ikonWrap}>
          <Ionicons name="notifications-outline" size={40} color="#fff" />
        </View>
        <Text style={s.baslik}>Mesajınız Bulunmamaktadır.</Text>
        <Text style={s.aciklama}>
          Mesajlarınıza gelen cevaplardan ve size özel fırsatlardan haberdar olmak için bildirimleri açın.
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
  icerik:     { alignItems: 'center', paddingHorizontal: 40, gap: 16 },
  ikonWrap:   { width: 80, height: 80, borderRadius: 40, backgroundColor: '#16a34a', justifyContent: 'center', alignItems: 'center' },
  baslik:     { fontSize: 18, fontWeight: '800', color: '#111827', textAlign: 'center' },
  aciklama:   { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 22 },
});
