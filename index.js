const { Collection, Client, Intents, Formatters, Permissions } = require('discord.js');
const { discordToken } = require('./config.json');
const fs = require( 'node:fs' );

const Sequelize = require('sequelize');
const discordClient = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// Define the connection information for the database
const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

// Define the database model
const Tags = require(`${__dirname}/models/tags`)(sequelize);



// Collect the commands found in the 'commands' folder and retrieve the name of each command
discordClient.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for(const file of commandFiles) {
    const command = require(`./commands/${file}`);
    discordClient.commands.set(command.data.name, command);
}

// Once everything is prepared, send an info to the console
discordClient.once('ready', () => {
    // Tags.sync({ force: true });
    Tags.sync();
    console.log(`[info] Logged in successfully as ${discordClient.user.tag}`);
});

// Handle the client interactions for slash-command usage '/test'
discordClient.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

    const botPermissions = [
        Permissions.FLAGS.MANAGE_MESSAGES,
        Permissions.FLAGS.MANAGE_ROLES,
        Permissions.FLAGS.MANAGE_CHANNELS,
    ]

    if (!interaction.guild.me.permissions.has(botPermissions)) {
        return await interaction.reply(Formatters.codeBlock(`In order for this bot to work properly, I require ${botPermissions.join(', ')} permissions`));
    }

    const command = discordClient.commands.get(interaction.commandName);
	if (!command) return;
    
    try {
        await command.execute(interaction);
    } 
    catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while attempting to execute this command!', ephemeral: true});
    }
    
});

// Handle the client interaction for button presses (occurs with '/continue')
discordClient.on('interactionCreate', interaction => {
    if (!interaction.isButton()) return;
});

discordClient.login(discordToken);