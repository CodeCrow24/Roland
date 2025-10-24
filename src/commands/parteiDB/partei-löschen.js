const { ApplicationCommandOptionType } = require('discord.js');
const parteienDB = require('../../utils/dbUtils/parteienDB.js');
const writeToLog = require('../../utils/writeToLog.js');
const writeCmdToLog = require('../../utils/writeCmdToLog.js');
require('dotenv').config();

module.exports = {
    name: 'partei-löschen',
    description: 'Löscht eine Partei',
    // devOnly: Boolean,
    // testOnly: Boolean,
    // deleted: Boolean,
    options: [
            {name: 'name', description: 'Der Name der Partei', required: true, type: ApplicationCommandOptionType.String}
        ],

    callback: (client, interaction) => {
        const parteiName = interaction.options.get('name')?.value || '[FEHLER]';
        
        if (!interaction.member.roles.cache.has(process.env.MASTER_ID)){
            interaction.reply({content:'Sie haben nicht die benötigten Berechtigungen', ephemeral: true});
            return;
        }
        if(parteiName === '[FEHLER]'){
            interaction.reply({content:'Name ist nicht korrekt aufgenommen worden. Bitte versuchen sie es später nochmal oder wenden sie sich an ihren Systemadministrator.', ephemeral: true});
            writeToLog({
                position: 'partei-löschen.js',
                error: 'Name not found.'
            }, true)
            console.log(`[parteiLöschenError] Name: ${parteiName}`)
            return;
        }

        const parteiID = parteienDB.getPartyID(parteiName);
        if (!parteiID) {
            interaction.reply({content: 'Partei nicht gefunden. Überprüfen sie Ihre Rechtschreibung oder versuchen Sie es später erneut.', ephemeral: true});
            return;
        }
        parteienDB.deleteParty(parteiID);

        console.log(`Partei gelöscht: ${parteiName}`);
        interaction.reply(`Partei gelöscht: ${parteiName}`);
        writeCmdToLog(interaction);
    },
};