const db = require('./dbInteract');

function getUserAmounts(){//calculate amount of Users in db
    const users = db.getAllEntries('users');
    let highest = -Infinity;

    for (const user of users) {
        const match = user.id.match(/\d+$/); // regex: one or more digits at the end

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
    const woerter = name.split(' ');
    let kuerzel = '';
    for(const wort of woerter) {
        const chars = wort.split('');
        kuerzel += chars[0];
    }
    return kuerzel;
}

// <|| EXPORT FUNCTIONS ||>


function addUser(name, userID, partei){
    // || Kuerzelfindung ||
    const kuerzel = findeKuerzel(name);

    // || generate ID ||
    id = kuerzel.toLowerCase() + (getUserAmounts() + 1);

    //Insert into DB
    db.addEntry('users', {id, name, userID, partei});
}
function deleteUser(id) {
    db.removeEntry('users', {id});
}
function getUserID(name){
    return db.getEntry('users', 'name', name).id;
}
function getUser(condition){
    return db.getEntry('users', Object.keys(condition)[0], Object.values(condition)[0]);
}
function getAllUsers(){
    return db.getAllEntries('users');
}

module.exports = {
    addUser,
    deleteUser,
    getUserID,
    getUser,
    getAllUsers
}