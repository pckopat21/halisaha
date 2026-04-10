# 🏆 Birimler Arası Halı Saha Turnuva Yönetimi

Bu proje, kurum içi birimler arası düzenlenen halı saha turnuvalarının profesyonel bir şekilde yönetilmesi, takip edilmesi ve istatistiklerinin tutulması için geliştirilmiş modern bir web uygulamasıdır.

## ✨ Öne Çıkan Özellikler

### 🏟️ Turnuva ve Sezon Yönetimi
- **Esnek Sezonlama:** Farklı yıllar ve isimlerle yeni turnuvalar tanımlama.
- **Akıllı Durum Takibi:** Kayıt, Aktif ve Tamamlandı aşamalarıyla sezon yaşam döngüsü.
- **Otomatik Odaklama:** Dashboard ve Ana Sayfa'nın her zaman en güncel (Kayıt veya Aktif) sezonu ön plana çıkarması.

### 👥 Takım ve Kadro Operasyonları
- **Birim Bazlı Kısıtlama:** Oyuncuların sadece kendi departman takımlarında oynayabilmesi.
- **Gelişmiş Kadro Kuralları:** 6-12 oyuncu sınırı, maksimum 5 firma personeli ve 2 lisanslı oyuncu kontrolü.
- **Hızlı Kayıt:** Personel oluştururken otomatik olarak takıma ekleme ve kaptan atama özelliği.
- **Sağlık Raporu Takibi:** Her oyuncu için dijital sağlık belgesi onayı.

### 📅 Fikstür ve Maç Yönetimi
- **Otomatik Kura:** Takımları gruplara rastgele dağıtma ve maç programını saniyeler içinde oluşturma.
- **Eleme Turları:** Son 16, Çeyrek Final, Yarı Final ve Final aşamalarını dinamik olarak oluşturma.
- **Anlık Skor ve Olay Yönetimi:** Goller, sarı/kırmızı kartlar ve penaltı atışlarının gerçek zamanlı takibi.

### 📊 İstatistik Merkezi
- **Altın Ayakkabı:** En çok gol atan oyuncuların dinamik sıralaması.
- **Fair Play Tablosu:** En az kart gören temiz takımların ödüllendirilmesi.
- **Oyuncu Karnesi:** Her bir oyuncunun tüm maçlardaki performans geçmişi.

## 🛠️ Teknoloji Yığını

- **Backend:** Laravel 11.x
- **Frontend:** React.js (Inertia.js Entegrasyonu)
- **Styling:** Vanilla CSS & Modern Glassmorphism tasarımlar
- **Icons:** Lucide React
- **Database:** MySQL / PostgreSQL
- **Auth:** Laravel Sanctum & Role-Based ACL

## 🚀 Kurulum

1.  **Depoyu Klonlayın:**
    ```bash
    git clone [repo-url]
    ```
2.  **Bağımlılıkları Yükleyin:**
    ```bash
    composer install
    npm install
    ```
3.  **Yapılandırma:**
    `.env.example` dosyasını `.env` olarak kopyalayın ve veritabanı bilgilerinizi girin.
4.  **Zaman Dilimi ve Key Kurulumu:**
    ```bash
    php artisan key:generate
    php artisan config:clear
    ```
5.  **Veritabanı Göçü:**
    ```bash
    php artisan migrate --seed
    ```
6.  **Uygulamayı Başlatın:**
    ```bash
    php artisan serve
    npm run dev
    ```

## 🔐 Roller ve Yetkiler

-   **Admin / Komite:** Turnuva oluşturma, kura çekme, takımları onaylama/reddetme ve sistemi genel yönetme yetkisi.
-   **Hakem:** Sadece atanmış maçların skorlarını ve olaylarını (gol/kart) girme yetkisi.
-   **Takım Yöneticisi:** Kendi takımını kurma, personel ekleme ve kadro güncelleme yetkisi.

---

> [!IMPORTANT]
> Sistem yerel saat olarak `Europe/Istanbul` (UTC+3) kullanmaktadır. Tüm işlem zamanları bu dile göre kaydedilir.

---

Geliştiren: Antigravity AI
