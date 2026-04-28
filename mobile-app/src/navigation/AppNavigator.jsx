import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

import KesifScreen    from '../screens/KesifScreen';
import IlanAraScreen  from '../screens/IlanAraScreen';
import IlanVerScreen  from '../screens/IlanVerScreen';
import MesajlarScreen from '../screens/MesajlarScreen';
import HesabimScreen  from '../screens/HesabimScreen';
import GirisScreen    from '../screens/GirisScreen';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// İlan Ver merkez butonu
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
        tabBarIcon: ({ color, focused, size }) => {
          const icons = {
            Kesif:    focused ? 'home'              : 'home-outline',
            IlanAra:  focused ? 'search'            : 'search-outline',
            IlanVer:  'add',
            Mesajlar: focused ? 'mail'              : 'mail-outline',
            Hesabim:  focused ? 'person'            : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Kesif"    component={KesifScreen}    options={{ title: 'Keşfet' }} />
      <Tab.Screen name="IlanAra"  component={IlanAraScreen}  options={{ title: 'İlan Ara', headerShown: true, headerTitle: 'İlan Ara', headerStyle: { backgroundColor: '#fff' }, headerTintColor: '#111827' }} />
      <Tab.Screen
        name="IlanVer"
        component={IlanVerScreen}
        options={{
          title: 'İlan Ver',
          headerShown: true,
          headerTitle: 'İlan Ver',
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#111827',
          tabBarIcon: () => null,
          tabBarButton: (props) => <IlanVerButon onPress={props.onPress} />,
        }}
      />
      <Tab.Screen name="Mesajlar" component={MesajlarScreen} options={{ title: 'Mesajlarım', headerShown: true, headerTitle: 'Mesajlarım', headerStyle: { backgroundColor: '#fff' }, headerTintColor: '#111827' }} />
      <Tab.Screen name="Hesabim"  component={HesabimScreen}  options={{ title: 'Hesabım',    headerShown: true, headerTitle: 'Hesabım',    headerStyle: { backgroundColor: '#fff' }, headerTintColor: '#111827' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Ana"   component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="Giris" component={GirisScreen}  options={{ title: 'Giriş Yap', headerStyle: { backgroundColor: '#fff' }, headerTintColor: '#111827', headerTitleStyle: { fontWeight: '700' } }} />
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
