const { ApplicationCommandOptionType, MessageFlags} = require('discord.js');
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

        // nur parla-präsi
        if (!interaction.member.roles.cache.has(process.env.PRESIDENT_ID)){
            interaction.editReply({content:'Sie haben nicht die benötigten Berechtigungen', flags: MessageFlags.Ephemeral});
            return;
        }

        // inputs
        const guild = interaction.guild;
        const parla = interaction.options.get('parlament')?.value;
        const isVerfassung = interaction.options.get('gesetz')?.value;

        // kein Parlament
        if (!parla){interaction.editReply({
            content:'Ein Fehler ist bei dem Aufruf zur Abstimmung aufgetreten.'});}

        // get pendingPoll aus DB
        const pendingPoll = db.getEntry('pendingPolls', 'parlament', parla);
        if (!pendingPoll) return interaction.editReply('Kein ausstehender Antrag gefunden.');

        // kanal und nachricht finden
        const channel = guild.channels.cache.get(pendingPoll.channelID);
        const msg = await channel.messages.fetch(pendingPoll.msgID);

        // antragID
        const antragID = pendingPoll.antragID;
        
        // reactions start
        await msg.react('👍');
        await msg.react('👎');
        await msg.react('😐');

        // send reactionmsg
        const msgLink = `https://discord.com/channels/${channel.guild.id}/${channel.id}/${msg.id}`;
        interaction.editReply({content:`Abstimmung zu ${msgLink} gestartet. Bitte stimmen Sie innerhalb 1 Minute ab. @here`});
        
        const filter = (reaction, user) => !user.bot;
        await msg.awaitReactions({ filter, time: 60000 });
        const userVotes = await buildUserVotes(msg);

        // remove rolands vote
        for (const emoji of ['👍', '👎', '😐']) {
            await msg.reactions.cache.get(emoji)?.users.remove(msg.client.user.id);
        }   

        // welches parlament
        let seatCollumn;
        if (parla === 'buergerschaft') {
            seatCollumn = 'sitzeH';
        } else if (parla == 'hanserat') {
            seatCollumn = 'sitze';
        }

        let votesUp = 0;
        let votesDown = 0;
        let totalCountedSeats = 0;

        const allParties = parteienDB.getAllParties();
        const allUsers = usersDB.getAllUsers();

        const partyVotes = {};

        for (const party of allParties) {
            const seats = party[seatCollumn];
            const partyMembers = allUsers.filter(u => u.partei === party.id);
            const chair = db.getCon('users', {'partei': party.id, 'vorsitz': 1});
            const voters =  partyMembers.filter(u => userVotes[u.userID]);

            const chairVoted = chair && userVotes[chair.userID];

            if (chairVoted) { // mebers vote normal, chair gets rest of the votes
                const memberVoters = voters.filter(u => u.userID !== chair.userID);

                const seatsTaken = memberVoters.length;
                const restSeats = Math.max(seats - seatsTaken, 0);

                for (const member of memberVoters) { //member votes
                    const vote = userVotes[member.userID];
                    if (vote === 'up') {
                        votesUp ++;
                        totalCountedSeats ++;
                    } else if (vote === 'down') {
                        votesDown ++;
                        totalCountedSeats ++;
                    }
                }

                const chairVote = userVotes[chair.userID];
                if (chairVote == 'up') { //chair vote
                    votesUp += restSeats;
                    totalCountedSeats += restSeats;
                    partyVotes[party.name] = 'dafür';
                } else if (chairVote == 'down') {
                    votesDown += restSeats;
                    totalCountedSeats += restSeats;
                    partyVotes[party.name] = 'dagegen';
                }


            } else if (voters.length > 0) { //members vote normal, first one gets all the rest
                const primary = voters[0];
                const others = voters.slice(1);

                const seatsTaken = others.length;
                const restSeats = Math.max(seats - seatsTaken, 0);

                for (const member of others) { //member votes
                    const vote = userVotes[member.userID];
                    if (vote === 'up') {
                        votesUp ++;
                        totalCountedSeats ++;
                    } else if (vote === 'down') {
                        votesDown ++;
                        totalCountedSeats ++;
                    }
                }

                const primaryVote = userVotes[primary.userID];
                if (primaryVote == 'up') { //chair vote
                    votesUp += restSeats;
                    totalCountedSeats += restSeats;
                    partyVotes[party.name] = 'dafür';
                } else if (primaryVote == 'down') {
                    votesDown += restSeats;
                    totalCountedSeats += restSeats;
                    partyVotes[party.name] = 'dagegen';
                }


            } else { // if delegate there, he gets all the votes
                const delegate = allUsers.find(
                    u => u.vertretung === party.id && userVotes[u.userID]
                );

                if (delegate) {
                    const delegateVote = userVotes[delegate.userID];

                    // Delegate gets full party seats
                    if (delegateVote === "up") {
                        votesUp += seats;
                        totalCountedSeats += seats;
                        partyVotes[party.name] = 'dafür';
                    } else if (delegateVote === "down") {
                        votesDown += seats;
                        totalCountedSeats += seats;
                        partyVotes[party.name] = 'dagegen';
                    }
                }
            }
        }

        const prozent = (isVerfassung) ? 66 : 50;

        if (((votesUp / totalCountedSeats) * 100) > prozent) {
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

        let text = `\nANTRAG ${pollMenge} von ${userName}: ${antrag.content} => ${acceptedTXT}\n`;

        for (const party in partyVotes){
            text += `${party} => ${partyVotes[party]}\n`;
        }

        fs.appendFileSync(filePath, text, 'utf8');
    }
}

/**
 * Builds a map of user votes based on message reactions
 * @param {Message} msg - The Discord Message with the reactions
 * @returns {Promise<Object>} userVotes - The map of userID => "up" | "down" | "neutral"
 */
async function buildUserVotes(msg) {
    const userVotes = {};

    const checkReactions = [
        { emoji: '👍', value: 'up'},
        { emoji: '👎', value: 'down'},
        { emoji: '😐', value: 'neutral'},
    ];

    for (const {emoji, value} of checkReactions) {
        const reaction = msg.reactions.cache.get(emoji);
        if (!reaction) continue; // no such reaction

        const users = await reaction.users.fetch();

        for (const [id, user] of users) {
            if (user.bot) continue;

            if (!userVotes[id]) userVotes[id] = value;
        }
    }

    return userVotes;
}