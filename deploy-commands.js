const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { DISCORD_BOT_TOKEN } = process.env;

const commands = [{
    name: 'limit',
    description: 'Set a limit to your conversation length',
    options: [
        {
            name: 'time',
            type: 'INTEGER',
            description: 'Set a time limit in minutes',
            required: false
        },
        {
            name: 'messages',
            type: 'INTEGER',
            description: 'Set a message limit',
            required: false
        }
    ]
},
    {
        name: 'removelimit',
        description: 'Remove your conversation limit'
    },
    {
        name: 'viewlimit',
        description: 'View your conversation limit'
    }];

const rest = new REST({ version: '9' }).setToken(DISCORD_BOT_TOKEN);


(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
