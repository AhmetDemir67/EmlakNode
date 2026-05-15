import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/context/ThemeContext';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hata: null };
  }
  static getDerivedStateFromError(error) {
    return { hata: error };
  }
  render() {
    if (this.state.hata) {
      return (
        <ScrollView style={s.errKap} contentContainerStyle={s.errIc}>
          <Text style={s.errBaslik}>HATA</Text>
          <Text style={s.errMesaj}>{this.state.hata?.message || String(this.state.hata)}</Text>
          <Text style={s.errStack}>{this.state.hata?.stack}</Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

const s = StyleSheet.create({
  errKap:    { flex: 1, backgroundColor: '#1e1e1e' },
  errIc:     { padding: 20, paddingTop: 60 },
  errBaslik: { color: '#ef4444', fontSize: 20, fontWeight: '900', marginBottom: 12 },
  errMesaj:  { color: '#fff', fontSize: 15, marginBottom: 16, lineHeight: 22 },
  errStack:  { color: '#9ca3af', fontSize: 11, lineHeight: 18 },
});

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <AppNavigator />
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
