@echo off
TITLE Installing packages

REM install nexe
npm install nexe

REM delete package-lock.json
del /s /q package-lock.json