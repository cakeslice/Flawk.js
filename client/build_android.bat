@echo off
setlocal

set CI=false
set SKIP_PREFLIGHT_CHECK=true
set GENERATE_SOURCEMAP=true

npm run buildLocal & npx cap sync & cd android & gradlew bundleRelease & cd app/build/outputs/apk/release & jarsigner -keystore ./../../../../../../.keystore -storepass YOUR_KEYSTORE_PASS app-release.aab YOUR_KEYSTORE_ALIAS & cd ../../../../../../

REM keytool -genkey -v -keystore .keystore -alias YOUR_KEYSTORE_ALIAS -keyalg RSA -keysize 2048 -validity 10000

:END
endlocal
