# JustEmuTarkov 0.7.5 (developer branch)

Automatickly generated files of JustEmuTarkov Server

Note: This repo is updated from a private repository sporadically. It might not be up to date at all times.

## How to run it - Instructions (no node required)

1. Download everything from release's (https://github.com/justemutarkov/EmuTarkov-Server/releases)  lastest release
2. unzip it somewhere, so you will know where.
3. File Assembly-CSharp.dll you need to move to {drive}:/{EscapeFromTarkovGameDirectory}/EscapeFromTarkov_data/Managed/\* (copy file to \* character - and it should ask you for override (make a backup of that file just incase you want to go back to the start point) - just do it)
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

## Information

See https://justemutarkov.github.io

## Issues

All bugs/errors/issues:<br/>
https://github.com/polivilas/EmuTarkov/issues<br/>
Please include your logs located in `gamedir/logs`.

## Contributions

All bugfixes/contributions/pull requests:<br/>
https://github.com/polivilas/EmuTarkov

## License

CC BY-NC-SA 3.0<br/>
https://creativecommons.org/licenses/by-nc-sa/3.0/

## Credits

- polivilas
- TheMaoci
- InNoHurryToCode
- BALIST0N
- Macmillanic
- Mr RUSS
- Windel
- Йуpасзка
