import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { okunmamisSayisi, okunmamisBildirimSayisi } from '../services/api';
import RobotFace from '../components/RobotFace';
import { useTheme } from '../context/ThemeContext';

import KesifScreen      from '../screens/KesifScreen';
import IlanAraScreen    from '../screens/IlanAraScreen';
import IlanVerScreen    from '../screens/IlanVerScreen';
import MesajlarScreen   from '../screens/MesajlarScreen';
import HesabimScreen    from '../screens/HesabimScreen';
import GirisScreen      from '../screens/GirisScreen';
import KayitScreen      from '../screens/KayitScreen';
import IlanDetayScreen  from '../screens/IlanDetayScreen';
import IlanlarimScreen        from '../screens/IlanlarimScreen';
import HaritaScreen           from '../screens/HaritaScreen';
import TumIlanlarScreen       from '../screens/TumIlanlarScreen';
import ProfilDuzenleScreen    from '../screens/ProfilDuzenleScreen';
import FavorilerScreen        from '../screens/FavorilerScreen';
import KayitliAramalarScreen  from '../screens/KayitliAramalarScreen';
import KayitliAdreslerScreen  from '../screens/KayitliAdreslerScreen';
import IlanDuzenleScreen        from '../screens/IlanDuzenleScreen';
import DukkanBilgileriScreen    from '../screens/DukkanBilgileriScreen';
import DanismanlarimScreen      from '../screens/DanismanlarimScreen';
import IstatistiklerScreen      from '../screens/IstatistiklerScreen';
import EmlakDegerlemeScreen     from '../screens/EmlakDegerlemeScreen';
import KonusmaScreen            from '../screens/KonusmaScreen';
import ChatbotScreen            from '../screens/ChatbotScreen';
import BildirimlerScreen        from '../screens/BildirimlerScreen';
import GizlilikGuvenlikScreen  from '../screens/GizlilikGuvenlikScreen';
import YardimDestekScreen      from '../screens/YardimDestekScreen';
import { navigationRef }      from '../services/navigationRef';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

const IlanVerButon = ({ onPress }) => (
  <TouchableOpacity style={s.merkez} onPress={onPress}>
    <Ionicons name="add" size={30} color="#fff" />
  </TouchableOpacity>
);

const ChatbotButon = () => {
  const navigation = useNavigation();
  const { tema } = useTheme();
  return (
    <TouchableOpacity style={s.chatbotBtn} onPress={() => navigation.navigate('Chatbot')}>
      <RobotFace size={48} dark={tema === 'dark'} />
    </TouchableOpacity>
  );
};

function TabNavigator() {
  const { tema, colors } = useTheme();
  const [okunmamis, setOkunmamis]             = useState(null);
  const [bildirimSayisi, setBildirimSayisi]   = useState(null);

  const HEADER = {
    headerStyle: { backgroundColor: colors.card },
    headerTintColor: colors.text,
    headerTitleStyle: { fontWeight: '700' },
  };

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) { setOkunmamis(null); setBildirimSayisi(null); return; }
        const [mesaj, bildirim] = await Promise.all([okunmamisSayisi(), okunmamisBildirimSayisi()]);
        setOkunmamis(mesaj.data.sayi > 0 ? mesaj.data.sayi : null);
        setBildirimSayisi(bildirim.data.sayi > 0 ? bildirim.data.sayi : null);
      } catch { setOkunmamis(null); setBildirimSayisi(null); }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={{ flex: 1 }}>
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: tema === 'dark' ? '#475569' : '#9ca3af',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginBottom: 2 },
        tabBarStyle: {
          height: 62,
          paddingBottom: 6,
          borderTopColor: colors.tabBorder,
          backgroundColor: colors.tabBg,
        },
        tabBarIcon: ({ color, focused }) => {
          const icons = {
            Kesif:    focused ? 'home'   : 'home-outline',
            IlanAra:  focused ? 'search' : 'search-outline',
            IlanVer:  'add',
            Mesajlar: focused ? 'mail'   : 'mail-outline',
            Hesabim:  focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Kesif"    component={KesifScreen}    options={{ title: 'Keşfet' }} />
      <Tab.Screen name="IlanAra"  component={IlanAraScreen}  options={{ title: 'İlan Ara', headerShown: true, headerTitle: 'İlan Ara', ...HEADER }} />
      <Tab.Screen
        name="IlanVer"
        component={IlanVerScreen}
        options={{
          title: 'İlan Ver',
          headerShown: true,
          headerTitle: 'İlan Ver',
          ...HEADER,
          tabBarIcon: () => null,
          tabBarButton: (props) => <IlanVerButon onPress={props.onPress} />,
        }}
      />
      <Tab.Screen name="Mesajlar" component={MesajlarScreen} options={{ title: 'Mesajlarım', headerShown: true, headerTitle: 'Mesajlarım', ...HEADER, tabBarBadge: okunmamis }} />
      <Tab.Screen name="Hesabim"  component={HesabimScreen}  options={{ title: 'Hesabım', headerShown: false }} />
    </Tab.Navigator>
    <ChatbotButon />
    </View>
  );
}

export default function AppNavigator() {
  const { tema, colors } = useTheme();

  const HEADER = {
    headerStyle: { backgroundColor: colors.card },
    headerTintColor: colors.text,
    headerTitleStyle: { fontWeight: '700' },
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar style={tema === 'dark' ? 'light' : 'dark'} backgroundColor={colors.card} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Ana"       component={TabNavigator} />
        <Stack.Screen name="Giris"     component={GirisScreen}     options={{ headerShown: true, title: 'Giriş Yap',  ...HEADER }} />
        <Stack.Screen name="Kayit"     component={KayitScreen}     options={{ headerShown: true, title: 'Kayıt Ol',   ...HEADER }} />
        <Stack.Screen name="IlanDetay" component={IlanDetayScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Ilanlarim" component={IlanlarimScreen} options={{ headerShown: true, title: 'İlanlarım',  ...HEADER }} />
        <Stack.Screen name="Harita"     component={HaritaScreen}     options={{ headerShown: false }} />
        <Stack.Screen name="TumIlanlar"       component={TumIlanlarScreen}      options={{ headerShown: false }} />
        <Stack.Screen name="ProfilDuzenle"    component={ProfilDuzenleScreen}   options={{ headerShown: false }} />
        <Stack.Screen name="Favoriler"        component={FavorilerScreen}       options={{ headerShown: true, title: 'Favorilerim', ...HEADER }} />
        <Stack.Screen name="KayitliAramalar"  component={KayitliAramalarScreen} options={{ headerShown: true, title: 'Kayıtlı Aramalarım', ...HEADER }} />
        <Stack.Screen name="KayitliAdresler"  component={KayitliAdreslerScreen} options={{ headerShown: true, title: 'Kayıtlı Adreslerim', ...HEADER }} />
        <Stack.Screen name="IlanDuzenle"       component={IlanDuzenleScreen}      options={{ headerShown: true, title: 'İlanı Düzenle',     ...HEADER }} />
        <Stack.Screen name="DukkanBilgileri"  component={DukkanBilgileriScreen}  options={{ headerShown: true, title: 'Dükkan Bilgilerim',  ...HEADER }} />
        <Stack.Screen name="Danismanlarim"    component={DanismanlarimScreen}    options={{ headerShown: true, title: 'Danışmanlarım',       ...HEADER }} />
        <Stack.Screen name="Istatistikler"    component={IstatistiklerScreen}    options={{ headerShown: true, title: 'İstatistikler',       ...HEADER }} />
        <Stack.Screen name="EmlakDegerleme"   component={EmlakDegerlemeScreen}   options={{ headerShown: false }} />
        <Stack.Screen name="Konusma"          component={KonusmaScreen}          options={{ headerShown: false }} />
        <Stack.Screen name="Chatbot"          component={ChatbotScreen}          options={{ headerShown: false }} />
        <Stack.Screen name="Bildirimler"      component={BildirimlerScreen}      options={{ headerShown: false }} />
        <Stack.Screen name="GizlilikGuvenlik" component={GizlilikGuvenlikScreen}  options={{ headerShown: false }} />
        <Stack.Screen name="YardimDestek"     component={YardimDestekScreen}      options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const s = StyleSheet.create({
  merkez: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: '#2563eb',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
  chatbotBtn: {
    position: 'absolute', bottom: 80, right: 18,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#1e3a8a', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 10, elevation: 10,
  },
});
