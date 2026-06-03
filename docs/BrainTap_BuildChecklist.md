# ReactBeat — Build Checklist

Bu checklist `BrainTap_ProjectDoc.md`'ye dayanır (proje adı **ReactBeat** olarak güncellendi), ancak projenin **Expo (SDK 56) + Firebase JS SDK + Sentry** stack'ine göre uyarlanmıştır. Dokümandaki eski stack (`@react-native-firebase` bare workflow, Crashlytics, native AdMob/RevenueCat) yerine geçen kararlar Faz 0'da listelenmiştir.

> Durum işaretleri: `[ ]` yapılacak · `[x]` tamamlandı · `[~]` kısmen

## Önerilen sıra (güncel)

1. [x] App icon + splash + native prebuild
2. [x] **Firebase Blaze** + `firebase deploy --only functions`
3. [x] **Firestore Console** → `config/app` seed
4. [~] `eas.json` + EAS project `@fatih_2062/reactbeat` link ✓ — secrets: `SENTRY_AUTH_TOKEN`, AdMob, RevenueCat (`.env.example`, `docs/RevenueCat_IAP_Setup.md`)
5. [ ] Simülatör smoke test (1 oyun → Result → Leaderboard → Profile) — **ertelendi**
6. [~] Faz 10 — AdMob + store IAP + RevenueCat (kod ✓; **HARİCİ sıra:** ASC/Play uygulama + IAP → RevenueCat → API key)
7. [~] Faz 12 — Jest birim testleri (`scorer`, `antiCheat`, `levelConfig`) ✓
8. [~] Faz 11 — Analytics sarmalayıcı (`services/analytics.ts` no-op) ✓; sağlayıcı bağlantısı bekliyor
9. [ ] EAS preview build → TestFlight + Play internal (`npm run build:preview`)

---

## FAZ 0 — Stack uyumlama kararları (kesinleşti)

- [x] **Crashlytics → Sentry** (org `batu-e1` / project `braintap`, EU region) — tamam
- [x] **Firebase: JS SDK** (`firebase`) — `@react-native-firebase` kullanılmıyor
- [ ] **Analytics** → ince `services/analytics.ts` sarmalayıcı (şimdilik no-op/console); sağlayıcı (PostHog) sonra bağlanır ✓ sarmalayıcı
- [ ] **Remote Config** → Firestore tabanlı `config/levels` dokümanı + dinleyici
- [ ] **Ses** → `expo-audio` (`react-native-sound` değil)
- [ ] **Haptic** → `expo-haptics`
- [ ] **Gradient** → `expo-linear-gradient`
- [ ] **Navigation** → React Navigation v6 (`native-stack` + `bottom-tabs`)
- [ ] **AdMob / RevenueCat / Google Sign-In / Apple Auth** → Expo config plugin'leri ile (native kod prebuild'de üretilir)

---

## FAZ 1 — Proje temeli & dev ortamı

- [x] Core kütüphaneler: `react-native-reanimated`, `react-native-gesture-handler`, `react-native-screens`, `lottie-react-native`, `zustand`, `expo-linear-gradient`, `expo-haptics`, `expo-audio`
- [x] `babel-preset-expo` reanimated plugin'ini içeriyor mu doğrula (gerekirse `react-native-reanimated/plugin` ekle) + prebuild
- [x] `src/` klasör iskeleti (ProjectDoc §3)
- [x] Tema: `theme/colors.ts`, `typography.ts`, `spacing.ts`, `index.ts` (§4)
- [x] Tipler: `GameMode`, `RootStackParamList` (§5)
- [x] UI bileşenleri: `Button`, `Card`, `Badge`, `Modal`, `ProgressBar`, `Avatar` (§16)
- [x] Shared: `SafeLayout`, `Header`, `Loader`

## FAZ 2 — Navigation & ekran iskeletleri

- [x] `@react-navigation/native` + `native-stack` + `bottom-tabs` kurulumu (provider, gesture-handler import)
- [x] `RootNavigator` (auth gate), `GameNavigator`
- [x] Tüm ekran stub'ları: Splash, Home, ModeSelect, 5×Game, Result, Leaderboard, Profile, Settings, Paywall

## FAZ 3 — Firebase backend & Auth

- [x] Firebase Console (`braintap-b0486`): Auth (Anonymous + Google + Apple) açıldı, Firestore (`eur`/europe-west1) + Realtime DB (europe-west1) oluşturuldu — anonim giriş doğrulandı ✓
- [x] Güvenlik kuralları yazıldı + **deploy edildi**: `firestore.rules` (`users/{uid}`) + `database.rules.json` (`leaderboard` read-only) + `firebase.json` + `.firebaserc` (§10)
- [~] Google Sign-In: kod tam (`linkWithGoogle`), config plugin `GOOGLE_IOS_URL_SCHEME` env ile koşullu — **HARİCİ (sen, Faz 10 öncesi): OAuth Web + iOS client ID**
- [x] Apple Sign-In: `expo-apple-authentication` + `usesAppleSignIn` entitlement + nonce'lı `linkWithApple` (§11) — _Apple Developer "Sign in with Apple" capability prod'da gerekli_
- [x] `services/firebase/auth.ts`: anonim giriş + Google/Apple link (merge, `credential-already-in-use` fallback) (§11)
- [x] `services/firebase/firestore.ts`: `users/{uid}` ensure/CRUD + `UserDoc` tipi
- [x] `useAuth` hook (AuthProvider) + Splash lazy auth akışı (anon hata → degraded, app yine açılır)

## FAZ 4 — State management

- [x] `gameStore` (geçici oyun durumu + tapCorrect/tapWrong/pause/resume/end/reset, anti-cheat session) (§9, §13)
- [x] `userStore` (Zustand + AsyncStorage persist; setUser/updateBestScore/setPremium/streak) — `useAuth` Firestore doc'undan hydrate
- [x] `settingsStore` (Zustand + AsyncStorage persist; ses/haptic/bildirim)
- [x] Home/Profile/Settings ekranları store'lara bağlandı (placeholder kaldırıldı), simülatörde doğrulandı ✓

## FAZ 5 — Oyun motoru

- [x] `engine/levelConfig.ts` (§8): `LevelConfig` + `getLevelConfig(mode, level)` (5 mod progresyon tabloları, 31+ RC fallback)
- [x] `engine/scorer.ts`: `calculateScore` (base + hız bonusu × combo + flat combo bonus) + `calculateXP`
- [x] `engine/antiCheat.ts` — `createSession`/`addEvent`/`finalizeSession` + `validateSession` (5 kontrol) + `theoreticalMaxScore` (§13); `gameStore` createSession'ı kullanıyor
- [x] 5 mod round üreticisi (`engine/modes/`): reflex, memory, pattern, colorConflict, oddOneOut — saf/UI'dan bağımsız (§7)

## FAZ 6 — Oyun ekranları & bileşenleri

- [~] Game bileşenleri: `TimerBar` (CircularTimer yerine; SVG halka sonra), `LivesBar`, `ScoreDisplay`, `ComboIndicator`, `GameHud` ✓ — `TapCard`, `StreakBadge` bekliyor
- [x] Ortak `GameHud` + generic `useGameController` (timer/round/score/combo/lives/session, round-bazlı `getTimeLimit`) — **5 mod da oynanabilir**: Reflex, ColorConflict, OddOneOut (tek-tap), Pattern (reveal→seç), Memory (dizi→tekrarla)
- [~] Reanimated animasyonları: timer pulse + lives shake + combo pop ✓ — ripple/flip bekliyor (§15)
- [~] `expo-haptics` (doğru/yanlış tap) ✓ — Lottie kutlama + `expo-audio` ertelendi (asset yok)
- [~] Süre-bitti akışı (yanlış sayılır) ✓ — Can-bitti modalı (reklam +1 can) Faz 10 ile bekliyor

## FAZ 7 — Result / Leaderboard / Profile / Settings

- [x] `useLeaderboard` + `services/firebase/leaderboard.ts` — RTDB `leaderboard/{period}/{mode}` realtime dinleme, top-100, `myRank` + `provisionalRank` (yeni skor, CF öncesi); `databaseURL` app.config + firebase init
- [x] `LeaderboardScreen` — 3 dönem × 5 mod tab/chip, liste, boş durum, alt bar sıra
- [x] `ResultScreen` — rekor kutlaması (`RecordCelebration` Reanimated), haftalık sıra (RTDB), top-10 + anonim → login modal (Google/Apple)
- [x] `ModeSelectScreen` — kişisel en iyi (`userStore`) + haftalık sıra (`useLeaderboard`)
- [x] `ProfileScreen` — avatar seçici (0–9, Firestore), görünen ad düzenleme, istatistik, hesap bağlama
- [x] `SettingsScreen` — ses/haptic/bildirim/dil ✓ + gizlilik/kullanım şartları linkleri + premium/restore

## FAZ 8 — Cloud Functions (Blaze planı)

- [x] Functions iskeleti (`functions/`, TypeScript, `europe-west1`, `firebase.json` predeploy + emulators)
- [x] `validateAndSaveScore` — callable: §13 anti-cheat + sunucu skor hesabı + RTDB daily/weekly/alltime upsert + haftalık sıra dönüşü
- [x] `resetDailyLeaderboard` (CRON `0 0 * * *` UTC) / `resetWeeklyLeaderboard` (CRON `0 0 * * 1` UTC)
- [x] Client: `submitValidatedScore` — oyun bitişinde CF çağrısı (`useGameController` → Result `rank`)
- [x] **Deploy edildi:** Blaze + `firebase deploy --only functions` (3 fonksiyon, `europe-west1`)
- [ ] Emülatör testi (`cd functions && npm run serve`) — isteğe bağlı doğrulama

## FAZ 9 — Dinamik config

- [x] Firestore `config/app` + `remoteConfig` servisi (defaults §18, merge + in-memory cache)
- [x] `configStore` (Zustand persist `lastFetchedAt`) — Splash/auth açılışında `fetchIfStale`, 12 saat TTL
- [x] `levelConfig` + `scorer` + leaderboard max size → RC değerlerine bağlandı
- [x] Firestore Console `config/app` seed (`docs/firestore-config-app.seed.json`)

## FAZ 10 — Monetizasyon

- [~] AdMob: `react-native-google-mobile-ads` + plugin (test app id'leri); interstitial (Result, her N oyun) + rewarded (ModeSelect +1 can) — **HARİCİ:** prod ad unit ID env'leri
- [~] RevenueCat: `react-native-purchases`, entitlement `premium`, ürün `reactbeat_premium_lifetime` — iOS `appl_...` ✓; Android `goog_...` bekliyor → `docs/RevenueCat_IAP_Setup.md`
- [~] App Store Connect IAP ($1.99) — ürün var, metadata eksik; **Play Console IAP + RC Android** sıradaki
- [x] `PaywallScreen` + satın alma/restore (`usePremiumActions`, Firestore sync)

## FAZ 11 — Analytics

- [x] `services/analytics.ts` sarmalayıcı (dev console log; sağlayıcıya hazır)
- [ ] Seçilen sağlayıcıyla event'leri bağla (`game_started`, `game_finished`, `new_record`, ... §19)

## FAZ 12 — Test

- [x] Birim testleri: `scorer`, `levelConfig`, `antiCheat` (Jest)
- [ ] Bileşen testleri (React Native Testing Library)
- [ ] Cloud Function testleri (emülatör)
- [ ] E2E (Maestro)
- [ ] Gerçek cihaz manuel test (iOS + Android)

## FAZ 13 — Release

- [x] App icon + splash (`expo-splash-screen`) — `assets/icon.png`, `splash.png`, `logo.png`; native splash + in-app loading
- [x] `eas.json` + EAS Build profilleri (`development`, `development-simulator`, `preview`, `production`) + npm script'ler
- [x] EAS project link (`extra.eas.projectId`, owner `fatih_2062`) → https://expo.dev/accounts/fatih_2062/projects/reactbeat
- [ ] Sentry source map upload'ı EAS'a bağla — `eas secret:create --name SENTRY_AUTH_TOKEN --value <token>`
- [ ] Gizlilik politikası + kullanım şartları + App Privacy beyanı
- [ ] TestFlight + Play internal testing

## Ekstra altyapı

- [x] **i18n** (Fluo gibi): `i18next` + `react-i18next`, `src/i18n/` + 12 dil (`tr`, `en`, `es`, `de`, `fr`, `pt`, `it`, `ru`, `ja`, `ko`, `ar`, `zh`); tüm ekran metinleri; cihaz dili otomatik algılama, `settingsStore.language` (persist) + Settings’te sarmalanmış dil seçici.

---

## Release yol haritası — detaylı takip

> Üstteki **Önerilen sıra (1–9)** maddelerinin alt görevleri. Agent veya sen bitirince `[x]` / `[~]` güncellenir.

### 1. App icon + splash + native prebuild
- [x] `assets/icon.png`, `splash.png`, `logo.png`
- [x] `expo-splash-screen` + in-app splash
- [x] Full-bleed native splash (Fluo pattern: `cover`, Android `splashscreen.xml`, iOS storyboard edge-to-edge)
- [x] `npm run sync:native-splash` — asset değişince native splash yeniden uygula (prebuild sonrası da)
- [x] `npx expo prebuild` (iOS + Android native)

### 2. Firebase Blaze + Cloud Functions
- [x] Blaze planı aktif
- [x] `firebase deploy --only functions` (3 fonksiyon, `europe-west1`)
- [x] `validateAndSaveScore` + günlük/haftalık reset CRON'ları live

### 3. Firestore `config/app` seed
- [x] Console'da `config/app` dokümanı
- [x] `docs/firestore-config-app.seed.json` ile eşleşiyor

### 4. EAS + build secrets
- [x] `eas.json` profilleri (`development`, `preview`, `production`)
- [x] EAS proje linki (`@fatih_2062/reactbeat`, `extra.eas.projectId`)
- [x] `.env.example` + local `.env` şablonu
- [ ] `eas secret:create` → `SENTRY_AUTH_TOKEN`
- [ ] `eas secret:create` → `ADMOB_*` (6 ad unit / app id)
- [ ] `eas secret:create` → `REVENUECAT_IOS_API_KEY` + `REVENUECAT_ANDROID_API_KEY`
- [ ] Sentry source map upload EAS build'de doğrulandı

### 5. Smoke test (simülatör veya gerçek cihaz)
- [ ] Ana ekran → mod seç → 1 oyun oyna (Reflex yeterli)
- [ ] Süre dolunca / yanlış cevapta can azalıyor
- [ ] Result ekranı: skor, doğru/yanlış, haftalık sıra
- [ ] Leaderboard listesi yükleniyor
- [ ] Profile: istatistikler görünüyor
- [ ] ModeSelect: rewarded ad → +1 can (sonraki oyunda 4 kalp)
- [ ] Settings: dil değiştirme çalışıyor

### 6. Faz 10 — Monetizasyon
**Kod (tamam):**
- [x] AdMob interstitial (Result) + rewarded (ModeSelect +1 can)
- [x] RevenueCat `purchasePremium` / `restorePurchases` / entitlement sync
- [x] Paywall + Settings restore
- [x] Can/reklam bug fix (bonus can azalır; premium sınırsız)

**Harici / panel (sırayla):**

#### iOS — App Store Connect + RevenueCat (kısmen)
- [x] **App Store Connect** — uygulama kaydı (`com.batudevelops.reactbeat`)
- [~] **App Store Connect** — Non-Consumable IAP `reactbeat_premium_lifetime` ($1.99) — ürün oluştu; **Missing Metadata** (fiyat, localization, review info, Paid Apps Agreement)
- [x] **RevenueCat** — proje ReactBeat, ASC API key, entitlement `premium`, offering `default` → Lifetime → iOS ürün
- [x] `REVENUECAT_IOS_API_KEY` → local `.env` (`appl_...`)
- [ ] **iOS sandbox IAP testi** — ASC metadata bitince → `npx expo run:ios --device` → sandbox Apple ID → Paywall Buy/Restore → RC Customers + Firestore `isPremium` *(ertelendi; smoke test sonrası)*

#### Android — Google Play + RevenueCat *(sıradaki)*
- [ ] **Google Play Console** — uygulama kaydı (`com.batudevelops.reactbeat`)
- [ ] **Google Play Console** — one-time product `reactbeat_premium_lifetime` ($1.99, **Activate**)
- [ ] **Google Play** — Play Console service account → RevenueCat Android app bağlantısı
- [ ] **RevenueCat** — Android ürün import + `default` offering’e Play ürünü ekle
- [ ] `REVENUECAT_ANDROID_API_KEY` → `.env` (`goog_...`; şimdilik `test_...`)
- [ ] **Play internal track** — en az bir AAB/APK yükle → license tester → satın alma testi

#### Ortak
- [x] **Firebase Console** — ReactBeat iOS + Android app (`com.batudevelops.reactbeat`), `GoogleService-Info.plist` + `google-services.json` ✓
- [x] AdMob app + ad unit ID'leri → local `.env`
- [ ] `eas secret:create` → `REVENUECAT_IOS_API_KEY` (+ Android `goog_` hazır olunca)

### 7. Faz 12 — Jest birim testleri
- [x] `engine/scorer`
- [x] `engine/levelConfig`
- [x] `engine/antiCheat`
- [ ] Bileşen testleri (RTL) — release sonrası
- [ ] CF emülatör testi — isteğe bağlı
- [ ] E2E (Maestro) — isteğe bağlı

### 8. Faz 11 — Analytics
- [x] `services/analytics.ts` sarmalayıcı (dev console)
- [ ] Sağlayıcı seçimi (PostHog vb.)
- [ ] Event'ler: `game_started`, `game_finished`, `new_record`, `purchase_*`

### 9. EAS preview → TestFlight + Play internal
- [ ] EAS secrets tamam (madde 4)
- [ ] `npm run build:preview` (iOS + Android)
- [ ] TestFlight internal testers
- [ ] Play Console internal testing track
- [ ] Gerçek cihazda prod build smoke test

---

### Plan dışı tamamlananlar (ekstra)
- [x] Marka rename: BrainTap → **ReactBeat** (`com.batudevelops.reactbeat`, `reactbeat_premium_lifetime`)
- [x] 12 dil i18n (`tr`, `en`, `es`, `de`, `fr`, `pt`, `it`, `ru`, `ja`, `ko`, `ar`, `zh`)
- [x] Paywall mağaza fiyatını RevenueCat'ten çeker (fallback `$1.99`)
- [x] `docs/RevenueCat_IAP_Setup.md` rehberi

### Önerilen sıradaki adımlar
1. [ ] **Google Play Console** — ReactBeat uygulaması + `reactbeat_premium_lifetime` IAP (madde 6, Android)
2. [ ] **RevenueCat Android** — Play service account, ürün import, `goog_...` → `.env`
3. [ ] **Play internal track** — AAB yükle + license tester ile IAP test
4. [ ] **iOS sandbox IAP** — ASC IAP metadata bitince cihazda Buy/Restore (ertelendi)
5. [ ] **Smoke test** — madde 5 (Android cihazda devam)
6. [ ] **EAS secrets + preview build** — madde 4 + 9

*Son güncelleme: 2026-06-02 (iOS RC key `.env`; Android Play sıradaki)*

---

*Kaynak: `BrainTap_ProjectDoc.md` (içerik ReactBeat) · Uyarlama: Expo SDK 56 + Firebase JS SDK + Sentry*
