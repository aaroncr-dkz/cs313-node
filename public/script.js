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
        ],
		"dex": "15",
        "con": "18"
    }
};
var topOfTheRound = 0;

/*------------------------------------------------------------------------------
 * onLoad AJAX and buildSelect for adding a combatant to the battle
 *------------------------------------------------------------------------------*/
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

/*------------------------------------------------------------------------------
 * functions to add a combatant card to the battlers list
 *------------------------------------------------------------------------------*/
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

function addCreatureAttacks(json, combatant) {
    combatants[combatant].atks = [];
    for (var i = 0; i < json.length; i++) {
        combatants[combatant].atks[i] = json[i];
    }

    if (combatants[combatant].specials === 1) {
        getSpecialAttacks(combatants[combatant].id, combatant);
    } else {
        buildCombatantCard(json, combatant);
    }
}

function buildCombatantCard(json, combatant) {
	var creature = combatants[combatant];
    var noSpace = creature.name.replace(' ', '_');
    var inititive = (rollDie(20) + Math.floor((creature.dex - 10) / 2));
    var specialAtk = "";

    if (combatants[combatant].specials === 1) {
        combatants[combatant].specAtks = [];
        for (var i = 0; i < json.length; i++) {
            combatants[combatant].specatks[i] = json[i];

            if (combatants[combatant].specatks[i].recharge !== 0) {
                combatants[combatant].specatks[i].isCharged = true;
            }
        }

        var atkId = creature.specatks[0].name.replace(' ', '_');

        specialAtk += "<button id='" + atkId + "' class='specialAtk' onclick='attack(\"" + creature.name + "\", \""
                + creature.specatks[0].name + "\")'>" + creature.specatks[0].name + "</button>";
    }

    var newItem = document.createElement("li");
    var text = document.createTextNode("");
    newItem.appendChild(text);
    newItem.innerHTML = "<table><tr><td class='combatantName'>" + creature.name + "</td>"
            + "<td class='inititive'>" + inititive + "</td></tr></table>"
            + "<div class='combatant' id='" + noSpace + "'><section class='hpColumn'><h3>HP</h3>"
            + "<div class='hpBox'><span class='hpBar'></span></div><p class='hpValue'>" + creature.hp + "/"
            + creature.hp + "</p></section><div><img src='creatures/images/" + creature.classificationname + "/"
            + noSpace + ".png'/></div><section class='combatantRightSide'>"
            + "<section class='actionRow'><div><h3>Action</h3><div class='actionCateBar actionBar'></div>"
            + "<button class='atkBtn' onclick='attack(\"" + creature.name + "\")'>Attack</button>"
            + "<select class='atkTarget'><option value='Colossus'>Colossus</option></select>" + specialAtk + "</div>"
            + "<div><h3>Bonus Action</h3><div class='actionCateBar BactionBar'></div>"
            + "<button class='atkBtn' onclick='useBonusActn(\"" + noSpace + "\")'>Use</button></div>"
            + "<div><h3>Reaction</h3><div class='actionCateBar reactionBar'></div>"
            + "<button class='atkBtn' onclick='useReactn(\"" + creature.name + "\")'>Use</button></div></section></section>"
            + "<section><h2></h2></section><img src='images/remove.png' alt='remove creature' class='remove' onclick='"
            + "removeCreature(\"" + creature.name + "\")'>";

    var battlers = document.getElementById("battlers");

    battlers.insertBefore(newItem, battlers.childNodes[0]); // Insert <li> before the first child of <ul>
	
	if (topOfTheRound < inititive) {
        topOfTheRound = inititive;
    }
	
    placeInInititive(); // now sort everything so it is back in inititive order
	createMiniHeads();
	addToPlayersTargets();
}

function createMiniHeads() {
    //var battlers = Object.keys(combatants);
    var battlers = document.getElementsByClassName("combatantName");
    var length = battlers.length;
    var list = document.getElementById("miniHeads");
    var html = "";

    for (var i = 0; i < length; i++) {
        var name = combatants[battlers[i].innerText].name.replace(' ', '_');
		name = name.toLowerCase();
        html += "<li><img class='miniHead' src='creatures/images/" + combatants[battlers[i].innerText].classificationname
                + "/" + name + ".png' /></li>";
    }
    list.innerHTML = html;
}

/*------------------------------------------------------------------------------
 *
 *------------------------------------------------------------------------------*/
function addToBattleLog(newLog) {
    var log = document.getElementById("battleLog");

    var newItem = document.createElement("li"); // Create a <li> node
    var text = document.createTextNode(""); // Create a text node
    newItem.appendChild(text); // Append the text to <li>
    newItem.innerHTML = newLog;

    log.insertBefore(newItem, log.childNodes[0]); // Insert <li> before the first child of <ul>
}

function addToPlayersTargets() {
    var battlers = document.getElementsByClassName("combatantName");
    var length = battlers.length;
    var lists = document.getElementsByClassName("playerChar");
    var html = "";

    for (var i = 0; i < length; i++) {
        if (!battlers[i].classList.contains("pc")) {
            var noSpace = combatants[battlers[i].innerText].name.replace(' ', '_');
            var name = combatants[battlers[i].innerText].name;
            html += "<option value='" + noSpace + "'>" + name + "</option>";
        }
    }

    length = lists.length;
    for (var i = 0; i < length; i++) {
        lists[i].innerHTML = html;
    }

    /*
     var creatures = json['Creatures'];
     var select = document.getElementById("creatureSelect");
     
     var length = creatures.length;
     for (var i = 0; i < length; i++) {
     var option = document.createElement("option");
     option.text = creatures[i];
     option.setAttribute("value", creatures[i]);
     select.add(option);
     }
     */
}

/*------------------------------------------------------------------------------
 *
 *------------------------------------------------------------------------------*/
function attack(atckerId, special) {
    atckerId = atckerId.replace(' ', '_');

    // get the attackers DOM element
    var atckersElement = document.getElementById(atckerId);
    var atcker = atckerId.split('-');
    atcker = atcker[0];

    // get the defender. Check monsters first, than players to see which kind is defending
    var defender = atckersElement.getElementsByClassName("atkTarget")[0];
    if (defender == null) {
        defender = atckersElement.getElementsByClassName("playerChar")[0].value;
    } else {
        defender = defender.value;
    }
    var defendersElement = document.getElementById(defender);

    atcker = atcker.replace('_', ' ');
    defender = defender.replace('_', ' ');

    // fight it out
    if (special == null) {
        battle(atcker, atckersElement, defender, defendersElement);
    } else {
        savingThrow(atcker, atckersElement, special, defender, defendersElement);
    }
}

function battle(attacker, atckersElement, defender, defendersElement) {
    attacker = combatants[attacker];
    defender = combatants[defender];

    var atckerName = attacker.name;
    var numAtks = attacker.atks.length;

    // roll all main attacks
    for (var i = 0; i < numAtks; i++) {
        for (var j = 0; j < attacker.atks[i].freq; j++) {
            var atkName = attacker.atks[i].name;
            var atkType = attacker.atks[i].type;
            var atkBonus = attacker.atks[i].atkbonus;
            var atkReach = attacker.atks[i].reach;
            var dmgDieNum = attacker.atks[i].dmgdienum;
            var dmgDieSize = attacker.atks[i].dmgdiesize;
            var dmgBonus = attacker.atks[i].dmgbonus;

            var newLog = "<strong>" + atkName + ".</strong> <em>" + atkType + " Attack:</em> +" + atkBonus + " to hit, " +
                    "reach " + atkReach + ", one target. <em>Hit:</em> (" + dmgDieNum + "d" + dmgDieSize + " + " +
                    dmgBonus + ") " + attacker.atks[i].dmgtypename + " damage<br>";
            addToBattleLog(newLog);

            attackIt(atckerName, atkBonus, defender, dmgDieNum, dmgDieSize, dmgBonus);
        }
    }

    newLog = "--------------------------------------------------------";
    addToBattleLog(newLog);
	useAction(atckersElement);

    return;
}

function attackIt(atckrName, atkBonus, defender, dmgDieNum, dmgDieSize, dmgBonus) {
    var result = rollDie(20);
	var defenderName = defender.name.replace(' ', '_');
    var atkColor = "White";
	
	if (result === 20) {
        atkColor = "Lime";
    } else if (result === 1) {
        atkColor = "Red";
    }

    var newLog = atckrName + " rolled: <span style='color: " + atkColor + "'>" + (result + atkBonus) + "</span> vs. "
            + defender.name + " AC " + defender.ac;
    addToBattleLog(newLog);

    // see if the result is greater than or equal to target's AC if so, roll for damage
    if ((result + atkBonus) >= defender.ac || result === 20) {
        var damage = calcDamage(result, dmgDieNum, dmgDieSize, dmgBonus);

        var newHealth = modifyHealth(defenderName, (damage * -1));

        newLog = atckrName + " dealt: " + damage + " damage";
        addToBattleLog(newLog);

        newLog = "<br>" + defender.name + ": " + newHealth + "HP remaining";
        addToBattleLog(newLog);

        if (isFoeSlain(newHealth)) {
            removeCreature(defender.name, true);
        }
    } else {
        newLog = "<br>";
        addToBattleLog(newLog);
    }
}

/*------------------------------------------------------------------------------
 *
 *------------------------------------------------------------------------------*/
function savingThrow(attacker, atckersElement, special, defender, defendersElement) {

    attacker = combatants[attacker];
    defender = combatants[defender];

    var specAtk;
    var specNum;
    for (var i = 0; i < attacker.specAtks.length; i++) {
        if (attacker.specAtks[i].name === special) {
            specAtk = attacker.specAtks[i];
            specNum = i;
            
            if (attacker.specAtks[i].isCharged === false) {
                return;
            }
            break;
        }
    }

    var specName = specAtk.name;
    var descrip = specAtk.description;

    var dc = specAtk.dc;
    var save = specAtk.save;
    var saveResult = specAtk.saveResult;

    var dmgDieNum = specAtk.dmgDieNum;
    var dmgDieSize = specAtk.dmgDieSize;

    var newLog = "<strong>" + specName + ".</strong> " + descrip + "<br>";
    addToBattleLog(newLog);

    saveIt(attacker.name, dc, save, saveResult, defender, dmgDieNum, dmgDieSize);

    newLog = "--------------------------------------------------------";
    addToBattleLog(newLog);
    useAction(atckersElement);
    
    console.log(combatants[attacker.name]);
    if (combatants[attacker.name].specAtks[specNum].recharge !== 0) {
        combatants[attacker.name].specAtks[specNum].isCharged = false;
        
        var specId = specAtk.name.replace(' ', '_');
        document.getElementById(specId).style.backgroundColor = "whitesmoke";
        document.getElementById(specId).style.color = "red";
    }

    return;
}

function saveIt(atckrName, dc, save, saveResult, defender, dmgDieNum, dmgDieSize) {
    var result = rollDie(20);
    var defenderName = defender.name.replace(' ', '_');
    var saveBonus = Math.floor((defender.con - 10) / 2);
    var saveName;

    switch (save) {
        case "con":
            saveName = "Constitution";
            break;
        case "str":
            saveName = "Strength";
            break;
    }

    var newLog = defenderName + " rolled: " + (result + saveBonus) + " vs. DC" + dc + " " + saveName + " saving throw";
    addToBattleLog(newLog);

    // see if the result is less than the DC if so, roll for damage. Unless the save result is half damage
    if ((result + saveBonus) < dc || saveResult === "Half Damage") {
        var damage = calcDamage(result - 1, dmgDieNum, dmgDieSize, 0);

        if ((result + saveBonus) >= dc) {
            damage = Math.floor(damage / 2);
            newLog = "Save success! Half damage taken";
            addToBattleLog(newLog);
        }

        var newHealth = modifyHealth(defenderName, (damage * -1));

        newLog = atckrName + " dealt: " + damage + " damage";
        addToBattleLog(newLog);

        newLog = "<br>" + defender.name + ": " + newHealth + "HP remaining";
        addToBattleLog(newLog);

        if (isFoeSlain(newHealth)) {
            removeCreature(defender.name, true);
        }
    } else {
        newLog = "Save success! No effect";
        addToBattleLog(newLog);

        newLog = "<br>";
        addToBattleLog(newLog);
    }
} 
 
/*------------------------------------------------------------------------------
 *
 *------------------------------------------------------------------------------*/
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

/*------------------------------------------------------------------------------
 *
 *------------------------------------------------------------------------------*/
function endTurn() {
    rotateQueue();
	endRound();
}

function endRound() {
    var battlers = document.getElementById("battlers");
    var currentTurn = battlers.firstElementChild;
    var checkInit = currentTurn.querySelector(".inititive").innerText * 1;

    if (topOfTheRound === checkInit) {
        checkRecharge(battlers);

        var actionBars = document.getElementsByClassName('actionBar');
        var BactionBars = document.getElementsByClassName('BactionBar');
        var reactionBars = document.getElementsByClassName('reactionBar');

        var length = actionBars.length;

        for (var i = 0; i < length; i++) {
            actionBars[i].style.backgroundColor = "crimson";
            BactionBars[i].style.backgroundColor = "cornflowerblue";
            reactionBars[i].style.backgroundColor = "chartreuse";
        }
    }
}

function rotateQueue() {
    var battlers = document.querySelectorAll('#battlers li');
    document.querySelector('#leftColumn > ol').append(battlers[0]);
	createMiniHeads();
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

function checkRecharge(battlers) {

}

/*------------------------------------------------------------------------------
 *
 *------------------------------------------------------------------------------*/
function useBonusActn(id) {
    id = id.replace('_', ' ');
    var element = document.getElementById(id);
    element.getElementsByClassName("BactionBar")[0].style.backgroundColor = "#98a3b9";
}

function useReactn(id) {
    var element = document.getElementById(id);
    element.getElementsByClassName("reactionBar")[0].style.backgroundColor = "#809966";
}

function useAction(element) {
    element.getElementsByClassName("actionBar")[0].style.backgroundColor = "#87686f";
}

/*------------------------------------------------------------------------------
 * RollDie()
 *
 * This function takes an INT as a parameter and uses that to determine the max
 * value on the random number generation. The function then returns the result.
 *
 *------------------------------------------------------------------------------*/
function rollDie(size) {
    var min = Math.ceil(1);
    var max = Math.floor(size);
    var result = Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive

    return result;
}

/*------------------------------------------------------------------------------
 * 
 *------------------------------------------------------------------------------*/
function removeCreature(creature, byBattle) {
    creature = creature.replace(' ', '_');
    var battlers = document.getElementById("battlers");
    var target = battlers.querySelector('#' + creature);
    var deceased = target.parentElement;

    var children = battlers.childNodes;
    var length = children.length;

    for (var i = 0; i < length; i++) {
        if (children[i] === deceased) {
            if (byBattle) {
                setTimeout(function () {
                    battlers.removeChild(battlers.childNodes[i]);
                    createMiniHeads();
                }, 1500);
            } else {
                battlers.removeChild(battlers.childNodes[i]);
                createMiniHeads();
            }
            break;
        }
    }
}

function isFoeSlain(foeHP) {
    if (foeHP <= 0) {
        return true;
    }
    return false;
}

/*------------------------------------------------------------------------------
 * modifyHealth()
 *------------------------------------------------------------------------------*/
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

/*------------------------------------------------------------------------------
 * getBaseCreature()
 *------------------------------------------------------------------------------*/
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
            addCreatureAttacks(newObj, combatantName);
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


