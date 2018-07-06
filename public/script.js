var combatants = {

    "Colossus": {
        "name": "Colossus",
        "classificationname": "player",
        "alignment": "unaligned",
        "ac": 18,
        "hp": 80,
        "speed": "30 ft.",
        "cr": "2",
        "atks": [
            {
                "name": "Giant Slayer",
                "type": "Melee Weapon",
                "freq": 2,
                "atkbonus": 10,
                "reach": "5 ft.",
                "dmgdienum": 1,
                "dmgdiesize": 8,
                "dmgbonus": 6,
                "dmgtypename": "slashing"
            }
        ]
    }
};

/***********************************************************************
 * onLoad AJAX and buildSelect for adding a combatant to the battle
 ***********************************************************************/
function callAllCreatures() {
    var httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {

            var newObj = JSON.parse(httpRequest.responseText);
            buildSelect(newObj);
        }
    };

    httpRequest.open("GET", 'creatures/all.json', true);
    httpRequest.send();
}

function buildSelect(json) {

    var creatures = json['Creatures'];
    var select = document.getElementById("creatureSelect");

    var length = creatures.length;
    for (var i = 0; i < length; i++) {
        var option = document.createElement("option");
        option.text = creatures[i];
        option.setAttribute("value", creatures[i]);
        select.add(option);
    }
}

/***********************************************************************
 * functions to add a combatant card to the battlers list
 ***********************************************************************/
function addCombatant() {
    var combatant = document.getElementById("creatureSelect").value;
    if (combatant.includes("---")) {
        return false;
    }
    getBaseCreature(combatant);
}

function addToCombatantsObject(json, combatant) {
    combatants[combatant] = json;
    getCreatureAttacks(combatants[combatant].id, combatant);
}

function buildCombatantCard(json, combatant) {
	combatants[combatant].atks = [];
	for(var i = 0; i < json.length; i++) {
		combatants[combatant].atks[i] = json[i];
	}
    
    var creature = combatants[combatant];
    var noSpace = creature.name.replace(' ', '_');
    var inititive = (rollDie(20) + Math.floor((creature.dex - 10) / 2));
    var specialAtk = "";
   //<button class="specialAtk">Rotting Gaze</button>

    var newItem = document.createElement("li");
    var text = document.createTextNode("");
    newItem.appendChild(text);
    newItem.innerHTML = "<table><tr><td class='combatantName'>" + creature.name + "</td>"
            + "<td class='inititive'>" + inititive + "</td></tr></table>"
            + "<div class='combatant' id='" + creature.name + "'><section class='hpColumn'><h3>HP</h3>"
            + "<div class='hpBox'><span class='hpBar'></span></div><p class='hpValue'>" + creature.hp + "/"
            + creature.hp + "</p></section><div><img src='creatures/images/" + creature.classificationname + "/"
            + noSpace + ".png'/></div><section class='combatantRightSide'>"
            + "<section class='actionRow'><div><h3>Action</h3><div class='actionCateBar actionBar'></div>"
            + "<button class='atkBtn' onclick='attack(\"" + creature.name + "\")'>Attack</button>"
            + "<select class='atkTarget'><option value='Colossus'>Colossus</option></select></div>"
            + "<div><h3>Bonus Action</h3><div class='actionCateBar BactionBar'></div>"
            + "<button class='atkBtn' onclick='useBonusActn(\"" + noSpace + "\")'>Use</button></div>"
            + "<div><h3>Reaction</h3><div class='actionCateBar reactionBar'></div>"
            + "<button class='atkBtn' onclick='useReactn(\"" + creature.name + "\")'>Use</button></div></section></section>"
            + "<section><h2></h2></section>";

    var battlers = document.getElementById("battlers");

    battlers.insertBefore(newItem, battlers.childNodes[0]); // Insert <li> before the first child of <ul>
    placeInInititive(); // now sort everything so it is back in inititive order
}

/***********************************************************************
 *
 ***********************************************************************/
function addToBattleLog(newLog) {
    var log = document.getElementById("battleLog");

    var newItem = document.createElement("li"); // Create a <li> node
    var text = document.createTextNode(""); // Create a text node
    newItem.appendChild(text); // Append the text to <li>
    newItem.innerHTML = newLog;

    log.insertBefore(newItem, log.childNodes[0]); // Insert <li> before the first child of <ul>
}

/***********************************************************************
 *
 ***********************************************************************/
function attack(atckerId) {
    var atckersElement = document.getElementById(atckerId);
    var atcker = atckerId.split('-');
    atcker = atcker[0];

    var defender = atckersElement.getElementsByClassName("atkTarget")[0].value;
    defendersElement = document.getElementById(defender);

    battle(atcker, atckersElement, defender, defendersElement);

    atckersElement.getElementsByClassName("actionBar")[0].style.backgroundColor = "#87686f";
}

function battle(attacker, atckersElement, defender, defendersElement) {
    attacker = combatants[attacker];
    defender = combatants[defender];

    var atckerName = attacker.name;
    var numAtks = attacker.atks.length;

    //console.log(attacker);
    //console.log(numAtks);

    // roll all main attacks
    for (var i = 0; i < numAtks; i++) {
        console.log(attacker.atks[i]);
        for (var j = 0; j < attacker.atks[i].freq; j++) {
            var atkName = attacker.atks[i].name;
            var atkType = attacker.atks[i].type;
            var atkBonus = attacker.atks[i].atkbonus;
            var atkReach = attacker.atks[i].reach;
            var dmgDieNum = attacker.atks[i].dmgdieNum;
            var dmgDieSize = attacker.atks[i].dmgdieSize;
            var dmgBonus = attacker.atks[i].dmgdonus;

            var newLog = "<strong>" + atkName + ".</strong> <em>" + atkType + " Attack:</em> +" + atkBonus + " to hit, " +
                    "reach " + atkReach + ", one target. <em>Hit:</em> (" + dmgDieNum + "d" + dmgDieSize + " + " +
                    dmgBonus + ") " + attacker.atks[i].dmgtypename + " damage<br>";
            addToBattleLog(newLog);

            attackIt(atckerName, atkBonus, defender, dmgDieNum, dmgDieSize, dmgBonus);
        }
    }

    newLog = "--------------------------------------------------------";
    addToBattleLog(newLog);

    return;
}

function attackIt(atckrName, atkBonus, defender, dmgDieNum, dmgDieSize, dmgBonus) {
    var result = rollDie(20);

    var newLog = atckrName + " rolled: " + (result + atkBonus) + " vs. " + defender.name + " AC " + defender.ac;
    addToBattleLog(newLog);

    // see if the result is greater than or equal to target's AC if so, roll for damage
    if ((result + atkBonus) >= defender.ac || result === 20) {
        var damage = calcDamage(result, dmgDieNum, dmgDieSize, dmgBonus);
        var newHealth = modifyHealth(defender.name, (damage * -1));

        newLog = atckrName + " dealt: " + damage + " damage";
        addToBattleLog(newLog);

        newLog = "<br>" + defender.name + ": " + newHealth + "HP remaining";
        addToBattleLog(newLog);
    } else {
        newLog = "<br>";
        addToBattleLog(newLog);
    }
}

function calcDamage(result, dieNum, dieSize, dmgBonus) {
    var damage = 0;

    // if the base result was 20, it was a critical hit
    if (result === 20)
        dieNum *= 2;

    for (var i = 0; i < dieNum; i++)
        damage += rollDie(dieSize);

    // add the damage bonus after all dice have been rolled
    damage += dmgBonus;

    return damage;
}

/***********************************************************************
 *
 ***********************************************************************/
function endTurn() {
    rotateQueue();
}

function rotateQueue() {
    var battlers = document.querySelectorAll('#battlers li');
    document.querySelector('#leftColumn > ol').append(battlers[0]);
}

function placeInInititive() {
    var battlers = document.getElementById("battlers");; 
    var switching = true; 
    var i, belligerents, inititives, shouldSwitch;
    
    // Make a loop that will continue until no switching has been done:
    while(switching) {
        switching = false;
        
        belligerents = battlers.getElementsByTagName("LI");
        inititives = battlers.getElementsByClassName("inititive");

        for(i = 0; i < (belligerents.length - 1); i++) {
            // Start by saying there should be no switching:
            shouldSwitch = false;
            // Check if the next item should switch place with the current item:
            if((inititives[i].innerHTML * 1) < (inititives[i + 1].innerHTML * 1)) {
                // if the next item is lower in inititive than the current
                shouldSwitch = true;
                break;
            }
        }
        if(shouldSwitch) {
            // If a switch has been marked, make the switch and mark the switch as done:
            belligerents[i].parentNode.insertBefore(belligerents[i + 1], belligerents[i]);
            switching = true;
        }
    }
}

/***********************************************************************
 *
 ***********************************************************************/
function useBonusActn(id) {
    id = id.replace('_', ' ');
    var element = document.getElementById(id);
    element.getElementsByClassName("BactionBar")[0].style.backgroundColor = "#98a3b9";
}

function useReactn(id) {
    var element = document.getElementById(id);
    element.getElementsByClassName("reactionBar")[0].style.backgroundColor = "#809966";
}

/***********************************************************************************
 * RollDie()
 *
 * This function takes an INT as a parameter and uses that to determine the max
 * value on the random number generation. The function then returns the result.
 *
 ***********************************************************************************/
function rollDie(size) {
    var min = Math.ceil(1);
    var max = Math.floor(size);
    var result = Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive

    return result;
}

/***********************************************************************************
 * isFoeSlain()
 ***********************************************************************************/
function isFoeSlain(foeHP) {
    // if creature 1 slew an enemy during its turn, reduce the number of foes
    if (foeHP <= 0) {
        return true;
    }
    return false;
}

/*****************************************************************************
 * modifyHealth()
 *****************************************************************************/
function modifyHealth(combatantId, healthChange) {
    var combatant = document.getElementById(combatantId);

    var health = combatant.getElementsByClassName("hpValue")[0].innerText;

    health = health.split('/');
    var currentHealth = health[0] * 1;
    var maxHealth = health[1] * 1;

    var newHealth = (currentHealth + healthChange);
    if (newHealth < 0) {
        newHealth = 0;
    } else if (newHealth > maxHealth) {
        newHealth = maxHealth;
    }

    var remaining = (newHealth / maxHealth) * 100;

    combatant.getElementsByClassName("hpValue")[0].innerText = newHealth + "/" + maxHealth;
    combatant.getElementsByClassName("hpBar")[0].style.height = remaining + "%";

    /*
     for(maxHealth; newHealth < currentHealth; currentHealth--) {
     var countDown = setInterval(function() {
     combatant.getElementsByClassName("hpValue")[0].innerText = currentHealth + "/" + maxHealth;
     }, 1000);
     }
     */
    return newHealth;
}

/***********************************************************************************
 * getBaseCreature()
 ***********************************************************************************/
function getBaseCreature(combatant) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.overrideMimeType("application/json");
    var newObj;

    httpRequest.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {

            newObj = JSON.parse(httpRequest.responseText);
            addToCombatantsObject(newObj, combatant);
        }
    };

    httpRequest.open("GET", '/creature/' + combatant, true);
    httpRequest.send();
}

function getCreatureAttacks(combatantId, combatantName) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.overrideMimeType("application/json");
    var newObj;

    httpRequest.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {

            newObj = JSON.parse(httpRequest.responseText);
            buildCombatantCard(newObj, combatantName);
        }
    };

    httpRequest.open("GET", '/attacks/' + combatantId, true);
    httpRequest.send();
}

function getSpecialAttacks(combatantId, combatantName) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.overrideMimeType("application/json");
    var newObj;

    httpRequest.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {

            newObj = JSON.parse(httpRequest.responseText);
            buildCombatantCard(newObj, combatantName);
        }
    };

    httpRequest.open("GET", '/specials/' + combatantId, true);
    httpRequest.send();
}


