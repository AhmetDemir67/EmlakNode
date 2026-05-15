import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('kullanici');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// İlanlar
export const ilanlarGetir        = (params)       => api.get('/ilanlar', { params });
export const fiyatiDusenIlanlar  = (tip)          => api.get('/ilanlar', { params: { fiyat_dustu: true, tip, limit: 20 } });
export const ilanDetayGetir      = (id)           => api.get(`/ilanlar/${id}`);
export const ilanEkle            = (data)         => api.post('/ilanlar', data);
export const ilanGuncelle        = (id, data)     => api.put(`/ilanlar/${id}`, data);
export const ilanSil             = (id)           => api.delete(`/ilanlar/${id}`);
export const benimIlanlarim      = (dukkan_id)    => api.get('/ilanlar', { params: { dukkan_id, limit: 100 } });
export const kullaniciilanlarim  = (kullanici_id) => api.get('/ilanlar', { params: { kullanici_id, limit: 100 } });
export const ilanDurumGuncelle   = (id, durum)    => api.patch(`/ilanlar/${id}/durum`, { durum });

// Auth
export const kayitOl         = (data) => api.post('/auth/kayit',          data);
export const kurumsalKayitOl = (data) => api.post('/auth/kurumsal-kayit', data);
export const girisYap        = (data) => api.post('/auth/giris',          data);

// Profil
export const profilGetir    = ()     => api.get('/auth/profil');
export const profilGuncelle = (data) => api.put('/auth/profil', data);
export const sifreGuncelle  = (data) => api.put('/auth/sifre', data);

// Dükkan
export const dukkanGetir        = (id)    => api.get(`/dukkanlar/${id}`);
export const dukkanGuncelle     = (id, d) => api.put(`/dukkanlar/${id}`, d);
export const danismanlarGetir   = (id)    => api.get(`/dukkanlar/${id}/danismanlar`);
export const istatistiklerGetir = (id)    => api.get(`/dukkanlar/${id}/istatistikler`);

// Favoriler
export const favorilerGetir = ()        => api.get('/favoriler');
export const favoriEkle     = (ilan_id) => api.post('/favoriler', { ilan_id });
export const favoriSil      = (ilan_id) => api.delete(`/favoriler/${ilan_id}`);
export const favoriKontrol  = (ilan_id) => api.get(`/favoriler/kontrol/${ilan_id}`);

// Kayıtlı Aramalar
export const kayitliAramalarGetir = ()     => api.get('/favoriler/aramalar');
export const kayitliAramaEkle     = (data) => api.post('/favoriler/aramalar', data);
export const kayitliAramaSil      = (id)   => api.delete(`/favoriler/aramalar/${id}`);

// Kayıtlı Adresler
export const kayitliAdreslerGetir = ()     => api.get('/favoriler/adresler');
export const kayitliAdresEkle     = (data) => api.post('/favoriler/adresler', data);
export const kayitliAdresSil      = (id)   => api.delete(`/favoriler/adresler/${id}`);

// Fotoğraf Yükleme
export const fotografYukleAPI = (formData) =>
  api.post('/upload', formData);

// Mesajlar
export const konusmalariGetir = ()          => api.get('/mesajlar');
export const mesajlariGetir   = (konusmaId) => api.get(`/mesajlar/${konusmaId}`);
export const mesajGonder      = (data)      => api.post('/mesajlar', data);
export const okunmamisSayisi  = ()          => api.get('/mesajlar/okunmamis');

// AI
export const aiAciklamaUret  = (data) => api.post('/ai/aciklama-uret', data, { timeout: 30000 });
export const aiMulkDegerle   = (data) => api.post('/ai/degerleme',     data, { timeout: 30000 });
export const aiChatbot       = (data) => api.post('/ai/chatbot',       data, { timeout: 30000 });
export const aiUlasimAnalizi = (data) => api.post('/ai/ulasim',        data, { timeout: 60000 });

export default api;
