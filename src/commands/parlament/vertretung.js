const { ApplicationCommandOptionType, AttachmentBuilder, Guild, MessageFlags} = require('discord.js');
const writeCmdToLog = require('../../utils/writeCmdToLog');
require('dotenv').config();

module.exports = {
    name: 'vertretung',
    description: 'Ernennt eine Vertretung, welche mit deinen Stimmen abstimmen kann.',
    // devOnly: Boolean,
    // testOnly: Boolean,
    //deleted: Boolean,
    //options: [],

    callback: (client, interaction) => {
        interaction.reply({content: 'Diese Command ist noch nicht verfügbar.', flags:MessageFlags.Ephemeral});
    },
};