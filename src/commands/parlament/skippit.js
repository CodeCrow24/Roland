const { ApplicationCommandOptionType, MessageFlags } = require('discord.js');
const db = require('../../utils/dbUtils/dbInteract');
const usersDB = require('../../utils/dbUtils/usersDB');
const parteienDB = require('../../utils/dbUtils/parteienDB');
require('dotenv').config();

module.exports = {
    name: 'skippit',
    description: 'skippt einen Antrag',
    // devOnly: Boolean,
    // testOnly: Boolean,
    // deleted: Boolean,
    

    callback: async (client, interaction) => {
        const guild = interaction.guild;
        const userID = interaction.member.id;
        const user = usersDB.getUser({userID}).id;

        await interaction.deferReply({flags: [MessageFlags.Ephemeral]});

        if (!interaction.member.roles.cache.has(process.env.PRESIDENT_ID) && !interaction.member.roles.cache.has(process.env.SEMIPRESI_ID)){
            interaction.editReply({content:'Sie haben nicht die benötigten Berechtigungen'});
            return;
        }

        if (interaction.channel.name != 'parlaments-bot-cmd'){
            interaction.editReply({content: 'Ein Fehler ist aufgetreten.', flags: MessageFlags.Ephemeral});
            console.log('Ein Fehler ist beim Erstellen eines Antrags aufgetreten. [Wrong Channel]');
        }

        let channel = guild.channels.cache.get(process.env.POLLSA_ID);

        // get pendingPoll aus DB
        const pendingPolls = db.getAllEntries('pendingPolls');
        let i = 0;
        for (poll of pendingPolls){
            if (i == 0) {
                i = poll.pos;
            } else if (i > poll.pos) {
                i = poll.pos;
            }
        }
        
        const pendingPoll = db.getEntry('pendingPolls', 'pos', i);
        if (!pendingPoll) return interaction.editReply({content:'Kein ausstehender Antrag gefunden.'});
        const pendingI = pendingPoll.pos;

        const nextPoll = db.getEntry('pendingPolls', 'pos', i + 1);
        if (!nextPoll) return interaction.editReply({content:'Kein zweiter ausstehender Antrag gefunden.'});
        const nextI = nextPoll.pos;

        await db.editEntry('pendingPolls', {
            'msgID': pendingPoll.msgID,
            'pos': nextI
        });
        await db.editEntry('pendingPolls', {
            'msgID': nextPoll.msgID,
            'pos': pendingI
        });

        interaction.editReply({content:'Antrag wird übersprungen.'});

    },
};