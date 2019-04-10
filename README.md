# FactorioChatBot
Bi-Directional chat bot integrating Discord and Factorio Chat written in nodejs.

# Requirements
  1. A factorio server with RCON enabled
  2. Ability to host the bridge locally on the same machine as the game server.

# Setting RCON
The Factorio server must have RCON enabled.

Launch Flags:

--rcon-port <port>	Port to use for RCON
  
--rcon-password <pass>	Password for RCON

# Dependencies
Install NodeJS https://nodejs.org/en/

To verify node is installed open an elevated cmd prompt and do "node -v" 
the node version should be returned

Navigate in the cmd prompt to the folder you have the FactorioChatBot (cd)

  Run the following commands within that directory

npm install discord.js --save

npm install webhook-discord --save

npm install chokidar --save

npm isntall rcon --save

# Configuration
Configuration files bot_auth.json and config.json found in the FactorioChatBot root MUST be edited.

bot_auth.json
  Set Discord Bot Token
  https://discordapp.com/developers/applications/

config.json
  set ChatLog.log Directory Path (Generated after typing to chat on server with PSiChatUtil mod installed).
    It's important to add double slashes Example : "C:\\Users\\UserProfile\\AppData\\Roaming\\Factorio\\script-output\\ChatLog.log"

  set PlayerLog.log (Same process as above)

  set webHook URL (discord server webhook)
    https://support.discordapp.com/hc/en-us/articles/228383668-Intro-to-Webhooks

  set channelListen with your discord channel ID to listen on
    https://support.discordapp.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-

  set RconIP (Should remain 127.0.0.1 for localhost)

  set RconPort (Same port you set in your server launch params)

  set RconPassword (Same pass you set in your server launch params)

# PSiChatUtil
Factorio Utility mod that exploits the write_file function to retrieve messages from in-game-chat.
This mod is required on both server and client.
https://mods.factorio.com/mod/PSiChatUtil

# Running the bridge
--To run from console do the following in the dir of the bot-- 

node FactorioChatBot.js

--To run as a service--

Install NSSM https://nssm.cc/

Follow the example https://i.imgur.com/L9qBYV5.png

