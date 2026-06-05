import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetToAna } from './navigationRef';

// Geliştirme: bilgisayarın IP'si (Android emülatör için 10.0.2.2, gerçek cihaz için LAN IP)
export const API_URL = 'http://192.168.1.37:3000/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const mesaj  = error.response?.data?.mesaj || '';
    if (
      (status === 401 || status === 403) &&
      (mesaj.includes('Oturum') || mesaj.includes('token') || mesaj.includes('Token') || mesaj.includes('Yetkisiz'))
    ) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('kullanici');
      resetToAna();
    }
    return Promise.reject(error);
  }
);

export const ilanlarGetir        = (params)  => api.get('/ilanlar', { params });
export const fiyatiDusenIlanlar = (tip)     => api.get('/ilanlar', { params: { fiyat_dustu: true, tip, limit: 20 } });
export const ilanDetayGetir  = (id)      => api.get(`/ilanlar/${id}`);

export const girisYap        = (data)    => api.post('/auth/giris', data);
export const kayitOl         = (data)    => api.post('/auth/kayit', data);
export const kurumsalKayitOl = (data)    => api.post('/auth/kurumsal-kayit', data);

export const kullaniciilanlarim = (kullanici_id) =>
  api.get('/ilanlar', { params: { kullanici_id, limit: 100 } });

export const ilanSil           = (id)        => api.delete(`/ilanlar/${id}`);
export const ilanGuncelle      = (id, data)  => api.put(`/ilanlar/${id}`, data);
export const ilanDurumGuncelle = (id, durum) => api.patch(`/ilanlar/${id}/durum`, { durum });

export const fotografYukleAPI = (formData) =>
  api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// Dükkan
export const dukkanGetir       = (id)     => api.get(`/dukkanlar/${id}`);
export const dukkanGuncelle    = (id, d)  => api.put(`/dukkanlar/${id}`, d);
export const danismanlarGetir  = (id)     => api.get(`/dukkanlar/${id}/danismanlar`);
export const danismanEkle      = (id, d)  => api.post(`/dukkanlar/${id}/danismanlar`, d);
export const danismanCikar     = (id, kulId) => api.delete(`/dukkanlar/${id}/danismanlar/${kulId}`);
export const istatistiklerGetir = (id)   => api.get(`/dukkanlar/${id}/istatistikler`);

export const profilGetir      = ()     => api.get('/auth/profil');
export const profilGuncelle   = (data) => api.put('/auth/profil', data);
export const sifreGuncelle    = (data) => api.put('/auth/sifre', data);

// Favoriler
export const favorilerGetir  = ()         => api.get('/favoriler');
export const favoriEkle      = (ilan_id)  => api.post('/favoriler', { ilan_id });
export const favoriSil       = (ilan_id)  => api.delete(`/favoriler/${ilan_id}`);
export const favoriKontrol   = (ilan_id)  => api.get(`/favoriler/kontrol/${ilan_id}`);

// Kayıtlı Aramalar
export const kayitliAramalarGetir = ()         => api.get('/favoriler/aramalar');
export const kayitliAramaEkle     = (data)     => api.post('/favoriler/aramalar', data);
export const kayitliAramaSil      = (id)       => api.delete(`/favoriler/aramalar/${id}`);

// Kayıtlı Adresler
export const kayitliAdreslerGetir = ()         => api.get('/favoriler/adresler');
export const kayitliAdresEkle     = (data)     => api.post('/favoriler/adresler', data);
export const kayitliAdresSil      = (id)       => api.delete(`/favoriler/adresler/${id}`);

// Mesajlar
export const konusmalariGetir   = ()                    => api.get('/mesajlar');
export const mesajlariGetir     = (konusmaId)           => api.get(`/mesajlar/${konusmaId}`);
export const mesajGonder        = (data)                => api.post('/mesajlar', data);
export const okunmamisSayisi    = ()                    => api.get('/mesajlar/okunmamis');

// Bildirimler
export const bildirimleriGetir         = ()    => api.get('/bildirimler');
export const okunmamisBildirimSayisi   = ()    => api.get('/bildirimler/okunmamis');
export const bildirimOku               = (id)  => api.patch(`/bildirimler/${id}/oku`);
export const hepsiniOku                = ()    => api.patch('/bildirimler/hepsini-oku');

// AI
export const aiAciklamaUret  = (data) => api.post('/ai/aciklama-uret', data, { timeout: 60000 });
export const aiMulkDegerle   = (data) => api.post('/ai/degerleme',     data, { timeout: 60000 });
export const aiChatbot       = (data) => api.post('/ai/chatbot',       data, { timeout: 60000 });
export const aiUlasimAnalizi = (data) => api.post('/ai/ulasim',        data, { timeout: 60000 });

export default api;
