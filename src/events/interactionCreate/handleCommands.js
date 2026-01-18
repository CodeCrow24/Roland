const { devs, testServer} = require('../../../config.json');
const getLocalCommands = require('../../utils/getLocalCommands');
const writeToLog = require('../../utils/writeToLog');
const { MessageFlags } = require('discord.js');

module.exports = async (client, interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.channel.name !== "bot-cmd" && interaction.channel.name !== "parlaments-bot-cmd"){
        interaction.reply({content:'Dies ist kein CMD Kanal und kann daher können hier keine Commands ausgeführt werden.', flags:MessageFlags.Ephemeral})
        return;
    }
    const localCommands = getLocalCommands();

    try {
        const commandObject = localCommands.find(
            (cmd) => cmd.name === interaction.commandName
        );

        if (!commandObject) return;

        if (commandObject.devOnly) {
            if (!devs.includes(interaction.member.id)) {
                interaction.reply({
                    content: 'Only devs can use this command.',
                    ephemeral: true,
                });
                return;
            }
        }

        if (commandObject.testOnly) {
            if (!interaction.guild.id === testServer) {
                interaction.reply({
                    content: 'This command cannot be used here.',
                    ephemeral: true,
                });
                return;
            }
        }

        if (commandObject.permissionsRequired?.length) {
            for (const permission of commandObject.permissionsRequired) {
                if (!interaction.member.permissions.has(permission)) {
                    interaction.reply({
                        content: 'Not permitted to use command.',
                        ephemeral: true,
                    });
                    return;
                }
            }
        }

        if (commandObject.botPermissions?.length) {
            for (const permission of commandObject.botPermissions) {
                const bot = interaction.guild.members.me;
                if (!bot.permissions.has(permission)) {
                    interaction.reply({
                        content: 'Not permitted to use command.',
                        ephemeral: true,
                    });
                    return;
                }
            }
        }

        await commandObject.callback(client, interaction);

    } catch (error) {
        console.log(`There was an error running a command: ${error}`);
        writeToLog(error, true);
    }

} 
