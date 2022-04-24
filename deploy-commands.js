/**
 * NAME: deploy-commands.js
 * DESC: A .js file that registers all of the commands found within the ./commands directory. Run this file whenever new commands are added.
 */

const fs = require('node:fs');
const {REST} = require('@discordjs/rest');
const {Routes} = require('discord-api-types/v9');
const {discordToken, clientID, guildID} = require('./config.json');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) 
{
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({version: '9'}).setToken(discordToken);

rest.put(Routes.applicationGuildCommands(clientID, guildID), {body: commands})
    .then(() => console.log('INFO: Successfully registered application commands!'))
    .catch(console.error);