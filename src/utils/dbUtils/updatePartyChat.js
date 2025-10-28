const { Client, AttachmentBuilder, EmbedBuilder} = require('discord.js');
const db = require('./dbInteract');
const log = require('../writeToLog');
const parteienDB = require('./parteienDB');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

module.exports = async (client, guild) => {
    const channelName = 'parteien';
    const categoryName = 'Informationen📣';

    const channels = await guild.channels.fetch();

    const category = channels.find( // find info category
        (ch) => ch.type === 4 && ch.name.toLowerCase() === categoryName.toLowerCase()
    );
    if (!category) {
        console.log(`Category "${categoryName}" not found.`);
        return;
    }
    const usedChannel = channels.find( // find old 'parteien' channel
    (ch) =>
        ch.name.toLowerCase() === channelName.toLowerCase() &&
        ch.parentId === category.id
    );

    const channel = await usedChannel.clone();
    await usedChannel.delete();

    const parteiFields = []
    const parteien = parteienDB.getAllParties();

    for (const parteiObject of parteien){parteiFields.push({
        name: `${parteiObject.name} [${parteiObject.kuerzel}]`,
        value:`${parteiObject.konto}€`})}

    const logoPath = path.join(__dirname, `../../../assets/bremenFlag.png`);
    const logo = new AttachmentBuilder(logoPath, { name: `bremenFlag.png` });

    const parteienEmbed = new EmbedBuilder()
        .setTitle("Bremer Parteien")
        .setThumbnail('attachment://bremenFlag.png')
        .setColor(0xdd0000)
        .addFields(...parteiFields)
        .setFooter({ text:'Quelle: Roland Datenbank', });

    channel.send({ embeds: [parteienEmbed], files: [logo]});
    log('Parteienkanal aktualisiert...', false);
}