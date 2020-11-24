@echo off
setlocal

cd ..
cd client

set CI=false
set SKIP_PREFLIGHT_CHECK=true
set GENERATE_SOURCEMAP=true

npm run buildCordova & cd .. & cd cordova & cordova run android

:END
endlocal
