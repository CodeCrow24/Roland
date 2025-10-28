const { ApplicationCommandOptionType, MessageFlags } = require('discord.js');
const usersDB = require('../../utils/dbUtils/usersDB.js');
const writeToLog = require('../../utils/writeToLog.js');
const writeCmdToLog = require('../../utils/writeCmdToLog.js');
require('dotenv').config();

module.exports = {
    name: 'user-löschen',
    description: 'Löscht einen User',
    // devOnly: Boolean,
    // testOnly: Boolean,
    // deleted: Boolean,
    options: [
            {name: 'name', description: 'Der Name des Users', required: true, type: ApplicationCommandOptionType.String}
        ],

    callback: (client, interaction) => {
        const userName = interaction.options.get('name')?.value || '[FEHLER]';
        
        if (!interaction.member.roles.cache.has(process.env.SYSADMIN_ID)){
            interaction.reply({content:'Sie haben nicht die benötigten Berechtigungen', flags: MessageFlags.Ephemeral});
            return;
        }
        if(userName === '[FEHLER]'){
            interaction.reply({content:'Name ist nicht korrekt aufgenommen worden.', flags: MessageFlags.Ephemeral});
            writeToLog({
                position: 'user-löschen.js',
                error: 'Name not found.'
            }, true)
            console.log(`[userLöschenError] Name: ${userName}`)
            return;
        }

        const userID = usersDB.getUserID(userName);
        if (!userID) {
            interaction.reply({content: 'Nutzer nicht gefunden. Überprüfen sie Ihre Rechtschreibung oder versuchen Sie es später erneut.', flags: MessageFlags.Ephemeral});
            return;
        }
        usersDB.deleteUser(userID);

        console.log(`User gelöscht: ${userName}`);
        interaction.reply({content: `User gelöscht: ${userName}`, flags: MessageFlags.Ephemeral});
        writeCmdToLog(interaction);
    },
};