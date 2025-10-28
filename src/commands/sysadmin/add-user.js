const { ApplicationCommandOptionType, MessageFlags} = require('discord.js');
const usersDB = require('../../utils/dbUtils/usersDB');
const parteienDB = require('../../utils/dbUtils/parteienDB');
const writeToLog = require('../../utils/writeToLog');
const writeCmdToLog = require('../../utils/writeCmdToLog');
require('dotenv').config();

module.exports = {
    name: 'user-hinzufügen',
    description: 'Fügt einen neuen User hinzu',
    // devOnly: Boolean,
    // testOnly: Boolean,
    // deleted: Boolean,
    options: [
        {name: 'name', description: 'Der Name des neuen Users', required: true, type: ApplicationCommandOptionType.String},
        {name: 'user-id', description: 'Die Discord-UserID des neuen Users', required: true, type: ApplicationCommandOptionType.String},
        {name: 'partei', description: 'Die Parteikürzel falls in einer Partei', required: false, type: ApplicationCommandOptionType.String},
    ],

    callback: (client, interaction) => {
        const userName = interaction.options.get('name')?.value || '[FEHLER]';
        const userID = interaction.options.get('user-id')?.value || '[FEHLER]';
        const partei = parteienDB.getParty({'kuerzel': interaction.options.get('partei')?.value || 'NEP'}).id || null;
        
        if (!interaction.member.roles.cache.has(process.env.SYSADMIN_ID)){
            interaction.reply({content:'Sie haben nicht die benötigten Berechtigungen', flags: MessageFlags.Ephemeral});
            return;
        }
        if(userName === '[FEHLER]' || userID === '[FEHLER]'){
            interaction.reply({content:'Name oder UserID ist nicht korrekt aufgenommen worden.', flags: MessageFlags.Ephemeral});
            writeToLog({
                position: 'add-user.js',
                error: 'Name oder UserID not found.'
            }, true)
            console.log(`[userHinzufügenError] Name: ${userName}; UserID: ${userID};`)
            return;
        }

        usersDB.addUser(userName, userID, partei);

        console.log(`User hinzugefügt: ${userName}`);
        interaction.reply({content:`User hinzugefügt: ${userName}`, flags: MessageFlags.Ephemeral});
        writeCmdToLog(interaction);
    }
};