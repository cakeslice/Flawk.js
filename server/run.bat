@echo off
setlocal

set NODE_PATH=app/

nodemon --exec "npm run lint && node --inspect=1237 --optimize_for_size --max_old_space_size=1024 --expose-gc app/server.js" --signal SIGTERM

:END
endlocal
