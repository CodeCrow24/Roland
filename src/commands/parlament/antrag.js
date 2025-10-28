const { ApplicationCommandOptionType, MessageFlags } = require('discord.js');
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
            name: 'inhalt',
            description: 'Der Antrag selbst',
            type: ApplicationCommandOptionType.String,
            required: true,
        }
    ],

    callback: async (client, interaction) => {
        const parla = interaction.options.get('parlament')?.value || 'err';
        const content = interaction.options.get('inhalt')?.value || 'err';
        const guild = interaction.guild;
        const userID = interaction.member.id;
        const user = usersDB.getUser({userID}).id;

        await interaction.deferReply();

        if (parla === 'err' || content === 'err' || interaction.channel.name != 'parlaments-bot-cmd'){
            interaction.editReply({content: 'Ein Fehler ist aufgetreten.', flags: MessageFlags.Ephemeral});
            console.log('Ein Fehler ist beim Erstellen eines Antrags aufgetreten.');
        }

        const antragID = db.addEntry('antraege', {content, 'parlament': parla, user});

        let channel;
        switch (parla) {
            case 'buergerschaft':
                channel = guild.channels.cache.get(process.env.POLLSA_ID);
                break;
            case 'hanserat':
                channel = guild.channels.cache.get(process.env.POLLSB_ID);
                break;

        }

        const entries = db.getAllSpez('antraege', 'parlament', [parla]);
        const pollMenge = Array.isArray(entries) ? entries.length : 0;


        const msg = await channel.send(`**Antrag ${pollMenge} von ${interaction.member.displayName}:** ${content}`);
        interaction.editReply({content:'Antrag gesended. Warte auf den Aufruf zur Abstimmung...'});

        db.addEntry('pendingPolls', {
            msgId: msg.id,
            channelId: channel.id,
            parlament: parla,
            user,
            antragID
        });
    },
};