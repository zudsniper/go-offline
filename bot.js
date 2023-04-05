/* Go Offline
 * This is a discord bot created to help users be mindful of their discord usage.
 * --------------------
 * this code was mostly written by ChatGPT-4
 * modified by me to work
 * --------------------
*/

const fs = require('fs');
const { Client, EmbedBuilder} = require('discord.js');
const { prefix } = require('./config.json');
const { DISCORD_BOT_TOKEN } = process.env;

const client = new Client({ intents: 1374389759040 });

const userLimits = {};

const addUserLimit = (userId, limit) => {
    userLimits[userId] = limit;
};

const removeUserLimit = (userId) => {
    delete userLimits[userId];
};

const getUserLimit = (userId) => {
    return userLimits[userId];
};

client.once('ready', () => {
    console.log('Bot is ready!');
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'limit') {
        const userId = interaction.user.id;
        const timeLimit = interaction.options.getInteger('time');
        const messageLimit = interaction.options.getInteger('messages');

        if (!timeLimit && !messageLimit) {
            return interaction.reply({ content: 'Please provide either a time limit, message limit, or both.', ephemeral: true });
        }

        addUserLimit(userId, { timeLimit, messageLimit, messagesSent: 0, lastMessage: Date.now() });
        await interaction.reply({ content: 'Your conversation limit has been set.', ephemeral: true });
    } else if (commandName === 'removelimit') {
        const userId = interaction.user.id;
        removeUserLimit(userId);
        await interaction.reply({ content: 'Your conversation limit has been removed.', ephemeral: true });
    } else if (commandName === 'viewlimit') {
        const userId = interaction.user.id;
        const limit = getUserLimit(userId);

        if (!limit) {
            return interaction.reply({ content: 'You do not have a conversation limit set.', ephemeral: true });
        }

        const embed= new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Your Conversation Limit')
            .addFields(
                { name: 'Time Limit', value: limit.timeLimit ? `${limit.timeLimit} minutes` : 'None', inline: false},
                { name: 'Message Limit', value: limit.messageLimit ? `${limit.messageLimit} messages` : 'None', inline: false}
            );

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;

    const userId = message.author.id;
    const channelId = message.channel.id;
    const limit = getUserLimit(userId);

    if (!limit) return;

    limit.messagesSent += 1;
    const timeSinceLastMessage = (Date.now() - limit.lastMessage) / 60000;

    if (timeSinceLastMessage >= 30) {
        removeUserLimit(userId);
        return;
    }

    if (limit.messageLimit && limit.messagesSent > limit.messageLimit) {
        await message.reply({content: `<@${userId}> You've exceeded your message limit! Please wait before sending more messages.`});
    }

    if (limit.timeLimit && timeSinceLastMessage >= limit.timeLimit) {
        await message.reply({content: `<@${userId}> You've exceeded your time limit! Please wait before sending more messages.`});
    }

    if (limit.messageLimit && limit.messagesSent >= limit.messageLimit * 0.9) {
        await message.author.send(`You are nearing your message limit (${limit.messageLimit} messages). Please be cautious.`);
    }

    if (limit.timeLimit && timeSinceLastMessage >= limit.timeLimit * 0.9) {
        await message.author.send(`You are nearing your time limit (${limit.timeLimit} minutes). Please be cautious.`);
    }

    limit.lastMessage = Date.now();
});

client.login(DISCORD_BOT_TOKEN).then(r => console.log('Logged in!')).finally(() => {console.log("Bot is ready!")});
