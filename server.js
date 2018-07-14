const express = require('express');
var app = express();
const path = require('path')
const url = require('url')
const PORT = process.env.PORT || 5000

/*---------------------------------
 * MySQL
 --------------------------------*/
//var mysql = require('mysql');
//var con = mysql.createConnection({
//    host: "localhost",
//    user: "iClient",
//    password: "z15H8rpmxGo7luVS",
//    database: "battle_manager"
//});

/*---------------------------------
 * postGres
 --------------------------------*/
const { Pool } = require("pg"); // This is the postgres database connection module.
const connectionString = process.env.DATABASE_URL;
const con = new Pool({connectionString: connectionString});

/*---------------------------------
 * Server
 --------------------------------*/
//app.set("port", 5000);
//app.set('views', path.join(__dirname, 'views'))
//app.set('view engine', 'ejs')
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.get("/creature/:creature", getCreature);
app.get("/attacks/:creatureId", getCreatureAttacks);
app.get("/specials/:creatureId", getSpecialAttacks);

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));

/*---------------------------------
 * getCreature
 --------------------------------*/
function getCreature(req, res) {
    var creature = req.params.creature;

    // use a helper function to query the DB, and provide a callback for when it's done
    getCreatureFromDB(creature, function (error, result) {

        // This is the callback function that will be called when the DB is done.
        if (error || result === null || result.length !== 1) {
            res.status(500).json({success: false, data: error});
        } else {
            res.status(200).json(result[0]);
        }
    });
}

function getCreatureFromDB(creature, callback) {
    //console.log(creature);

    // Set up the SQL that we will use for our query. 
    var sql = "SELECT cr.id, cr.name, cr.size, cl.classificationName, cr.ac, cr.hp, cr.dex "
            + "FROM creatures cr INNER JOIN classifications cl "
            + "ON cl.classificationId = cr.classificationId "
            + "WHERE cr.name = $1";

    // We now set up an array of all the parameters we will pass to fill the
    // placeholder spots we left in the query.
    var params = [creature];

    // This runs the query, and then calls the provided anonymous callback function
    con.query(sql, params, function (err, result) {
        if (err) {
            console.log("Error in query: ");
            console.log(err);
            callback(err, null);
        }

        //console.log("Found result: " + JSON.stringify(result.rows));

        // When someone else called this function, they supplied the function
        // they wanted called when we were all done. Call that function now
        // and pass it the results.

        // (The first parameter is the error variable, so we will pass null.)
        callback(null, result.rows);
    });
}

/*---------------------------------
 * getCreatureAttacks
 --------------------------------*/
function getCreatureAttacks(req, res) {
    var id = req.params.creatureId;

    // use a helper function to query the DB, and provide a callback for when it's done
    getAttacksFromDB(id, function (error, result) {

        // This is the callback function that will be called when the DB is done.
        if (error || result === null || result.length < 1) {
            res.status(500).json({success: false, data: error});
        } else {
            res.status(200).json(result);
        }
    });
}

function getAttacksFromDB(id, callback) {

    // Set up the SQL that we will use for our query. 
    var sql = "SELECT a.name, a.type, a.atkBonus, a.reach, a.dmgDieNum, a.dmgDieSize, a.dmgBonus, dt.dmgTypeName, ca.freq "
            + "FROM creature_attacks ca INNER JOIN attacks a ON ca.atkID = a.atkId "
            + "INNER JOIN damagetypes dt ON dt.dmgTypeId = a.dmgTypeId "
            + "WHERE ca.creatureId = $1::int";

    // We now set up an array of all the parameters we will pass to fill the
    // placeholder spots we left in the query.
    var params = [id];

    // This runs the query, and then calls the provided anonymous callback function
    con.query(sql, params, function (err, result) {
        if (err) {
            console.log("Error in query: ");
            console.log(err);
            callback(err, null);
        }

        //console.log("Found result: " + JSON.stringify(result.rows));

        // When someone else called this function, they supplied the function
        // they wanted called when we were all done. Call that function now
        // and pass it the results.

        // (The first parameter is the error variable, so we will pass null.)
        callback(null, result.rows);
    });
}

/*---------------------------------
 * getSpecialAttacks
 --------------------------------*/
function getSpecialAttacks(req, res) {
    var id = req.params.creatureId;

    // use a helper function to query the DB, and provide a callback for when it's done
    getSpecialsFromDB(id, function (error, result) {

        // This is the callback function that will be called when the DB is done.
        if (error || result === null || result.length < 1) {
            res.status(500).json({success: false, data: error});
        } else {
            res.status(200).json(result);
        }
    });
}

function getSpecialsFromDB(id, callback) {

    // Set up the SQL that we will use for our query. 
    var sql = "SELECT * "
            + "FROM creature_specials cs INNER JOIN specialattacks sa ON cs.specAtkId = sa.specAtkId"
            + "WHERE cs.creatureId = $1::int";

    // We now set up an array of all the parameters we will pass to fill the
    // placeholder spots we left in the query.
    var params = [id];

    // This runs the query, and then calls the provided anonymous callback function
    con.query(sql, params, function (err, result) {
        if (err) {
            console.log("Error in query: ");
            console.log(err);
            callback(err, null);
        }

        //console.log("Found result: " + JSON.stringify(result.rows));

        // When someone else called this function, they supplied the function
        // they wanted called when we were all done. Call that function now
        // and pass it the results.

        // (The first parameter is the error variable, so we will pass null.)
        callback(null, result.rows);
    });
}