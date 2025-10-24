const { ApplicationCommandOptionType, Client, Interaction} = require('discord.js');
const parteienDB = require('../../utils/dbUtils/parteienDB.js');
const writeToLog = require('../../utils/writeToLog.js');
const writeCmdToLog = require('../../utils/writeCmdToLog.js');
require('dotenv').config();

module.exports = {
    name: 'partei-werte',
    description: 'Verändert Parteiwerte (Wahlleiter)',
    // devOnly: Boolean,
    // testOnly: Boolean,
    // deleted: Boolean,
    options: [
            {name: 'name', description: 'Der Name der Partei', required: true, type: ApplicationCommandOptionType.String},
            {name: 'wert', description: 'Der Wert der verändert werden soll', choices: [
                {name: 'Sitze', value: 'sitze'},
                {name: 'Konto', value: 'konto'}
            ], required: true, type: ApplicationCommandOptionType.String},
            {name: 'wert-neu', description: 'Neuer Wert', required: true, type: ApplicationCommandOptionType.String},
    ],

    callback: (client, interaction) => {
        const parteiName = interaction.options.get('name')?.value || '[FEHLER]';
        const column = interaction.options.get('wert')?.value || '[FEHLER]';
        const value = interaction.options.get('wert-neu')?.value || '[FEHLER]';

        
        if (!interaction.member.roles.cache.has(process.env.WAHLROLE_ID)){
            interaction.reply({content:'Sie haben nicht die benötigten Berechtigungen', ephemeral: true});
            return;
        }
        if (parteiName === '[Fehler]' ||  column === '[Fehler]' || value === '[Fehler]'){
            interaction.reply({content:'Name, Wert oder neuer Wert ist nicht korrekt aufgenommen worden. Bitte versuchen sie es später nochmal oder wenden sie sich an ihren Systemadministrator.', ephemeral: true});
            writeToLog({
                position: 'partei-werte.js',
                error: 'name, column or value not found.'
            }, true)
            console.log(`[parteiAnpassenError] Name: ${parteiName}`)
            return;
        }


        const parteiID = parteienDB.getPartyID(parteiName);
        if (!parteiID) {
            interaction.reply({content: 'Partei nicht gefunden. Überprüfen sie Ihre Rechtschreibung oder versuchen Sie es später erneut.', ephemeral: true});
            return;
        }
        console.log(`ID ${parteiID}, Wert: ${column}, neuwert: ${value}`);
        parteienDB.changePartyValue(parteiID, column, value);

        console.log(`Wert: ${column} von Partei: ${parteiName} verändert zu '${value}'.`);
        interaction.reply(`Wert: ${column} von Partei: ${parteiName} verändert zu '${value}'.`);
        writeCmdToLog(interaction);
    },
};