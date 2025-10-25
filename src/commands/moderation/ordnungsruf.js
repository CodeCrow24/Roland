const { ApplicationCommandOptionType, AttachmentBuilder, Guild} = require('discord.js');
const writeCmdToLog = require('../../utils/writeCmdToLog');
const db = require('../../utils/dbUtils/dbInteract');
const usersDB = require('../../utils/dbUtils/usersDB');
const parteienDB = require('../../utils/dbUtils/parteienDB');
require('dotenv').config();

module.exports = {
    name: 'ordnungsruf',
    description: 'Vergibt einen Ordnungsruf',
    // devOnly: Boolean,
    // testOnly: Boolean,
    //deleted: Boolean,
    options: [
        {name:'person', description:'Die Person die einen Ordnungsruf bekommt', type: ApplicationCommandOptionType.User, required: true},
        {name:'grund', description:'Der Grund für den Ordnungsruf', type: ApplicationCommandOptionType.String, required: false},
        {name:'strafe', description:'Die Strafe für den Ordnungsruf', type: ApplicationCommandOptionType.Number, required: false},
    ],

    callback: async (client, interaction) => {
        await interaction.deferReply({ephemeral: true});
        const mentionableUser = interaction.options.getUser('person');
        if (!mentionableUser) return interaction.editReply({content:'Person muss angegeben werden.'});
        const grund = interaction.options.get('grund')?.value || 'Der Grund wurde nicht angegeben.';
        const strafe = interaction.options.get('strafe')?.value || 0;
        const channel = interaction.guild.channels.cache.get(process.env.ORDNUNG_ID);
        const userID = usersDB.getUser({'userID': mentionableUser.id}).id;
        const partei = parteienDB.getParty({'vorsitz': userID});
        //const member = await interaction.guild.members.fetch(mentionableUser.id);

        if (!interaction.member.roles.cache.has(process.env.PRESIDENT_ID)){
            interaction.reply({content:'Sie haben nicht die benötigten Berechtigungen', ephemeral: true});
            return;
        }

        parteienDB.changePartyValue(partei.id, 'konto', partei.konto - strafe);

        db.addEntry('ordnungsrufe', {userID, strafe, grund});

        const ordnungsrufIndex = db.getAllSpez('ordnungsrufe', 'userID', userID).length;

        channel.send(`**Ordnungsruf ${ordnungsrufIndex})** [ <@${mentionableUser.id}> ]\n  Grund: ${grund}\n  Strafe: ${strafe}€`);

        interaction.editReply({content:'Ordnungsruf vergeben.'});

    },
};