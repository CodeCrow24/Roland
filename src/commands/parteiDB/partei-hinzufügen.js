const { ApplicationCommandOptionType } = require('discord.js');
const parteienDB = require('../../utils/dbUtils/parteienDB.js');
const writeToLog = require('../../utils/writeToLog.js');
const writeCmdToLog = require('../../utils/writeCmdToLog.js');
require('dotenv').config();

module.exports = {
    name: 'partei-hinzufügen',
    description: 'Fügt eine neue Partei hinzu',
    // devOnly: Boolean,
    // testOnly: Boolean,
    // deleted: Boolean,
    options: [
        {name: 'name', description: 'Der Name der neuen Partei', required: true, type: ApplicationCommandOptionType.String},
        {name: 'vorsitz', description: 'Der Name des Parteivorsitzenden', required: true, type: ApplicationCommandOptionType.String},
        {name: 'sitze', description: 'Die Anzahl Sitze der neuen Partei (Default: 0)', required: false, type: ApplicationCommandOptionType.Number},
        {name: 'konto', description: 'Der Kontostand der neuen Partei (Default 0)', required: false, type: ApplicationCommandOptionType.Number},
    ],

    callback: (client, interaction) => {
        const parteiName = interaction.options.get('name')?.value || '[FEHLER]';
        const promptVorsitz = interaction.options.get('vorsitz')?.value || '[FEHLER]';
        const parteiSitze = interaction.options.get('sitze')?.value || 0;
        const parteiKonto = interaction.options.get('konto')?.value || 0;

        
        if (!interaction.member.roles.cache.has(process.env.MASTER_ID)){
            interaction.reply({content: 'Sie haben nicht die benötigten Berechtigungen', ephemeral: true});
            return;
        }
        if(parteiName === '[FEHLER]' || parteiVorsitz === '[FEHLER]'){
            interaction.reply({content: 'Name oder Vorsitz ist nicht korrekt aufgenommen worden. Bitte versuchen sie es später nochmal oder wenden sie sich an ihren Systemadministrator.', ephemeral: true});
            writeToLog({
                position: 'partei-hinzufügen.js',
                error: 'Name oder Vorsitz not found.'
            }, true)
            console.log(`[parteiHinzufügenError] Name: ${parteiName}; Vorsitz: ${parteiVorsitz};`)
            return;
        }
        const parteiVorsitz = usersDB.getUser({'name': promptVorsitz}).id;

        parteienDB.addParty(parteiName, parteiVorsitz, parteiKonto, parteiSitze);

        console.log(`Partei hinzugefügt: ${parteiName}`);
        interaction.reply(`Partei hinzugefügt: ${parteiName}`);
        writeCmdToLog(interaction);
    }
};