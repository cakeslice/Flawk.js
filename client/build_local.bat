@echo off
setlocal

set CI=false
set SKIP_PREFLIGHT_CHECK=true
set GENERATE_SOURCEMAP=true

npm run buildLocal

:END
endlocal
