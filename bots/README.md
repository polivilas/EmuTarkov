## Randomized bots !
the server now generate randomized AI scavs, only based on RNG


### What is randomized ?
 
- Appearance : head and outfit are mixed with all kind of scavs( bosses, pmcs etcc..)
- weapons : more than 160 possibilities including pistols , grenades & ultra modded weapons
- gear : scavs can have any rigs, armor, backpack and headgear , each slot is based on % of chance
- skills : all their skills are randomized (endurance, strengh, vitality, etcc)

####  randomization 
Every bot randomized have these following chances of stuff :

- Vest rig : 100% (can be armored, they are mixed with normal rigs)
- Magazines : 100% , randomized magazine on his weapon and two on his rig
- Ammo : 100% every ammo on each mags are randomized
- Glasses : 30%
- Face cover : 40%
- headwear : 40% (it can be an armored Helmet, but no visor...)
- Backpack : 25%
- Body armor : 25% 
- Grenade in pocket : 10% (except bosses)
- meds in pocket : 10% (except bosses)

### Scav bosses ?
Killa and Reshala are vanillia, but reshala's guards stuff is randomized, their behavior are still the same. So be very carefull when hunting bosses

#### How it works ?
the server take care of all !  Nothing to configure, nothing to edit : )


### PmcWar Mode
the randomizer provide a pmc war mode, it replace randomly every scav by a bear or a usec
witch lead into some epic team fight with AI

therefore, this setting is hard on CPU usage and make the game sluttering ..
there is one option to change in "bots/BotsSettings.json"

    "EnablePmcWar":true,
(its false by default)
