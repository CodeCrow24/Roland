const { ApplicationCommandOptionType, MessageFlags} = require('discord.js');
const parteienDB = require('../../utils/dbUtils/parteienDB.js');
const usersDB = require('../../utils/dbUtils/usersDB.js');
const writeToLog = require('../../utils/writeToLog.js');
const writeCmdToLog = require('../../utils/writeCmdToLog.js');

module.exports = {
    name: 'partei-anpassen',
    description: 'Verändert Parteidaten (Parteivorsitz)',
    // devOnly: Boolean,
    // testOnly: Boolean,
    // deleted: Boolean,
    options: [
            {name: 'name', description: 'Der Name der Partei', required: true, type: ApplicationCommandOptionType.String},
            {name: 'wert', description: 'Der Wert der verändert werden soll', choices: [
                {name: 'Name', value: 'name'},
                {name: 'Vorsitz', value: 'vorsitz'}
            ], required: true, type: ApplicationCommandOptionType.String},
            {name: 'wert-neu', description: 'Neuer Wert', required: true, type: ApplicationCommandOptionType.String},
    ],

    callback: (client, interaction) => {
        const parteiName = interaction.options.get('name')?.value || '[FEHLER]';
        const column = interaction.options.get('wert')?.value || '[FEHLER]';
        const valueTemp = interaction.options.get('wert-neu')?.value || '[FEHLER]';
        const vorsitzID = usersDB.getUser({'id': parteienDB.getParty({'name': parteiName}).vorsitz}).userID;

        if (!interaction.member.roles.cache.has(process.env.SYSADMIN_ID) && interaction.member.id !== vorsitzID){
            interaction.reply({content: 'Sie haben nicht die benötigten Berechtigungen', flags: MessageFlags.Ephemeral});
            return;
        }
        if (parteiName === '[Fehler]' ||  column === '[Fehler]' || valueTemp === '[Fehler]'){
            interaction.reply({content: 'Name, Wert oder neuer Wert ist nicht korrekt aufgenommen worden. Bitte versuchen sie es später nochmal oder wenden sie sich an ihren Systemadministrator.', flags: MessageFlags.Ephemeral});
            writeToLog({
                position: 'partei-anpassen.js',
                error: 'name, column or value not found.'
            }, true)
            console.log(`[parteiAnpassenError] Name: ${parteiName}`)
            return;
        }

        let value;
        if (column === 'vorsitz'){
            value = usersDB.getUser({'name': valueTemp}).id;
        } else {
            value = valueTemp;
        }

        const parteiID = parteienDB.getPartyID(parteiName);
        if (!parteiID) {
            interaction.reply({content: 'Partei nicht gefunden. Überprüfen sie Ihre Rechtschreibung oder versuchen Sie es später erneut.', flags: MessageFlags.Ephemeral});
            return;
        }
        parteienDB.changePartyValue(parteiID, column, value);

        console.log(`Wert: ${column} von Partei: ${parteiName} verändert zu '${value}'.`);
        interaction.reply({content: `Wert: ${column} von Partei: ${parteiName} verändert zu '${value}'.`, flags: MessageFlags.Ephemeral});
        writeCmdToLog(interaction);
    },
};