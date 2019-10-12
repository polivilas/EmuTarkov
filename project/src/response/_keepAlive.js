"use strict";

const trader = require('../trader.js');

//// ---- FUNCTIONS BELOW ---- ////

function main() {
    let update_per = 3600;// update each hour
    let tradersToUpdateList = trader.getList();
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
    if(flag){
        trader.loadAllTraders();
    }
    return; // not finished
}

//// ---- EXPORT LIST ---- ////

module.exports.main = main;
//module.exports.funcname = funcname; // preset
