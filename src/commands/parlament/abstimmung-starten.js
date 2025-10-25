const { ApplicationCommandOptionType } = require('discord.js');
const db = require('../../utils/dbUtils/dbInteract');
const usersDB = require('../../utils/dbUtils/usersDB');
const parteienDB = require('../../utils/dbUtils/parteienDB');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

module.exports = {
    name: 'abstimmung-starten',
    description: 'beginnt die abstimmung',
    // devOnly: Boolean,
    // testOnly: Boolean,
    // deleted: Boolean,
    options: [
        {
            name: 'parlament',
            description: 'Das Parlament in welches der Antrag gestellt werden soll.',
            type: ApplicationCommandOptionType.String,
            choices: [
                {name: 'Bürgerschaft', value: 'buergerschaft'},
                {name: 'Hanserat', value: 'hanserat'},
            ],
            required: true,
        },
        {
            name: 'verfassungsänderung',
            description: 'Ob der Antrag eine Verfassungsänderung ist.',
            type: ApplicationCommandOptionType.String,
            required: false,
        },
    ],

    callback: async (client, interaction) => {
        await interaction.deferReply();

        if (!interaction.member.roles.cache.has(process.env.PRESIDENT_ID)){
            interaction.editReply({content:'Sie haben nicht die benötigten Berechtigungen', ephemeral: true});
            return;
        }

        const guild = interaction.guild;
        const parla = interaction.options.get('parlament')?.value;
        const isVerfassung = interaction.options.get('gesetz')?.value;
        if (!parla){interaction.editReply({content:'Ein Fehler ist bei dem Aufruf zur Abstimmung aufgetreten.'});}

        const pendingPoll = db.getEntry('pendingPolls', 'parlament', parla);
        if (!pendingPoll) return interaction.editReply('Kein ausstehender Antrag gefunden.');

        const channel = guild.channels.cache.get(pendingPoll.channelID);
        const msg = await channel.messages.fetch(pendingPoll.msgID);

        const antragID = pendingPoll.antragID;
        
        await msg.react('👍');
        await msg.react('👎');
        await msg.react('😐');

        const msgLink = `https://discord.com/channels/${channel.guild.id}/${channel.id}/${msg.id}`;
        interaction.editReply({content:`Abstimmung zu ${msgLink} gestartet. Bitte stimmen Sie innerhalb 1 Minute ab. @here`});

        const filter = (reaction, user) => !user.bot;

        const collected = await msg.awaitReactions({ filter, time: 60000 });


        const thumbsUpReaction = collected.get("👍");
        const thumbsDownReaction = collected.get("👎");

        const thumbsUpUsers = thumbsUpReaction 
            ? Array.from((await thumbsUpReaction.users.fetch()).values()).filter(u => !u.bot)
            : [];
        const thumbsDownUsers = thumbsDownReaction 
            ? Array.from((await thumbsDownReaction.users.fetch()).values()).filter(u => !u.bot)
            : [];

        const allUsers = thumbsUpUsers.concat(thumbsDownUsers);

        for (const emoji of ['👍', '👎', '😐']) {
            await msg.reactions.cache.get(emoji)?.users.remove(msg.client.user.id);
        }       

        let totalVotes = 0;
        for (const user of allUsers) {
            totalVotes += parteienDB.getParty({'vorsitz': usersDB.getUser({'userID': user.id}).id}).sitze || 0;
        }

        let votesUp = 0;
        for (const user of thumbsUpUsers) {votesUp += parteienDB.getParty({'vorsitz': usersDB.getUser({'userID': user.id}).id}).sitze;}

        const prozent = (isVerfassung) ? 66 : 50;

        if (((votesUp / totalVotes) * 100) > prozent) {
            msg.react('✅');
            db.editEntry('antraege', {'id': antragID, 'accepted': 1});
        } else {
            msg.react('❌');
        }

        db.removeEntry('pendingPolls', {'msgID':pendingPoll.msgID});

        //PROTOKOLL

        const filePath = path.join(__dirname, '..', '..', '..', 'logs', `${parla}-protokoll.txt`);

        const antrag = db.getEntry('antraege', 'id', antragID);

        const acceptedTXT = (antrag.accepted === 1) ? 'Angenommen' : 'Abgelehnt';
        const userName = usersDB.getUser({'id': antrag.user}).name;
        const entries = db.getAllSpez('antraege', 'parlament', [parla]);
        const pollMenge = Array.isArray(entries) ? entries.length : 0;

        const text = `ANTRAG ${pollMenge} von ${userName}: ${antrag.content} => ${acceptedTXT}\n\n`;

        fs.appendFileSync(filePath, text, 'utf8');

    }
}