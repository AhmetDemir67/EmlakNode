# 🏢 B2B Yapay Zeka Destekli Emlak Yönetim Platformu

Modern emlak ofisleri için tasarlanmış, süreçleri dijitalleştiren ve yapay zeka destekli analizler sunmayı hedefleyen Full-Stack B2B emlak yönetim platformu.

## 🚀 Proje Hakkında

Bu proje, sahada çalışan emlak danışmanları ile ofis yönetimini tek bir merkezde toplayan, eşzamanlı ve bulut tabanlı bir sistemdir. Modern web standartlarına uygun olarak tasarlanan "Müşteri Vitrini" ve emlakçılara özel "Yönetim Paneli", gücünü Node.js ve PostgreSQL tabanlı sağlam bir backend mimarisinden almaktadır.

## ✨ Temel Özellikler

* **🔐 Güvenli Kimlik Doğrulama:** JWT (JSON Web Token) ve bcrypt şifreleme ile rol tabanlı (Admin, Patron, Danışman, Müşteri) erişim kontrolü.
* **📝 Gelişmiş İlan Yönetimi (CRUD):** Emlakçıların kendi portföylerini yönetebildiği; ilan ekleme, listeleme, güncelleme ve silme operasyonları. Dinamik SQL sorguları ile esnek güncelleme imkanı.
* **🛡️ Korumalı Rotalar (Private Routes):** Sadece oturum açmış yetkili kullanıcıların erişebildiği güvenli yönetim paneli (Dashboard) deneyimi.
* **🤖 Yapay Zeka Entegrasyonu (Geliştirme Aşamasında):** İlan açıklamalarının görsel bazlı otomatik üretilmesi ve bölgesel piyasa verilerine göre yapay zeka destekli fiyat tahminleme modülü.
* **📱 Mobil Saha Asistanı (Planlanan):** Projenin mimarisi, ilerleyen aşamalarda React Native ile geliştirilecek mobil uygulama ile tam entegre çalışacak şekilde tasarlanmıştır.

## 🛠️ Kullanılan Teknolojiler

**Frontend (İstemci - Web Vitrini & Panel)**
* React.js (Vite mimarisi ile)
* Tailwind CSS (Modern ve duyarlı Emlakjet tarzı UI/UX tasarımı)
* React Router DOM (Sayfa yönlendirmeleri)
* Axios (API haberleşmesi)

**Backend (Sunucu & API)**
* Node.js & Express.js
* PostgreSQL (İlişkisel veritabanı)
* JSON Web Token (JWT) & Bcrypt (Kimlik doğrulama ve şifreleme)
* Cors & Dotenv (Güvenlik ve ortam değişkenleri yönetimi)
