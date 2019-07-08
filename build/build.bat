@echo off
TITLE Building EmuTarkov server

REM wipe out folder
rd /s /q out
mkdir out

REM build the app
node src\build.js --clean

REM copy the data folder
xcopy ..\project\data out\data /e /i /h /Y