const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const dotenv = require('dotenv');

dotenv.config();
const BOT_TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
// GUILD_ID is optional. If you want to deploy commands to a specific guild for testing:
const GUILD_ID = process.env.GUILD_ID; 

if (!BOT_TOKEN || !CLIENT_ID) {
    console.error('Error: BOT_TOKEN and CLIENT_ID must be provided in .env for command deployment.');
    process.exit(1);
}

const commands = [
    new SlashCommandBuilder()
        .setName('trade')
        .setDescription('Logs a trade between two users, involving channels and/or items.')
        .addChannelOption(option => 
            option.setName('receiving_channel')
                .setDescription('The channel you (the command user) are receiving.')
                .setRequired(true)
                // You might want to restrict channel types, e.g., ChannelType.GuildText
                // .addChannelTypes(ChannelType.GuildText) 
        )
        .addChannelOption(option =>
            option.setName('giving_channel')
                .setDescription('The channel the other user is receiving (you are giving).')
                .setRequired(true)
                // .addChannelTypes(ChannelType.GuildText)
        )
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The other user involved in the trade.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('receiving_item')
                .setDescription('Optional: Item/vehicle you are receiving.')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('giving_item')
                .setDescription('Optional: Item/vehicle the other user is receiving.')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('notes')
                .setDescription('Optional: Any additional notes for the trade.')
                .setRequired(false)
        ),
    new SlashCommandBuilder()
        .setName('grantaccess')
        .setDescription('Logs granting channel access to a user.')
        .addChannelOption(option =>
            option.setName('channel_granted')
                .setDescription('The channel access is being granted to.')
                .setRequired(true)
                // .addChannelTypes(ChannelType.GuildText)
        )
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user receiving access.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('notes')
                .setDescription('Optional: Additional notes.')
                .setRequired(false)
        ),
    new SlashCommandBuilder()
        .setName('assignrole')
        .setDescription('Logs assigning a role to a user.')
        .addRoleOption(option =>
            option.setName('role_assigned')
                .setDescription('The role being assigned.')
                .setRequired(true)
        )
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user receiving the role.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('notes')
                .setDescription('Optional: Additional notes.')
                .setRequired(false)
        ),
    // Example of a simple ping command for testing
    new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong! (for testing deployment)'),
].map(command => command.toJSON());

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

// Deploy commands
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        // To deploy globally, use Routes.applicationCommands(CLIENT_ID)
        // To deploy to a specific guild, use Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
        
        let route;
        if (GUILD_ID) {
            route = Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID);
            console.log(`Deploying commands to guild: ${GUILD_ID}`);
        } else {
            route = Routes.applicationCommands(CLIENT_ID);
            console.log('Deploying commands globally. This may take some time (up to an hour).');
        }

        const data = await rest.put(route, { body: commands });

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error('Failed to deploy commands:', error);
    }
})();
