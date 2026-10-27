# ReactBeat — Build Checklist

Bu checklist `BrainTap_ProjectDoc.md`'ye dayanır (proje adı **ReactBeat** olarak güncellendi), ancak projenin **Expo (SDK 56) + Firebase JS SDK + Sentry** stack'ine göre uyarlanmıştır. Dokümandaki eski stack (`@react-native-firebase` bare workflow, Crashlytics, native AdMob/RevenueCat) yerine geçen kararlar Faz 0'da listelenmiştir.

> Durum işaretleri: `[ ]` yapılacak · `[x]` tamamlandı · `[~]` kısmen

## Önerilen sıra (güncel)

1. [x] App icon + splash + native prebuild
2. [x] **Firebase Blaze** + `firebase deploy --only functions`
3. [x] **Firestore Console** → `config/app` seed
4. [~] `eas.json` + EAS project `@fatih_2062/reactbeat` link ✓ — secrets: `SENTRY_AUTH_TOKEN`, AdMob, RevenueCat (`.env.example`, `docs/RevenueCat_IAP_Setup.md`)
5. [ ] Simülatör smoke test (1 oyun → Result → Leaderboard → Profile) — **ertelendi**
6. [~] Faz 10 — AdMob + RevenueCat kodu ✓; Play servis hesabı + Android `goog_` ✓. Kalan: Play ürünü, ekran görüntüleri, AAB, EAS secret, iOS IAP metadata
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

- [x] `engine/levelConfig.ts` (§8): `LevelConfig` + `getLevelConfig(mode, level)` (8 mod progresyon tabloları, 31+ RC fallback)
- [x] `engine/scorer.ts`: `calculateScore` (base + hız bonusu × combo + flat combo bonus) + `calculateXP`
- [x] `engine/antiCheat.ts` — `createSession`/`addEvent`/`finalizeSession` + `validateSession` (5 kontrol) + `theoreticalMaxScore` (§13); `gameStore` createSession'ı kullanıyor
- [x] 8 mod round üreticisi (`engine/modes/`): reflex, memory, pattern, colorConflict, oddOneOut, **mathSnap**, **direction**, **mix** — saf/UI'dan bağımsız (§7)
- [x] **Math Snap** — level bandına göre 10 bulmaca türü (`add`, `subtract`, `multiply`, `missingLeft/Right`, `double`, `half`, `chainAdd`, `compare`, `oddEven`); sadece süre değil soru tipi de zorlaşıyor (`mathSnap.test.ts`)
- [x] **Pattern** — level bandına göre zihinsel döndürme (`match` → `cw90` → `ccw90` → `cw180` → karışık); distraktörler aynı desenin diğer rotasyonları (`pattern.test.ts`)
- [x] **Direction** — üstte metin prompt + altta 4 yön pedi; level bandına göre `directWord`/`directSymbol`/`opposite`/`clockwise`/`mirror*` (`direction.test.ts`)

## FAZ 6 — Oyun ekranları & bileşenleri

- [~] Game bileşenleri: `TimerBar` (CircularTimer yerine; SVG halka sonra), `LivesBar`, `ScoreDisplay`, `ComboIndicator`, `GameHud` ✓ — `TapCard`, `StreakBadge` bekliyor
- [x] Ortak `GameHud` + generic `useGameController` (timer/round/score/combo/lives/session, round-bazlı `getTimeLimit`) — **5 mod da oynanabilir**: Reflex, ColorConflict, OddOneOut (tek-tap), Pattern (reveal→seç), Memory (dizi→tekrarla)
- [~] Reanimated animasyonları: timer pulse + lives shake + combo pop ✓ — ripple/flip bekliyor (§15)
- [~] `expo-haptics` (doğru/yanlış tap) ✓ — Lottie kutlama + `expo-audio` ertelendi (asset yok)
- [~] Süre-bitti akışı (yanlış sayılır) ✓ — Can-bitti modalı (reklam +1 can) Faz 10 ile bekliyor
- [x] **Memory input kilidi** — dizi oynatılırken grid `pointerEvents="none"` ile kilitli; timer dizi + ara bitince başlar (`useMemorySequence` + `memoryTiming.ts`, `memoryTiming.test.ts`)
- [x] **Can-bitti → reklamla devam** — kaldığı level + skordan devam (level 1'e sıfırlanma bug'ı düzeltildi; `gameStore.bumpRunLevel`, run state korunuyor); **run başına 1 kez** ile sınırlı (`adContinueUsed`)

## FAZ 7 — Result / Leaderboard / Profile / Settings

- [x] `useLeaderboard` + `services/firebase/leaderboard.ts` — RTDB `leaderboard/{period}/{mode}` realtime dinleme, top-100, `myRank` + `provisionalRank` (yeni skor, CF öncesi); `databaseURL` app.config + firebase init
- [x] `LeaderboardScreen` — dönem sekmeleri + **skill grubu sekmeleri** + alt mod seçici, liste, boş durum, alt bar sıra; premium/all-time kilitleri
- [x] `ResultScreen` — rekor kutlaması (`RecordCelebration` Reanimated), haftalık sıra (RTDB), top-10 + anonim → login modal (Google/Apple)
- [x] `ModeSelectScreen` — kişisel en iyi (`userStore`) + haftalık sıra (`useLeaderboard`)
- [x] `ProfileScreen` — avatar seçici (0–9, Firestore), görünen ad düzenleme, istatistik, hesap bağlama
- [x] `SettingsScreen` — ses/haptic/bildirim/dil ✓ + gizlilik/kullanım şartları linkleri + premium/restore

## FAZ 8 — Cloud Functions (Blaze planı)

- [x] Functions iskeleti (`functions/`, TypeScript, `europe-west1`, `firebase.json` predeploy + emulators)
- [x] `validateAndSaveScore` — callable: §13 anti-cheat + sunucu skor hesabı + RTDB daily/weekly/alltime upsert + haftalık sıra dönüşü; **8 mod destekli** (mathSnap + direction eklendi)
- [x] `resetDailyLeaderboard` (CRON `0 0 * * *` UTC) / `resetWeeklyLeaderboard` (CRON `0 0 * * 1` UTC)
- [x] Client: `submitValidatedScore` — oyun bitişinde CF çağrısı (`useGameController` → Result `rank`); comboBonus oturum event'lerinden alınır
- [x] **Leaderboard yazma fix'i** — Admin SDK `databaseURL` europe-west1 RTDB'ye sabitlendi (varsayılan US URL'sine yazma sorunu düzeltildi)
- [x] **Deploy edildi:** Blaze + `firebase deploy --only functions` (3 fonksiyon, `europe-west1`) — leaderboard fix + 8 mod ile yeniden deploy edildi
- [ ] Emülatör testi (`cd functions && npm run serve`) — isteğe bağlı doğrulama

## FAZ 9 — Dinamik config

- [x] Firestore `config/app` + `remoteConfig` servisi (defaults §18, merge + in-memory cache)
- [x] `configStore` (Zustand persist `lastFetchedAt`) — Splash/auth açılışında `fetchIfStale`, 12 saat TTL
- [x] `levelConfig` + `scorer` + leaderboard max size → RC değerlerine bağlandı
- [x] Firestore Console `config/app` seed (`docs/firestore-config-app.seed.json`)

## FAZ 10 — Monetizasyon

- [x] AdMob: `react-native-google-mobile-ads` + plugin; interstitial (Result) + rewarded (ModeSelect +1 can). Release, AdMob konsolundaki gerçek app/unit id'lerini kullanır (`app.config.js`); debug (`__DEV__`) Google test unit'lerinde kalır
- [~] RevenueCat: `react-native-purchases`, entitlement `premium`, ürün `reactbeat_premium_lifetime` — iOS `appl_...` ✓; Android `goog_...` local `.env` ✓. Ürün import ve satın alma testi AAB + Play ürünü bekliyor → `docs/RevenueCat_IAP_Setup.md`
- [~] App Store Connect IAP ($1.99) — ürün var, metadata eksik. Play Console uygulaması draft; one-time product henüz yok
- [x] `PaywallScreen` + satın alma/restore (`usePremiumActions`, Firestore sync)

## FAZ 11 — Analytics

- [x] `services/analytics.ts` sarmalayıcı (dev console log; sağlayıcıya hazır)
- [ ] Seçilen sağlayıcıyla event'leri bağla (`game_started`, `game_finished`, `new_record`, ... §19)

## FAZ 12 — Test

- [x] Birim testleri: `scorer`, `levelConfig`, `antiCheat`, `mathSnap`, `pattern`, `direction`, `mix`, `memoryTiming`, `livesStore`, `progressStore`, `gameStore.lives`, `scoreSync` (Jest, 13 suite / 70 test)
- [ ] Bileşen testleri (React Native Testing Library)
- [ ] Cloud Function testleri (emülatör)
- [ ] E2E (Maestro)
- [ ] Gerçek cihaz manuel test (iOS + Android)

## FAZ 12.5 — Commit / CI kontrolleri (Fluo pattern)

- [x] **Husky** `.husky/pre-commit` → `npm run check` (her commit öncesi)
- [x] `npm run check` = `typecheck` (app `tsc --noEmit`) + `typecheck:functions` (functions build) + `lint` (ESLint)
- [x] `npm run test:ci` (`jest --ci --passWithNoTests`)
- [x] **GitHub Actions** `.github/workflows/ci.yml` — main push/PR'da test:ci + check
- [x] ESLint `functions/lib` hariç; kırık `App.test.tsx` Jest'ten exclude; `tsconfig` `noEmit`

## FAZ 13 — Release

- [x] App icon + splash (`expo-splash-screen`) — `assets/icon.png`, `splash.png`, `logo.png`; native splash + in-app loading
- [x] `eas.json` + EAS Build profilleri (`development`, `development-simulator`, `preview`, `production`) + npm script'ler
- [x] EAS project link (`extra.eas.projectId`, owner `fatih_2062`) → https://expo.dev/accounts/fatih_2062/projects/reactbeat
- [ ] Sentry source map upload'ı EAS'a bağla — `eas secret:create --name SENTRY_AUTH_TOKEN --value <token>`
- [x] Gizlilik politikası + kullanım şartları + hesap silme sayfası — GitHub Pages (`batudevelops.github.io/ReactBeat-app`); Play privacy + delete-account URL ve uygulama içi Settings linkleri oraya bakar
- [ ] App Privacy beyanı (App Store Connect)
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

#### Android — Google Play + RevenueCat
- [x] **Google Play Console** — uygulama kaydı draft (`com.batudevelops.reactbeat`). Store listing metni, ikon, feature graphic, kategori Puzzle, gizlilik/silme URL'leri ve data safety kaydı duruyor. İncelemeye gönderilmedi
- [ ] **Google Play Console** — one-time product `reactbeat_premium_lifetime` (mağazanın gösterdiği fiyat, **Activate**)
- [x] **Google Play** — servis hesabı `revenuecat-play@braintap-b0486.iam.gserviceaccount.com` yalnızca ReactBeat'e Active (süresiz). RevenueCat Play uygulaması `app77cf0299f7` + JSON yüklendi. Katalog okumaları geçiyor; abonelik doğrulaması AAB olmadığı için "paket adı bulunamadı"
- [ ] **RevenueCat** — Android ürün import + `default` offering’e Play ürünü ekle (önce Play ürünü)
- [x] `REVENUECAT_ANDROID_API_KEY` → local `.env` (`goog_...`, gitignore)
- [ ] **EAS secret** — `REVENUECAT_ANDROID_API_KEY` (bulut derlemesi local `.env` okumaz)
- [ ] **Play internal track** — en az bir AAB yükle → license tester → satın alma testi
- [ ] **Store listing** — 2–8 gerçek telefon ekran görüntüsü
- [ ] **Production erişimi** — 12 opt-in testçi × 14 gün
- [ ] **AdMob** — mağaza bağlantısı, uygulamalar yayınlanınca (şimdilik limited serving)

#### Ortak
- [x] **Firebase Console** — ReactBeat iOS + Android app (`com.batudevelops.reactbeat`), `GoogleService-Info.plist` + `google-services.json` ✓
- [x] AdMob app + ad unit ID'leri → local `.env`
- [ ] `eas secret:create` → `REVENUECAT_IOS_API_KEY` + `REVENUECAT_ANDROID_API_KEY` (`goog_` local `.env`'de hazır)

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

### Son oturum güncellemeleri (2026-07-22)
- [x] **Hibrit premium** — reklamsız + sınırsız can + all-time leaderboard + Color Conflict / Odd One Out premium; Brain Mix ücretsiz (`PREMIUM_MODES`, `isModeLocked`)
- [x] **3 yeni mod** — Math Snap, Direction, Brain Mix (`GAME_MODES` 8 mod, `SKILL_GROUPS`, `LEADERBOARD_GROUPS`)
- [x] **Ana sayfa** — Featured Brain Mix kartı + skill grupları (Hız / Hafıza / Dikkat)
- [x] **Can = 8** (`DEFAULT_LIVES=8`, `MAX_LIVES=9` reklam bonusu dahil); eski ≤5 kullanıcılar 8'e bump
- [x] **Math Snap / Pattern / Direction** — level bandına göre mekanik çeşitliliği (yukarı bkz. Faz 5)
- [x] **Memory** — dizi bitmeden tıklama engellendi + timer dizi sonrası başlar
- [x] **Can-bitti reklamla devam** — kaldığı yerden devam + run başına 1 kez sınırı
- [x] **Leaderboard yazma fix'i** — CF RTDB bölge URL'si + 8 mod → yeniden deploy
- [x] **Husky pre-commit + GitHub CI** — typecheck (app + functions) + lint + test:ci

### Code review düzeltmeleri (2026-10-27)
- [x] **Billing/hesap** — doğru hesap `batu.develops@gmail.com`'a geçildi; `ReactBeat Billing` oluşturulup `braintap-b0486`'ya bağlandı → Blaze aktif; functions deploy çalışıyor
- [x] **Kritik #1 — Skor formülü birliği** — sunucu `combo_multiplier_step`'i `config/app`'ten okuyor (`functions/src/config.ts`, 5 dk cache); `scorer.ts` / `antiCheat.ts` / `validateAndSaveScore.ts` tek kaynağı kullanıyor (sabit `0.1` kaldırıldı) → deploy edildi
- [x] **Kritik #2 — Reklam akışı** — `admob.ts` rewarded/interstitial yüklü değilse LOADED event'ini bekliyor (rewarded 8sn / interstitial 3sn timeout); artık sessizce no-op değil
- [x] **Yüksek — Premium sunucu-otoriteli** — client Firestore'a `isPremium` yazmıyor; RevenueCat webhook (`functions/src/revenueCatWebhook.ts`, Admin SDK) tek kaynak; Firestore kuralları `isPremium` değişimini engelliyor
- [x] **Yüksek — Firestore kuralları** — `users/{uid}` artık yalnızca sahibi okur/yazar; `isPremium` create'te `false` zorunlu, update'te değiştirilemez
- [x] **Yüksek — weeklyRank + rate limit** — rank artık `.indexOn: score` ile yalnızca top 100'ü okuyor (tüm board değil); skor gönderimine 60sn/30 istek sınırı (`functions/src/rateLimit.ts`, `rateLimits/*` RTDB)
- [x] **RevenueCat webhook kurulumu** — URL `https://europe-west1-braintap-b0486.cloudfunctions.net/revenueCatWebhook`; `Authorization` secret'i düzeltilip (newline bug) yeniden deploy; RC Dashboard'da webhook bağlandı; 401/200 uçtan uca doğrulandı

### Code review düzeltmeleri — Orta öncelik (2026-10-27)
- [x] **i18n tam** — EN'de olup diğer 10 dilde eksik olan 70 anahtar gerçek çevirilerle dolduruldu (es/de/fr/pt/it/ru/ja/ko/ar/zh); artık İngilizce fallback yok
- [x] **Geri navigasyonda skor kaybı** — `GameScreen` artık header/jest/donanım geri tuşunu yakalıyor; aktif runda skor varsa onay sorup `finalizeRun` ile skoru kaydedip Result'a gidiyor (12 dilde `game.quit*` anahtarları)
- [x] **finalizeRun ortak helper** — skor gönderimi + stat/XP/best mantığı `useGameController`'dan çıkarıldı; hem doğal bitiş hem geri-çıkış kullanıyor (controller 468→408 satır)
- [x] **CellGrid ortak bileşeni** — Memory ve Pattern ızgara render tekrarı tek bileşende birleştirildi
- [ ] **useGameController timer döngüsü** — derin bölme çalışma zamanı testi gerektirdiğinden (regresyon riski) ertelendi; isteğe bağlı sonraki iş

### Play kurulumu sonrası hâlâ yapılmayanlar (2026-10-27)
- [ ] Play one-time product `reactbeat_premium_lifetime` + RevenueCat ürün import / offering
- [ ] 2–8 gerçek telefon ekran görüntüsü (feature graphic yüklendi)
- [ ] Internal track AAB, sonra license tester ile satın alma
- [ ] Production erişimi: 12 opt-in testçi × 14 gün
- [ ] AdMob uygulamalarını mağazaya bağla (yayından sonra)
- [ ] EAS secret: `REVENUECAT_ANDROID_API_KEY` (ve iOS / AdMob / Sentry)
- [ ] Apple Developer Program lisans sözleşmesi (kullanıcı onayı bekliyor)
- [ ] iOS IAP Missing Metadata + App Privacy beyanı

### Önerilen sıradaki adımlar
1. [ ] **Play one-time product** — `reactbeat_premium_lifetime`, sonra RevenueCat import
2. [ ] **Play internal track** — AAB yükle + license tester ile IAP test
3. [ ] **Store listing** — gerçek telefon ekran görüntüleri
4. [ ] **iOS sandbox IAP** — ASC IAP metadata + lisans sözleşmesi bitince cihazda Buy/Restore
5. [ ] **Smoke test** — madde 5 (Android cihazda devam)
6. [ ] **EAS secrets + preview build** — madde 4 + 9

*Son güncelleme: 2026-10-27 (Play servis hesabı + RevenueCat Android `goog_` bağlandı; AdMob gerçek id'ler; gizlilik/şartlar/silme GitHub Pages. Kalan: Play ürünü, ekran görüntüleri, AAB, testçiler, EAS secret, Apple lisans + iOS IAP metadata)*

---

*Kaynak: `BrainTap_ProjectDoc.md` (içerik ReactBeat) · Uyarlama: Expo SDK 56 + Firebase JS SDK + Sentry*
