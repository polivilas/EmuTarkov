# EmuTarkov
Escape From Tarkov backend emulator written in JS.

## Note
This works offline only. This doesn't work online or private LAN. Some functionality is not implemented. This is in active development and does contain bugs and/or errors.

## Usage
### Emulator setup
```note: emudir is a reference to the emulator root directory```
1. download [nodejs]( https://nodejs.org/en/) and install it to PATH.
2. download the emulator source.
3. run ```install.bat``` located in ```emudir```.
### Game setup
```note: the emulator supports only game version 0.11.7.3287```<br/>
```note: gamedir is a reference to the game root directory```
1. obtain a copy of the game.
2. open ```client.config.json``` located in ```gamedir```.
3. change ```"BackendUrl": "https://prod.escapefromtarkov.com",``` to ```"BackendUrl": "http://localhost:1337",```
### Playing the game
1. execute ```run.bat``` located in ```emudir```
2. execute ```EscapeFromTarkov.exe``` located in ```gamedir```
### Starting an offline raid
1. press ESCAPE FROM TARKOV
2. select the PMC
3. select your location and press next
4. check the map and press next
5. check enable OFFLINE mode for this raid
6. configure the raid to your liking
7. press next or ready

## Issues
All bugs/errors/issues:<br/>
https://github.com/polivilas/EmuTarkov/issues<br/>
Please include your logs located in ```gamedir/logs``` as well.

## Contributions
All bugfixes/contributions/pull requests:<br/>
https://github.com/polivilas/EmuTarkov

## License
CC BY-NC-SA 3.0<br/>
https://creativecommons.org/licenses/by-nc-sa/3.0/
