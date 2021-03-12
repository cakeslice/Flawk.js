@echo off
setlocal

cordova-res ios --skip-config --copy & cordova-res android --skip-config --copy

:END
endlocal
