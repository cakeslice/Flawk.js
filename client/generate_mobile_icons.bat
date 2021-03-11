@echo off
setlocal

cordova-res ios --skip-config --copy & cordova-res android --skip-config --copy
REM Copy all icons in android/app/src/main/res/mipmap* to replace ic_launcher_foreground.png

:END
endlocal
