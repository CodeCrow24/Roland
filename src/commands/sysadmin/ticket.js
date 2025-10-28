const { ApplicationCommandOptionType } = require('discord.js');
const logCommand = require('../../utils/writeCmdToLog');

module.exports = {
    name: 'ticket',
    description: 'Erlaubt das Stellen eines Tickets bei Technikfehlern',
    // devOnly: Boolean,
    testOnly: true,
    // deleted: Boolean,
    options: [
        {name:'problem', description:'das Problem welches Ihnen begegnet', type: ApplicationCommandOptionType.String, required: true},
        {name:'beschreibung', description:'beschreiben sie Ihr Problem', type: ApplicationCommandOptionType.String, required: true},
        {name:'sonstiges', description:'falls ihnen noch etwas einfällt (wie und wann es Aáuftritt, besonderheiten, etc...)', type: ApplicationCommandOptionType.String, required: false},
    ],

    callback: (client, interaction) => {
        logCommand(interaction, interaction.options);
        console.log(`logged problem via command "${interaction.commandName}"...`);
        interaction.reply({content: 'Ihre Problem wurde weitergeleitet.', ephemeral: true,});
    },
};