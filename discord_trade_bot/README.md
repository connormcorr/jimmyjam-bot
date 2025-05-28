# Discord Trade Logging Bot (discord.js)

This bot is designed to log trades, sales, access grants, and role assignments in a Discord server. It uses slash commands to initiate actions and logs them in a designated channel with a professional embed format, pinging a specified role or user for review. This version is built with Node.js and discord.js.

## Prerequisites

1.  **Node.js:** You need Node.js version 16.9.0 or newer.
    *   You can download it from [nodejs.org](https://nodejs.org/en/download/).
    *   npm (Node Package Manager) is included with Node.js.
2.  **npm:** npm is used to install and manage project dependencies.
    *   You can check if Node.js and npm are installed by opening a command prompt or terminal and typing `node -v` and `npm -v`.

## Setup Instructions

1.  **Clone or Download the Bot:**
    *   If you have git installed, you can clone it: `git clone <repository_url>`
    *   Otherwise, download the bot files as a ZIP and extract them to a folder on your computer. Let's call this folder `discord_trade_bot`.

2.  **Create a Discord Bot Application:**
    *   Go to the [Discord Developer Portal](https://discord.com/developers/applications).
    *   Click "New Application" and give it a name (e.g., "Trade Logger JS").
    *   Go to the "Bot" tab on the left side.
    *   Click "Add Bot" and confirm.
    *   **Get your Bot Token:** Under the bot's username, you'll see "TOKEN". Click "Copy" to copy the token. **Treat this token like a password and never share it publicly.**
    *   **Enable Privileged Gateway Intents:** Scroll down on the "Bot" page and enable:
        *   `SERVER MEMBERS INTENT` (Needed to get information about server members for commands).
        *   `MESSAGE CONTENT INTENT` (May be needed for some interactions or future features, though slash commands reduce this need).
        *   Ensure `PRESENCE INTENT` is disabled if not strictly needed, to respect user privacy and reduce bot resource usage. (Default is off for new bots)

3.  **Get Channel and Role/User IDs:**
    *   **Enable Developer Mode in Discord:**
        *   Open your Discord client. User Settings -> App Settings -> Advanced -> Turn on "Developer Mode".
    *   **Get Channel ID:** Right-click on your logging text channel -> "Copy ID". This is `LOGGING_CHANNEL_ID`.
    *   **Get Role ID (for pinging):** Server Settings -> Roles -> Right-click role -> "Copy ID". This is `PING_ROLE_ID`.
    *   **Get User ID (if pinging a user):** Right-click user -> "Copy ID". Use this for `PING_ROLE_ID`.

4.  **Configure the Bot (`.env` file):**
    *   In the `discord_trade_bot` folder, ensure the `.env` file exists (it should from previous steps or be created from `.env.example` if provided).
    *   Open `.env` and fill in your details:
        ```env
        BOT_TOKEN=YOUR_DISCORD_BOT_TOKEN_HERE
        LOGGING_CHANNEL_ID=YOUR_LOGGING_CHANNEL_ID_HERE
        PING_ROLE_ID=YOUR_PING_ROLE_ID_HERE
        CLIENT_ID=YOUR_BOTS_APPLICATION_CLIENT_ID_HERE 
        GUILD_ID=YOUR_TEST_SERVER_ID_HERE # Optional: For faster command deployment during testing
        ```
        (Note: Added CLIENT_ID and GUILD_ID as these are often used with discord.js command deployment).

5.  **Install Dependencies and Run the Bot:**
    *   Navigate to the `discord_trade_bot` folder in your command prompt or terminal.
    *   **Using `startbot.bat` (Windows):**
        *   Simply double-click the `startbot.bat` file.
        *   It will automatically install dependencies (if `node_modules` folder is missing) and then start the bot.
    *   **Manual Setup (All Platforms):**
        *   Open a terminal or command prompt in the `discord_trade_bot` directory.
        *   **Install dependencies:**
            ```bash
            npm install
            ```
        *   **(One-time) Deploy Slash Commands:**
            You may need to run a command deployment script the first time or when commands change.
            If a `deploy-commands.js` file is provided:
            ```bash
            node deploy-commands.js
            ```
            (This step will be detailed further when `deploy-commands.js` is created in the plan).
        *   **Run the bot:**
            ```bash
            node bot.js
            ```

6.  **Invite the Bot to Your Server:**
    *   Go to Discord Developer Portal -> Your Application -> OAuth2 -> URL Generator.
    *   Scopes: `bot` and `applications.commands`.
    *   Bot Permissions: `Send Messages`, `Embed Links`, `Read Message History`, `View Channels`. (Add `Manage Roles` if direct role assignment is implemented).
    *   Copy the generated URL, paste it into your browser, and authorize on your server.

## Bot Usage

(This section will describe slash commands: `/trade`, `/grantaccess`, `/assignrole`. The functionality will be similar to the Python version, but invoked via discord.js commands. Details will be confirmed as commands are implemented.)

*   **/trade `receiving_channel` `giving_channel` `user` `[receiving_item]` `[giving_item]` `[notes]`**
*   **/grantaccess `channel_granted` `user` `[notes]`**
*   **/assignrole `role_assigned` `user` `[notes]`**

The bot will post a formatted embed in the logging channel and ping the configured role/user. The embeds will include subtle branding: "Created by J. Paul | S.H.A.D.O.W Technologies Collective" and the invite link `https://discord.gg/5H3Aam69rm`.

## Troubleshooting

*   **Bot not online:**
    *   Check terminal for errors after `node bot.js`.
    *   Verify `BOT_TOKEN` in `.env`.
*   **Commands not appearing/working:**
    *   Ensure slash commands were deployed (e.g., via `node deploy-commands.js`).
    *   Commands can take time to propagate. Try reinviting the bot to a test server.
    *   Check bot permissions on the server and for specific channels.
*   **"npm install" errors:**
    *   Check internet connection. Delete `node_modules` and `package-lock.json` then try `npm install` again.
*   **Ensure `CLIENT_ID` and `GUILD_ID` (for testing) are correctly set in `.env` if your `deploy-commands.js` script uses them.**
