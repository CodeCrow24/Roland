const db = require('./dbInteract');

function getPartyAmounts(){//calculate amount of parties in db
    const parteien = db.getAllEntries('parteien');
    let highest = -Infinity;

    for (const partei of parteien) {
        const match = partei.id.match(/\d+$/); // regex: one or more digits at the end

        if (match) {
            const num = parseInt(match[0], 10); //string => num
            if (num > highest) {
                highest = num;
            }
        }  
    }
    
    if (highest === -Infinity) {
        console.error('[DB]: Encounterred error: no numeric database ids found');
        return -1;
    } else {
        return highest;
    }
}
function findeKuerzel(name){
    const woerter = name.split(/[ -]/);
    let kuerzel = '';
    for(const wort of woerter) {
        const chars = wort.split('');
        kuerzel += chars[0];
    }
    return kuerzel;
}

function addParty(name, konto, sitze){
    // || Kuerzelfindung ||
    const kuerzel = findeKuerzel(name);

    // || generate ID ||
    id = kuerzel.toLowerCase() + (getPartyAmounts() + 1);

    //Insert into DB
    return db.addEntry('parteien', {id, name, sitze, kuerzel, konto}).id;
}
function deleteParty(id) {
    db.removeEntry('parteien', {id});
}
function changePartyValue(id, valueName, value) {
    if (valueName === 'name') {
        db.editEntry('parteien', {id, 'name': value});
        db.editEntry('parteien', {id, 'kuerzel': findeKuerzel(value)});
        return;
    }
    db.editEntry('parteien', {id, [valueName]: value});
}
function getPartyID(name){
    return db.getEntry('parteien', 'name', name).id;
}
function getParty(condition){ //{column: value}
    return db.getEntry('parteien', Object.keys(condition)[0], Object.values(condition)[0]);
}
function getAllParties(){
    return db.getAllEntries('parteien');
}

module.exports = {
    addParty,
    deleteParty,
    changePartyValue,
    getPartyID,
    getParty,
    getAllParties
}