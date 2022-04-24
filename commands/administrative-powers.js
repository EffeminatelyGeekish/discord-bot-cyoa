/**
 * NAME: util-admin-powers.js
 * DESC: Command and sub-commands to allow mods and admins to have higher powers than most other users.
 * 
 * COMMANDS INCLUDED:
 * - admin resetdata = Resets every users current progress within the server
 * - admin serverstats = Displays the statistics of every user 
 */
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Formatters, Collection, Permissions } = require('discord.js');
const Sequelize = require('sequelize');
const { Op } = require('sequelize');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription('Commands to reset and display data from the current adventure.')
    .addSubcommand(subcommand => subcommand
        .setName('resetdata')
        .setDescription('Resets the progression of everyone who exists in the server.'))
    .addSubcommand(subcommand => subcommand
        .setName('serverstats')
        .setDescription('Displays statistics of everyone who has taken part in the adventure.'))
    .addSubcommand(subcommand => subcommand
        .setName('userstats')
        .setDescription('Displays statistics of the user selected.')
        .addStringOption(option => option.setName('username').setDescription('Username of the person you wish to look up the stats of.'))
        .addStringOption(option => option.setName('userid').setDescription('User ID of the person you wish to look up the stats of.'))),

    async execute(interaction) {
        // Check if the user has the correct permissions to use these commands. If they don't, then respond appropriately
        if (!interaction.member.roles.cache.some(role => (role.name === 'Mod' || role.name === 'Administrator'))) {
            return await interaction.reply({ content: Formatters.codeBlock(`You do not have the appropriate permissions to use these commands.`), ephemeral: true});
        }

        // Create the database connection information
        const sequelize = new Sequelize('database', 'user', 'password', {
            host: 'localhost',
            dialect: 'sqlite',
            logging: false,
            storage: 'database.sqlite',
        });
        const UserDatabase = require(`../models/Tags`)(sequelize);

        switch (interaction.options.getSubcommand()) {
            case 'resetdata' : // Admin powers to reset the current progression data of everyone in the server
                const rowsReturnedReset = await UserDatabase.update({ user_progression_stage: 0, user_progression_history: "0" }, { where: { user_progression_stage: {[Op.ne]: 0}}});

                if (rowsReturnedReset > 0) {
                    return await interaction.reply(Formatters.codeBlock(`All user progress has been reset to page 0 of their adventure.`));
                }
                break;

            case 'serverstats' : // Admin powers to look up the stats of everyone in the server
                const rowsReturnedStats = await UserDatabase.findAll({  attributes: ['user_name', 'user_progression_stage', 'user_completed_adventures'] });

                return interaction.reply(
                    Formatters.codeBlock(
                        rowsReturnedStats.sort((a, b) => b.user_progression_stage - a.user_progression_stage)
                            .map((rowsReturnedStats, position) => `(${position + 1}) ${rowsReturnedStats.user_name} - Current Page: ${rowsReturnedStats.user_progression_stage} | Completed Adventures: ${rowsReturnedStats.user_completed_adventures}`)
                            .join('\n'),
                    )
                );

            case 'userstats' : // Admin powers to look up the stats of a particular individual (either by username or by user ID)
                const lookupUsername = interaction.options.getString('username');
                const lookupUserID = interaction.options.getString('userid');
                const rowsReturnedUserStats = await UserDatabase.findOne({ where: { [Op.or]: [{user_name: lookupUsername}, {user_id: lookupUserID}]}});

                if (rowsReturnedUserStats === null) {
                    return await interaction.reply(Formatters.codeBlock(`The user you searched for cannot be found. Have they started their adventure yet with '/create'`));
                } else {
                    return await interaction.reply(Formatters.codeBlock(`${rowsReturnedUserStats.user_name} - Current Page: ${rowsReturnedUserStats.user_progression_stage} | Completed Adventures: ${rowsReturnedUserStats.user_completed_adventures}`));
                }

            default:
                return await interaction.reply(Formatters.codeBlock(`The command entered cannot be found. Please try again.`));
        }
    }
}