/**
 * NAME: adventure-history.js
 * DESC: Shows the user a complete history of the pages they have gone to, so that they can catch up if needed
 */
const fs = require('node:fs');
const path = require('path');
const {SlashCommandBuilder} = require('@discordjs/builders');
const Sequelize = require('sequelize');
const { MessageActionRow, MessageButton, Formatters } = require('discord.js');

module.exports = {
    data : new SlashCommandBuilder()
        .setName('history')
        .setDescription('Shows you the last five stages of your current adventure.'),

    async execute(interaction) {
        // Create the database connection information
        const sequelize = new Sequelize('database', 'user', 'password', {
            host: 'localhost',
            dialect: 'sqlite',
            logging: false,
            storage: 'database.sqlite',
        });
        const UserDatabase = require(`../models/Tags`)(sequelize);

        // Read in the adventure JSON file
        const currentAdventureJSON = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'util', 'adventure.json')));

        // Collect the users history from the database
        const userHistorySelect = await UserDatabase.findOne({ where: { user_id: interaction.user.id, user_name: interaction.user.username }});
        if ( !userHistorySelect ) {
            return await interaction.reply({ 
                content: Formatters.codeBlock(`There was no history found associated with ${interaction.user.username}.\nHave you started your adventure yet with '/create' or '/continue'?`), 
                ephemeral: true 
            });
        }


        // Only show the last five stages the user has been on, as Discord only allows a character limit of 2000 (at time of writing)
        const userHistory = userHistorySelect.get('user_progression_history').split("/").slice(-5);
        var expandedString = "";

        // Locate the ID from the JSON file to that of the 'userHistory' array
        for ( var i = 0; i < userHistory.length; i++ ) {
            for ( var j = 0; j < currentAdventureJSON.length; j++ ) {
                if ( currentAdventureJSON[j].id.toString() === userHistory[i]) {
                    // Create the string to be sent back to the user
                    expandedString += `\n\nAdventure Stage: ${userHistory[i]} \n${currentAdventureJSON[j].text}`;
                }
            }
        }
        return await interaction.reply({ 
            content: Formatters.codeBlock(`${expandedString}`), 
            ephemeral: true 
        });
    }
}
