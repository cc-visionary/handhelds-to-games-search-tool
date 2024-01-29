var sqlite3 = require("sqlite3").verbose();

const db_source = "./database/game_list.sqlite";

let db = new sqlite3.Database(db_source);

module.exports = db;
