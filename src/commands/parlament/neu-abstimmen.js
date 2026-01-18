const { ApplicationCommandOptionType, AttachmentBuilder, Guild, MessageFlags} = require('discord.js');
const writeCmdToLog = require('../../utils/writeCmdToLog');
require('dotenv').config();

module.exports = {
    name: 'neu-abstimmen',
    description: 'Stimmt über einen Antrag erneut ab.',
    // devOnly: Boolean,
    // testOnly: Boolean,
    //deleted: Boolean,
    //options: [],

    callback: (client, interaction) => {
        interaction.reply({content: 'Diese Command ist noch nicht verfügbar.', flags:MessageFlags.Ephemeral});
    },
};