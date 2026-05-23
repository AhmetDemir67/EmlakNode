import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const SatirItem = ({ icon, iconBg, iconColor, baslik, aciklama, onPress, son, colors, sagEleman }) => (
  <TouchableOpacity
    style={[s.satir, { borderBottomColor: colors.border, borderBottomWidth: son ? 0 : 1 }]}
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View style={[s.ikonKap, { backgroundColor: iconBg || colors.bg }]}>
      <Ionicons name={icon} size={20} color={iconColor || '#2563eb'} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={[s.satirBaslik, { color: colors.text }]}>{baslik}</Text>
      {aciklama ? <Text style={[s.satirAciklama, { color: colors.textMuted }]}>{aciklama}</Text> : null}
    </View>
    {sagEleman || (onPress ? <Ionicons name="chevron-forward" size={16} color={colors.textMuted} /> : null)}
  </TouchableOpacity>
);

export default function GizlilikGuvenlikScreen({ navigation }) {
  const { colors, tema } = useTheme();
  const [profilGizli, setProfilGizli]       = useState(false);
  const [ilanGizli, setIlanGizli]           = useState(false);
  const [konumGizli, setKonumGizli]         = useState(false);

  const hesapSil = () => {
    Alert.alert(
      'Hesabı Sil',
      'Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve tüm verileriniz silinir.',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Hesabı Sil', style: 'destructive', onPress: () => Alert.alert('Bilgi', 'Hesap silme işlemi için destek@emlaknode.com adresine e-posta gönderin.') },
      ]
    );
  };

  return (
    <View style={[s.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={s.geriBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[s.headerBaslik, { color: colors.text }]}>Gizlilik ve Güvenlik</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Profil Gizliliği */}
        <Text style={[s.grupBaslik, { color: colors.grupBaslik }]}>PROFİL GİZLİLİĞİ</Text>
        <View style={[s.grup, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SatirItem
            icon="person-outline"
            iconBg="#eff6ff"
            iconColor="#2563eb"
            baslik="Profili Gizle"
            aciklama="Profiliniz yalnızca size görünsün"
            colors={colors}
            sagEleman={
              <Switch
                value={profilGizli}
                onValueChange={setProfilGizli}
                trackColor={{ false: '#e5e7eb', true: '#2563eb' }}
                thumbColor="#fff"
              />
            }
          />
          <SatirItem
            icon="home-outline"
            iconBg="#eff6ff"
            iconColor="#2563eb"
            baslik="İlanlarımı Gizle"
            aciklama="İlanlarınız arama sonuçlarında görünmesin"
            colors={colors}
            sagEleman={
              <Switch
                value={ilanGizli}
                onValueChange={setIlanGizli}
                trackColor={{ false: '#e5e7eb', true: '#2563eb' }}
                thumbColor="#fff"
              />
            }
          />
          <SatirItem
            icon="location-outline"
            iconBg="#eff6ff"
            iconColor="#2563eb"
            baslik="Konum Bilgisini Gizle"
            aciklama="İlanlarda tam adres gösterilmesin"
            son
            colors={colors}
            sagEleman={
              <Switch
                value={konumGizli}
                onValueChange={setKonumGizli}
                trackColor={{ false: '#e5e7eb', true: '#2563eb' }}
                thumbColor="#fff"
              />
            }
          />
        </View>

        {/* Güvenlik */}
        <Text style={[s.grupBaslik, { color: colors.grupBaslik }]}>GÜVENLİK</Text>
        <View style={[s.grup, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SatirItem
            icon="lock-closed-outline"
            iconBg="#f0fdf4"
            iconColor="#16a34a"
            baslik="Şifre Değiştir"
            aciklama="Hesap şifrenizi güncelleyin"
            onPress={() => navigation.navigate('ProfilDuzenle')}
            colors={colors}
          />
          <SatirItem
            icon="shield-checkmark-outline"
            iconBg="#f0fdf4"
            iconColor="#16a34a"
            baslik="İki Adımlı Doğrulama"
            aciklama="Hesabınıza ekstra güvenlik katmanı ekleyin"
            onPress={() => Alert.alert(
              'İki Adımlı Doğrulama',
              'Bu özelliği etkinleştirmek için destek@emlaknode.com adresine "2FA Aktifleştirme" konusuyla e-posta gönderin.',
              [{ text: 'Tamam' }]
            )}
            colors={colors}
          />
          <SatirItem
            icon="log-out-outline"
            iconBg="#fff7ed"
            iconColor="#f97316"
            baslik="Tüm Cihazlardan Çıkış"
            aciklama="Tüm aktif oturumları sonlandır"
            onPress={() => Alert.alert('Tüm Cihazlardan Çıkış', 'Tüm aktif oturumlarınızı sonlandırmak istiyor musunuz?', [
              { text: 'İptal', style: 'cancel' },
              { text: 'Çıkış Yap', style: 'destructive', onPress: () => {} },
            ])}
            son
            colors={colors}
          />
        </View>

        {/* Veri ve Gizlilik */}
        <Text style={[s.grupBaslik, { color: colors.grupBaslik }]}>VERİ VE GİZLİLİK</Text>
        <View style={[s.grup, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SatirItem
            icon="document-text-outline"
            iconBg="#f5f3ff"
            iconColor="#8b5cf6"
            baslik="Gizlilik Politikası"
            aciklama="Verilerinizin nasıl kullanıldığını öğrenin"
            onPress={() => Alert.alert('Gizlilik Politikası', 'Verileriniz yalnızca hizmet kalitesini artırmak amacıyla kullanılır ve üçüncü taraflarla paylaşılmaz.')}
            colors={colors}
          />
          <SatirItem
            icon="reader-outline"
            iconBg="#f5f3ff"
            iconColor="#8b5cf6"
            baslik="Kullanım Koşulları"
            aciklama="Hizmet kullanım şartlarını inceleyin"
            onPress={() => Alert.alert('Kullanım Koşulları', 'EmlakNode hizmetlerini kullanarak kullanım koşullarını kabul etmiş sayılırsınız.')}
            colors={colors}
          />
          <SatirItem
            icon="download-outline"
            iconBg="#f5f3ff"
            iconColor="#8b5cf6"
            baslik="Verilerimi İndir"
            aciklama="Hesabınızdaki tüm verileri talep edin"
            onPress={() => Alert.alert('Veri İndirme', 'Verilerinizi talep etmek için destek@emlaknode.com adresine e-posta gönderin.')}
            son
            colors={colors}
          />
        </View>

        {/* Tehlikeli Bölge */}
        <Text style={[s.grupBaslik, { color: colors.grupBaslik }]}>TEHLİKELİ BÖLGE</Text>
        <View style={[s.grup, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SatirItem
            icon="trash-outline"
            iconBg="#fff1f2"
            iconColor="#ef4444"
            baslik="Hesabı Kalıcı Olarak Sil"
            aciklama="Tüm verileriniz silinir, geri alınamaz"
            onPress={hesapSil}
            son
            colors={colors}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1 },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    paddingTop: 52, paddingHorizontal: 8, paddingBottom: 12, borderBottomWidth: 1 },
  geriBtn:        { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerBaslik:   { fontSize: 17, fontWeight: '800' },
  grupBaslik:     { fontSize: 11, fontWeight: '700', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8, letterSpacing: 0.8 },
  grup:           { marginHorizontal: 16, borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
  satir:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, gap: 12 },
  ikonKap:        { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  satirBaslik:    { fontSize: 15, fontWeight: '600' },
  satirAciklama:  { fontSize: 12, marginTop: 1 },
});
