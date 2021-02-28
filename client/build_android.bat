@echo off
setlocal

set CI=false
set SKIP_PREFLIGHT_CHECK=true
set GENERATE_SOURCEMAP=true

npm run buildLocal & npx cap copy & cd android & gradlew assembleRelease & cd app/build/outputs/apk/release & jarsigner -keystore YOUR_KEYSTORE_PATH -storepass YOUR_KEYSTORE_PASS app-release-unsigned.apk YOUR_KEYSTORE_ALIAS & zipalign 4 app-release-unsigned.apk app-release.apk & cd ../../../../../

:END
endlocal
