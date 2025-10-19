const { ApplicationCommandOptionType, PermissionFlagsBits, Client, Interaction} = require('discord.js');
const writeToLog = require('../../utils/writeToLog');
const writeCmdToLog = require('../../utils/writeCmdToLog');

module.exports = {
    name: 'ban',
    description: 'bans a member',
    // devOnly: Boolean,
    // testOnly: Boolean,
    deleted: true,
    
    options: [
        {
            name: 'target-user',
            description: 'the user you want to ban',
            required: true,
            type: ApplicationCommandOptionType.Mentionable,
        },
        {
            name: 'reason',
            description: 'the reason for the ban',
            required: true,
            type: ApplicationCommandOptionType.String,
        },

    ],

    permissionsRequired: [PermissionFlagsBits.BanMembers],
    botPermissions: [PermissionFlagsBits.BanMembers],

    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */

    callback: async (client, interaction) => {
        const targetUserId = interaction.options.get('target-user').value;
        const reason = interaction.options.get('reason')?.value || "No reason provided";

        await interaction.deferReply();

        const targetUser = await interaction.guild.members.fetch(targetUserId);

        if (!targetUser){
            await interaction.editReply('This user is not in this server.');
            return;
        }
        if (targetUser.id === interaction.guild.ownerId){
            await interaction.editReply('Cannot ban server owner.');
            return;
        }
        
        const targetUserRolePos = targetUser.roles.highest.position; //highest role of target
        const requestUserRolePos = interaction.member.roles.highest.position; // --|--
        const botRolePos = interaction.guild.members.me.roles.highest.position; // --|--

        if (requestUserRolePos <= targetUserRolePos ){
            await interaction.editReply('Cannot ban user with higher role priviledge.');
            return;
        }
        if (botRolePos <= targetUserRolePos ){
            await interaction.editReply('Roland cannot ban user with higher role priviledge.');
            return;
        }

        //ban target
        try {
            await targetUser.ban({ reason });
            await interaction.editReply(`User ${targetUser.user.tag} was banned\nReason: ${reason}`);
            writeCmdToLog(interaction);
        } catch (error){
            console.log(error);
            writeToLog(error, true);
        }
    },
};