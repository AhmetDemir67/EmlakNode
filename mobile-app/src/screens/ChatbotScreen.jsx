import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { aiChatbot } from '../services/api';
import RobotFace from '../components/RobotFace';
import { useTheme } from '../context/ThemeContext';

const BASLANGIC = {
  rol: 'model',
  metin: 'Merhaba! Ben EmlakAI, yapay zeka destekli emlak danışmanınızım.\n\nSize emlak satın alma, kiralama, değerleme veya piyasa hakkında yardımcı olabilirim. Nasıl yardımcı olabilirim?',
};

const HIZLI_SORULAR = [
  'Ev satın alırken nelere dikkat etmeliyim?',
  'Tapu harcı nasıl hesaplanır?',
  'Kira artış oranı nedir?',
  'Konut kredisi nasıl alınır?',
];

export default function ChatbotScreen({ navigation }) {
  const { colors } = useTheme();
  const [mesajlar, setMesajlar] = useState([BASLANGIC]);
  const [input, setInput]       = useState('');
  const [yukleniyor, setYuk]    = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (mesajlar.length > 1) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [mesajlar]);

  const gonder = async (metin = input.trim()) => {
    if (!metin || yukleniyor) return;
    const yeniMesajlar = [...mesajlar, { rol: 'user', metin }];
    setMesajlar(yeniMesajlar);
    setInput('');
    setYuk(true);
    try {
      const gecmis = yeniMesajlar.slice(1);
      const r = await aiChatbot({ mesaj: metin, gecmis });
      setMesajlar(m => [...m, { rol: 'model', metin: r.data.cevap }]);
    } catch {
      setMesajlar(m => [...m, { rol: 'model', metin: 'Üzgünüm, şu an yanıt veremiyorum. Lütfen biraz sonra tekrar deneyin.' }]);
    } finally {
      setYuk(false);
    }
  };

  const renderMesaj = ({ item }) => {
    const kullanici = item.rol === 'user';
    return (
      <View style={[s.mesajRow, kullanici && s.mesajRowSag]}>
        {!kullanici && <RobotFace size={28} />}
        <View style={[s.baloncuk,
          kullanici
            ? s.kullaniciBaloncu
            : [s.botBaloncuk, { backgroundColor: colors.card, borderColor: colors.border }]
        ]}>
          <Text style={[s.baloncukText, kullanici ? s.kullaniciText : { color: colors.text }]}>{item.metin}</Text>
        </View>
        {kullanici && (
          <View style={s.userAvatar}>
            <Ionicons name="person" size={13} color="#fff" />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <LinearGradient colors={['#1e3a8a', '#1d4ed8', '#2563eb']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.header}>
        <TouchableOpacity style={s.geriBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <View style={s.headerOrta}>
          <RobotFace size={38} />
          <View>
            <Text style={s.headerBaslik}>EmlakAI</Text>
            <View style={s.onlineRow}>
              <View style={s.onlineDot} />
              <Text style={s.onlineText}>Çevrimiçi</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={s.geriBtn} onPress={() => { setMesajlar([BASLANGIC]); setInput(''); }}>
          <Ionicons name="refresh-outline" size={20} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Mesaj listesi */}
        <FlatList
          ref={listRef}
          data={mesajlar}
          style={{ backgroundColor: colors.bg }}
          keyExtractor={(_, i) => String(i)}
          renderItem={renderMesaj}
          contentContainerStyle={s.liste}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            yukleniyor ? (
              <View style={s.mesajRow}>
                <RobotFace size={28} />
                <View style={[s.yaziyorKutu, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={s.noktaRow}>
                    {[0, 150, 300].map(delay => (
                      <View key={delay} style={[s.nokta, { opacity: 0.5 }]} />
                    ))}
                  </View>
                </View>
              </View>
            ) : null
          }
        />

        {/* Hızlı sorular — sadece başlangıçta */}
        {mesajlar.length === 1 && !yukleniyor && (
          <View style={[s.hizliRow, { backgroundColor: colors.bg }]}>
            {HIZLI_SORULAR.map(s2 => (
              <TouchableOpacity key={s2} style={s.hizliChip} onPress={() => gonder(s2)}>
                <Text style={s.hizliText} numberOfLines={1}>{s2}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Input alanı */}
        <View style={[s.inputBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TextInput
            style={[s.input, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }]}
            value={input}
            onChangeText={setInput}
            placeholder="Mesajınızı yazın…"
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={500}
            onSubmitEditing={() => gonder()}
          />
          <TouchableOpacity
            style={[s.gonderBtn, (!input.trim() || yukleniyor) && { opacity: 0.4 }]}
            onPress={() => gonder()}
            disabled={!input.trim() || yukleniyor}
          >
            {yukleniyor
              ? <ActivityIndicator size={16} color="#fff" />
              : <Ionicons name="send" size={16} color="#fff" />
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, paddingTop: 10, paddingBottom: 12 },
  geriBtn:     { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerOrta:  { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  botIkon:     { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerBaslik:{ fontSize: 15, fontWeight: '800', color: '#fff' },
  onlineRow:   { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot:   { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fcd34d' },
  onlineText:  { fontSize: 11, color: 'rgba(255,255,255,0.6)' },

  liste:       { padding: 16, gap: 12, paddingBottom: 8 },

  mesajRow:    { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  mesajRowSag: { flexDirection: 'row-reverse' },

  botAvatar:   { width: 28, height: 28, borderRadius: 14, backgroundColor: '#7c3aed', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  userAvatar:  { width: 28, height: 28, borderRadius: 14, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },

  baloncuk:        { maxWidth: '75%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  botBaloncuk:     { backgroundColor: '#fff', borderWidth: 1, borderColor: '#f0f0f0', borderBottomLeftRadius: 4,
                     shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  kullaniciBaloncu:{ backgroundColor: '#2563eb', borderBottomRightRadius: 4 },
  baloncukText:    { fontSize: 14, color: '#111827', lineHeight: 21 },
  kullaniciText:   { color: '#fff' },

  yaziyorKutu: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#f0f0f0', borderRadius: 18, borderBottomLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 12 },
  noktaRow:    { flexDirection: 'row', gap: 4 },
  nokta:       { width: 8, height: 8, borderRadius: 4, backgroundColor: '#9ca3af' },

  hizliRow:    { paddingHorizontal: 12, paddingBottom: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  hizliChip:   { paddingHorizontal: 12, paddingVertical: 7, backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 20 },
  hizliText:   { fontSize: 12, fontWeight: '600', color: '#2563eb', maxWidth: 160 },

  inputBar:    { flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0', backgroundColor: '#fff' },
  input:       { flex: 1, fontSize: 14, color: '#111827', backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, maxHeight: 100 },
  gonderBtn:   { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center' },
});
