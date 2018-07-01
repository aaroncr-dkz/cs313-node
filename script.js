var combatants = {

    "Colossus": {
        "name": "Colossus",
        "classification": "player",
        "alignment": "unaligned",
        "ac": 18,
        "hp": 80,
        "speed": "30 ft.",
        "cr": "2",
        "atks": [
            {
                "name": "Giant Slayer",
                "type": "Melee Weapon",
                "numAtks": 2,
                "atkBonus": 10,
                "reach": "5 ft.",
                "dmgDieNum": 1,
                "dmgDieSize": 8,
                "dmgBonus": 6,
                "dmgType": "slashing"
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

    var selectOptions = "";
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
    makeHTTPRequest(combatant);
}

function addToCombatantsObject(json, combatant) {
    combatants[json.name] = json;
    buildCombatantCard(combatant);
}

function buildCombatantCard(combatant) {
    var creature = combatants[combatant];

    var newItem = document.createElement("li");
    var text = document.createTextNode("");
    newItem.appendChild(text);
    newItem.innerHTML = "<table><tr><td class='combatantName'>" + creature.name + "</td><td class='inititive'></td></tr></table>" +
        "<div class='combatant' id='" + creature.name + "'><section class='hpColumn'><h3>HP</h3><div class='hpBox'>" +
        "<span class='hpBar'></span></div><p class='hpValue'>" + creature.hp + "/" + creature.hp + "</p></section><div>" +
        "<img src='creatures/images/" + creature.classification + "/" + creature.name + ".png'/></div><section class='combatantRightSide'>" +
        "<section class='actionRow'><div><h3>Action</h3><div class='actionCateBar actionBar'></div><button class='atkBtn' " +
        "onclick='attack(\"" + creature.name + "\")'>Attack</button><select class='atkTarget'>" +
        "<option value='Colossus'>Colossus</option></select></div><div><h3>Bonus Action</h3><div class='actionCateBar BactionBar'>" +
        "</div></div><div><h3>Reaction</h3><div class='actionCateBar reactionBar'></div></div></section></section><section><h2></h2>" +
        "</section>";

    var battlers = document.getElementById("battlers");

    battlers.insertBefore(newItem, battlers.childNodes[0]); // Insert <li> before the first child of <ul>
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
 *
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

/***********************************************************************
 *
 ***********************************************************************/
function battle(attacker, atckersElement, defender, defendersElement) {
    attacker = combatants[attacker];
    defender = combatants[defender];

    var atckerName = attacker.name;
    var numAtks = attacker.atks.length;

    // roll all main attacks
    for (var i = 0; i < numAtks; i++) {
        var atkName = attacker.atks[i].name;
        var atkType = attacker.atks[i].type;
        var atkBonus = attacker.atks[i].atkBonus;
        var atkReach = attacker.atks[i].reach;
        var dmgDieNum = attacker.atks[i].dmgDieNum;
        var dmgDieSize = attacker.atks[i].dmgDieSize;
        var dmgBonus = attacker.atks[i].dmgBonus;

        var newLog = "<strong>" + atkName + ".</strong> <em>" + atkType + " Attack:</em> +" + atkBonus + " to hit, " +
            "reach " + atkReach + ", one target. <em>Hit:</em> (" + dmgDieNum + "d" + dmgDieSize + " + " + dmgBonus + ") " +
            attacker.atks[i].dmgType + " damage<br>";
        addToBattleLog(newLog);

        attackIt(atckerName, atkBonus, defender, dmgDieNum, dmgDieSize, dmgBonus);
    }

    // if the creature has a second kind of attack
    if (attacker.secndNumAtks !== null) {
        // roll all secondary attacks
        for (var i = 0; i < attacker.secndNumAtks; i++)
            attackIt(atckerName, atkBonus, defender, attacker.secndDmgDieNum, attacker.secndDmgDieSize, dmgBonus);
    }

    newLog = "--------------------------------------------------------";
    addToBattleLog(newLog);

    return;
}


/***********************************************************************************
 * attack()
 ***********************************************************************************/
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
    }
    else {
        newLog = "<br>";
        addToBattleLog(newLog);
    }
}

/***********************************************************************************
 * calcDamage()
 ***********************************************************************************/
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
 * calcDamage()
 ***********************************************************************************/
function isFoeSlain(foeHP) {
    // if creature 1 slew an enemy during its turn, reduce the number of foes
    if (foeHP <= 0) {
        return true;
    }
    return false;
}

/***********************************************************************************
 * makeHTTPRequest()
 *
 * This fucntion is an AJAX request that accesses the creatures json files.
 *
 ***********************************************************************************/
function makeHTTPRequest(combatant) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.overrideMimeType("application/json");
    var newObj;

    httpRequest.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {

            newObj = JSON.parse(httpRequest.responseText);
            addToCombatantsObject(newObj, combatant);
        }
    };

    httpRequest.open("GET", '/creature?name=' + combatant, true);
    httpRequest.send();

    return newObj;
}

/*****************************************************************************
 *
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
