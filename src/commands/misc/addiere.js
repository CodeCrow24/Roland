const { ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: 'addiere',
    description: 'beispiel für command optionen.',
    // devOnly: Boolean,
    // testOnly: Boolean,
    deleted: true,
    options: [
        {name:'first-number', description:'erste zahl', choices:[
            {name:'1', value:1},{name:'2', value:2},{name:'3', value:3},{name:'4', value:4},{name:'5', value:5}
        ], type: ApplicationCommandOptionType.Number, required: true},
        {name:'second-number', description:'zweite zahl', type: ApplicationCommandOptionType.Number, required: true},
    ],

    callback: (client, interaction) => {
        const num1 = interaction.options.get('first-number').value;
        const num2 = interaction.options.get('second-number').value;
        interaction.reply(`${num1+num2}`)
    },
};