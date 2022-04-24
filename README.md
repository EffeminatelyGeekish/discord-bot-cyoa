# Choose Your Own Adventure Discord Bot
Choose Your Own Adventure bot is a Discord Bot written in Javascript, utilising JSON and DiscordJS libraries. It is a personal project rather than one I intend to be working on forever, so it is not hosted. The expectation of this bot is that it will be hosted by you, and ran accordingly.

## How To Set Up
This bot is designed to be run on a local discord server. In order to do this, you can utilse any number of hosting services available to you. For the purposes of this README file, this takes into account that you have already installed Node JS onto your local machine and are using Windows 10. 

### Setting Up The Discord Bot
1. Firstly, clone the project
```
git clone https://github.com/EffeminatelyGeekish/discord-bot-cyoa.git
```
2. Head to the [Discord Developers Portal](https://discord.com/login?redirect_to=%2Fdevelopers%2Fapplications) and create an empty bot by clicking "New Application"
3. Set the name of the bot to what you wish and proceed through the rest of these instructions

### Utilising the provided code
1. Save the .zip file and extract it to where you would like to run the application from
2. In the main folder, make a file called `config.json`.
3. Add the following empty code:
```
{
    "discordToken": "",
    "clientID": "",
    "guildID": ""
}
```
#### Adding The Discord Token
1. Head back to the [Discord Developers Portal](https://discord.com/login?redirect_to=%2Fdevelopers%2Fapplications) and click on the newly created application
2. Go to the tab named **Bot** under **Settings** and copy the token after you click **Reset Token**
3. Place the token between the speech marks for `discordToken`.

#### Adding the Client ID
1. Head back to the **General Information** tab on the [Discord Developers Portal](https://discord.com/login?redirect_to=%2Fdevelopers%2Fapplications)
2. Copy the **Application ID** 
3. Paste this value between the speech marks for `clientID`.

#### Adding the Guild ID
1. Open up Discord via the web application or the standalone application
2. Right-click on the image for the server you are adding the bot to
3. At the bottom of the list, click `Copy ID`\
(*if `Copy ID` cannot be found, make sure that you have switched on **Developer Mode** under advanced settings in Discord*)

#### Adding the Discord Bot to your Server
1. Head back to the [Discord Developer Portal](https://discord.com/login?redirect_to=%2Fdevelopers%2Fapplications)
2. Select your application, and then click on `OAuth2` and `URL Generator`
3. Select the following:
    - `bot`
    - `Administrator`
    - `Send Messages`
    - `Use Slash Commands`
4. With the generated URL, simply paste it into your current web browser and follow the link.

### Running the Discord Bot
1. Open up Powershell and CD to the directory where you have stored the code.
2. Run ```npm ci``` to install the required packages 
3. Run ``node ./deploy-commands.js`` to register the commands for the bot
    - **_if you modify or add any commands to this folder, make sure that this command is run again_**
4. Finally, run ``node ./index.js`` to activate and run the bot

## Commands
**Admin Commands**
    - **_in order for these to be used, you must have selected users to be under the role of "Mod" or "Administrator" to change this requirement to a role you currently have set up, this is found in `commands/administrative-powers.js`_**
- **/admin userstats** - Requires the input of either a username or the user ID of the user you wish to provide the statistics of.
- **/admin serverstats** - Produces statistics on every user in the server that is currently taking part in an adventure.
- **/admin resetdata** - Resets the data of every user in the server with a current adventure. If you are changing the adventure file, then this command will reset everyone back to stage one.

**User Commands**
- **/create** - Creates your character, allowing you to progress through the adventure.
- **/continue** - Continues your adventure from where you left off.
- **/restart** - Resets your character to the stage of creation, allowing you to start your adventure from the first stage.
- **/history** - Displays your characters history, so you know where your character has been before.

## Updating the Adventure File
The adventure file provided under ``util/adventure.json`` is more of a demonstration of the system. In order to update this or create your own, you can use any text editor and follow the structure provided below:
```
[
	{
		"id" : 0,
		"text" : "An old decrept wooden door stands before you. Do you...\nStage 1: open the door and enter.\nStage 4: ignore the door, and peer through the window.\nStage 6: walk around to the back of the house.",
		"choices" : [1, 4, 6]
	},
    ...
]
```
- **ID** is the stage of the adventure your users are on. If it is 0 it is the starting point, and currently 100 is the ending point.
    - If you should want to increase this amount, open the file ``commands/adventure-continue.js`` and locate the line with `const endProgressionStage = 100;`. Where it says 100, change that number to the number you would prefer for the ending point of your adventure and save it.\
    - ***REMEMBER*** - The ending point set via `const endProgressionStage = 100;` must be reached within your ``adventure.json`` file through the `choices`. If it doesn't, then your adventure will not reach an ending.
- **TEXT** is the line of dialog you wish for your users to read. This must be less than 2000 characters, and should ideally provide your users with a set of choices that they can continue to. This _can not_ contain markdown.
- **CHOICES** is a list of options that appear for the users. They appear in the form of buttons, and allow the user to progress with their adventure.

### RULES
- The **ID** _must_ begin with 0.
- The **TEXT** _must_ contain information.
- The **CHOICES** _must not_ be empty, WITH the exception of choices for the **ID** tag of 100.
- The **FILENAME** _must_ remain as `adventure.json`. 