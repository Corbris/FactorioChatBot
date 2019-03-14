# FactorioChatBot
Bi-Directional bot integrating discord with Factorio chat

# Setting RCON
The Factorio server must have RCON enabled.
Launch Flags:
--rcon-port <port>	Port to use for RCON
--rcon-password <pass>	Password for RCON

# Dependencies
npm discord.js

npm webhook-discord

npm chokidar

npm rcon

# Configuration
bot_auth.json
  Set Discord Bot Token
  https://discordapp.com/developers/applications/

config.json
  set ChatLog.log Directory Path (Generated after typing to chat on server with PSiChatUtil mod installed)

  set webHook URL (discord server webhook)
    https://support.discordapp.com/hc/en-us/articles/228383668-Intro-to-Webhooks

  set channelListen with your discord channel ID to listen on
    https://support.discordapp.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-

  set RconIP

  set RconPort

  set RconPassword

# mod/PSiChatUtil
Factorio Utility mod that exploits the write_file function to retrieve messages from in-game-chat.
This mod is required on both server and client.
