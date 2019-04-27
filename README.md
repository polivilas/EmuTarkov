# EmuTarkov
Escape From Tarkov backend emulator written in JS.

# How to use?
First you need to install Node.JS on your computer : https://nodejs.org/en/ 

Once Node.js installed, download and unzip the emutarkov archive  anywhere you want on your computer.
In emutarkov folder launch 'install.bat', it will install dependencies for your server 

before running the server go to your EFT folder 
Open 'client.config.json' with any text editor
modify this following line : 
`"BackendUrl": "https://prod.escapefromtarkov.com", `
to
 `"BackendUrl": "http://localhost:1337",`
 *Note : everytime the game is updated , you MUST redo this step*

after you done all that, run 'run.bat' on emutarkov folder

here you go, launch the game and enjoy :) 

### Reminder 
You don't need anything else and don't worry, nobody will knows
This is a backend server emulator, witch means this is local, not online ! 

# Contributions
All bugfixes/contributions/pull requests --> https://github.com/polivilas/EmuTarkov

# LICENSE
CC BY-NC-SA 3.0 ( https://creativecommons.org/licenses/by-nc-sa/3.0/ )

