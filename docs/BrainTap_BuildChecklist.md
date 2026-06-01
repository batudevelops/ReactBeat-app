# BrainTap — Build Checklist

Bu checklist `BrainTap_ProjectDoc.md`'ye dayanır, ancak projenin **Expo (SDK 56) + Firebase JS SDK + Sentry** stack'ine göre uyarlanmıştır. Dokümandaki eski stack (`@react-native-firebase` bare workflow, Crashlytics, native AdMob/RevenueCat) yerine geçen kararlar Faz 0'da listelenmiştir.

> Durum işaretleri: `[ ]` yapılacak · `[x]` tamamlandı · `[~]` kısmen

---

## FAZ 0 — Stack uyumlama kararları (kesinleşti)

- [x] **Crashlytics → Sentry** (org `batu-e1` / project `braintap`, EU region) — tamam
- [x] **Firebase: JS SDK** (`firebase`) — `@react-native-firebase` kullanılmıyor
- [ ] **Analytics** → ince `services/analytics.ts` sarmalayıcı (şimdilik no-op/console); sağlayıcı (PostHog) sonra bağlanır
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
- [ ] **HARİCİ (sen):** Firebase **Blaze** planı + `firebase deploy --only functions` (bkz. `functions/README.md`)
- [ ] Emülatör testi (`cd functions && npm run serve`) — isteğe bağlı doğrulama

## FAZ 9 — Dinamik config

- [ ] Firestore tabanlı `config` dokümanı + 12 saatlik fetch (§18 default değerleri)

## FAZ 10 — Monetizasyon

- [ ] AdMob: `react-native-google-mobile-ads` + plugin, app ID'ler, rewarded (+can) & interstitial (her 3 oyun) (§14)
- [ ] RevenueCat: `react-native-purchases`, entitlement `premium`, ürün `braintap_premium_lifetime`
- [ ] App Store Connect + Play Console IAP ($1.99 lifetime)
- [ ] `PaywallScreen` + satın alma/restore

## FAZ 11 — Analytics

- [ ] Seçilen sağlayıcıyla event'leri bağla (`game_started`, `game_finished`, `new_record`, ... §19)

## FAZ 12 — Test

- [ ] Birim testleri: `scorer`, `levelConfig`, `antiCheat`, store'lar (Jest)
- [ ] Bileşen testleri (React Native Testing Library)
- [ ] Cloud Function testleri (emülatör)
- [ ] E2E (Maestro)
- [ ] Gerçek cihaz manuel test (iOS + Android)

## FAZ 13 — Release

- [ ] App icon + splash (`expo-splash-screen`)
- [ ] `eas.json` + EAS Build profilleri (dev/preview/production)
- [ ] Sentry source map upload'ı EAS'a bağla (`SENTRY_AUTH_TOKEN` secret)
- [ ] Gizlilik politikası + kullanım şartları + App Privacy beyanı
- [ ] TestFlight + Play internal testing

## Ekstra altyapı

- [x] **i18n** (Fluo gibi): `i18next` + `react-i18next`, `src/i18n/` + `tr.json`/`en.json`; tüm ekran metinleri taşındı; cihaz dili otomatik algılama (core RN bridge, native modül yok), `settingsStore.language` (persist) + Settings'te dil seçici. Not: tam doğru çoğul kuralları için ileride `Intl.PluralRules` polyfill eklenebilir.

---

*Kaynak: `BrainTap_ProjectDoc.md` · Uyarlama: Expo SDK 56 + Firebase JS SDK + Sentry*
