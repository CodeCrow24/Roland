const { Client, ApplicationCommandOptionType, ChannelType, PermissionFlagsBits, Colors} = require('discord.js');
const parteienDB = require('../../utils/dbUtils/parteienDB.js');
const usersDB = require('../../utils/dbUtils/usersDB.js');
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
async function createRole(client, interaction, name){
    try {
        // Get the color option from the interaction
        let colorInput = interaction.options.get('farbe')?.value;

        // Create the role
        const newRole = await interaction.guild.roles.create({
            name,
            colors: {primaryColor: colorInput},
            reason: 'Neue Partei',
        });

        const allRoles = interaction.guild.roles.cache
            .sort((a, b) => b.position - a.position);

        // Place just below the bot's top role
        const botTopRole = interaction.guild.members.me.roles.highest;
        const desiredPosition = botTopRole.position - 1;

        await newRole.setPosition(desiredPosition);

        console.log(`Created and moved role **${newRole.name}** to position ${desiredPosition}`);
    } catch (error) {
        console.error(error);
    }
}
async function createChannel(client, interaction, name) {
    try {
        const guild = interaction.guild;
        const category = interaction.guild.channels.cache.find(c => c.name === 'journalismus📰' && c.type === 4);

        // Find the role by name
        const roles = await guild.roles.fetch();
        const role = roles.find(r => r.name === name);
        if (!role) {
            return console.log('Parteirolle konnte nicht gefunden werden');
        }

        // Create the channel
        const channel = await guild.channels.create({
            name: `${findeKuerzel(name)}-zeitung📰`,
            type: ChannelType.GuildText,
            parent: category.id,
            topic: `Die Zeitung von ${role.name}.`,
            permissionOverwrites: [
            {
                id: guild.roles.everyone, // @everyone
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.ReadMessageHistory,
                    PermissionFlagsBits.AddReactions
                ],
                deny: [
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.EmbedLinks,
                    PermissionFlagsBits.AttachFiles,
                    PermissionFlagsBits.ManageMessages
                ]
            },
            {
                id: role.id, // the named role
                allow: [
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.EmbedLinks,
                    PermissionFlagsBits.AttachFiles,
                    PermissionFlagsBits.ManageMessages
                ]
            }],
            reason: `Channel created where only ${role.name} can post.`
            });

    } catch (error) {
        console.error(error);
    }
}


module.exports = {
    name: 'partei-hinzufügen',
    description: 'Fügt eine neue Partei hinzu',
    // devOnly: Boolean,
    // testOnly: Boolean,
    // deleted: Boolean,
    options: [
        {name: 'name', description: 'Der Name der neuen Partei', required: true, type: ApplicationCommandOptionType.String},
        {name: 'vorsitz', description: 'Der Name des Parteivorsitzenden', required: true, type: ApplicationCommandOptionType.String},
        {name: 'farbe', description:'Die Farbe der Parteirolle', required: false, type: ApplicationCommandOptionType.String},
        {name: 'sitze', description: 'Die Anzahl Sitze der neuen Partei (Default: 0)', required: false, type: ApplicationCommandOptionType.Number},
        {name: 'konto', description: 'Der Kontostand der neuen Partei (Default 0)', required: false, type: ApplicationCommandOptionType.Number},
    ],

    callback: async (client, interaction) => {
        const parteiName = interaction.options.get('name')?.value || '[FEHLER]';
        const promptVorsitz = interaction.options.get('vorsitz')?.value || '[FEHLER]';
        const parteiSitze = interaction.options.get('sitze')?.value || 0;
        const parteiKonto = interaction.options.get('konto')?.value || 0;
        const vorsitzUser = usersDB.getUser({'name': promptVorsitz});

        await createRole(client, interaction, parteiName);
        createChannel(client, interaction, parteiName);

        const roles = await interaction.guild.roles.fetch();
        const role = roles.find(r => r.name === parteiName);

        const member = await interaction.guild.members.fetch(vorsitzUser.userID);

        await member.roles.add(role);
        
        if (!interaction.member.roles.cache.has(process.env.MASTER_ID) && !interaction.member.roles.cache.has(process.env.SYSADMIN_ID)){
            interaction.reply({content: 'Sie haben nicht die benötigten Berechtigungen', ephemeral: true});
            return;
        }
        if(parteiName === '[FEHLER]' || promptVorsitz === '[FEHLER]'){
            interaction.reply({content: 'Name oder Vorsitz ist nicht korrekt aufgenommen worden. Bitte versuchen sie es später nochmal oder wenden sie sich an ihren Systemadministrator.', ephemeral: true});
            writeToLog({
                position: 'partei-hinzufügen.js',
                error: 'Name oder Vorsitz not found.'
            }, true)
            console.log(`[parteiHinzufügenError] Name: ${parteiName}; Vorsitz: ${promptVorsitz};`)
            return;
        }
        
        if (!vorsitzUser){
            interaction.reply({content: 'Vorsitzender Nutzer nicht gefunden. Überprüfen sie Ihre Rechtschreibung oder versuchen Sie es später erneut.', ephemeral: true});
            return;
        }
        const parteiVorsitz = vorsitzUser.id;

        parteienDB.addParty(parteiName, parteiVorsitz, parteiKonto, parteiSitze);

        console.log(`Partei hinzugefügt: ${parteiName}`);
        interaction.reply(`Partei hinzugefügt: ${parteiName}`);
        writeCmdToLog(interaction);
    }
};