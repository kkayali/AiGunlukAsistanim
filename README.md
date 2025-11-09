# 🧠 Ai Günlük Asistanım

Kullanıcının yazdığı günlük notlarını analiz ederek duygu durumunu tespit eden ve buna uygun öneriler sunan **AI destekli mobil günlük asistanı**.  
Uygulama **çevrimdışı çalışabilir**, geçmiş kayıtları cihazda tutar ve **haftalık özet grafiği** gösterir.

---

## 🚀 Proje Özeti

**Ai Günlük Asistanım**, React Native CLI ile geliştirilmiş bir mobil uygulamadır.  
Kullanıcıdan alınan metinleri Hugging Face üzerinde çalışan duygu analizi modeliyle işler.  
Analiz sonucuna göre sistem; pozitif, nötr veya negatif duyguları algılar ve kişiye özel öneriler sunar.  
Tüm veriler yerel olarak AsyncStorage içinde tutulur, bu sayede **internet bağlantısı olmasa bile geçmiş analizler görüntülenebilir.**

---

## ⚙️ Teknoloji ve Mimarî

| Katman | Teknoloji | Açıklama |
|--------|------------|----------|
| Mobil Çatı | **React Native CLI (0.76.5)** | Android platformu için geliştirildi |
| Arayüz Bileşenleri | **react-native-paper**, **react-navigation** | Modern ve sade Material UI görünümü |
| Veri Saklama | **@react-native-async-storage/async-storage** | Offline modda veri depolama |
| Ağ Kontrolü | **@react-native-community/netinfo** | Çevrimdışı durumda kullanıcı bilgilendirme |
| Görsel Grafik | **react-native-svg** | Haftalık özet ekranında dairesel grafik |
| Yapay Zekâ Servisi | **Hugging Face API** | Sentiment Analysis modeli ile duygu sınıflandırması |

---

## 🤖 Kullanılan AI Modeli ve API Açıklaması

**Model Adı:** `cardiffnlp/twitter-xlm-roberta-base-sentiment`  
**Sağlayıcı:** [Hugging Face Inference API](https://huggingface.co/models)

Bu model Türkçe dahil çok dilli metinler için eğitilmiştir.  
Analiz sonucunda şu etiketlerden birini döndürür:
- `positive` → Pozitif duygu
- `neutral` → Nötr duygu
- `negative` → Negatif duygu  

Uygulamada `src/services/hf.js` dosyasında Hugging Face API çağrıları gerçekleştirilir.  
API erişimi `.env` dosyasındaki `HF_TOKEN` değişkeni ile sağlanır.

> ⚠️ Tüm servisler ücretsizdir ve yalnızca Hugging Face’in halka açık inference uç noktaları kullanılmıştır.

---

## 💾 Offline Çalışma

Uygulama çevrimdışı olduğunda:
- Yeni analiz yapılamaz (kullanıcı bilgilendirilir),
- Ancak **önceden yapılan analizler ve geçmiş kayıtları** `AsyncStorage` üzerinden listelenir.  
- Böylece kullanıcı geçmiş duygu durumu ve önerilerini internet olmadan da görebilir.

Bu özellik `src/services/storage.js` içinde yönetilmektedir.

---

## 📊 Ekranlar

| Ekran | Açıklama |
|-------|-----------|
| **DailyEntryScreen** | Kullanıcıdan metin alır, analizi yapar ve önerileri gösterir. |
| **HistoryScreen** | Önceki analizlerin tarih sırasına göre listesi. |
| **WeeklySummaryScreen** | Son 7 günün duygu dağılımını dairesel grafik olarak gösterir. |

---

## 🖼️ Çalışır Demo

Aşağıdaki ekran görüntüleri **Expo sürümünde çalışan demo**dan alınmıştır (UI ve işlev aynıdır):

| Analiz Ekranı | Geçmiş Ekranı |
|----------------|----------------|
| ![Analiz](screenshots/analiz.png) | ![Geçmiş](screenshots/gecmis.png) |

> Alternatif olarak kısa bir video (.mp4) ekleyebilirsin:  
> `demo/demo.mp4`

---

## 🧭 Kurulum ve Çalıştırma Adımları

### 1️⃣ Gerekli ortam
- Node.js (18 veya üzeri)
- Android Studio + SDK
- Java JDK 17
- React Native CLI global veya `npx` ile erişilebilir durumda

### 2️⃣ Depoyu klonla
```bash
git clone https://github.com/kkayali/AiGunlukAsistanim.git
cd AiGunlukAsistanim
