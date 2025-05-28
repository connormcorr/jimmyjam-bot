// Require the necessary discord.js classes
const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, Collection, PermissionsBitField } = require('discord.js');
const dotenv = require('dotenv');
const fs = require('node:fs');
const path = require('node:path');

// Load environment variables from .env file
dotenv.config();
const BOT_TOKEN = process.env.BOT_TOKEN;
const LOGGING_CHANNEL_ID = process.env.LOGGING_CHANNEL_ID;
const PING_ROLE_ID = process.env.PING_ROLE_ID;
const CLIENT_ID = process.env.CLIENT_ID; // Will be used for command deployment
const GUILD_ID = process.env.GUILD_ID; // Optional: For guild-specific command deployment

// Basic validation for core environment variables
if (!BOT_TOKEN || !LOGGING_CHANNEL_ID || !PING_ROLE_ID || !CLIENT_ID) {
    console.error('Error: Missing critical environment variables (BOT_TOKEN, LOGGING_CHANNEL_ID, PING_ROLE_ID, CLIENT_ID). Please check your .env file.');
    process.exit(1);
}

// Create a new Client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,      // To access guild member information
        GatewayIntentBits.GuildMessages,     // To interact with messages (though less needed with slash commands)
        // Add other intents as necessary for your bot's functionality
    ]
});

// Storing commands
client.commands = new Collection(); 

// --- Command Loading (Example - can be more sophisticated) ---
// This is a placeholder to show where command loading would go.
// Actual command file structure and loading will be refined in Phase 2.
// For now, we are focusing on the basic bot structure.
/*
const commandsPath = path.join(__dirname, 'commands'); // Assuming a 'commands' directory
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            console.log(`Loaded command: ${command.data.name}`);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
} else {
    console.log("[INFO] No 'commands' directory found, or it's empty. Manual command handlers will be used for now.");
}
*/

// Event: Bot is ready
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log(`Bot ID: ${client.user.id}`);
    console.log(`Logging Channel ID: ${LOGGING_CHANNEL_ID}`);
    console.log(`Ping Role/User ID: ${PING_ROLE_ID}`);
    console.log('Bot is ready and listening for interactions.');

    // Optionally set bot activity
    client.user.setActivity('for /trade commands', { type: 'WATCHING' });

    // Check logging channel
    const logChannel = client.channels.cache.get(LOGGING_CHANNEL_ID);
    if (logChannel) {
        console.log(`Successfully found logging channel: #${logChannel.name} (ID: ${logChannel.id})`);
    } else {
        console.error(`Error: Could not find logging channel with ID ${LOGGING_CHANNEL_ID}. Ensure the ID is correct and the bot is in the server with access to this channel.`);
    }
});

// Placeholder handler functions - these will be fully implemented in later steps
async function handleTrade(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    try {
        // Retrieve options (as in Step 9)
        const receivingChannel = interaction.options.getChannel('receiving_channel');
        const givingChannel = interaction.options.getChannel('giving_channel');
        const targetUser = interaction.options.getUser('user');
        const receivingItem = interaction.options.getString('receiving_item');
        const givingItem = interaction.options.getString('giving_item');
        const notes = interaction.options.getString('notes');
        const initiatorUser = interaction.user;

        const logChannel = client.channels.cache.get(LOGGING_CHANNEL_ID);

        if (!logChannel) {
            console.error(`Error: Logging channel with ID ${LOGGING_CHANNEL_ID} not found.`);
            await interaction.followUp({ content: 'Error: Could not find the logging channel. Please check bot configuration.', ephemeral: true });
            return;
        }
        
        if (!logChannel.permissionsFor(client.user).has(PermissionsBitField.Flags.SendMessages) ||
            !logChannel.permissionsFor(client.user).has(PermissionsBitField.Flags.EmbedLinks)) {
            console.error(`Error: Bot lacks SendMessages or EmbedLinks permission in channel ${logChannel.name}.`);
            await interaction.followUp({ content: `Error: I don't have permissions to send messages or embed links in the ${logChannel.toString()} channel. Please check my permissions.`, ephemeral: true });
            return;
        }

        // Create the Embed (as in Step 10)
        const tradeEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Trade Logged')
            .setAuthor({ name: `Initiated by: ${initiatorUser.username}`, iconURL: initiatorUser.displayAvatarURL({ dynamic: true }) })
            .addFields(
                { name: 'Trade Participants', value: `${initiatorUser.toString()} (Initiator) trades with ${targetUser.toString()} (Recipient)` },
                { name: '​', value: '​' },
                { name: `${initiatorUser.username} Gives`, value: `Channel: ${givingChannel.toString()}` + (givingItem ? `
Item/Vehicle: \`\`\`${givingItem}\`\`\`` : ''), inline: true },
                { name: `${targetUser.username} Gives`, value: `Channel: ${receivingChannel.toString()}` + (receivingItem ? `
Item/Vehicle: \`\`\`${receivingItem}\`\`\`` : ''), inline: true }
            )
            .setTimestamp()
            .setFooter({ 
                text: `Logged by ${client.user.username} | Created by J. Paul | S.H.A.D.O.W Technologies Collective`, 
                iconURL: client.user.displayAvatarURL({ dynamic: true }) 
            });
        if (notes) {
            tradeEmbed.addFields({ name: 'Additional Notes', value: `\`\`\`${notes}\`\`\`` });
        }
        tradeEmbed.addFields({ name: 'Support & Community', value: '[Join S.H.A.D.O.W Technologies Collective](https://discord.gg/5H3Aam69rm)' });

        // Send the Embed to the logging channel (as in Step 10)
        await logChannel.send({ embeds: [tradeEmbed] });
        
        // --- Send Ping Message ---
        let pingMessageContent = `A new trade has been logged.`; // Default message
        const roleToPing = interaction.guild.roles.cache.get(PING_ROLE_ID);
        const userToPing = await client.users.fetch(PING_ROLE_ID).catch(() => null); // Fetch user by ID

        if (roleToPing) {
            pingMessageContent = `${roleToPing.toString()}, please review the trade log above.`;
        } else if (userToPing) {
            pingMessageContent = `${userToPing.toString()}, please review the trade log above.`;
        } else {
            // Fallback if PING_ROLE_ID is neither a valid role nor a user in cache/fetchable
            // Or if it's just a string that's not an ID.
            // Using a raw mention might work if it's correctly formatted user/role ID string already.
            // e.g. <@&ID> or <@ID>
            // For safety, we check if it looks like an ID.
            if (/^\d+$/.test(PING_ROLE_ID)) { // if PING_ROLE_ID is a string of digits
                 pingMessageContent = `<@&${PING_ROLE_ID}> / <@${PING_ROLE_ID}>, please review the trade log above. (ID provided may be a role or user)`;
            } else {
                console.warn(`PING_ROLE_ID "${PING_ROLE_ID}" is not a valid role or user ID. Cannot form a specific ping. Generic ping sent.`);
            }
        }
        
        try {
            await logChannel.send(pingMessageContent);
        } catch (e) {
            console.error(`Failed to send ping message to log channel: ${e}`);
            // Don't stop the whole process, but maybe inform the user.
            await interaction.followUp({ content: 'Trade logged, but failed to send ping notification. Please check bot permissions for sending messages in the log channel.', ephemeral: true });
            return; // Exit if ping fails, as confirmation below might be misleading
        }

        // --- Send Confirmation to Command User ---
        await interaction.followUp({ 
            content: `Trade successfully logged in ${logChannel.toString()} and a notification has been sent.`, 
            ephemeral: true 
        });

    } catch (error) {
        console.error('Error in handleTrade:', error);
        if (interaction.replied || interaction.deferred) { // Check if already replied or deferred
            await interaction.followUp({ content: 'There was an error processing the trade command.', ephemeral: true });
        } else {
             // This path should ideally not be hit due to deferReply
            await interaction.reply({ content: 'There was an error processing the trade command.', ephemeral: true });
        }
    }
}

async function handleGrantAccess(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    try {
        // Retrieve options from the interaction
        const channelGranted = interaction.options.getChannel('channel_granted');
        const targetUser = interaction.options.getUser('user');
        const notes = interaction.options.getString('notes'); // Optional
        const initiatorUser = interaction.user;

        // Get the logging channel
        const logChannel = client.channels.cache.get(LOGGING_CHANNEL_ID);

        if (!logChannel) {
            console.error(`Error: Logging channel with ID ${LOGGING_CHANNEL_ID} not found for /grantaccess.`);
            await interaction.followUp({ content: 'Error: Could not find the logging channel. Please check bot configuration.', ephemeral: true });
            return;
        }

        // Check bot permissions in logging channel
        if (!logChannel.permissionsFor(client.user).has(PermissionsBitField.Flags.SendMessages) ||
            !logChannel.permissionsFor(client.user).has(PermissionsBitField.Flags.EmbedLinks)) {
            console.error(`Error: Bot lacks SendMessages or EmbedLinks permission in channel ${logChannel.name} for /grantaccess.`);
            await interaction.followUp({ content: `Error: I don't have permissions to send messages or embed links in the ${logChannel.toString()} channel. Please check my permissions.`, ephemeral: true });
            return;
        }

        // --- Create the Embed ---
        const grantEmbed = new EmbedBuilder()
            .setColor(0x57F287) // Example color for grant (e.g., green)
            .setTitle('Access Granted Log')
            .setAuthor({ name: `Action by: ${initiatorUser.username}`, iconURL: initiatorUser.displayAvatarURL({ dynamic: true }) })
            .addFields(
                { name: 'Granter', value: initiatorUser.toString(), inline: true },
                { name: 'Recipient', value: targetUser.toString(), inline: true },
                { name: 'Channel Granted', value: channelGranted.toString(), inline: false }
            )
            .setTimestamp()
            .setFooter({ 
                text: `Logged by ${client.user.username} | Created by J. Paul | S.H.A.D.O.W Technologies Collective`, 
                iconURL: client.user.displayAvatarURL({ dynamic: true }) 
            });

        if (notes) {
            grantEmbed.addFields({ name: 'Additional Notes', value: `\`\`\`${notes}\`\`\``, inline: false });
        }
        
        // Add branding invite link
        grantEmbed.addFields({ name: 'Support & Community', value: '[Join S.H.A.D.O.W Technologies Collective](https://discord.gg/5H3Aam69rm)', inline: false });

        // --- Send the Embed to the logging channel ---
        await logChannel.send({ embeds: [grantEmbed] });

        // --- Send Ping Message ---
        let pingMessageContent = `Access grant has been logged.`; // Default
        const roleToPing = interaction.guild.roles.cache.get(PING_ROLE_ID);
        const userToPing = await client.users.fetch(PING_ROLE_ID).catch(() => null);

        if (roleToPing) {
            pingMessageContent = `${roleToPing.toString()}, please review the access grant log above.`;
        } else if (userToPing) {
            pingMessageContent = `${userToPing.toString()}, please review the access grant log above.`;
        } else {
            if (/^\d+$/.test(PING_ROLE_ID)) {
                 pingMessageContent = `<@&${PING_ROLE_ID}> / <@${PING_ROLE_ID}>, please review the access grant log above.`;
            } else {
                console.warn(`PING_ROLE_ID "${PING_ROLE_ID}" for /grantaccess is not a valid role or user ID.`);
            }
        }
        
        try {
            if (pingMessageContent !== `Access grant has been logged.`) { // Only send if a specific ping was formed
                await logChannel.send(pingMessageContent);
            }
        } catch (e) {
            console.error(`Failed to send ping message for /grantaccess: ${e}`);
            // Non-critical, proceed to user confirmation
        }

        // --- Send Confirmation to Command User ---
        await interaction.followUp({ 
            content: `Access grant for ${targetUser.username} to ${channelGranted.toString()} successfully logged in ${logChannel.toString()}.`, 
            ephemeral: true 
        });

    } catch (error) {
        console.error('Error in handleGrantAccess:', error);
        await interaction.followUp({ content: 'There was an error processing the access grant command.', ephemeral: true });
    }
}

async function handleAssignRole(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    try {
        // Retrieve options from the interaction
        const roleAssigned = interaction.options.getRole('role_assigned');
        const targetUser = interaction.options.getUser('user');
        const notes = interaction.options.getString('notes'); // Optional
        const initiatorUser = interaction.user;

        // Get the logging channel
        const logChannel = client.channels.cache.get(LOGGING_CHANNEL_ID);

        if (!logChannel) {
            console.error(`Error: Logging channel with ID ${LOGGING_CHANNEL_ID} not found for /assignrole.`);
            await interaction.followUp({ content: 'Error: Could not find the logging channel. Please check bot configuration.', ephemeral: true });
            return;
        }

        // Check bot permissions in logging channel
        if (!logChannel.permissionsFor(client.user).has(PermissionsBitField.Flags.SendMessages) ||
            !logChannel.permissionsFor(client.user).has(PermissionsBitField.Flags.EmbedLinks)) {
            console.error(`Error: Bot lacks SendMessages or EmbedLinks permission in channel ${logChannel.name} for /assignrole.`);
            await interaction.followUp({ content: `Error: I don't have permissions to send messages or embed links in the ${logChannel.toString()} channel. Please check my permissions.`, ephemeral: true });
            return;
        }
        
        // Optional: Check if bot has permissions to assign the specific role (ManageRoles)
        // This is complex because role hierarchy matters. Bot role must be higher than 'roleAssigned'.
        // For a logging bot, actual assignment might be manual, and this bot just logs the intent.
        // If direct assignment is intended, add:
        // if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        //     await interaction.followUp({ content: "Error: I don't have the 'Manage Roles' permission to assign roles.", ephemeral: true });
        //     return;
        // }
        // if (interaction.guild.members.me.roles.highest.comparePositionTo(roleAssigned) <= 0) {
        //    await interaction.followUp({ content: `Error: I cannot assign the role ${roleAssigned.name} because it is higher than or equal to my highest role.`, ephemeral: true });
        //    return;
        // }
        // And then: await interaction.guild.members.cache.get(targetUser.id).roles.add(roleAssigned);

        // --- Create the Embed ---
        const assignEmbed = new EmbedBuilder()
            .setColor(0xFFA500) // Example color for role assignment (e.g., orange)
            .setTitle('Role Assignment Log')
            .setAuthor({ name: `Action by: ${initiatorUser.username}`, iconURL: initiatorUser.displayAvatarURL({ dynamic: true }) })
            .addFields(
                { name: 'Assigner', value: initiatorUser.toString(), inline: true },
                { name: 'Recipient', value: targetUser.toString(), inline: true },
                { name: 'Role Assigned', value: roleAssigned.toString(), inline: false }
            )
            .setTimestamp()
            .setFooter({ 
                text: `Logged by ${client.user.username} | Created by J. Paul | S.H.A.D.O.W Technologies Collective`, 
                iconURL: client.user.displayAvatarURL({ dynamic: true }) 
            });

        if (notes) {
            assignEmbed.addFields({ name: 'Additional Notes', value: `\`\`\`${notes}\`\`\``, inline: false });
        }

        assignEmbed.addFields({ name: 'Support & Community', value: '[Join S.H.A.D.O.W Technologies Collective](https://discord.gg/5H3Aam69rm)', inline: false });

        // --- Send the Embed to the logging channel ---
        await logChannel.send({ embeds: [assignEmbed] });

        // --- Send Ping Message ---
        let pingMessageContent = `Role assignment has been logged.`; // Default
        const roleToPing = interaction.guild.roles.cache.get(PING_ROLE_ID);
        const userToPing = await client.users.fetch(PING_ROLE_ID).catch(() => null);

        if (roleToPing) {
            pingMessageContent = `${roleToPing.toString()}, please review the role assignment log above.`;
        } else if (userToPing) {
            pingMessageContent = `${userToPing.toString()}, please review the role assignment log above.`;
        } else {
             if (/^\d+$/.test(PING_ROLE_ID)) {
                 pingMessageContent = `<@&${PING_ROLE_ID}> / <@${PING_ROLE_ID}>, please review the role assignment log above.`;
            } else {
                console.warn(`PING_ROLE_ID "${PING_ROLE_ID}" for /assignrole is not a valid role or user ID.`);
            }
        }
        
        try {
            if (pingMessageContent !== `Role assignment has been logged.`) {
                await logChannel.send(pingMessageContent);
            }
        } catch (e) {
            console.error(`Failed to send ping message for /assignrole: ${e}`);
            // Non-critical, proceed
        }

        // --- Send Confirmation to Command User ---
        await interaction.followUp({ 
            content: `Assignment of role ${roleAssigned.name} to ${targetUser.username} successfully logged in ${logChannel.toString()}.`, 
            ephemeral: true 
        });

    } catch (error) {
        console.error('Error in handleAssignRole:', error);
        await interaction.followUp({ content: 'There was an error processing the role assignment command.', ephemeral: true });
    }
}

// Event: Interaction created (e.g., slash command used)
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return; // Only handle slash commands

    const { commandName } = interaction;

    console.log(`Received command: ${commandName}`);

    try {
        if (commandName === 'trade') {
            await handleTrade(interaction, client);
        } else if (commandName === 'grantaccess') {
            await handleGrantAccess(interaction, client);
        } else if (commandName === 'assignrole') {
            await handleAssignRole(interaction, client);
        } else if (commandName === 'ping') { // Keep the ping command for testing
            await interaction.reply({ content: 'Pong!', ephemeral: true });
        } else {
            await interaction.reply({ content: `No specific handler implemented for command '${commandName}'.`, ephemeral: true });
        }
    } catch (error) {
        console.error(`Error handling command ${commandName}:`, error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

// Global Error Handlers
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
    // Here you could add more sophisticated logging or alerting,
    // e.g., sending a message to a specific admin/channel if the error is critical.
});

process.on('uncaughtException', error => {
    console.error('Uncaught exception:', error);
    // For uncaught exceptions, it's often advisable to restart the bot
    // to ensure a clean state, as the application might be in an undefined state.
    // However, simply logging it might be sufficient for some scenarios,
    // or you might implement a more graceful shutdown/restart mechanism.
    // For now, we'll log it. Consider adding 'process.exit(1);' for critical errors.
});


// Log in to Discord with your client's token
client.login(BOT_TOKEN)
    .then(() => {
        console.log('Successfully logged in to Discord.');
    })
    .catch(error => {
        console.error('Failed to log in to Discord:', error);
        if (error.code === 'DisallowedIntents') {
            console.error('Error: Privileged intents are not enabled for this bot. Go to your bot's application page on the Discord Developer Portal and enable "Server Members Intent" and potentially "Message Content Intent" under the "Privileged Gateway Intents" section.');
        } else if (error.message.includes('INVALID_TOKEN')) {
            console.error('Error: Invalid token. Please ensure your BOT_TOKEN in the .env file is correct.');
        }
        process.exit(1);
    });
