@echo off
setlocal

set CI=false
set SKIP_PREFLIGHT_CHECK=true
set GENERATE_SOURCEMAP=true

REM Don't forget to add the remote registry in CapRover (disable push)
set img=rg.fr-par.scw.cloud/cakeslice/flawk-staging:latest

npm run buildLocal & docker image build -t %img% . -f Dockerfile.local & docker push %img% & docker image rm %img%

:END
endlocal
