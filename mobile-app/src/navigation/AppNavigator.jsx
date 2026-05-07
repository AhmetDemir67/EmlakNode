import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, StyleSheet } from 'react-native';

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
import IlanDuzenleScreen      from '../screens/IlanDuzenleScreen';
import { navigationRef }      from '../services/navigationRef';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

const HEADER = {
  headerStyle: { backgroundColor: '#fff' },
  headerTintColor: '#111827',
  headerTitleStyle: { fontWeight: '700' },
};

const IlanVerButon = ({ onPress }) => (
  <TouchableOpacity style={s.merkez} onPress={onPress}>
    <Ionicons name="add" size={30} color="#fff" />
  </TouchableOpacity>
);

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#16a34a',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginBottom: 2 },
        tabBarStyle: { height: 62, paddingBottom: 6, borderTopColor: '#f3f4f6', backgroundColor: '#fff' },
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
      <Tab.Screen name="Mesajlar" component={MesajlarScreen} options={{ title: 'Mesajlarım', headerShown: true, headerTitle: 'Mesajlarım', ...HEADER }} />
      <Tab.Screen name="Hesabim"  component={HesabimScreen}  options={{ title: 'Hesabım', headerShown: false }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer ref={navigationRef}>
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
        <Stack.Screen name="IlanDuzenle"      component={IlanDuzenleScreen}     options={{ headerShown: true, title: 'İlanı Düzenle', ...HEADER }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const s = StyleSheet.create({
  merkez: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: '#16a34a',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
});
