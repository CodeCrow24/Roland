const { ApplicationCommandOptionType, MessageFlags, AttachmentBuilder } = require('discord.js');
const db = require('../../utils/dbUtils/dbInteract');
const usersDB = require('../../utils/dbUtils/usersDB');
const parteienDB = require('../../utils/dbUtils/parteienDB');
require('dotenv').config();

module.exports = {
    name: 'antrag',
    description: 'stellt einen Antrag',
    // devOnly: Boolean,
    // testOnly: Boolean,
    // deleted: Boolean,
    options: [
        {
            name: 'inhalt',
            description: 'Der Antrag selbst',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name:'anhang', 
            description:'Der Anhang der Nachricht (falls notwendig)', 
            type: ApplicationCommandOptionType.Attachment, 
            required: false
        }
    ],

    callback: async (client, interaction) => {
        const content = interaction.options.get('inhalt')?.value || 'err';
        const guild = interaction.guild;
        const userID = interaction.member.id;
        const user = usersDB.getUser({userID}).id;
        const anhang = interaction.options.getAttachment('anhang');

        await interaction.deferReply();

        if (content === 'err' || interaction.channel.name != 'parlaments-bot-cmd'){
            interaction.editReply({content: 'Ein Fehler ist aufgetreten.', flags: MessageFlags.Ephemeral});
            console.log('Ein Fehler ist beim Erstellen eines Antrags aufgetreten.');
        }

        const antragID = db.addEntry('antraege', {content, user});

        let channel = guild.channels.cache.get(process.env.POLLSA_ID);

        const entries = db.getAllEntries('antraege');
        const pollMenge = Array.isArray(entries) ? entries.length : 0;


        const msgContent = `**Antrag ${pollMenge} von ${interaction.member.displayName}:** ${content}`;
        interaction.editReply({content:'Antrag gesended. Warte auf den Aufruf zur Abstimmung...'});

        let msg;
        if (!anhang){
            msg = await channel.send(msgContent);
        }else{
            const file = new AttachmentBuilder(anhang.url);
            msg = await channel.send({content:msgContent, files: [file]})
        }

        const pendingPolls = db.getAllEntries('pendingPolls');
        let highestPending = 0;
        for (poll of pendingPolls){
            if (highestPending < poll.pos){highestPending = poll.pos}
        }

        const thisI = highestPending + 1;

        await db.addEntry('pendingPolls', {
            msgId: msg.id,
            channelId: channel.id,
            user,
            antragID,
            pos: thisI,
        });
    },
};