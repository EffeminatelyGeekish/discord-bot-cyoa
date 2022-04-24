/**
 * NAME: adventure-restart.js
 * DESC: Resets the user progression value to 0, allowing them to start the adventure from the first entry
 */
const {SlashCommandBuilder} = require('@discordjs/builders');
const { Formatters } = require('discord.js');
const Sequelize = require('sequelize');

module.exports = {
    data : new SlashCommandBuilder()
        .setName('restart')
        .setDescription('Restart the current adventure! ***WARNING: THIS WILL RESET YOUR CURRENT ADVENTURE PROGRESS!***')
        .addStringOption(option => option.setName('confirmation').setDescription('Enter your username if you wish to reset your progress! ***NOTE*** This is case-sensitive.').setRequired(true)),

    async execute(interaction) {
        // Create the connection information for the database
        const sequelize = new Sequelize('database', 'user', 'password', {
            host: 'localhost',
            dialect: 'sqlite',
            logging: false,
            storage: 'database.sqlite',
        });
        const UsersDatabase = require(`../models/Tags`)(sequelize);
        
        // Search for the user. If the user does not exist, then they don't need to reset their progress
        const userFound = await UsersDatabase.findOne({ where: { user_id: interaction.user.id, user_name: interaction.user.username }});
        if (!userFound) {
            return await interaction.reply({ content: Formatters.codeBlock(`No progress currently exists for ${interaction.user.username}. Please use '/create' to create your character profile.`), ephemeral: true });
        }

        // Update the users progress back to current stage back to the first stage of their adventure
        const confirmationCode = interaction.options.getString('confirmation');
        if (confirmationCode === interaction.user.username) {
            const updatedRows = await UsersDatabase.update({ user_progression_stage: 0, user_progression_history: "0"},{ where: { user_id: interaction.user.id, user_name: interaction.user.username }});
            if (updatedRows > 0) {
               return await interaction.reply({ content: Formatters.codeBlock(`Your progress has been reset. Please use '/continue' to start your adventure once more.`), ephemeral: true });
            }
        } else {
            return await interaction.reply ({ content: Formatters.codeBlock(`The confirmation text you entered does not match the correct confirmation code. Progress has not been reset.`), ephemeral: true });
        }
    }
}