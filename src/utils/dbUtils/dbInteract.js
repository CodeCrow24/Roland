const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../../../data/data.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON')
db.prepare(`
    CREATE TABLE IF NOT EXISTS "parteien" (
	"id"	TEXT NOT NULL,
	"name"	TEXT NOT NULL COLLATE NOCASE,
	"sitze"	INTEGER DEFAULT 0,
	"kuerzel"	TEXT,
	"konto"	INTEGER DEFAULT 0,
	PRIMARY KEY("id")
)
`).run();
db.prepare(`
    CREATE TABLE IF NOT EXISTS "ordnungsrufe" (
	"id"	INTEGER,
	"userID"	TEXT,
	"strafe"	INTEGER,
	"grund"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("userID") REFERENCES "users"("id")
)
`).run();
db.prepare(`
    CREATE TABLE IF NOT EXISTS "users" (
	"id"	TEXT NOT NULL,
	"name"	TEXT NOT NULL,
	"userID"	TEXT NOT NULL,
	"partei"	TEXT,
	"vorsitz"	INTEGER DEFAULT 0,
	"vertretung"	TEXT,
	PRIMARY KEY("id"),
	FOREIGN KEY("partei") REFERENCES "parteien"("id"),
	FOREIGN KEY("vertretung") REFERENCES "parteien"("id")
)
`).run();
db.prepare(`
    CREATE TABLE IF NOT EXISTS "antraege" (
	"id"	INTEGER,
	"content"	TEXT,
	"user"	TEXT,
	"accepted"	INTEGER DEFAULT 0,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("user") REFERENCES "users"("id")
)
`).run();
db.prepare(`
    CREATE TABLE IF NOT EXISTS "pendingPolls" (
	"msgID"	TEXT,
	"channelID"	TEXT,
	"user"	TEXT,
	"antragID"	INTEGER,
	"pos"	INTEGER
)
`).run();

function getEntry(table, column, value){
    const stmt = db.prepare(`SELECT * FROM ${table} WHERE ${column} = ?`);
    return stmt.get(value);
}
function getAllSpez(table, column, value){
    const stmt = db.prepare(`SELECT * FROM ${table} WHERE ${column} = ?`);
    return stmt.all(value);
}
function getCon(table, identifiers){
    const columns = Object.keys(identifiers);
    const values = Object.values(identifiers);

    const conditions = columns.map(col => `${col} = ?`).join(' AND ');
    const stmt = db.prepare(`SELECT * FROM ${table} WHERE ${conditions}`);
    return stmt.get(...values);
}
function getAllCon(table, identifiers){
    const columns = Object.keys(identifiers);
    const values = Object.values(identifiers);

    const conditions = columns.map(col => `${col} = ?`).join(' AND ');
    const stmt = db.prepare(`SELECT * FROM ${table} WHERE ${conditions}`);
    return stmt.all(...values);
}
function getAllEntries(table) {
    const stmt = db.prepare(`SELECT * FROM ${table}`);
    return stmt.all();
}
function addEntry(table, args) {
    const columns = Object.keys(args);
    const values = Object.values(args);
    const placeholders = columns.map(() => '?').join(', '); //question marks for stmt

    const stmt = db.prepare(
        `INSERT OR IGNORE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`
    );

    const result = stmt.run(...values);

    return result.lastInsertRowid;
}
function removeEntry(table, identifiers){
    const columns = Object.keys(identifiers);
    const values = Object.values(identifiers);

    const conditions = columns.map(col => `${col} = ?`).join(' AND ');
    const stmt = db.prepare(`DELETE FROM ${table} WHERE ${conditions}`);
    stmt.run(...values);
}
function editEntry(table, args){
    const column = Object.keys(args)[1];
    const value = Object.values(args)[1];
    const idColumn = Object.keys(args)[0];
    const id = Object.values(args)[0];

    const stmt = db.prepare(`UPDATE ${table} SET ${column} = ? WHERE ${idColumn} = ?`);
    stmt.run(value, id);
}
module.exports = {
    addEntry,
    editEntry,
    removeEntry,
    getEntry,
    getAllEntries,
    getAllSpez,
    getCon,
    getAllCon
};