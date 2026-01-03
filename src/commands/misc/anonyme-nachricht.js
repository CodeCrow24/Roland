const { ApplicationCommandOptionType, AttachmentBuilder, Guild, MessageFlags} = require('discord.js');
const writeCmdToLog = require('../../utils/writeCmdToLog');
require('dotenv').config();

module.exports = {
    name: 'anon-nachricht',
    description: 'Sended eine Nachricht ohne deine Identität zu enthüllen.',
    // devOnly: Boolean,
    // testOnly: Boolean,
    //deleted: Boolean,
    options: [
        {name:'nachricht', description:'Der Inhalt der Nachricht', type: ApplicationCommandOptionType.String, required: true},
        {name:'anhang', description:'Der Anhang der Nachricht (falls notwendig)', type: ApplicationCommandOptionType.Attachment, required: false},
    ],

    callback: (client, interaction) => {
        const msg = interaction.options.get('nachricht')?.value || '[FEHLER]';
        const anhang = interaction.options.getAttachment('anhang');
        const channel = interaction.guild.channels.cache.get(process.env.ANONCHANNEL_ID);
        
        if (!anhang){
            channel.send(msg);
        }else{
            const file = new AttachmentBuilder(anhang.url);
            channel.send({content:msg, files: [file]});
        }


        interaction.reply({content:'Anonym gesendet.', flags: MessageFlags.Ephemeral});
        writeCmdToLog(interaction);
        console.log(interaction);
    },
};