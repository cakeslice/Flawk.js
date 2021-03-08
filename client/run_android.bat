@echo off
setlocal

set CI=false
set SKIP_PREFLIGHT_CHECK=true
set GENERATE_SOURCEMAP=true

npm run buildLocal & npx cap sync & cd android & gradlew assembleDebug & gradlew installDebug & cd ..

:END
endlocal
