import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Geliştirme: bilgisayarın IP'si (Android emülatör için 10.0.2.2, gerçek cihaz için LAN IP)
export const API_URL = 'http://10.0.2.2:5000/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const ilanlarGetir    = (params)  => api.get('/ilanlar', { params });
export const ilanDetayGetir  = (id)      => api.get(`/ilanlar/${id}`);

export const girisYap        = (data)    => api.post('/auth/giris', data);
export const kayitOl         = (data)    => api.post('/auth/kayit', data);

export const kullaniciilanlarim = (kullanici_id) =>
  api.get('/ilanlar', { params: { kullanici_id, limit: 100 } });

export default api;
