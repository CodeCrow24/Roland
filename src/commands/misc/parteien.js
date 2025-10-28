const { EmbedBuilder,  AttachmentBuilder, ApplicationCommandOptionType, MessageFlags} = require('discord.js');
const parteienDB = require('../../utils/dbUtils/parteienDB.js');
const usersDB = require('../../utils/dbUtils/usersDB.js');
const path = require('path');
const fs = require('fs');


module.exports = {
    name: 'parteien',
    description: 'beispiel für formatierte informationen.',
    // devOnly: Boolean,
    // testOnly: Boolean,
    // deleted: Boolean,
    options: [
        {name:'parteikuerzel', description:'Das Parteikuerzel der Partei', type: ApplicationCommandOptionType.String, required: false},
    ],

    callback: (client, interaction) => {
        const parteiKuerzel = interaction.options.get('parteikuerzel')?.value || '404';

        if (interaction.channel.name !== 'bot-cmd') {
            interaction.reply({content:'Dieser Command kann hier nicht genutzt werden', flags: MessageFlags.Ephemeral});
            return;
        }


        if (parteiKuerzel === '404') {
            const parteiFields = []
            const parteien = parteienDB.getAllParties();
            for (const parteiObject of parteien){parteiFields.push({
                name: `${parteiObject.name} [${parteiObject.kuerzel}]`,
                value:`${usersDB.getUser({'id': parteiObject.vorsitz}).name}`})}
            const parteienEmbed = new EmbedBuilder()
                .setTitle("Bremer Parteien")
                .setThumbnail('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGf-X8RpKfCZQbU1rLqjc2vRe_dih2oTHxXQ&s')
                .setColor(0x96324c)
                .addFields(...parteiFields)
                .setFooter({ text:'Quelle: Roland Datenbank', });


            interaction.reply({ embeds: [parteienEmbed]});
            return;}

        
        const partei = parteienDB.getParty({'kuerzel': parteiKuerzel});
        if (!partei) return interaction.reply({ content: 'Partei nicht gefunden', flags: MessageFlags.Ephemeral });

        const logoPath = path.join(__dirname, `../../../assets/${parteiKuerzel}_Logo.png`);
        let logo;
        if (!fs.existsSync(logoPath)) {
            const defaultPath = path.join(__dirname, `../../../assets/404_Logo.png`);
            logo = new AttachmentBuilder(defaultPath, { name: `${parteiKuerzel}_Logo.png` });
        } else {
            logo = new AttachmentBuilder(logoPath, { name: `${parteiKuerzel}_Logo.png` });
        }
        const parteiEmbed = new EmbedBuilder()
            .setTitle(partei.name)
            .setThumbnail(`attachment://${parteiKuerzel}_Logo.png`)
            .setColor(0x96324c)
            .addFields(
                {name: 'Parteivorsitz: ', value: usersDB.getUser({'id': partei.vorsitz}).name || 'Keine Daten', inline: true,},
                {name: 'Sitze: ', value: String(partei.sitze) || 'Keine Daten', inline: true,},
            )
            .setFooter({ text:'Quelle: Roland Datenbank', });
        
        interaction.reply({
            embeds: [parteiEmbed],
            files: [logo]
        });

    },
};