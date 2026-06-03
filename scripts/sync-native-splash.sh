#!/usr/bin/env bash
# Re-apply Fluo-style full-bleed native splash after changing assets/splash.png.
# Safe to run after `expo prebuild` (which resets Android Theme.SplashScreen / small icon).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SPLASH="$ROOT/assets/splash.png"
ANDROID_RES="$ROOT/android/app/src/main/res"
IOS_IMGSET="$ROOT/ios/ReactBeat/Images.xcassets/SplashScreenLogo.imageset"

if [[ ! -f "$SPLASH" ]]; then
  echo "Missing $SPLASH" >&2
  exit 1
fi

mkdir -p "$ANDROID_RES/drawable-nodpi"

cp "$SPLASH" "$ANDROID_RES/drawable-nodpi/splashscreen_image.png"

cat > "$ANDROID_RES/drawable/splashscreen.xml" <<'EOF'
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/splashscreen_background"/>
    <item>
        <bitmap
            android:src="@drawable/splashscreen_image"
            android:gravity="fill"/>
    </item>
</layer-list>
EOF

cat > "$ANDROID_RES/values/styles.xml" <<'EOF'
<resources xmlns:tools="http://schemas.android.com/tools">
  <style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar">
    <item name="android:editTextBackground">@drawable/rn_edit_text_material</item>
    <item name="colorPrimary">@color/colorPrimary</item>
    <item name="android:statusBarColor">@color/splashscreen_background</item>
    <item name="android:navigationBarColor">@color/splashscreen_background</item>
    <item name="android:windowOptOutEdgeToEdgeEnforcement" tools:targetApi="35">true</item>
  </style>
  <!-- Full-bleed splash (cover). Android 12 Theme.SplashScreen uses a small centered icon by default. -->
  <style name="Theme.App.SplashScreen" parent="Theme.AppCompat.DayNight.NoActionBar">
    <item name="android:windowBackground">@drawable/splashscreen</item>
    <item name="android:editTextBackground">@drawable/rn_edit_text_material</item>
    <item name="colorPrimary">@color/colorPrimary</item>
    <item name="android:statusBarColor">@color/splashscreen_background</item>
    <item name="android:navigationBarColor">@color/splashscreen_background</item>
    <item name="android:windowOptOutEdgeToEdgeEnforcement" tools:targetApi="35">true</item>
    <item name="postSplashScreenTheme">@style/AppTheme</item>
  </style>
</resources>
EOF

# Native drawable splash (pairs with Theme.App.SplashScreen windowBackground above).
if grep -q 'expo_splash_screen_resize_mode' "$ANDROID_RES/values/strings.xml"; then
  sed -i '' 's|<string name="expo_splash_screen_resize_mode"[^>]*>[^<]*</string>|<string name="expo_splash_screen_resize_mode" translatable="false">native</string>|' "$ANDROID_RES/values/strings.xml"
else
  perl -i -pe 's|(<string name="app_name">[^<]+</string>)|$1\n  <string name="expo_splash_screen_resize_mode" translatable="false">native</string>|' "$ANDROID_RES/values/strings.xml"
fi

# iOS launch images — phone portrait @1x/@2x/@3x (sips: -z height width).
sips -z 926 428 "$SPLASH" --out "$IOS_IMGSET/image.png" >/dev/null
sips -z 1852 856 "$SPLASH" --out "$IOS_IMGSET/image@2x.png" >/dev/null
sips -z 2778 1284 "$SPLASH" --out "$IOS_IMGSET/image@3x.png" >/dev/null
cp "$IOS_IMGSET/image.png" "$IOS_IMGSET/dark_image.png"
cp "$IOS_IMGSET/image@2x.png" "$IOS_IMGSET/dark_image@2x.png"
cp "$IOS_IMGSET/image@3x.png" "$IOS_IMGSET/dark_image@3x.png"

echo "Native splash synced from assets/splash.png"
