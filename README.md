# 🏆 Birimler Arası Halı Saha Turnuva Yönetimi

Bu proje, kurum içi birimler arası düzenlenen halı saha turnuvalarının profesyonel bir şekilde yönetilmesi, takip edilmesi ve istatistiklerinin tutulması için geliştirilmiş modern bir web uygulamasıdır.

## ✨ Öne Çıkan Özellikler

### 🏟️ Turnuva ve Saha Yönetimi
- **Esnek Sezonlama:** Farklı yıllar ve isimlerle yeni turnuvalar tanımlama.
- **Akıllı Durum Takibi:** Kayıt, Aktif ve Tamamlandı aşamalarıyla sezon yaşam döngüsü.
- **Saha ve Lojistik Yönetimi:** Fiziksel halı sahaların sisteme dahil edilmesi, maçlara saha atama ve lokasyon bazlı takip.
- **Haftalık Çizelge:** Tüm sahaların doluluk durumunun ve maç programının merkezi takibi.

### 👥 Gelişmiş Kadro ve Takım Operasyonları
- **Birim Bazlı Kısıtlama:** Oyuncuların sadece kendi departman takımlarında oynayabilmesi.
- **Dinamik Kural Motoru:** Turnuva bazlı; kadro büyüklüğü, firma personeli limiti, lisanslı oyuncu sınırı ve sahada bulunma limitlerinin (min/max) özelleştirilebilmesi.
- **Hızlı Kayıt ve Onay:** Personel oluştururken otomatik takıma ekleme, kaptan atama ve komite onay/ret süreçleri.
- **Dijital Sağlık Takibi:** Oyuncuların sağlık raporlarının tarihsel ve dijital onay takibi.

### 📅 Maç Merkezi ve Canlı Takip
- **Real-Time Match Center:** Maçların anlık skor, gol atanlar, sarı/kırmızı kartlar ve oyuncu değişiklikleriyle canlı takibi.
- **Otomatik Fikstür & Kura:** Takımları gruplara rastgele dağıtma ve tüm sezon programını saniyeler içinde oluşturma.
- **Eleme Ağacı:** Son 16'dan final aşamasına kadar dinamik eleme turları ve çapraz eşleşme yönetimi.
- **Lokasyon Entegrasyonu:** Her maçın hangi sahada oynandığının tüm arayüzlerde (Dashboard, Maç Merkezi) gösterilmesi.

### 📊 Analiz ve İstatistik Paneli
- **Rol Bazlı Dashboardlar:** Admin ve Takım Sorumluları için özelleştirilmiş, anlık verilerle donatılmış yönetim panelleri.
- **Altın Ayakkabı:** Gol krallığı yarışının canlı ve detaylı sıralaması.
- **Fair Play Endeksi:** Kart cezalarına göre takımların disiplin puanlaması ve centilmenlik sıralaması.
- **Birim Analizi:** Kurum içi birimlerin (departmanların) turnuva başarısı ve gol dağılımı grafikleri.

### 🛡️ Disiplin ve Yönetmelik Sistemi
- **Otomatik Cezalı Takibi:** Kırmızı kart gören veya sarı kart sınırına ulaşan oyuncuların bir sonraki maçta otomatik olarak "Cezalı" durumuna düşürülmesi.
- **Kural İhlali Uyarıları:** Kadro kurallarına uymayan oyuncu seçimlerinde anlık görsel uyarılar ve sistem engellemeleri.

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

## 🌐 Canlı Ortama Taşıma (Hostinger/Shared Hosting)

Projeyi canlı sunucuya taşırken şu yapılandırma adımlarını izlemelisiniz:

### 1. Dosya Yapısı
Güvenlik için dosyaları şu şekilde ayırın:
-   `public_html/`: Laravel'in `public` klasör içeriği buraya.
-   `lara_app/`: Laravel'in tüm ana dizin içeriği buraya.

### 2. Kritik Ayarlar
-   **Public Path:** `bootstrap/app.php` içinde `usePublicPath` ayarı yapılmıştır. Bu ayar hem yerelde hem sunucuda otomatik olarak çalışır.
-   **SQL Strict Mode:** Bazı sunucularda `GROUP BY` hatalarını önlemek için `config/database.php` içinde `strict => false` olarak ayarlanmıştır.

### 3. Paylaşımlı Hosting index.php Yapılandırması
Sunucuda `public_html/index.php` dosyanızın içeriği şu şekilde olmalıdır (Eğer ana dosyalar `lara_app` içindeyse):

```php
<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// 1. Bakım modu yolu (lara_app içine bakmalı)
if (file_exists($maintenance = __DIR__.'/../lara_app/storage/framework/maintenance.php')) {
    require $maintenance;
}

// 2. Autoloader yolu
require __DIR__.'/../lara_app/vendor/autoload.php';

// 3. Uygulamayı başlat ve isteği işle
(require_once __DIR__.'/../lara_app/bootstrap/app.php')
    ->handleRequest(Request::capture());
```

### 4. Veritabanı Kurulumu (Canlıda)
Sunucuya yükleme yaptıktan sonra tabloları oluşturmak için şu adresi ziyaret edin:
`https://siteniz.com.tr/install-db`

## 🔄 Sistemi Güncelleme (Build Süreci)

Kodda yaptığınız frontend (React/CSS) değişikliklerinin canlıda görünmesi için şu **Altın Kuralı** izlemelisiniz:

1.  **Yerelde Derleyin:** Değişiklik yaptıktan sonra yerel terminalde:
    ```bash
    npm run build
    ```
2.  **Dosyaları Güncelleyin:** Yerelde oluşan `public/build` klasörünün içindeki tüm dosyaları sunucudaki `public_html/build/` klasörüne (Eskileri silerek) yükleyin.
3.  **Varlıklar:** Yeni görsel veya resim eklediyseniz `public/assets/` içeriğini sunucudaki `public_html/assets/` klasörüne aktarın.

> [!IMPORTANT]
> Sunucuya sadece `.tsx` dosyalarını yüklemek tasarımı değiştirmez. Mutlaka `npm run build` alıp çıkan paketlenmiş dosyaları yüklemelisiniz.

## 🔐 Roller ve Yetkiler

-   **Admin / Komite:** Turnuva oluşturma, kura çekme, takımları onaylama/reddetme, saha tanımlama ve lojistik yönetimi.
-   **Hakem / Saha Yetkilisi:** Maç skorlarını, olaylarını (gol/kart) ve saha içi teknik verileri girme yetkisi.
-   **Takım Yöneticisi:** Kendi takımını kurma, personel ekleme, kadro güncelleme ve saha/lojistik bilgilerini takip etme.

---

> [!IMPORTANT]
> Sistem yerel saat olarak `Europe/Istanbul` (UTC+3) kullanmaktadır. Tüm işlem zamanları bu dile göre kaydedilir.

---

Geliştiren: Antigravity AI
