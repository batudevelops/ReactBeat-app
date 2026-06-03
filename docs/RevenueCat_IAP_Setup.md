# ReactBeat — RevenueCat + IAP Kurulum Rehberi

Uygulama kodu hazır. Premium satın alma için panel adımları **bu sırayla** yapılmalı:

```
1. App Store Connect  → uygulama kaydı + IAP ürünü
2. Google Play Console → uygulama kaydı + IAP ürünü
3. RevenueCat          → store’ları bağla, ürünleri import et, offering
4. .env                → public API key’ler
```

> RevenueCat, App Store / Play’de **zaten tanımlı** bundle ID, package name ve product ID’lere bağlanır. Store’da uygulama yokken RevenueCat kurmak mümkün olsa da ürün import ve sandbox test çalışmaz.

## Sabit değerler (kodla eşleşmeli)

| Alan | Değer |
|------|--------|
| iOS bundle ID | `com.batudevelops.reactbeat` |
| Android package | `com.batudevelops.reactbeat` |
| RevenueCat entitlement | `premium` |
| Store product ID | `reactbeat_premium_lifetime` |
| Fiyat | $1.99 (tek seferlik / lifetime) |

Kaynak: `src/constants/monetization.ts`

---

## 1) App Store Connect (iOS)

### 1a. Uygulama kaydı (önce bu)

1. [App Store Connect](https://appstoreconnect.apple.com) → **My Apps** → **+** → **New App**.
2. **Platform:** iOS · **Name:** ReactBeat · **Primary Language:** Turkish veya English.
3. **Bundle ID:** `com.batudevelops.reactbeat` (Apple Developer’da App ID oluşturulmuş olmalı).
4. **SKU:** örn. `reactbeat-ios` (iç kullanım, benzersiz string).
5. Uygulama kaydı oluştuktan sonra devam et.

### 1b. In-App Purchase

1. Uygulama → **Features → In-App Purchases → +** → **Non-Consumable**.
2. **Reference Name:** `ReactBeat Premium Lifetime`
3. **Product ID:** `reactbeat_premium_lifetime` (tam eşleşme şart)
4. **Price:** $1.99 (Tier 2 veya bölgesel eşdeğeri)
5. Localization ekle (Display Name + Description).
6. **Paid Applications Agreement** + banka/vergi bilgileri tamamlanmış olmalı (IAP aktif olmaz).
7. **App Store Connect → Users and Access → Sandbox → Testers** → test Apple ID oluştur.

> Simülatörde gerçek IAP çalışmaz. Sandbox test için **gerçek cihaz** veya **TestFlight** build gerekir.

---

## 2) Google Play Console (Android)

### 2a. Uygulama kaydı (önce bu)

1. [Google Play Console](https://play.google.com/console) → **Create app**.
2. **App name:** ReactBeat · **Default language** · **App / Game:** Game.
3. **Package name:** `com.batudevelops.reactbeat` (**sonradan değiştirilemez** — `app.config.js` ile aynı olmalı).
4. Declarations (policies, ads vb.) tamamla → uygulama oluşsun.

### 2b. In-app product

1. **Monetize → Products → In-app products → Create product**.
2. **Product ID:** `reactbeat_premium_lifetime`
3. **Name / Description** doldur.
4. **Price:** $1.99 (veya TRY karşılığı).
5. **Activate** et.
6. **License testers** ekle (Settings → License testing).

> Internal testing track’e en az bir APK/AAB yüklenmeden Play Billing test edilemez.

---

## 3) RevenueCat Dashboard

1. [RevenueCat](https://app.revenuecat.com) → **New Project** → `ReactBeat`.
2. **Apps → Add app → Apple App Store**
   - Bundle ID: `com.batudevelops.reactbeat`
   - App Store Connect Shared Secret veya App Store Connect API key (önerilen) bağla.
3. **Apps → Add app → Google Play Store**
   - Package: `com.batudevelops.reactbeat`
   - Play Console service account JSON yükle.
4. **Product catalog → Products**
   - iOS: `reactbeat_premium_lifetime` (App Store ürününü import et)
   - Android: `reactbeat_premium_lifetime` (Play ürününü import et)
5. **Entitlements → +** → Identifier: `premium`
   - Her iki store ürününü bu entitlement’a bağla.
6. **Offerings → default (Current)**
   - Package type: **Lifetime**
   - Product: `reactbeat_premium_lifetime`
   - Offering’i **Current** yap.

### API keys

**Project Settings → API keys → Public app-specific keys**

- iOS → `appl_...`
- Android → `goog_...`

`.env` dosyana ekle (local build / prebuild için):

```env
REVENUECAT_IOS_API_KEY=appl_XXXXXXXXXXXX
REVENUECAT_ANDROID_API_KEY=goog_XXXXXXXXXXXX
```

Sonra native rebuild:

```bash
npx expo prebuild
npm run ios   # veya npm run android
```

---

## 4) EAS cloud build secrets

Local `.env` EAS bulut build’ine gitmez. Her secret’i projeye ekle:

```bash
eas secret:create --scope project --name REVENUECAT_IOS_API_KEY --value appl_XXXX
eas secret:create --scope project --name REVENUECAT_ANDROID_API_KEY --value goog_XXXX
eas secret:create --scope project --name ADMOB_IOS_APP_ID --value ca-app-pub-...
eas secret:create --scope project --name ADMOB_ANDROID_APP_ID --value ca-app-pub-...
# ... diğer ADMOB_* birimleri
eas secret:create --scope project --name SENTRY_AUTH_TOKEN --value <sentry-token>
```

`app.config.js` bu env değişkenlerini `extra.revenueCat` / `extra.admob` içine aktarır.

Preview build:

```bash
npm run build:preview
```

---

## 5) Doğrulama checklist

- [ ] RevenueCat → Customers → test kullanıcı UID’si görünüyor (anon Firebase uid)
- [ ] Paywall → fiyat mağazadan geliyor (yoksa fallback `$1.99`)
- [ ] Satın al → Settings/Profile’da Premium aktif
- [ ] Restore purchases → ikinci cihazda premium geri geliyor
- [ ] Premium: Color Conflict + Odd One Out kilidi açık, reklam yok, sınırsız can
- [ ] Firestore `users/{uid}.isPremium === true`

---

## Sık hatalar

| Belirti | Olası neden |
|---------|-------------|
| “No purchasable package found” | Offering current değil veya lifetime package yok |
| “RevenueCat API key is not configured” | `.env` boş / EAS secret eksik |
| iOS satın alma hiç açılmıyor | Sandbox tester değil veya Paid Apps Agreement eksik |
| Android “item unavailable” | Ürün activate değil veya internal track’te build yok |
| Entitlement aktif ama uygulama free | `premium` id yazım hatası (küçük harf) |

---

*Son güncelleme: Faz 10 monetizasyon · Expo SDK 56*
