const { ApplicationCommandOptionType, MessageFlags } = require('discord.js');
const logCommand = require('../../utils/writeCmdToLog');

module.exports = {
    name: 'anfrage',
    description: 'erlaubt das anfragen von features für roland.',
    // devOnly: Boolean,
    testOnly: true,
    // deleted: Boolean,
    options: [
        {name:'name', description:'das feature das hinzugefügt werden soll.', type: ApplicationCommandOptionType.String, required: true},
        {name:'beschreibung', description:'beschreiben sie ihr feature', type: ApplicationCommandOptionType.String, required: true},
        {name:'sonstiges', description:'falls ihnen noch etwas einfällt (optionen, besonderheiten, etc...)', type: ApplicationCommandOptionType.String, required: false},
    ],

    callback: (client, interaction) => {
        logCommand(interaction, interaction.options);
        console.log(`logged request via command "${interaction.commandName}"...`);
        interaction.reply({content: 'Ihre Anfrage wurde weitergeleitet.', flags: MessageFlags.Ephemeral,});
    },
};