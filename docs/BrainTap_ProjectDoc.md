# BrainTap — Proje Dokümantasyonu

**Versiyon:** 1.1  
**Platform:** iOS + Android (Expo SDK 56)  
**Durum:** Aktif geliştirme

---

## İçindekiler

1. [Proje Genel Bakış](#1-proje-genel-bakış)
2. [Tech Stack](#2-tech-stack)
3. [Klasör Yapısı](#3-klasör-yapısı)
4. [Tema & Renk Sistemi](#4-tema--renk-sistemi)
5. [Navigation Yapısı](#5-navigation-yapısı)
6. [Ekranlar](#6-ekranlar)
7. [Oyun Modları](#7-oyun-modları)
8. [Level Yapısı](#8-level-yapısı)
9. [State Management](#9-state-management)
10. [Firebase Yapısı](#10-firebase-yapısı)
11. [Auth Akışı](#11-auth-akışı)
12. [Leaderboard Sistemi](#12-leaderboard-sistemi)
13. [Anti-Cheat Sistemi](#13-anti-cheat-sistemi)
14. [Monetizasyon](#14-monetizasyon)
15. [Animasyon Sistemi](#15-animasyon-sistemi)
16. [Bileşen Kütüphanesi](#16-bileşen-kütüphanesi)
17. [Cloud Functions](#17-cloud-functions)
18. [Remote Config](#18-remote-config)
19. [Sentry & Analytics](#19-sentry--analytics)
20. [Babel & Build Yapılandırması](#20-babel--build-yapılandırması)

---

## 1. Proje Genel Bakış

BrainTap, refleks, hafıza ve dikkat odaklı 8 oyun modunu barındıran hyper-casual bir beyin antrenmanı oyunudur (ReactBeat / Expo). Fluo eğitim uygulamasının yanına bağımsız bir oyun olarak geliştirilmektedir.

### Temel Özellikler

- **8 oyun modu** + **Brain Mix** (hızlı oyna) — 6 ücretsiz çekirdek, 2 premium dikkat modu
- Ana sayfa **beceri grupları**: Hız · Hafıza · Dikkat + üstte Brain Mix
- Gerçek zamanlı leaderboard (günlük / haftalık / tüm zamanlar*) — modlar gruplu filtre
- Lazy auth: anonim başla, top 10'da sosyal login tetikle
- **Hibrit premium** ($1.99 tek seferlik): reklamsız + sınırsız can + all-time leaderboard + premium modlar
- Ücretsiz: **8 can** (5 dk regen), reklam ile +1 (max 9)
- Server-side skor doğrulama (anti-cheat)
- Firestore tabanlı dinamik level ayarları

\* Tüm zamanlar leaderboard yalnızca premium.

### Bundle ID
- iOS: `com.batudevelops.reactbeat`
- Android: `com.batudevelops.reactbeat`

---

## 2. Tech Stack

### Core
| Katman | Teknoloji |
|--------|-----------|
| Framework | React Native 0.85.3 (bare workflow) |
| Dil | TypeScript |
| Navigation | React Navigation v6 |
| State | Zustand |
| Animasyon | Reanimated 3 + Lottie |
| Backend | Firebase (Firestore + Realtime DB + Auth + Remote Config) |
| Monitoring | Sentry + Expo |

### Bağımlılıklar (npm)

```
@react-navigation/native
@react-navigation/stack
@react-navigation/bottom-tabs
react-native-screens
react-native-safe-area-context
react-native-reanimated
react-native-gesture-handler
lottie-react-native
zustand
@react-native-async-storage/async-storage
react-native-linear-gradient
react-native-haptic-feedback
react-native-sound
@react-native-google-signin/google-signin
react-native-google-mobile-ads
react-native-purchases
@react-native-firebase/app
@react-native-firebase/auth
@react-native-firebase/firestore
@react-native-firebase/database
@react-native-firebase/remote-config
@react-native-firebase/analytics
@react-native-firebase/crashlytics
```

### Firebase Proje
- Görünen ad (home screen / splash): **BrainTap**
- Expo slug / URL scheme (teknik, küçük harf): `braintap`
- Cloud Functions region: `europe-west1`

---

## 3. Klasör Yapısı

```
src/
├── app/
│   ├── index.tsx                  # Entry point, auth gate
│   └── navigation/
│       ├── RootNavigator.tsx      # Auth durumuna göre navigator seç
│       ├── GameNavigator.tsx      # Ana oyun navigasyonu
│       └── types.ts               # NavigationProp tipleri
│
├── screens/
│   ├── Splash/
│   │   └── SplashScreen.tsx
│   ├── Home/
│   │   └── HomeScreen.tsx
│   ├── ModeSelect/
│   │   └── ModeSelectScreen.tsx
│   ├── Game/
│   │   ├── ReflexGame/
│   │   │   └── ReflexGameScreen.tsx
│   │   ├── MemoryGame/
│   │   │   └── MemoryGameScreen.tsx
│   │   ├── PatternGame/
│   │   │   └── PatternGameScreen.tsx
│   │   ├── ColorConflictGame/
│   │   │   └── ColorConflictScreen.tsx   # Premium
│   │   └── OddOneOutGame/
│   │       └── OddOneOutScreen.tsx       # Premium
│   ├── Result/
│   │   └── ResultScreen.tsx
│   ├── Leaderboard/
│   │   └── LeaderboardScreen.tsx
│   ├── Profile/
│   │   └── ProfileScreen.tsx
│   ├── Settings/
│   │   └── SettingsScreen.tsx
│   └── Paywall/
│       └── PaywallScreen.tsx
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── ProgressBar.tsx
│   │   └── Avatar.tsx
│   ├── game/
│   │   ├── TapCard.tsx            # Dokunulabilir oyun kartı
│   │   ├── CircularTimer.tsx      # Dairesel geri sayım
│   │   ├── LivesBar.tsx           # Kalp ikonları
│   │   ├── ScoreDisplay.tsx       # Anlık skor + combo
│   │   ├── ComboIndicator.tsx     # Combo çarpanı animasyonu
│   │   └── StreakBadge.tsx        # Günlük seri rozeti
│   └── shared/
│       ├── SafeLayout.tsx
│       ├── Header.tsx
│       └── Loader.tsx
│
├── store/
│   ├── gameStore.ts               # Oyun içi anlık durum
│   ├── userStore.ts               # Kullanıcı profili + skorlar
│   └── settingsStore.ts           # Ses, haptic, bildirim tercihleri
│
├── hooks/
│   ├── useGame.ts                 # Oyun döngüsü mantığı
│   ├── useAuth.ts                 # Firebase auth işlemleri
│   ├── useLeaderboard.ts          # Realtime DB okuma
│   └── useAdmob.ts                # Reklam yönetimi
│
├── services/
│   ├── firebase/
│   │   ├── auth.ts
│   │   ├── firestore.ts
│   │   ├── leaderboard.ts
│   │   └── remoteConfig.ts
│   ├── admob.ts
│   ├── revenuecat.ts
│   └── sentry.ts
│
├── engine/
│   ├── modes/
│   │   ├── reflex.ts
│   │   ├── memory.ts
│   │   ├── pattern.ts
│   │   ├── colorConflict.ts
│   │   └── oddOneOut.ts
│   ├── scorer.ts                  # Skor hesaplama (client-side)
│   ├── levelConfig.ts             # Level parametreleri
│   └── antiCheat.ts               # Session verisi toplama
│
├── theme/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   └── index.ts
│
└── utils/
    ├── haptics.ts
    ├── sound.ts
    └── format.ts
```

---

## 4. Tema & Renk Sistemi

### Ana Renkler

```typescript
// theme/colors.ts

export const colors = {
  // Primary — Brand Orange
  orange50:  '#fff7ed',
  orange200: '#fed7aa',
  orange400: '#fb923c',
  orange500: '#f97316',  // Primary CTA
  orange600: '#ea580c',  // Pressed state
  orange700: '#c2410c',
  orange900: '#7c2d12',  // Node fills

  // Secondary — Amber
  amber50:   '#fffbeb',
  amber200:  '#fde68a',
  amber400:  '#fbbf24',  // Stars, ödül
  amber500:  '#f59e0b',  // Skor parlaması
  amber600:  '#d97706',  // Bağlantı çizgileri
  amber800:  '#92400e',

  // Feedback
  success:   '#22c55e',  // Doğru cevap
  error:     '#ef4444',  // Yanlış cevap
  info:      '#3b82f6',  // Leaderboard
  special:   '#8b5cf6',  // Streak rekoru

  // Backgrounds (dark theme — oyun geceleri oynanır)
  bgBase:     '#0c0a08',   // Ana arka plan
  bgSurface:  '#1e1410',   // Kartlar, modallar
  bgElevated: '#2a1f14',   // Sheet, drawer
  bgBorder:   '#3d2d1c',   // Ayırıcılar

  // Text
  textPrimary:   '#fafaf9',  // Başlık, skor
  textSecondary: '#d6d3d1',  // Gövde, etiket
  textMuted:     '#78716c',  // İpucu, altyazı
  textDisabled:  '#44403c',  // Pasif öğeler
}
```

### Typography

```typescript
// theme/typography.ts
export const typography = {
  heading1: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
  heading2: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
  heading3: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
  body:     { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  caption:  { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  score:    { fontSize: 48, fontWeight: '800', lineHeight: 56 },
  combo:    { fontSize: 28, fontWeight: '700', lineHeight: 36 },
}
```

### Spacing

```typescript
// theme/spacing.ts
export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48
}
```

---

## 5. Navigation Yapısı

### Stack Hiyerarşisi

```
RootNavigator
├── (auth === null)  → SplashScreen
└── (auth !== null)  → GameNavigator
    ├── HomeScreen                      (default)
    ├── ModeSelectScreen
    ├── Game Stack
    │   ├── ReflexGameScreen
    │   ├── MemoryGameScreen
    │   ├── PatternGameScreen
    │   ├── ColorConflictScreen         (premium check)
    │   └── OddOneOutScreen             (premium check)
    ├── ResultScreen
    ├── LeaderboardScreen
    ├── ProfileScreen
    ├── SettingsScreen
    └── PaywallScreen                   (modal)
```

### Navigation Types

```typescript
// navigation/types.ts
export type RootStackParamList = {
  Home: undefined
  ModeSelect: { mode: GameMode }
  Game: { mode: GameMode; level: number }
  Result: { score: number; mode: GameMode; isNewRecord: boolean }
  Leaderboard: { mode?: GameMode }
  Profile: undefined
  Settings: undefined
  Paywall: undefined
}
```

---

## 6. Ekranlar

### 6.1 SplashScreen

**Amaç:** Firebase auth başlatma, Remote Config fetch, kullanıcı yükleme.

**İçerik:**
- BrainTap logosu (SVG, tap ripple mark + wordmark)
- Tagline: REACT · REMEMBER · BEAT
- Arka plan: `bgBase` (#0c0a08)

**Mantık:**
1. Firebase anonymous auth başlat
2. Remote Config default değerlerini fetch et
3. Firestore'dan kullanıcı dokümanını çek (varsa)
4. userStore'u doldur
5. → HomeScreen'e yönlendir

**Geçiş animasyonu:** Logo fade-in, 1.5s sonra HomeScreen'e slide-up.

---

### 6.2 HomeScreen

**Amaç:** Ana menü. Brain Mix hızlı oyna, beceri grupları, can sayacı.

**İçerik:**

```
┌─────────────────────────────┐
│  Merhaba, [displayName] 👋   │
│  🔥 7 günlük seri    ❤️ 6/8  │
├─────────────────────────────┤
│  [Brain Mix — Quick Play]    │  ← tam genişlik
├─────────────────────────────┤
│  HIZ                         │
│  [Reflex] [Math Snap]        │
│  [Direction]                 │
├─────────────────────────────┤
│  HAFIZA                      │
│  [Memory]  [Pattern]         │
├─────────────────────────────┤
│  DİKKAT                      │
│  [Color Conflict 🔒] [Odd One Out 🔒] │
├─────────────────────────────┤
│  [Leaderboard] [Profil] [⚙️] │
└─────────────────────────────┘
```

**Bileşenler:**
- `ModeCard` — gruplu 2 sütun grid; Brain Mix featured kart
- Can sayacı — premium hariç, regen geri sayımı
- `BottomNavBar` — Leaderboard / Profil / Ayarlar

**Mantık:**
- **Brain Mix** her zaman ücretsiz (ana giriş kapısı)
- Premium → Color Conflict + Odd One Out açılır
- Kilitli mod → PaywallScreen
- Ücretsiz oyuncu: 8 can, 5 dk'da 1 regen, reklam +1 (max 9)

---

### 6.3 ModeSelectScreen

**Parametre:** `mode: GameMode`

**Amaç:** Seçilen mod hakkında bilgi, kişisel en iyi, haftalık sıralama önizleme, oyun başlatma.

**İçerik:**

```
┌─────────────────────────────┐
│  ← Geri    [MOD ADI]         │
│  [Mod ikonu + kısa açıklama] │
├─────────────────────────────┤
│  Kişisel en iyi: 4,820       │
│  Haftalık sıra: #12          │
├─────────────────────────────┤
│  Bu haftanın top 3:          │
│  🥇 Ali    9,200             │
│  🥈 Veli   8,750             │
│  🥉 Ayşe   7,980             │
├─────────────────────────────┤
│  [🎥 Reklam izle → +1 can]   │
│  [▶ Oyna]                    │
└─────────────────────────────┘
```

**Mantık:**
- "Reklam izle" → AdMob rewarded → +1 can (canStore)
- "Oyna" → GameScreen'e geç, level 1'den başla veya son tamamlanan level'dan

---

### 6.4 Game Screens (8 mod + Mix router)

Her oyun ekranı ortak bir Game Layout kullanır:

```
┌─────────────────────────────┐
│  [◀] [mod adı]   Skor: 2,400│
│  ❤️ ❤️ ❤️          Combo: x3  │
│  ──────────────────────────  │
│  [CircularTimer — 1.5s]      │
│  ──────────────────────────  │
│                              │
│         OYUN ALANI           │
│      (mod'a özel içerik)     │
│                              │
└─────────────────────────────┘
```

**Ortak Bileşenler:**
- `CircularTimer` — dairesel geri sayım, son 3s kırmızı pulse
- `LivesBar` — session canları; global pool premium hariç
- `ScoreDisplay` — anlık skor
- `ComboIndicator` — combo arttıkça scale bounce animasyonu

**Can Bitti Akışı:**
1. Oyun duraksıtılır
2. Modal: "Can kalmadı" → [Reklam izle (+1 can)] veya [Bitir]
3. Reklam yoksa ya da kullanıcı reddederse → ResultScreen

**Süre Bitti Akışı:**
1. Soru boş geçer, yanlış sayılır
2. Hayat -1, sonraki soru

---

### 6.5 ResultScreen

**Parametre:** `{ score, mode, isNewRecord, rank }`

**İçerik:**

```
┌─────────────────────────────┐
│  🎉 YENİ REKOR! (varsa)     │
│  [Konfeti Lottie]           │
├─────────────────────────────┤
│  Skorun: 4,820              │
│  Doğru: 18  Yanlış: 4       │
│  Ort. tepki: 0.8s           │
├─────────────────────────────┤
│  Bu haftaki sıran: #8       │
│  (Top 10 → Login öner)      │
├─────────────────────────────┤
│  [Tekrar Oyna]              │
│  [Ana Menü]                 │
│  [Leaderboard'a bak]        │
└─────────────────────────────┘
```

**Mantık:**
- `isNewRecord` true ise Lottie konfeti oynatılır
- `rank <= 10` ise → Google/Apple login modalı tetiklenir
- Her 3 oyun sonunda interstitial reklam göster (AdMob)
- Skor Cloud Function'a gönderilir, doğrulanır, leaderboard'a yazılır

---

### 6.6 LeaderboardScreen

**İçerik:**

```
┌─────────────────────────────┐
│  Liderlik Tablosu           │
│  [Günlük] [Haftalık] [Tüm 🔒]│
│  [Hız][Hafıza][Dikkat][Mix]  │  ← beceri grubu
│  [Reflex][Math Snap][Direction]│ ← gruba göre alt modlar
├─────────────────────────────┤
│  🥇 Ali       9,200         │
│  🥈 Veli      8,750         │
│  🥉 Ayşe      7,980         │
│  4. Mehmet    7,200         │
│  ...                        │
├─────────────────────────────┤
│  [Sabit alt bar]            │
│  Senin sıran: #47 — 4,820  │
└─────────────────────────────┘
```

**Veri Kaynağı:** Firebase Realtime Database (anlık okuma)

**Filtreleme:** 3 zaman × 8 mod (+ Mix) = 24 liste; UI'da 4 beceri grubu + alt mod seçici

Her liste maksimum 100 kullanıcı gösterir. Premium modlar kilitli kullanıcıya Paywall. All-time premium gerektirir.

---

### 6.7 ProfileScreen

**İçerik:**

```
┌─────────────────────────────┐
│  [Avatar seç — 0-9 ikon]    │
│  [displayName] düzenle       │
│  [Premium rozeti — varsa]   │
├─────────────────────────────┤
│  Toplam oyun: 124           │
│  Toplam XP: 48,200          │
│  En uzun seri: 12 gün       │
├─────────────────────────────┤
│  En iyi skorlar:            │
│  Reflex:        4,820       │
│  Memory:        3,100       │
│  Pattern:       2,750       │
│  Color Conflict: —          │
│  Odd One Out:   —           │
├─────────────────────────────┤
│  [Google ile bağla] (anonim)│
│  [Apple ile bağla] (anonim) │
└─────────────────────────────┘
```

---

### 6.8 SettingsScreen

**İçerik:**
- Ses efektleri (açık/kapalı)
- Haptic feedback (açık/kapalı)
- Bildirimler (günlük hatırlatma)
- Gizlilik politikası
- Kullanım şartları
- Sürüm bilgisi
- Premium satın al (ücretsiz kullanıcı için)
- Restore purchases

---

### 6.9 PaywallScreen (Modal)

**İçerik:**

```
┌─────────────────────────────┐
│  BrainTap Premium           │
├─────────────────────────────┤
│  ✓ Tüm oyun modlarına erişim │
│  ✓ Reklamsız deneyim        │
│  ✓ Sınırsız can             │
│  ✓ Tüm zamanlar leaderboard │
├─────────────────────────────┤
│  TEK SEFERLİK               │
│  $1.99                      │
├─────────────────────────────┤
│  [Satın Al]                 │
│  [Restore Purchases]        │
│  [Kapat]                    │
└─────────────────────────────┘
```

**Mantık:**
- RevenueCat `purchasePackage` çağrısı
- Başarılı → userStore.setPremium(true) → Firestore güncelle
- Restore → RevenueCat `restorePurchases`

---

## 7. Oyun Modları

### 7.1 Reflex

**Mekanik:** Ekranın ortasında bir şekil/renk/sayı belirir. Kullanıcı "Bu DOĞRU mu?" veya belirli kritere uyan seçeneğe tap'lamalı.

**Görsel:**
- Merkez büyük kart (renk + şekil)
- Alt: 2-4 seçenek butonu

**Zorluk artışı:**
- Seçenek sayısı artar (2 → 4)
- Süre kısalır (2s → 0.8s)
- Benzer seçenekler artar (tuzak)

---

### 7.2 Memory

**Mekanik:** Sırayla gösterilen kartları ezberle, aynı sırayla tap'la.

**Görsel:**
- 3×3 ila 4×4 grid
- Kartlar sırayla parlar
- Sonra hepsi söner, kullanıcı sırayı tap'lar

**Zorluk artışı:**
- Grid büyür
- Gösterim süresi kısalır
- Sıra uzar

---

### 7.3 Pattern Match

**Mekanik:** Kısa süre (0.5-1.5s) gösterilen deseni 4 seçenekten bul.

**Görsel:**
- Üst: 0.5s gösterilen desen (renkli kareler/şekiller)
- Alt: 4 seçenek kartı

**Zorluk artışı:**
- Gösterim süresi kısalır
- Desen karmaşıklaşır
- Seçenekler birbirine benzer

---

### 7.4 Color Conflict — *Premium*

**Mekanik:** Bir şeklin rengi ile arka planı çakışıyor. "Şeklin gerçek rengine tap'la" (kelime yok, tamamen görsel).

**Görsel:**
- Merkez büyük daire/kare — renk A
- Arka plan rengi — renk B
- Alt: 4 renk seçeneği (renkli daireler)

**Zorluk artışı:**
- Renk sayısı artar (2 → 6)
- Süre kısalır
- Çok benzer renkler eklenir

---

### 7.5 Odd One Out — *Premium*

**Mekanik:** 4-9 kart arasında farklı olana (renk, şekil, sayı vb.) tap'la.

**Görsel:**
- Grid: 2×2 → 3×3
- Tüm kartlar aynı görünür, biri farklı

**Zorluk artışı:**
- Grid büyür
- Fark incelir (renk tonu, şekil boyutu)
- Süre kısalır

---

### 7.6 Math Snap — *Ücretsiz (Hız)*

**Mekanik:** Basit toplama/çıkarma sorusu gösterilir; doğru sayıya tap'la.

**Zorluk artışı:**
- Sayı aralığı büyür
- Seçenek sayısı artar (2 → 4)
- Süre kısalır

---

### 7.7 Direction — *Ücretsiz (Hız)*

**Mekanik:** Ekranda bir ok (↑↓←→) belirir; aynı yön butonuna tap'la.

**Zorluk artışı:**
- Seçenek sayısı artar (2 → 4 yön)
- Süre kısalır

---

### 7.8 Brain Mix — *Ücretsiz (Quick Play)*

**Mekanik:** Tek level track; her tur rastgele alt mod (Reflex, Memory, Pattern, Color Conflict, Odd One Out, Math Snap, Direction). Alt mod zorluğu mix level'ına göre gelir.

**Not:** Mix ana giriş kapısı — premium yapılmaz. Premium alt modlar (Color Conflict, Odd One Out) mix içinde de premium kullanıcıya açık; ücretsiz oyuncu mix'te yalnızca ücretsiz alt modlar döner (ileride filtrelenebilir).

---

## 8. Level Yapısı

### Level Config Interface

```typescript
// engine/levelConfig.ts

export interface LevelConfig {
  timeLimit: number        // ms — soru başına süre
  options: number          // seçenek sayısı
  lives: number            // can sayısı
  speedMultiplier: number  // animasyon hızı
  comboBonus: number       // combo başına ekstra puan
  streakThreshold: number  // combo başlamak için gereken ardışık doğru
  gridSize?: number        // Memory/OddOneOut için grid
  showDuration?: number    // Memory/Pattern için gösterim süresi (ms)
}
```

### Reflex Level Tablosu

| Level | Süre | Seçenek | Can | Speed |
|-------|------|---------|-----|-------|
| 1-5   | 2000ms | 2 | 3 | 1x |
| 6-15  | 1500ms | 3 | 3 | 1.2x |
| 16-30 | 1200ms | 4 | 3 | 1.5x |
| 31+   | Remote Config | RC | RC | RC |

### Skor Hesaplama

```typescript
// engine/scorer.ts
function calculateScore(params: {
  correct: boolean
  reactionMs: number
  timeLimit: number
  combo: number
  comboBonus: number
}): number {
  if (!params.correct) return 0

  const baseScore = 100
  const speedRatio = 1 - (params.reactionMs / params.timeLimit)
  const speedBonus = Math.floor(speedRatio * 50)  // max 50 puan hız bonusu
  const comboMultiplier = 1 + (params.combo * 0.1) // her combo %10 artış

  return Math.floor((baseScore + speedBonus) * comboMultiplier)
}
```

---

## 9. State Management

### gameStore.ts

```typescript
interface GameStore {
  // Durum
  mode: GameMode | null
  level: number
  score: number
  combo: number
  streak: number       // mevcut ardışık doğru sayısı
  lives: number
  status: 'idle' | 'playing' | 'paused' | 'finished'
  session: GameSession | null   // anti-cheat için

  // Aksiyonlar
  startGame: (mode: GameMode, level: number) => void
  tapCorrect: (reactionMs: number) => void
  tapWrong: () => void
  pauseGame: () => void
  resumeGame: () => void
  endGame: () => void
  reset: () => void
}
```

### userStore.ts

```typescript
interface UserStore {
  // Kimlik
  uid: string | null
  displayName: string
  avatar: number        // 0-9 ikon index
  isAnonymous: boolean
  isPremium: boolean

  // İstatistik
  bestScores: {
    reflex: number
    memory: number
    pattern: number
    colorConflict: number
    oddOneOut: number
  }
  totalGames: number
  totalXP: number
  streak: number
  lastPlayedAt: string | null

  // Aksiyonlar
  setUser: (user: Partial<UserStore>) => void
  updateBestScore: (mode: GameMode, score: number) => void
  setPremium: (val: boolean) => void
  incrementStreak: () => void
  resetStreak: () => void
}
```

### settingsStore.ts

```typescript
interface SettingsStore {
  soundEnabled: boolean
  hapticEnabled: boolean
  notificationsEnabled: boolean

  toggleSound: () => void
  toggleHaptic: () => void
  toggleNotifications: () => void
}
```

---

## 10. Firebase Yapısı

### Firestore — Kullanıcı Profili

```
users/{uid}
  ├── displayName: string
  ├── avatar: number (0-9)
  ├── isAnonymous: boolean
  ├── isPremium: boolean
  ├── createdAt: Timestamp
  ├── lastPlayedAt: Timestamp
  ├── streak: number
  ├── totalGames: number
  ├── totalXP: number
  └── bestScores: {
        reflex: number
        memory: number
        pattern: number
        colorConflict: number
        oddOneOut: number
      }
```

### Realtime Database — Leaderboard

```
leaderboard/
  ├── daily/
  │   ├── reflex/{uid}: { score, name, avatar, ts }
  │   ├── memory/{uid}: { ... }
  │   ├── pattern/{uid}: { ... }
  │   ├── colorConflict/{uid}: { ... }
  │   └── oddOneOut/{uid}: { ... }
  ├── weekly/
  │   └── (aynı yapı)
  └── alltime/
      └── (aynı yapı)
```

### Güvenlik Kuralları (Realtime DB)

```json
{
  "rules": {
    "leaderboard": {
      ".read": true,
      ".write": false
    }
  }
}
```

Leaderboard'a sadece Cloud Function yazar. Kullanıcı direkt yazamaz.

### Firestore Güvenlik Kuralları

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == uid;
    }
  }
}
```

---

## 11. Auth Akışı

### Lazy Auth Stratejisi

```
Uygulama açılır
       │
       ▼
Anonymous Auth (otomatik, kullanıcı görmez)
       │
       ▼
Oyun oynamaya başlar
       │
       ▼
Leaderboard Top 10'a girer?
       │
      YES → "Skoru kaydet!" Modal
              │
              ▼
         Google veya Apple Login
              │
              ▼
         Anonymous → Merge → Gerçek hesap
         (veriler kaybolmaz)
```

### Auth Service

```typescript
// services/firebase/auth.ts

// Anonim giriş
export async function signInAnonymously(): Promise<User>

// Google ile bağla (anonymous merge)
export async function linkWithGoogle(): Promise<User>

// Apple ile bağla (anonymous merge)
export async function linkWithApple(): Promise<User>

// Çıkış
export async function signOut(): Promise<void>

// Mevcut kullanıcı
export function getCurrentUser(): User | null
```

---

## 12. Leaderboard Sistemi

### Veri Akışı

```
Oyun biter
    │
    ▼
Client → Cloud Function'a session gönder
    │
    ▼
CF: Anti-cheat doğrula
    │
    ├── BAŞARISIZ → Skor reddedilir
    │
    └── BAŞARILI → Realtime DB'ye yaz
                       (daily + weekly + alltime)
```

### Leaderboard Hook

```typescript
// hooks/useLeaderboard.ts

function useLeaderboard(period: Period, mode: GameMode) {
  // Firebase Realtime DB'den top 100 dinle
  // Kendi sırını bul
  // Realtime güncelleme
  return { entries, myRank, loading }
}
```

### Haftalık Reset

Her Pazartesi gece yarısı Cloud Function otomatik olarak `weekly` koleksiyonunu temizler.
Her gün gece yarısı `daily` koleksiyonu temizlenir.

---

## 13. Anti-Cheat Sistemi

### Session Verisi

```typescript
// engine/antiCheat.ts

interface GameSession {
  sessionId: string          // UUID
  mode: GameMode
  level: number
  startTime: number          // Date.now()
  endTime: number
  deviceFingerprint: string  // platform + model
  events: TapEvent[]
}

interface TapEvent {
  ts: number           // tap timestamp
  questionId: string   // hangi soru
  answer: string       // verilen cevap
  correct: boolean
  reactionMs: number   // ne kadar sürede tap'ladı
}
```

### Cloud Function Doğrulama

```typescript
// functions/src/validateScore.ts

// Kontrol 1: reactionMs < 80ms → şüpheli (insan min ~150ms)
// Kontrol 2: Tüm cevaplar aynı ms'de → bot
// Kontrol 3: Score > teoretik maksimum → hile
// Kontrol 4: Session süresi < toplam süre → sahte session
// Kontrol 5: Event sayısı != skor sayısı → manipülasyon
```

---

## 14. Monetizasyon

### Paket Yapısı (Hibrit Model)

Premium **yalnızca reklam kaldırmak için değil** — oynanabilir ücretsiz çekirdek + prestij/rahatlık katmanı.

| Özellik | Ücretsiz | Premium ($1.99) |
|---------|----------|-----------------|
| Brain Mix | ✓ | ✓ |
| Reflex, Memory, Pattern | ✓ | ✓ |
| Math Snap, Direction | ✓ | ✓ |
| Color Conflict | ✗ | ✓ |
| Odd One Out | ✗ | ✓ |
| Reklamlar | Her 3 oyun interstitial | ✗ |
| Can | **8** (5 dk regen, reklam +1 → max 9) | Sınırsız |
| Leaderboard | Günlük + Haftalık | + Tüm Zamanlar |

**Tasarım ilkeleri:**
- Mix premium yapılmaz (ana giriş)
- Tüm oyunu kilitleme — en az 5 mod ücretsiz
- Premium modlar = gelişmiş dikkat oyunları (Color Conflict, Odd One Out)

### AdMob

```typescript
// services/admob.ts

// Interstitial: Her 3 oyun sonunda
const INTERSTITIAL_THRESHOLD = 3

// Rewarded: Can kazan
// ModeSelect ekranında + Can bitti modalında
```

### RevenueCat

```typescript
// services/revenuecat.ts

const ENTITLEMENT_ID = 'premium'
const PRODUCT_ID = 'reactbeat_premium_lifetime'

async function purchasePremium(): Promise<boolean>
async function restorePurchases(): Promise<boolean>
async function checkPremiumStatus(): Promise<boolean>
```

---

## 15. Animasyon Sistemi

### Reanimated 3 Kullanım Alanları

| Animasyon | Tetikleyici | Açıklama |
|-----------|------------|----------|
| Tap ripple | Doğru cevap | Merkezi halka genişler |
| Shake | Yanlış cevap | Kart 3 kez sallanır |
| Combo pop | Combo artışı | Scale 1→1.3→1 bounce |
| Timer pulse | Son 3 saniye | Kırmızı renk pulse |
| Card reveal | Soru geçişi | Flip animasyonu |
| Lives lose | Can kaybı | Kalp fade-out |

### Lottie Kullanım Alanları

| Animasyon | Dosya | Tetikleyici |
|-----------|-------|------------|
| Konfeti | confetti.json | Yeni rekor |
| Level up | levelup.json | Level tamamlama |
| Streak fire | fire.json | Streak devam |
| Premium | premium.json | Satın alma sonrası |

Lottie dosyaları [lottiefiles.com](https://lottiefiles.com)'dan temin edilir.

### Animasyon Kuralları

- Oyun içi tüm animasyonlar Reanimated (JS thread bağımsız, 60fps)
- Kutlama animasyonları Lottie (hazır dosya)
- Haptic feedback her doğru/yanlış cevap için
- `react-native-haptic-feedback` kullanılır

---

## 16. Bileşen Kütüphanesi

### TapCard.tsx

```typescript
interface TapCardProps {
  color?: string
  shape?: 'circle' | 'square' | 'triangle'
  label?: string
  onPress: () => void
  isCorrect?: boolean     // animasyon tetiklemek için
  isWrong?: boolean
  size?: 'sm' | 'md' | 'lg'
}
```

### CircularTimer.tsx

```typescript
interface CircularTimerProps {
  duration: number         // ms
  onComplete: () => void
  warningThreshold?: number  // ms kala uyarı (default 3000)
}
```

### Button.tsx

```typescript
interface ButtonProps {
  label: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  icon?: ReactNode
}
```

---

## 17. Cloud Functions

### Fonksiyonlar (europe-west1)

```typescript
// validateAndSaveScore
// POST — oyun bitince çağrılır
// Input: { session: GameSession, uid: string }
// Output: { valid: boolean, score: number, rank: number }

// resetDailyLeaderboard
// CRON — her gün 00:00 UTC

// resetWeeklyLeaderboard
// CRON — her Pazartesi 00:00 UTC
```

---

## 18. Remote Config

### Default Değerler

```json
{
  "reflex_level_31_timeLimit": 1000,
  "reflex_level_31_options": 4,
  "memory_level_31_gridSize": 16,
  "memory_level_31_showDuration": 600,
  "pattern_level_31_showDuration": 400,
  "interstitial_threshold": 3,
  "daily_leaderboard_size": 100,
  "combo_threshold": 3,
  "combo_multiplier_step": 0.1
}
```

Remote Config Fetch: Splash'ta bir kez, sonra 12 saatte bir arka planda.

---

## 19. Sentry & Analytics

### Sentry

- Tüm unhandled exception'lar otomatik
- Oyun session crash → session data da gönderilir
- `sentry.captureException(error)` kritik akışlarda

### Firebase Analytics Event'leri

```typescript
game_started     { mode, level }
game_finished    { mode, level, score, duration }
new_record       { mode, score }
leaderboard_viewed { period, mode }
premium_viewed   {}
premium_purchased {}
ad_watched       { type: 'rewarded' | 'interstitial' }
auth_triggered   { reason: 'top10' | 'manual' }
```

---

## 20. Babel & Build Yapılandırması

### babel.config.js (Reanimated için)

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin', // ← en son olmalı
    ],
  };
};
```

### Build Komutları

```bash
# iOS geliştirme
npx expo run:ios

# Android geliştirme
npx expo run:android

# Metro cache temizle
npx react-native start --reset-cache

# iOS pod güncelle
cd ios && pod install && cd ..
```

### Xcode Özel Ayarları

Podfile'a eklenmiş:
```ruby
pod 'GoogleUtilities', :modular_headers => true
pod 'FirebaseAppCheckInterop', :modular_headers => true
pod 'FirebaseAuthInterop', :modular_headers => true
pod 'FirebaseAuth', :modular_headers => true
pod 'GoogleDataTransport', :modular_headers => true
pod 'nanopb', :modular_headers => true
pod 'FirebaseFirestoreInternal', :modular_headers => true
pod 'FirebaseABTesting', :modular_headers => true
pod 'RecaptchaInterop', :modular_headers => true
pod 'leveldb-library', :modular_headers => true
```

post_install build settings:
```ruby
config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
```

---

*BrainTap Proje Dokümantasyonu — Son güncelleme: Haziran 2026*
