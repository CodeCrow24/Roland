const { ApplicationCommandOptionType } = require('discord.js');
const parteienDB = require('../../utils/dbUtils/parteienDB.js');
const writeToLog = require('../../utils/writeToLog.js');
const writeCmdToLog = require('../../utils/writeCmdToLog.js');
require('dotenv').config();
function findeKuerzel(name){
    const woerter = name.split(/[ -]/);
    let kuerzel = '';
    for(const wort of woerter) {
        const chars = wort.split('');
        kuerzel += chars[0];
    }
    return kuerzel.toLowerCase();
}
async function removeRole(client, interaction, name){
    try {
        // Fetch the guild from the interaction
        const guild = interaction.guild;
        if (!guild) return;

        // Find the role by name
        const role = guild.roles.cache.find(r => r.name === name);
        if (!role) return;

        // Delete the role
        await role.delete('Role removal requested');
    } catch (error) {
        console.error(error);
    }
}
async function removeChannel(client, interaction, name) {
    try {
        const guild = interaction.guild;
        if (!guild) return;

        // Find the category first
        const category = guild.channels.cache.find(c => c.name === 'journalismus📰' && c.type === 4); // type 4 = CategoryChannel in v14
            if (!category) return;

        // Construct the channel name
        const channelName = `${findeKuerzel(name)}-zeitung📰`;

        // Find the channel in the category
        const channel = guild.channels.cache.find(
            c => c.parentId === category.id && c.name === channelName
        );
        if (!channel) return;

        // Delete the channel
        await channel.delete('Channel removal requested');
    } catch (error) {
        console.error(error);
    }
}
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
        
        if (!interaction.member.roles.cache.has(process.env.MASTER_ID) && !interaction.member.roles.cache.has(process.env.SYSADMIN_ID)){
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
        removeChannel(client, interaction, parteiName);
        removeRole(client, interaction, parteiName);

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