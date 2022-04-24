/**
 * NAME: adventure-continue.js
 * DESC: Command to continue the user's adventure based on their current stage of progression
 */
const fs = require('node:fs');
const path = require('path');
const Sequelize = require('sequelize');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, Formatters, Interaction } = require('discord.js');

module.exports = {
    data : new SlashCommandBuilder()
        .setName('continue')
        .setDescription('Continue your adventure from where you left off!'),

    async execute(interaction) {
        // Any "global" variables
        const endProgressionStage = 100; // Progression Stage Ending, if the progression end stage should end, change this value
        const inactivityTimer = 30000; // Inactivity setting, how many milliseconds it takes before the system should end accepting button inputs

        // Create the extra line of text that explains how many seconds since inital activation before inactivity
        const timerTextDialog = `[information] - Buttons will become inactive after ${convertInactivityTimer(inactivityTimer)}.\n\n`;

        // Create the database connection information
        const sequelize = new Sequelize('database', 'user', 'password', {
            host: 'localhost',
            dialect: 'sqlite',
            logging: false,
            storage: 'database.sqlite',
            });
        const UserDatabase = require(`../models/Tags`)(sequelize); 

        // Check to see if the user has any user progress.
        const userProgression = await UserDatabase.findOne({ where: { user_id: interaction.user.id, user_name: interaction.user.username }});
        if (!userProgression) {
            return await interaction.reply({ content: Formatters.codeBlock(`Was unable to find any progress tied to your user account. Have you started an adventure with '/create' yet?`), ephemeral: true });
        }

        // Prepare the text for original message before the collector
        const progressionStage = userProgression.get('user_progression_stage');
        const messageText = getCurrentMessageInformation(progressionStage, "TEXT");
        const messageButtons = getCurrentMessageButtons(getCurrentMessageInformation(progressionStage, "OPTIONS")); 

        // Prepare the collector for the button inputs when the stage is to 'collect'
        const filter = fil => fil.user.id === interaction.user.id;
        const inputCollector = interaction.channel.createMessageComponentCollector({ filter, time: inactivityTimer });
        inputCollector.on('collect', async inpCol => {
            // Update the users progression
            setUserProgression(UserDatabase, interaction, inpCol.customId);

            // Update the users history
            var updatedProgress = await UserDatabase.findOne({ where: { user_id: interaction.user.id, user_name: interaction.user.username }});
            
            var progressionHistory = updatedProgress.get('user_progression_history');
            progressionHistory += `/${inpCol.customId}`; // Append the current progression stage onto the string containing their history
            setUserHistory(UserDatabase, interaction, progressionHistory);
            
            // Get the users updated information
            updatedProgress = await UserDatabase.findOne({ where: { user_id: interaction.user.id, user_name: interaction.user.username }});
            
            var updatedProgressStage = updatedProgress.get('user_progression_stage');
            var updatedMessageText = getCurrentMessageInformation(updatedProgressStage, "TEXT");
            var updatedMessageButtons = getCurrentMessageButtons(getCurrentMessageInformation(updatedProgressStage, "OPTIONS"));

            switch(updatedProgressStage) {
                case endProgressionStage : // When the progression stage is the endProgressionStage, then update the user progress and end the collector
                    // Update the 'user_completed_adventure' count
                    // var completedAdventures = updatedProgress.get('user_completed_adventures')++;
                    completedAdventures = await UserDatabase.increment({ user_completed_adventures: 1}, { where: { user_id: interaction.user.id }});

                    if (completedAdventures) {
                        await inpCol.update({ content: Formatters.codeBlock(updatedMessageText), components: [], ephemeral: true });
                        inputCollector.stop();
                    }

                    break;

                default : // If the current progression stage is not the 'endProgressionStage' then update the current message
                    await inpCol.update({ content: Formatters.codeBlock(timerTextDialog + updatedMessageText), components: [updatedMessageButtons], ephemeral: true });
                    break;
            }
        })

        // Prepare the collector for the button inputs when the stage is to 'end'
        inputCollector.on('end', async collected => {
            console.log(`[info] Message buttons for the slash command '/continue' started by ${interaction.user.username} cannot be used further.`);
        });

        // Send the original message to the user, removing the button options if they are on the end progression stage
        if (progressionStage === endProgressionStage) {
            await interaction.reply({ content: Formatters.codeBlock(messageText), components: [], ephemeral: true });
        } else {
            await interaction.reply({ content: Formatters.codeBlock(timerTextDialog + messageText), components: [messageButtons], ephemeral: true });
        }
        // switch (userProgression.get('user_progression_stage')) {
        //     case endProgressionStage :

        //     default :
        // }
    }
}

/**
 * getCurrentMessageInformation = Gets the current message options based upon the users current adventure stage
 * @param {int} currentProgressionStage - Current stage of the adventure that the user is on
 * @param {file} currentAdventureFile - The JSON file that holds the information about the current adventure
 * @param {string} optionCheck - Checks whether the current return should be the options or the text : OPTIONS | TEXT
 * @returns - Returns the message options or the message text to display back to the user
 */
function getCurrentMessageInformation(currentProgressionStage, optionCheck) {
    // Read in the JSON file used for the story text
    var currentAdventureFile = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'util', 'adventure.json')));

    switch (optionCheck) {
        case "TEXT" :
            for ( var i = 0; i < currentAdventureFile.length; i++ ) {
                if ( currentAdventureFile[i].id === currentProgressionStage ) {
                    return currentAdventureFile[i].text;
                }
            }

        case "OPTIONS" :
            for ( var i = 0; i < currentAdventureFile.length; i++ ) {
                if ( currentAdventureFile[i].id === currentProgressionStage ) {
                    return currentAdventureFile[i].choices;
                }
            }   
    }
}

/**
 * getCurrentMessageButtons = Gets the current message buttons based on the options found within the user's current adventure stage
 * @param {Array} currentMessageOptions - Array of message options to send the user to the next stage of their adventure
 * @returns - Returns a MessageActionRow object containing the buttons that the user can use to progress their adventure
 */
function getCurrentMessageButtons(currentMessageOptions) { 
    var messageButtons = new MessageActionRow();
    for ( var i in currentMessageOptions) {
        messageButtons.addComponents(
            new MessageButton()
                .setCustomId(currentMessageOptions[i].toString()).setLabel(`Page: ${currentMessageOptions[i]}`).setStyle('PRIMARY'),
        );
    }
    return messageButtons;
}

/**
 * (async) setUserProgression = Sets the users progression within the database
 * @param {*} dbTable - Database Table affected by the update 
 * @param {Interaction} interaction - Current DiscordInteraction
 * @param {int} newProgressionStage - Users next stage of progression within the adventure
 * @returns - Returns a console.log message outlining the success of the user update
 */
async function setUserProgression(dbTable, interaction, newProgressionStage) {
    // Update the users progression and relay a message to the console on the success
    var updateUserRowsReturned = await dbTable.update({ user_progression_stage : newProgressionStage }, { where : { user_id : interaction.user.id, user_name : interaction.user.username, }});
    if ( updateUserRowsReturned > 0 ) {
        return console.log(`[info] User ${interaction.user.username} has successfully updated to stage ${newProgressionStage}.`);
    }
}

/**
 * (async) setUserHistory = Sets the users history within the database
 * @param {*} dbTable - Database table affected by the update
 * @param {Interaction} interaction - Current DiscordInteraction
 * @param {var} newProgressionHistory - Users current progression history, including the stage they have now picked
 * @returns - Returns a console.log message outlining the success of the user update
 */
async function setUserHistory(dbTable, interaction, newProgressionHistory) {
    var updateUserRowsReturned = await dbTable.update({ user_progression_history : newProgressionHistory }, { where: { user_id: interaction.user.id, user_name: interaction.user.username }} );
    if ( updateUserRowsReturned > 0 ) {
        return console.log(`[info] User ${interaction.user.username}'s history has successfully been updated. Their history is as follows: ${newProgressionHistory}`);
    }
}

/**
 * convertInactivityTimer = Converts the preset milliseconds into minutes/seconds for user friendly output
 * @param {int} inactivityTimerMilliseconds - The allocated milliseconds for the inactivity timer 
 * @returns - Returns value containing the minutes and seconds
 */
function convertInactivityTimer(inactivityTimerMilliseconds) {
    var inactivityMinutes = Math.floor(inactivityTimerMilliseconds / 60000);
    var inactivitySeconds = ((inactivityTimerMilliseconds % 60000) / 1000).toFixed(0);
    return (inactivitySeconds == 60 ? (inactivityMinutes + 1) + "00" : inactivityMinutes + " minute(s) and " + (inactivitySeconds < 10 ? "0" : "") + inactivitySeconds + " second(s)");
}