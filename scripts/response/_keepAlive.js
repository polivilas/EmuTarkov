"use strict";

const trader = require('../trader.js');

//// ---- FUNCTIONS BELOW ---- ////

function main() 
{

    let update_per = 3600;// update each hour
    let tradersToUpdateList = trader.loadAllTraders();
    let flag = false;
    tradersToUpdateList = tradersToUpdateList.data;
    let timeNow = Math.floor(Date.now() / 1000);
    for(let i = 0; i < tradersToUpdateList.length; i++){
        if((tradersToUpdateList[i].supply_next_time + update_per) <= timeNow){
            //1569769200
            flag = true;
            let substracted_time = timeNow - tradersToUpdateList[i].supply_next_time;
            let days_passed = Math.floor((substracted_time)/86400);
            let time_co_compensate = days_passed * 86400;
            let newTraderTime = tradersToUpdateList[i].supply_next_time + time_co_compensate;
            let compensateUpdate_per = Math.floor((timeNow - newTraderTime)/update_per);
            compensateUpdate_per = compensateUpdate_per * update_per;
            newTraderTime = newTraderTime + compensateUpdate_per + update_per;
            tradersToUpdateList[i].supply_next_time = newTraderTime;
			//console.log(newTraderTime);
            trader.setTrader(tradersToUpdateList[i]);
        }
    }
    updatePlayerHideout();
    return; // not finished
}

//each time keep alive is called, we need to update produtions time, resource left of everything in the hideout
function updatePlayerHideout()
{
    let ply = profile.getCharacterData();
    if(ply !== undefined)
    {
        let hideout_areas_config = JSON.parse( utility.readJson("database/configs/hideout/areas.json" ) );

        for(let prod in ply.data[0].Hideout.Production)//update production time
        { 
            let time_elapsed = Math.floor( Date.now()/1000) - ply.data[0].Hideout.Production[prod].StartTime;
            ply.data[0].Hideout.Production[prod].Progress = time_elapsed; 
        }
    
        for(let area in ply.data[0].Hideout.Areas)
        {            
            if(ply.data[0].Hideout.Areas[area].slots.length > 0)//update ressource of first slot
            {
                //hmmm ...? 
            }

        }
    }
    else
    {
        consle.log("ply is undefined");
    } 

    profile.setCharacterData(ply); 
}
//// ---- EXPORT LIST ---- ////

module.exports.main = main;
//module.exports.funcname = funcname; // preset
