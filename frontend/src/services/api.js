import axios from 'axios';

// ----------------------------------------------------------------
// Axios instance — tüm API isteklerinde bu kullanılır
// ----------------------------------------------------------------
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor ──────────────────────────────────────────
// Giriş yapılmışsa her isteğe JWT token'ı otomatik ekle
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response Interceptor ─────────────────────────────────────────
// 401 (token süresi dolmuş) gelirse kullanıcıyı otomatik çıkış yaptır
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // İleride: window.location.href = '/giris';
    }
    return Promise.reject(error);
  }
);

// ── API Fonksiyonları ────────────────────────────────────────────

// İlanlar
export const ilanlarGetir     = (params)     => api.get('/ilanlar', { params });
export const ilanDetayGetir   = (id)         => api.get(`/ilanlar/${id}`);
export const ilanEkle         = (data)       => api.post('/ilanlar', data);
export const ilanGuncelle     = (id, data)   => api.put(`/ilanlar/${id}`, data);
export const ilanSil          = (id)         => api.delete(`/ilanlar/${id}`);
export const benimIlanlarim   = (dukkan_id)  => api.get('/ilanlar', { params: { dukkan_id, limit: 100 } });
export const ilanDurumGuncelle = (id, durum) => api.patch(`/ilanlar/${id}/durum`, { durum });

// Auth
export const kayitOl         = (data) => api.post('/auth/kayit',          data);
export const kurumsalKayitOl = (data) => api.post('/auth/kurumsal-kayit', data);
export const girisYap        = (data) => api.post('/auth/giris',          data);

export default api;
