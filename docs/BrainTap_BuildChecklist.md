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

- [ ] `levelConfig.ts` (§8), `scorer.ts` (skor formülü)
- [ ] `antiCheat.ts` — session + TapEvent (§13)
- [ ] 5 mod motoru: reflex, memory, pattern, colorConflict, oddOneOut (§7)

## FAZ 6 — Oyun ekranları & bileşenleri

- [ ] Game bileşenleri: `CircularTimer`, `LivesBar`, `ScoreDisplay`, `ComboIndicator`, `TapCard`, `StreakBadge`
- [ ] Ortak Game Layout + 5 oyun ekranı
- [ ] Reanimated animasyonları (ripple, shake, combo pop, timer pulse, flip) (§15)
- [ ] Lottie kutlamalar + `expo-haptics` + `expo-audio`
- [ ] Can-bitti / süre-bitti akışları

## FAZ 7 — Result / Leaderboard / Profile / Settings

- [ ] `ResultScreen` (rekor → konfeti, top10 → login tetikle)
- [ ] `useLeaderboard` + RTDB top-100 dinleme (3 dönem × 5 mod)
- [ ] `ProfileScreen` (avatar, istatistik, hesap bağlama)
- [ ] `SettingsScreen` (ses/haptic/bildirim, gizlilik, restore)

## FAZ 8 — Cloud Functions (Blaze planı)

- [ ] Functions kurulumu (`europe-west1`), Blaze planı
- [ ] `validateAndSaveScore` (anti-cheat 5 kontrol → RTDB) (§13, §17)
- [ ] `resetDailyLeaderboard` / `resetWeeklyLeaderboard` (CRON)
- [ ] Emülatör testi

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

---

*Kaynak: `BrainTap_ProjectDoc.md` · Uyarlama: Expo SDK 56 + Firebase JS SDK + Sentry*
