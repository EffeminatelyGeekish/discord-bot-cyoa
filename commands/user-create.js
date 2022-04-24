/**
 * NAME: user-create.js
 * DESC: Command used to create a user in the database. Once a user has done this, they can then use '/continue' to proceed with their adventure
 */
const {SlashCommandBuilder} = require('@discordjs/builders');
const { Formatters } = require('discord.js');
const Sequelize = require('sequelize');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create')
        .setDescription(`Creates a user profile so that you can progress through the adventure.`),

    async execute(interaction) {
        // Create the database connection infromation
        const sequelize = new Sequelize('database', 'user', 'password', {
            host: 'localhost',
            dialect: 'sqlite',
            logging: false,
            storage: 'database.sqlite',
        });
        const UserDatabase = require(`../models/Tags`)(sequelize);

        // Create the user, if it fails specify as to why it failed
        try {
            const userCreated = await UserDatabase.create({ user_id: interaction.user.id, user_name: interaction.user.username, user_progression_stage: 0, user_progression_history: "0", user_completed_adventures: 0 });
            return await interaction.reply(Formatters.codeBlock(`${interaction.user.username} has created a user.\nYou can now progress your adventure with '/continue'!`));
        }
        catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return await interaction.reply(Formatters.codeBlock(`${interaction.user.username} already exists!`));
            }

            console.log(error);
            return await interaction.reply(Formatters.codeBlock(`Something went wrong when adding a new user to the system`));
        }
    }
};