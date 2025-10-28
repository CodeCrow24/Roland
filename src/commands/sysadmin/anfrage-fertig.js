require('dotenv').config();
const { ApplicationCommandOptionType, MessageFlags} = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'anfrage-fertig',
    description: 'räumt auf',
    devOnly: true,
    testOnly: true,
    // deleted: Boolean,
    options: [
        {name: 'name', type: ApplicationCommandOptionType.String, required: true, description: 'Name der Anfrage'},
        {name: 'nutzer', type: ApplicationCommandOptionType.User, required: true, description: 'Name des Nutzers'},
    ],


    callback: (client, interaction) => {
        const logDir = path.join(__dirname, '..', '..', '..', 'logs');
        const logFile = path.join(logDir, `anfrage-command-log.json`);

        const data = JSON.parse(fs.readFileSync(logFile, 'utf8'));

        const searchName = interaction.options.get('name')?.value || 'nothing';
        
        const user = interaction.options.getUser('nutzer');

        const entry = data.find(item => item.options.name === searchName);

        if (!entry) {    
            interaction.reply({content:'Eintrag nicht gefunden', flags: MessageFlags.Ephemeral});
        }
        
        user.send(`Anfrage fertiggestellt: '${entry.options.name}'.`);

        let newData = JSON.parse(fs.readFileSync(logFile, 'utf8'));
        newData = newData.filter(item => item.options.name !== searchName);
        fs.writeFileSync(logFile, JSON.stringify(newData, null, 2));


        interaction.reply({content:'Eintrag gefunden und entfernt', flags: MessageFlags.Ephemeral});
    },
};