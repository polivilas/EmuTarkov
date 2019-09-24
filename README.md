# JustEmuTarkov 0.7.4 Release (developer branch)
Automatickly generated files of JustEmuTarkov Server

## How to run it - Instructions

1. Download everything from release's (https://github.com/justemutarkov/EmuTarkov-Server/releases) in this case release 0.7.4
2. unzip it somewhere, so you will know where.
3. File Assembly-CSharp.dll you need to move to {drive}:/{EscapeFromTarkovGameDirectory}/EscapeFromTarkov_data/Managed/* (copy file to * character - and it should ask you for override (make a backup of that file just incase you want to go back to the start point) - just do it)
4. Start Launcher (you should notice red text on the left side - it displaying errors in real time)
5. Go to Settings tab
6. Copy your game directory - like this `{drive}:/{EscapeFromTarkovGameDirectory}` // for me its `C:/EscapeFromTarkovGame/`
7. Copy Server directory (this one you extracted from archive before) for me its `C:/Jet/Server`
8. Look at the left side and check if red texts disapears (if not you copy wrong directory)
9. if everything is ok go to Account tab
10. you can specify login(email) and password used for premaded accounts (we always have default passwords as: `password`) - you can also create your own account(with character) by presseng `Create New Profile`.
11. after you decide on which account you want to play type that login and password if you still not done it and press Login button
12. in that menu you can edit your profile but the most important thing you will not need to login into the game anymore for this session(untill you close launcher)
13. nowe we can start server by clicking button which says so. after that we clicking Start Client

### Troubleshooting at first launching
- if game stuck on profile loading close game by pressing ALT+F4 or ending task in task manager and after restarting server start game again from launcher (its very rarely happends)
- if game displays error backend error cannot receive data from peer (or something simmilar) - it means that server crashed or you done something wrong check client.config.json (in game directory) it backendURL is changed (or just ask us on discord)
- where is server configuration file ? - if you still didnt notice its in server main directory

### Small changelog - changes (not all of them) done at version 0.7.4

- added support for md5 and regular text passwords (search both to give ability to login from ingame menu or from launcher)
- changed server.config.json location to easier access
- bots full refactor (almost entirely recoded - about 90%) (this was like 1-2 week of work)
- some code fixing in selling and buying
- added basic traders progression tracker (could sometimes crash server - if you are using older character data)
- dev: true, enables developer features like 1 RUB items in 2 "new" traders, display more info from server...
- refactor Remove item function - now it should remove items in the right way (thanks to my fellow helpers:> "TRegular")
- progression save features:
 * added all GClass replace's
 * added recalculate _id's to give ability to sell items (and not get that duplicate key) - you can enter raid with your old items and exit it by survived to recalculate ID's
- simplyfy console returns (dev mode displays more important data for debug mainly for coders)
 * sample: [INFO][IP>192.168.1.1:1337]<POST>[Profile:0][Req:/client/items]
- fixed image downloading ( copying them to temp folder on request ) - it should handle all requests now
- added new variable game version to ability to make backward compatibility in the future (loaded from /client/game/version/validate)
- fixed ingame console errors with /client/game/version/validate and /client/notifier/channel/create
- reworked character storage now they are stored like character_<number>.json - it holds only PMC profile Scav one is automatickly added after data grabbed by script
- reworked all data needed for new character storage (including launcher - now 0.1.8)
- traders now pays money if you dont have any :> - additional selling for Dolars and Euros giving them (or should give)
- updated items.json and templates.json with actual official data (ability to play at version 0.11.7.41XX)
- Reversed Assembly for 0.11.7.41XX to have no launcher required(cause its stupid), progression save, Battleye Disabled(no more stupid popups) -> start game only from `EscapeFromTarkov.exe` you can delete _BE executable of EFT if you are using Copy of the game or you are not playing on official server
- currency calculator depends on items.json value so you selling with number of rubles but you are getting "EuroValue / Ruble in Euro" etc. (from Rub and to Rub)
- pay money amount fixed ;) - now you pay correct number of cash (sometimes takes too much sometimes takes too small somehow)
- get money amount fixed ;) - now you get correct number of cash
- move item if there is only 1 in stack or there is no stack in item info (there was a crash if there was no StackObjectCount) FIXED
- fixed flea market buying you can now buy anything from there
- get selling cash amount at trader abit tweaked (added summing all attachments for main items) - thanks 
- getting error in console opens explorer with logs (i think its ok to check what error occur cause some ppl dont know about that things being saved) - so its enabled only if you have `dev: true`
- without dev:true display only nececerly messages disable all console reports like body etc. - and displays errors if occured
- small chance to get Easter Egg dogtag lvl50 in backpack (i will need to think about loot table later)
- finally fixed wrong item size calculations (wrong data send to function)
- initial support for quests (no items are giving)
- ability to add new custom items without interfering with items.json file
- select items for adding to backpack from template categories (limits items to proper ones - its changable in botPresets.json)
- flea market (category allowing script inside flea js file
- changed dev: true to debugMode: true
- added ability to disable progression in config files (on request)
- added older data files database where you can storage other data's for other versions of the game
- update quest standing (*) - still can be buggy
- track buying as sales sum
- fixed selling offraid items
- fixed offraid item duplicate key
- fixed tagging items (now its not throwing errors - after multiply changing tag in stash and inraid mixed)
- fixed error on redownloading images by server to client (.toString() not defined)
- mergeitem now can merge items without upd.StackItemObject
- all bots have proper names now


## Information
See https://justemutarkov.github.io

## Issues
All bugs/errors/issues:<br/>
https://github.com/polivilas/EmuTarkov/issues<br/>
Please include your logs located in ```gamedir/logs```.

## Contributions
All bugfixes/contributions/pull requests:<br/>
https://github.com/polivilas/EmuTarkov

## License
CC BY-NC-SA 3.0<br/>
https://creativecommons.org/licenses/by-nc-sa/3.0/

## Credits
- polivilas
- BALIST0N
- TheMaoci
- InNoHurryToCode
- Macmillanic
- Mr RUSS
- Windel
- Йуpасзка
